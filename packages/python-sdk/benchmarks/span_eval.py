"""Span-level evaluation utilities: IoU matching, TP/FP/FN counting, P/R/F1."""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from typing import NamedTuple

from tabulate import tabulate


class Span(NamedTuple):
    """A labelled character span."""

    start: int
    end: int
    label: str


def iou(a: Span, b: Span) -> float:
    """Compute Intersection-over-Union for two character spans (ignoring label)."""
    overlap = max(0, min(a.end, b.end) - max(a.start, b.start))
    union = max(a.end, b.end) - min(a.start, b.start)
    return overlap / union if union > 0 else 0.0


@dataclass
class Counts:
    tp: int = 0
    fp: int = 0
    fn: int = 0


def match_spans(
    predicted: list[Span],
    ground_truth: list[Span],
    iou_threshold: float = 0.5,
    type_strict: bool = True,
) -> dict[str, Counts]:
    """Match predicted spans against ground truth using IoU threshold.

    Args:
        predicted: Spans produced by the detector.
        ground_truth: Ground-truth spans.
        iou_threshold: Minimum IoU required for a match.
        type_strict: If True, labels must also match for a TP.

    Returns:
        Dict mapping each label to its TP/FP/FN counts.
    """
    counts: dict[str, Counts] = defaultdict(Counts)
    matched_gt: set[int] = set()

    for pred in predicted:
        best_iou = 0.0
        best_idx = -1
        for i, gt in enumerate(ground_truth):
            if i in matched_gt:
                continue
            score = iou(pred, gt)
            if score > best_iou:
                best_iou = score
                best_idx = i

        if best_iou >= iou_threshold and best_idx >= 0:
            gt_span = ground_truth[best_idx]
            if not type_strict or pred.label == gt_span.label:
                counts[pred.label].tp += 1
                matched_gt.add(best_idx)
            else:
                # IoU matches but label mismatch: FP for predicted, FN for ground truth
                counts[pred.label].fp += 1
                counts[gt_span.label].fn += 1
                matched_gt.add(best_idx)
        else:
            counts[pred.label].fp += 1

    # Unmatched ground truths are FNs
    for i, gt in enumerate(ground_truth):
        if i not in matched_gt:
            counts[gt.label].fn += 1

    return dict(counts)


def precision(c: Counts) -> float:
    return c.tp / (c.tp + c.fp) if (c.tp + c.fp) > 0 else 0.0


def recall(c: Counts) -> float:
    return c.tp / (c.tp + c.fn) if (c.tp + c.fn) > 0 else 0.0


def f1(c: Counts) -> float:
    p, r = precision(c), recall(c)
    return 2 * p * r / (p + r) if (p + r) > 0 else 0.0


def f_beta(c: Counts, beta: float = 2.0) -> float:
    """F-beta score (default beta=2 weights recall higher)."""
    p, r = precision(c), recall(c)
    if p + r == 0:
        return 0.0
    b2 = beta * beta
    return (1 + b2) * p * r / (b2 * p + r)


def aggregate_counts(all_counts: list[dict[str, Counts]]) -> dict[str, Counts]:
    """Sum counts across multiple documents."""
    total: dict[str, Counts] = defaultdict(Counts)
    for doc_counts in all_counts:
        for label, c in doc_counts.items():
            total[label].tp += c.tp
            total[label].fp += c.fp
            total[label].fn += c.fn
    return dict(total)


def print_results(
    counts: dict[str, Counts],
    title: str = "Results",
    beta: float = 1.0,
) -> None:
    """Print a formatted P/R/F table."""
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")

    rows = []
    total = Counts()
    for label in sorted(counts.keys()):
        c = counts[label]
        total.tp += c.tp
        total.fp += c.fp
        total.fn += c.fn
        rows.append([
            label,
            c.tp,
            c.fp,
            c.fn,
            f"{precision(c):.3f}",
            f"{recall(c):.3f}",
            f"{f_beta(c, beta):.3f}" if beta != 1.0 else f"{f1(c):.3f}",
        ])

    f_label = f"F{beta}" if beta != 1.0 else "F1"
    rows.append([
        "OVERALL (micro)",
        total.tp,
        total.fp,
        total.fn,
        f"{precision(total):.3f}",
        f"{recall(total):.3f}",
        f"{f_beta(total, beta):.3f}" if beta != 1.0 else f"{f1(total):.3f}",
    ])

    headers = ["Entity", "TP", "FP", "FN", "Precision", "Recall", f_label]
    print(tabulate(rows, headers=headers, tablefmt="github"))
    print()


def print_comparison(
    counts_a: dict[str, Counts],
    counts_b: dict[str, Counts],
    name_a: str = "System A",
    name_b: str = "System B",
    title: str = "Comparison",
) -> None:
    """Print a side-by-side comparison table for two systems."""
    print(f"\n{'='*80}")
    print(f" {title}")
    print(f"{'='*80}")

    all_labels = sorted(set(counts_a.keys()) | set(counts_b.keys()))
    rows = []
    total_a, total_b = Counts(), Counts()

    for label in all_labels:
        ca = counts_a.get(label, Counts())
        cb = counts_b.get(label, Counts())
        total_a.tp += ca.tp
        total_a.fp += ca.fp
        total_a.fn += ca.fn
        total_b.tp += cb.tp
        total_b.fp += cb.fp
        total_b.fn += cb.fn
        rows.append([
            label,
            f"{precision(ca):.3f}",
            f"{recall(ca):.3f}",
            f"{f1(ca):.3f}",
            f"{precision(cb):.3f}",
            f"{recall(cb):.3f}",
            f"{f1(cb):.3f}",
        ])

    rows.append([
        "OVERALL (micro)",
        f"{precision(total_a):.3f}",
        f"{recall(total_a):.3f}",
        f"{f1(total_a):.3f}",
        f"{precision(total_b):.3f}",
        f"{recall(total_b):.3f}",
        f"{f1(total_b):.3f}",
    ])

    headers = [
        "Entity",
        f"P ({name_a})", f"R ({name_a})", f"F1 ({name_a})",
        f"P ({name_b})", f"R ({name_b})", f"F1 ({name_b})",
    ]
    print(tabulate(rows, headers=headers, tablefmt="github"))
    print()
