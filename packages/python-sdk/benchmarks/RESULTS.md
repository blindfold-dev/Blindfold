# Benchmark Results

Results from running the PII detection benchmark suite comparing Blindfold PIIScanner (regex-only) against Presidio AnalyzerEngine (NLP + regex).

## 1. Overall Summary

| Benchmark | System | Samples | Precision | Recall | F1 | Time |
|---|---|---:|---:|---:|---:|---:|
| Presidio Synthetic | Blindfold | 2,000 | **0.912** | 0.646 | **0.756** | **0.2s** |
| Presidio Synthetic | Presidio | 2,000 | 0.381 | **0.760** | 0.508 | 11.6s |
| AI4Privacy (all langs) | Blindfold | 3,000 | **0.802** | **0.461** | **0.586** | **0.4s** |
| AI4Privacy (all langs) | Presidio | 3,000 | 0.364 | 0.414 | 0.388 | 33.8s |

## 2. Per-Entity: Synthetic Data (Blindfold vs Presidio)

| Entity | P (BF) | R (BF) | F1 (BF) | P (Pr) | R (Pr) | F1 (Pr) | Winner |
|---|---:|---:|---:|---:|---:|---:|---|
| Email Address | 1.000 | 1.000 | **1.000** | 1.000 | 1.000 | **1.000** | Tie |
| IBAN | 1.000 | 1.000 | **1.000** | 1.000 | 1.000 | **1.000** | Tie |
| Social Security Number | 1.000 | 1.000 | **1.000** | 0.929 | 1.000 | 0.963 | Blindfold |
| IP Address | 1.000 | 1.000 | **1.000** | 0.895 | 0.944 | 0.919 | Blindfold |
| Credit Card Number | 1.000 | 0.894 | **0.944** | 1.000 | 0.723 | 0.840 | Blindfold |
| Phone Number | 0.916 | 0.571 | **0.704** | 0.577 | 0.421 | 0.487 | Blindfold |
| Date of Birth | 1.000 | 0.129 | 0.229 | 0.200 | 0.939 | **0.330** | Presidio |
| URL | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | Tie (both 0) |

## 3. Per-Entity: AI4Privacy (Blindfold vs Presidio)

| Entity | P (BF) | R (BF) | F1 (BF) | P (Pr) | R (Pr) | F1 (Pr) | Winner |
|---|---:|---:|---:|---:|---:|---:|---|
| Email Address | 0.998 | 0.960 | 0.979 | 0.998 | 0.999 | **0.999** | Presidio |
| Phone Number | 0.893 | 0.842 | **0.866** | 0.381 | 0.364 | 0.372 | Blindfold |
| Date of Birth | 0.928 | 0.403 | **0.562** | 0.338 | 0.750 | 0.466 | Blindfold |
| ZIP Code | 0.845 | 0.175 | **0.290** | 0.000 | 0.000 | 0.000 | Blindfold |
| Social Security Number | 0.473 | 0.112 | 0.181 | 0.257 | 0.216 | **0.235** | Presidio |
| Credit Card Number | 0.500 | 0.061 | **0.109** | 0.145 | 0.056 | 0.081 | Blindfold |
| Driver's License | 0.905 | 0.049 | **0.093** | 0.000 | 0.000 | 0.000 | Blindfold |

**Blindfold wins 5 of 7 entity types** on AI4Privacy (loses SSN and Email).

## 4. Per-Language: AI4Privacy (Blindfold)

| Language | Precision | Recall | F1 |
|---|---:|---:|---:|
| English | 0.803 | **0.620** | **0.700** |
| Spanish | 0.903 | 0.482 | 0.628 |
| German | **0.891** | 0.413 | 0.564 |
| Dutch | 0.713 | 0.422 | 0.530 |
| French | 0.790 | 0.331 | 0.467 |
| Italian | 0.696 | 0.326 | 0.444 |

## Key Takeaways

- **Overall F1**: Blindfold 58.6% vs Presidio 38.8% on AI4Privacy (+19.8pp)
- **Synthetic F1**: Blindfold 75.6% vs Presidio 50.8% (+24.8pp)
- **Precision**: Blindfold consistently 2x+ higher than Presidio (80-91% vs 36-38%)
- **Speed**: Blindfold 60-80x faster (0.2-0.4s vs 12-34s)
- **Credit Card**: Blindfold wins both benchmarks (F1 0.944 synthetic, 0.109 AI4Privacy)
- **Date of Birth**: Blindfold wins on AI4Privacy (F1 0.562 vs 0.466), loses on synthetic
- **Phone Number**: Blindfold dominates (F1 0.866 vs 0.372 on AI4Privacy)
- **SSN**: Blindfold wins on synthetic (1.000 vs 0.963), loses on AI4Privacy (dataset uses non-US social number formats)
- **Recall gap**: Expected for pure regex — NER-dependent types (names, addresses) are not regex-detectable
