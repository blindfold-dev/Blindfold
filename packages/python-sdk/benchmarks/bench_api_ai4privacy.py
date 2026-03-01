#!/usr/bin/env python3
"""Benchmark: Blindfold API (/detect) on AI4Privacy pii-masking-400k dataset.

Unlike bench_ai4privacy.py which tests only the local regex PIIScanner,
this benchmark calls the live API /detect endpoint — testing the full
pipeline including GLiNER zero-shot NER for Person, Organization, Address, etc.

Usage:
    # Smoke test with 5 English samples
    python bench_api_ai4privacy.py --samples-per-lang 5 --languages en

    # Full run with default settings (100 samples/lang, 6 languages)
    python bench_api_ai4privacy.py --api-key YOUR_KEY

    # Compare API vs local regex scanner
    python bench_api_ai4privacy.py --samples-per-lang 50 --compare-regex

    # Custom endpoint and concurrency
    python bench_api_ai4privacy.py --base-url https://us-api.blindfold.dev --concurrency 10
"""

from __future__ import annotations

import argparse
import asyncio
import os
import sys
import time
from collections import defaultdict

import httpx
from datasets import load_dataset

from entity_mapping import (
    AI4PRIVACY_TO_API,
    AI4PRIVACY_TO_BLINDFOLD,
    API_DETECTABLE_AI4PRIVACY,
    API_MERGEABLE_LABELS,
)
from span_eval import (
    Counts,
    Span,
    aggregate_counts,
    match_spans,
    print_comparison,
    print_results,
)

DEFAULT_BASE_URL = "https://eu-api.blindfold.dev"
DEFAULT_SAMPLES_PER_LANG = 100
DEFAULT_LANGUAGES = ["en", "fr", "de", "it", "es", "nl"]
DEFAULT_CONCURRENCY = 5
IOU_THRESHOLD = 0.5
MAX_RETRIES = 3
RETRY_BASE_DELAY = 2.0  # seconds, doubled on each retry


# ---------------------------------------------------------------------------
# Dataset loading
# ---------------------------------------------------------------------------

