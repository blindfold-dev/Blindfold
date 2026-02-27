# Benchmark Results

Results from running the PII detection benchmark suite comparing Blindfold PIIScanner (regex-only) against Presidio AnalyzerEngine (NLP + regex).

## 1. Overall Summary

| Benchmark | System | Samples | Precision | Recall | F1 | Time |
|---|---|---:|---:|---:|---:|---:|
| Presidio Synthetic | Blindfold | 2,000 | **0.860** | 0.410 | **0.556** | **0.1s** |
| Presidio Synthetic | Presidio | 2,000 | 0.395 | **0.732** | 0.513 | 11.4s |
| AI4Privacy (all langs) | Blindfold | 3,000 | **0.816** | 0.324 | **0.464** | **0.3s** |
| AI4Privacy (all langs) | Presidio | 3,000 | 0.365 | **0.414** | 0.388 | 32.3s |

## 2. Per-Entity: Synthetic Data (Blindfold vs Presidio)

| Entity | P (BF) | R (BF) | F1 (BF) | P (Pr) | R (Pr) | F1 (Pr) | Winner |
|---|---:|---:|---:|---:|---:|---:|---|
| Email Address | 1.000 | 1.000 | **1.000** | 1.000 | 1.000 | **1.000** | Tie |
| IBAN | 1.000 | 1.000 | **1.000** | 1.000 | 1.000 | **1.000** | Tie |
| Social Security Number | 1.000 | 1.000 | **1.000** | 0.880 | 1.000 | 0.936 | Blindfold |
| IP Address | 0.905 | 1.000 | **0.950** | 0.900 | 0.947 | 0.923 | Blindfold |
| Credit Card Number | 1.000 | 0.391 | 0.562 | 1.000 | 0.734 | **0.846** | Presidio |
| Phone Number | 1.000 | 0.235 | 0.380 | 0.627 | 0.386 | **0.478** | Presidio |
| Date of Birth | 1.000 | 0.089 | 0.164 | 0.195 | 0.884 | **0.320** | Presidio |
| URL | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | Tie (both 0) |

## 3. Per-Entity: AI4Privacy (Blindfold vs Presidio)

| Entity | P (BF) | R (BF) | F1 (BF) | P (Pr) | R (Pr) | F1 (Pr) | Winner |
|---|---:|---:|---:|---:|---:|---:|---|
| Email Address | 0.998 | 0.960 | **0.979** | 0.998 | 0.999 | **0.999** | Presidio |
| Phone Number | 0.972 | 0.456 | **0.620** | 0.381 | 0.364 | 0.372 | Blindfold |
| ZIP Code | 0.978 | 0.151 | **0.261** | 0.000 | 0.000 | 0.000 | Blindfold |
| Social Security Number | 0.847 | 0.096 | 0.173 | 0.258 | 0.218 | **0.236** | Presidio |
| Driver's License | 0.909 | 0.052 | **0.098** | 0.000 | 0.000 | 0.000 | Blindfold |
| Date of Birth | 1.000 | 0.039 | 0.075 | 0.338 | 0.750 | **0.466** | Presidio |
| Credit Card Number | 0.588 | 0.027 | 0.051 | 0.145 | 0.056 | **0.081** | Presidio |

## 4. Per-Language: AI4Privacy (Blindfold)

| Language | Precision | Recall | F1 | Detections |
|---|---:|---:|---:|---:|
| English | 0.825 | **0.494** | **0.618** | 560 |
| Spanish | 0.887 | 0.375 | 0.527 | 406 |
| German | **0.890** | 0.287 | 0.434 | 318 |
| Dutch | 0.749 | 0.299 | 0.428 | 334 |
| French | 0.856 | 0.258 | 0.396 | 291 |
| Italian | 0.666 | 0.228 | 0.340 | 311 |

## Key Takeaways

- **Precision**: Blindfold consistently 2x+ higher than Presidio (82-86% vs 37-40%)
- **Speed**: Blindfold 100x faster (0.1-0.3s vs 11-32s)
- **Recall gap**: Expected for pure regex — NER-dependent types (dates, names) pull recall down
- **Strongest entities**: Email (98-100% F1), IBAN/SSN (100% on synthetic)
- **Weakest entities**: Date of Birth, Credit Card (format variance across locales)
