#!/usr/bin/env python3
"""Benchmark: Blindfold PIIScanner on AI4Privacy pii-masking-400k dataset.

Loads the multilingual AI4Privacy dataset from HuggingFace (streaming),
runs PIIScanner.detect() on each sample, and compares against ground-truth
privacy_mask spans using IoU-based matching.
"""

from __future__ import annotations

import sys
import time
from collections import defaultdict

from datasets import load_dataset

from blindfold import PIIScanner

from entity_mapping import AI4PRIVACY_TO_BLINDFOLD, REGEX_DETECTABLE_AI4PRIVACY
from span_eval import (
    Counts,
    Span,
    aggregate_counts,
    match_spans,
    print_results,
)

# Sample size per language
SAMPLES_PER_LANG = 500
LANGUAGES = ["en", "fr", "de", "it", "es", "nl"]
IOU_THRESHOLD = 0.5


def load_samples(
    languages: list[str] = LANGUAGES,
    per_lang: int = SAMPLES_PER_LANG,
) -> dict[str, list[dict]]:
    """Load samples from AI4Privacy dataset, streaming by language."""
    print(f"Loading AI4Privacy dataset ({per_lang}/language x {len(languages)} languages)...")
    ds = load_dataset("ai4privacy/pii-masking-400k", split="train", streaming=True)

    samples_by_lang: dict[str, list[dict]] = {lang: [] for lang in languages}
    lang_set = set(languages)

    for row in ds:
        lang = row.get("language", "")
        if lang not in lang_set:
            continue
        if len(samples_by_lang[lang]) >= per_lang:
            # Check if all languages are full
            if all(len(v) >= per_lang for v in samples_by_lang.values()):
                break
            continue
        samples_by_lang[lang].append(row)

    for lang in languages:
        print(f"  {lang}: {len(samples_by_lang[lang])} samples")

    return samples_by_lang


def gt_spans_from_row(row: dict) -> list[Span]:
    """Extract ground-truth spans from a dataset row.

    Only includes entity types that map to Blindfold regex-detectable types.
    """
    spans = []
    for mask in row.get("privacy_mask", []):
        label = mask["label"]
        bf_label = AI4PRIVACY_TO_BLINDFOLD.get(label)
        if bf_label is not None:
            spans.append(Span(start=mask["start"], end=mask["end"], label=bf_label))
    return spans


def gt_spans_all(row: dict) -> list[Span]:
    """Extract ALL ground-truth spans (including NER-only) for FN analysis."""
    spans = []
    for mask in row.get("privacy_mask", []):
        label = mask["label"]
        bf_label = AI4PRIVACY_TO_BLINDFOLD.get(label)
        # Use original label for NER-only types
        display_label = bf_label if bf_label is not None else f"[NER] {label}"
        spans.append(Span(start=mask["start"], end=mask["end"], label=display_label))
    return spans


def run_blindfold(texts: list[str]) -> list[list[Span]]:
    """Run Blindfold PIIScanner on all texts."""
    scanner = PIIScanner(locales=["us", "eu"])
    results = []
    for text in texts:
        matches = scanner.detect(text)
        spans = [
            Span(start=m.start, end=m.end, label=m.entity_type)
            for m in matches
        ]
        results.append(spans)
    return results


def main() -> None:
    samples_by_lang = load_samples()

    all_counts: list[dict[str, Counts]] = []
    lang_counts: dict[str, dict[str, Counts]] = {}

    for lang in LANGUAGES:
        samples = samples_by_lang[lang]
        if not samples:
            print(f"\n  Skipping {lang} — no samples")
            continue

        texts = [s["source_text"] for s in samples]
        gt_all = [gt_spans_from_row(s) for s in samples]

        # Count regex-detectable ground-truth entities
        entity_dist: dict[str, int] = defaultdict(int)
        for gt in gt_all:
            for span in gt:
                entity_dist[span.label] += 1

        print(f"\n  [{lang.upper()}] Regex-detectable GT entities: {dict(entity_dist)}")

        # Run Blindfold
        t0 = time.time()
        bf_all = run_blindfold(texts)
        elapsed = time.time() - t0
        bf_total = sum(len(s) for s in bf_all)
        print(f"  [{lang.upper()}] Blindfold: {bf_total} detections in {elapsed:.1f}s")

        # Evaluate
        doc_counts = [
            match_spans(pred, gt, iou_threshold=IOU_THRESHOLD)
            for pred, gt in zip(bf_all, gt_all)
        ]
        agg = aggregate_counts(doc_counts)
        lang_counts[lang] = agg
        all_counts.extend(doc_counts)

        print_results(agg, title=f"Blindfold on AI4Privacy [{lang.upper()}]")

    # Overall across all languages
    overall = aggregate_counts(all_counts)
    print_results(overall, title="Blindfold on AI4Privacy [ALL LANGUAGES]")

    # Per-language summary
    print("\n" + "=" * 60)
    print(" Per-Language Summary (micro-averaged)")
    print("=" * 60)
    from span_eval import f1, precision, recall
    from tabulate import tabulate

    rows = []
    for lang in LANGUAGES:
        if lang not in lang_counts:
            continue
        total = Counts()
        for c in lang_counts[lang].values():
            total.tp += c.tp
            total.fp += c.fp
            total.fn += c.fn
        rows.append([
            lang.upper(),
            total.tp,
            total.fp,
            total.fn,
            f"{precision(total):.3f}",
            f"{recall(total):.3f}",
            f"{f1(total):.3f}",
        ])

    print(tabulate(rows, headers=["Lang", "TP", "FP", "FN", "P", "R", "F1"], tablefmt="github"))
    print()


if __name__ == "__main__":
    main()