def load_samples(
    languages: list[str],
    per_lang: int,
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
            if all(len(v) >= per_lang for v in samples_by_lang.values()):
                break
            continue
        samples_by_lang[lang].append(row)

    for lang in languages:
        print(f"  {lang}: {len(samples_by_lang[lang])} samples")

    return samples_by_lang


# ---------------------------------------------------------------------------
# Ground-truth extraction with span merging
# ---------------------------------------------------------------------------

def gt_spans_from_row(row: dict) -> list[Span]:
    """Extract ground-truth spans mapped to API entity types.

    Only includes entity types the API can detect (regex + NER).
    """
    spans = []
    for mask in row.get("privacy_mask", []):
        label = mask["label"]
        api_label = AI4PRIVACY_TO_API.get(label)
        if api_label is not None:
            spans.append(Span(start=mask["start"], end=mask["end"], label=api_label))
    return spans


def merge_adjacent_spans(spans: list[Span], max_gap: int = 3) -> list[Span]:
    """Merge same-label spans separated by at most `max_gap` characters.

    AI4Privacy annotates "John" (GIVENNAME) and "Doe" (SURNAME) separately,
    but the API returns "John Doe" as one Person span. Similarly, STREET + CITY
    + STATE may be merged into a single Address span. This function merges
    adjacent ground-truth spans with the same mapped label so IoU matching
    is fair.

    Only merges labels in API_MERGEABLE_LABELS (Person, Address).
    """
    if not spans:
        return spans

    # Separate mergeable from non-mergeable
    mergeable = [s for s in spans if s.label in API_MERGEABLE_LABELS]
    non_mergeable = [s for s in spans if s.label not in API_MERGEABLE_LABELS]

    if not mergeable:
        return spans

    # Sort by label then start position
    mergeable.sort(key=lambda s: (s.label, s.start))

    merged = []
    current = mergeable[0]

    for span in mergeable[1:]:
        if span.label == current.label and span.start <= current.end + max_gap:
            # Extend current span
            current = Span(
                start=current.start,
                end=max(current.end, span.end),
                label=current.label,
            )
        else:
            merged.append(current)
            current = span

    merged.append(current)
    return non_mergeable + merged


# ---------------------------------------------------------------------------
# API calling with async concurrency and rate-limit retry
# ---------------------------------------------------------------------------

async def call_detect_api(
    client: httpx.AsyncClient,
    base_url: str,
    api_key: str,
    text: str,
    sem: asyncio.Semaphore,
) -> list[Span]:
    """Call /detect endpoint and return detected spans."""
    url = f"{base_url}/api/public/v1/detect"
    headers = {"X-API-Key": api_key}

    async with sem:
        for attempt in range(MAX_RETRIES):
            try:
                r = await client.post(
                    url,
                    json={"text": text},
                    headers=headers,
                    timeout=30,
                )
                if r.status_code == 200:
                    body = r.json()
                    return [
                        Span(start=e["start"], end=e["end"], label=e["type"])
                        for e in body.get("entities", [])
                    ]
                if r.status_code == 429:
                    delay = RETRY_BASE_DELAY * (2 ** attempt)
                    await asyncio.sleep(delay)
                    continue
                # Other error — don't retry
                print(f"  Warning: API returned {r.status_code}: {r.text[:200]}")
                return []
            except Exception as e:
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(RETRY_BASE_DELAY)
                    continue
                print(f"  Warning: request failed: {e}")
                return []

    return []


async def run_api_detect(
    texts: list[str],
    base_url: str,
    api_key: str,
    concurrency: int,
) -> list[list[Span]]:
    """Run API /detect on all texts with async concurrency."""
    sem = asyncio.Semaphore(concurrency)
    results: list[list[Span]] = [[] for _ in texts]
    completed = 0
    total = len(texts)

    async def worker(idx: int, text: str):
        nonlocal completed
        async with httpx.AsyncClient() as client:
            spans = await call_detect_api(client, base_url, api_key, text, sem)
            results[idx] = spans
            completed += 1
            if completed % max(1, total // 20) == 0 or completed == total:
                pct = completed / total * 100
                print(f"\r  API progress: {completed}/{total} ({pct:.0f}%)", end="", flush=True)

    tasks = [worker(i, text) for i, text in enumerate(texts)]
    await asyncio.gather(*tasks)
    print()  # newline after progress
    return results


# ---------------------------------------------------------------------------
# Local regex scanner (for --compare-regex)
# ---------------------------------------------------------------------------

def run_regex_scanner(texts: list[str]) -> list[list[Span]]:
    """Run local PIIScanner (regex only) on all texts."""
    from blindfold import PIIScanner

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


def gt_spans_regex_only(row: dict) -> list[Span]:
    """Extract ground-truth spans for regex-only evaluation."""
    spans = []
    for mask in row.get("privacy_mask", []):
        label = mask["label"]
        bf_label = AI4PRIVACY_TO_BLINDFOLD.get(label)
        if bf_label is not None:
            spans.append(Span(start=mask["start"], end=mask["end"], label=bf_label))
    return spans


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Benchmark Blindfold API /detect on AI4Privacy dataset",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--api-key",
        default=os.environ.get("BLINDFOLD_API_KEY", ""),
        help="Blindfold API key (or set BLINDFOLD_API_KEY env var)",
    )
    parser.add_argument(
        "--base-url",
        default=os.environ.get("BLINDFOLD_BASE_URL", DEFAULT_BASE_URL),
        help=f"API base URL (default: {DEFAULT_BASE_URL})",
    )
    parser.add_argument(
        "--samples-per-lang",
        type=int,
        default=DEFAULT_SAMPLES_PER_LANG,
        help=f"Samples per language (default: {DEFAULT_SAMPLES_PER_LANG})",
    )
    parser.add_argument(
        "--languages",
        nargs="+",
        default=DEFAULT_LANGUAGES,
        help=f"Languages to test (default: {' '.join(DEFAULT_LANGUAGES)})",
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=DEFAULT_CONCURRENCY,
        help=f"Max concurrent API requests (default: {DEFAULT_CONCURRENCY})",
    )
    parser.add_argument(
        "--compare-regex",
        action="store_true",
        help="Also run local PIIScanner for side-by-side comparison",
    )
    args = parser.parse_args()

    if not args.api_key:
        print("Error: --api-key required (or set BLINDFOLD_API_KEY env var)", file=sys.stderr)
        sys.exit(1)

    # Load dataset
    samples_by_lang = load_samples(args.languages, args.samples_per_lang)

    all_api_doc_counts: list[dict[str, Counts]] = []
    all_regex_doc_counts: list[dict[str, Counts]] = []
    lang_api_counts: dict[str, dict[str, Counts]] = {}
    lang_regex_counts: dict[str, dict[str, Counts]] = {}

    for lang in args.languages:
        samples = samples_by_lang[lang]
        if not samples:
            print(f"\n  Skipping {lang} -- no samples")
            continue

        texts = [s["source_text"] for s in samples]

        # Ground truth for API (includes NER types, with span merging)
        gt_api = [merge_adjacent_spans(gt_spans_from_row(s)) for s in samples]

        # Entity distribution
        entity_dist: dict[str, int] = defaultdict(int)
        for gt in gt_api:
            for span in gt:
                entity_dist[span.label] += 1
        print(f"\n  [{lang.upper()}] API-detectable GT entities: {dict(entity_dist)}")

        # Run API /detect
        print(f"  [{lang.upper()}] Calling API /detect on {len(texts)} texts (concurrency={args.concurrency})...")
        t0 = time.time()
        api_results = asyncio.run(
            run_api_detect(texts, args.base_url, args.api_key, args.concurrency)
        )
        elapsed = time.time() - t0
        api_total = sum(len(s) for s in api_results)
        print(f"  [{lang.upper()}] API: {api_total} detections in {elapsed:.1f}s")

        # Evaluate API
        api_doc_counts = [
            match_spans(pred, gt, iou_threshold=IOU_THRESHOLD)
            for pred, gt in zip(api_results, gt_api)
        ]
        api_agg = aggregate_counts(api_doc_counts)
        lang_api_counts[lang] = api_agg
        all_api_doc_counts.extend(api_doc_counts)

        print_results(api_agg, title=f"API /detect on AI4Privacy [{lang.upper()}]")

        # Optional: run local regex scanner for comparison
        if args.compare_regex:
            gt_regex = [gt_spans_regex_only(s) for s in samples]

            print(f"  [{lang.upper()}] Running local PIIScanner...")
            t0 = time.time()
            regex_results = run_regex_scanner(texts)
            regex_elapsed = time.time() - t0
            regex_total = sum(len(s) for s in regex_results)
            print(f"  [{lang.upper()}] Regex: {regex_total} detections in {regex_elapsed:.1f}s")

            regex_doc_counts = [
                match_spans(pred, gt, iou_threshold=IOU_THRESHOLD)
                for pred, gt in zip(regex_results, gt_regex)
            ]
            regex_agg = aggregate_counts(regex_doc_counts)
            lang_regex_counts[lang] = regex_agg
            all_regex_doc_counts.extend(regex_doc_counts)

            print_comparison(
                api_agg, regex_agg,
                name_a="API", name_b="Regex",
                title=f"API vs Regex [{lang.upper()}]",
            )

    # Overall across all languages
    overall_api = aggregate_counts(all_api_doc_counts)
    print_results(overall_api, title="API /detect on AI4Privacy [ALL LANGUAGES]")

    if args.compare_regex and all_regex_doc_counts:
        overall_regex = aggregate_counts(all_regex_doc_counts)
        print_comparison(
            overall_api, overall_regex,
            name_a="API", name_b="Regex",
            title="API vs Regex [ALL LANGUAGES]",
        )

    # Per-language summary
    from span_eval import f1, precision, recall
    from tabulate import tabulate

    print("\n" + "=" * 60)
    print(" Per-Language Summary — API /detect (micro-averaged)")
    print("=" * 60)

    rows = []
    for lang in args.languages:
        if lang not in lang_api_counts:
            continue
        total = Counts()
        for c in lang_api_counts[lang].values():
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

    # Print test configuration summary
    total_samples = sum(len(samples_by_lang[l]) for l in args.languages)
    total_chars = sum(
        len(s["source_text"])
        for l in args.languages
        for s in samples_by_lang[l]
    )
    print(f"\nConfig: {total_samples} samples, {total_chars:,} characters")
    print(f"API: {args.base_url} | Concurrency: {args.concurrency} | IoU: {IOU_THRESHOLD}")
    print()


if __name__ == "__main__":
    main()
