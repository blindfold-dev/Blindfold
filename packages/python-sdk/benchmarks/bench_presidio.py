#!/usr/bin/env python3
"""Benchmark: Blindfold PIIScanner vs Presidio on synthetic PII data.

Generates synthetic sentences using presidio-evaluator's PresidioSentenceFaker,
then runs both Blindfold and Presidio on the same texts to compare P/R/F1.
"""

from __future__ import annotations

import sys
import time

from presidio_analyzer import AnalyzerEngine
from presidio_evaluator.data_generator import PresidioSentenceFaker

from blindfold import PIIScanner

from entity_mapping import BLINDFOLD_TO_PRESIDIO, PRESIDIO_TO_BLINDFOLD
from span_eval import (
    Counts,
    Span,
    aggregate_counts,
    match_spans,
    print_comparison,
    print_results,
)

# Number of synthetic samples to generate
N_SAMPLES = 2000


def generate_dataset(n: int = N_SAMPLES) -> list:
    """Generate synthetic PII sentences via PresidioSentenceFaker."""
    print(f"Generating {n} synthetic samples...")
    faker = PresidioSentenceFaker(locale="en", lower_case_ratio=0.05)
    samples = faker.generate_new_fake_sentences(n)
    print(f"  Generated {len(samples)} samples")
    return samples


def gt_spans_from_sample(sample) -> list[Span]:
    """Extract ground-truth spans from a presidio InputSample.

    Only includes entity types that Blindfold can detect via regex
    (skips NER-only types like PERSON, LOCATION, ORGANIZATION).
    """
    spans = []
    for s in sample.spans:
        entity = s.entity_type
        if entity in PRESIDIO_TO_BLINDFOLD and PRESIDIO_TO_BLINDFOLD[entity] is not None:
            # Normalize to Blindfold label for comparison
            label = PRESIDIO_TO_BLINDFOLD[entity]
            spans.append(Span(start=s.start_position, end=s.end_position, label=label))
    return spans


def run_blindfold(texts: list[str]) -> list[list[Span]]:
    """Run Blindfold PIIScanner on all texts."""
    scanner = PIIScanner(locales=["us", "eu"])
    results = []
    for text in texts:
        matches = scanner.detect(text)
        spans = []
        for m in matches:
            if m.entity_type in BLINDFOLD_TO_PRESIDIO:
                spans.append(Span(start=m.start, end=m.end, label=m.entity_type))
        results.append(spans)
    return results


def run_presidio(texts: list[str]) -> list[list[Span]]:
    """Run Presidio AnalyzerEngine on all texts."""
    analyzer = AnalyzerEngine()
    supported = list(PRESIDIO_TO_BLINDFOLD.keys())
    results = []
    for text in texts:
        detections = analyzer.analyze(text=text, entities=supported, language="en")
        spans = []
        for d in detections:
            bf_label = PRESIDIO_TO_BLINDFOLD.get(d.entity_type)
            if bf_label is not None:
                spans.append(Span(start=d.start, end=d.end, label=bf_label))
        results.append(spans)
    return results


def main() -> None:
    # Generate data
    samples = generate_dataset(N_SAMPLES)
    texts = [s.full_text for s in samples]
    gt_all = [gt_spans_from_sample(s) for s in samples]

    # Count ground-truth entities
    gt_entity_counts: dict[str, int] = {}
    for gt in gt_all:
        for span in gt:
            gt_entity_counts[span.label] = gt_entity_counts.get(span.label, 0) + 1
    print("\nGround-truth entity distribution:")
    for label, count in sorted(gt_entity_counts.items(), key=lambda x: -x[1]):
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
    pr_all = run_presidio(texts)
    pr_time = time.time() - t0
    pr_total = sum(len(s) for s in pr_all)
    print(f"  Presidio: {pr_total} detections in {pr_time:.1f}s")

    # Evaluate Blindfold
    bf_counts = aggregate_counts([
        match_spans(pred, gt, iou_threshold=0.5)
        for pred, gt in zip(bf_all, gt_all)
    ])
    print_results(bf_counts, title="Blindfold PIIScanner (regex)", beta=2.0)

    # Evaluate Presidio
    pr_counts = aggregate_counts([
        match_spans(pred, gt, iou_threshold=0.5)
        for pred, gt in zip(pr_all, gt_all)
    ])
    print_results(pr_counts, title="Presidio AnalyzerEngine (NLP + regex)", beta=2.0)

    # Side-by-side
    print_comparison(
        bf_counts,
        pr_counts,
        name_a="Blindfold",
        name_b="Presidio",
        title="Head-to-Head: Blindfold vs Presidio (Synthetic Data)",
    )

    print(f"Timing: Blindfold {bf_time:.1f}s | Presidio {pr_time:.1f}s")


if __name__ == "__main__":
    main()
