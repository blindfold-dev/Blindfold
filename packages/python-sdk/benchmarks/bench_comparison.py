#!/usr/bin/env python3
"""Benchmark: Head-to-head Blindfold vs Presidio on AI4Privacy data.

Runs both Blindfold PIIScanner and Presidio AnalyzerEngine on the same
AI4Privacy subset, then prints side-by-side P/R/F1 comparison.
"""

from __future__ import annotations

import sys
import time
from collections import defaultdict

from datasets import load_dataset
from presidio_analyzer import AnalyzerEngine

from blindfold import PIIScanner

from entity_mapping import (
    AI4PRIVACY_TO_BLINDFOLD,
    AI4PRIVACY_TO_PRESIDIO,
    PRESIDIO_TO_BLINDFOLD,
)
from span_eval import (
    Counts,
    Span,
    aggregate_counts,
    match_spans,
    print_comparison,
    print_results,
)

# Use the same dataset parameters as bench_ai4privacy.py
SAMPLES_PER_LANG = 500
LANGUAGES = ["en", "fr", "de", "it", "es", "nl"]
IOU_THRESHOLD = 0.5


def load_samples(
    languages: list[str] = LANGUAGES,
    per_lang: int = SAMPLES_PER_LANG,
) -> list[dict]:
    """Load samples from AI4Privacy dataset (flat list)."""
    print(f"Loading AI4Privacy dataset ({per_lang}/language x {len(languages)} languages)...")
    ds = load_dataset("ai4privacy/pii-masking-400k", split="train", streaming=True)

    samples_by_lang: dict[str, list[dict]] = {lang: [] for lang in languages}
    lang_set = set(languages)

    for row in ds:
        lang = row.get("language", "")
        if lang not in lang_set:
            continue
        if len(samples_by_lang[lang]) >= per_lang:
            if all(len(v) >= per_lang for v in samples_by_lang.values()):
                break
            continue
        samples_by_lang[lang].append(row)

    all_samples = []
    for lang in languages:
        n = len(samples_by_lang[lang])
        print(f"  {lang}: {n} samples")
        all_samples.extend(samples_by_lang[lang])

    print(f"  Total: {len(all_samples)} samples")
    return all_samples


def gt_spans_from_row(row: dict) -> list[Span]:
    """Extract ground-truth spans mapped to Blindfold entity types."""
    spans = []
    for mask in row.get("privacy_mask", []):
        label = mask["label"]
        bf_label = AI4PRIVACY_TO_BLINDFOLD.get(label)
        if bf_label is not None:
            spans.append(Span(start=mask["start"], end=mask["end"], label=bf_label))
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


def run_presidio(texts: list[str], languages: list[str]) -> list[list[Span]]:
    """Run Presidio AnalyzerEngine on all texts.

    Maps Presidio results to Blindfold entity types for fair comparison.
    """
    analyzer = AnalyzerEngine()
    results = []
    for text, lang in zip(texts, languages):
        detections = []
        for try_lang in [lang, "en"]:
            try:
                detections = analyzer.analyze(text=text, language=try_lang)
                break
            except Exception:
                continue

        spans = []
        for d in detections:
            bf_label = PRESIDIO_TO_BLINDFOLD.get(d.entity_type)
            if bf_label is not None:
                spans.append(Span(start=d.start, end=d.end, label=bf_label))
        results.append(spans)
    return results


def main() -> None:
    samples = load_samples()
    texts = [s["source_text"] for s in samples]
    languages = [s.get("language", "en") for s in samples]
    gt_all = [gt_spans_from_row(s) for s in samples]

    # Ground-truth distribution
    entity_dist: dict[str, int] = defaultdict(int)
    for gt in gt_all:
        for span in gt:
            entity_dist[span.label] += 1
    print("\nGround-truth entity distribution (regex-detectable only):")
    for label, count in sorted(entity_dist.items(), key=lambda x: -x[1]):
        print(f"  {label}: {count}")

    # Run Blindfold
    print(f"\nRunning Blindfold PIIScanner on {len(texts)} samples...")
    t0 = time.time()
    bf_all = run_blindfold(texts)
    bf_time = time.time() - t0
    bf_total = sum(len(s) for s in bf_all)
    print(f"  Blindfold: {bf_total} detections in {bf_time:.1f}s")

    # Run Presidio
    print(f"Running Presidio AnalyzerEngine on {len(texts)} samples...")
    t0 = time.time()
    pr_all = run_presidio(texts, languages)
    pr_time = time.time() - t0
    pr_total = sum(len(s) for s in pr_all)
    print(f"  Presidio: {pr_total} detections in {pr_time:.1f}s")

    # Evaluate Blindfold
    bf_doc_counts = [
        match_spans(pred, gt, iou_threshold=IOU_THRESHOLD)
        for pred, gt in zip(bf_all, gt_all)
    ]
    bf_counts = aggregate_counts(bf_doc_counts)
    print_results(bf_counts, title="Blindfold on AI4Privacy")

    # Evaluate Presidio
    pr_doc_counts = [
        match_spans(pred, gt, iou_threshold=IOU_THRESHOLD)
        for pred, gt in zip(pr_all, gt_all)
    ]
    pr_counts = aggregate_counts(pr_doc_counts)
    print_results(pr_counts, title="Presidio on AI4Privacy")

    # Side-by-side comparison
    print_comparison(
        bf_counts,
        pr_counts,
        name_a="Blindfold",
        name_b="Presidio",
        title="Head-to-Head: Blindfold vs Presidio (AI4Privacy)",
    )

    print(f"Timing: Blindfold {bf_time:.1f}s | Presidio {pr_time:.1f}s")
    print(f"Samples: {len(texts)} | IoU threshold: {IOU_THRESHOLD}")


if __name__ == "__main__":
    main()
