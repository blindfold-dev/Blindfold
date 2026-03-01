# Benchmark Results

Results from running the PII detection benchmark suite comparing Blindfold PIIScanner (regex-only) against Presidio AnalyzerEngine (NLP + regex).

## 1. Overall Summary

| Benchmark | System | Samples | Precision | Recall | F1 | Time |
|---|---|---:|---:|---:|---:|---:|
| Presidio Synthetic | Blindfold | 2,000 | **0.924** | 0.662 | **0.771** | **0.2s** |
| Presidio Synthetic | Presidio | 2,000 | 0.361 | **0.716** | 0.480 | 12.6s |
| AI4Privacy (all langs) | Blindfold | 3,000 | **0.802** | **0.461** | **0.586** | **0.4s** |
| AI4Privacy (all langs) | Presidio | 3,000 | 0.364 | 0.414 | 0.388 | 31.8s |

## 2. Per-Entity: Synthetic Data (Blindfold vs Presidio)

| Entity | P (BF) | R (BF) | F1 (BF) | P (Pr) | R (Pr) | F1 (Pr) | Winner |
|---|---:|---:|---:|---:|---:|---:|---|
| Email Address | 1.000 | 1.000 | **1.000** | 1.000 | 1.000 | **1.000** | Tie |
| IBAN | 1.000 | 1.000 | **1.000** | 1.000 | 1.000 | **1.000** | Tie |
| Social Security Number | 1.000 | 1.000 | **1.000** | 0.792 | 1.000 | 0.884 | Blindfold |
| IP Address | 1.000 | 1.000 | **1.000** | 0.955 | 1.000 | 0.977 | Blindfold |
| Credit Card Number | 1.000 | 0.888 | **0.941** | 1.000 | 0.686 | 0.814 | Blindfold |
| Phone Number | 0.919 | 0.479 | **0.630** | 0.577 | 0.317 | 0.409 | Blindfold |
| Date of Birth | 1.000 | 0.127 | 0.226 | 0.157 | 0.915 | **0.268** | Presidio |
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
| English | 0.811 | **0.689** | **0.745** |
| Spanish | **0.907** | 0.507 | 0.650 |
| German | 0.895 | 0.439 | 0.589 |
| Dutch | 0.713 | 0.446 | 0.548 |
| French | 0.781 | 0.336 | 0.470 |
| Italian | 0.689 | 0.350 | 0.464 |

## Key Takeaways

- **Overall F1**: Blindfold 58.6% vs Presidio 38.8% on AI4Privacy (+19.8pp)
- **Synthetic F1**: Blindfold 77.1% vs Presidio 48.0% (+29.1pp)
- **Precision**: Blindfold consistently 2x+ higher than Presidio (80-92% vs 36%)
- **Speed**: Blindfold 60-80x faster (0.2-0.4s vs 13-32s)
- **Credit Card**: Blindfold wins both benchmarks (F1 0.941 synthetic, 0.109 AI4Privacy)
- **Date of Birth**: Blindfold wins on AI4Privacy (F1 0.562 vs 0.466), loses on synthetic
- **Phone Number**: Blindfold dominates (F1 0.866 vs 0.372 on AI4Privacy)
- **SSN**: Blindfold wins on synthetic (1.000 vs 0.884), loses on AI4Privacy (dataset uses non-US social number formats)
- **Recall gap**: Expected for pure regex — NER-dependent types (names, addresses) are not regex-detectable
