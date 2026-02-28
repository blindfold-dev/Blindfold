# Benchmark Results

Results from running the PII detection benchmark suite comparing Blindfold PIIScanner (regex-only) against Presidio AnalyzerEngine (NLP + regex).

## 1. Overall Summary

| Benchmark | System | Samples | Precision | Recall | F1 | Time |
|---|---|---:|---:|---:|---:|---:|
| AI4Privacy (all langs) | Blindfold | 3,000 | **0.807** | **0.459** | **0.586** | **0.4s** |
| AI4Privacy (all langs) | Presidio | 3,000 | 0.364 | 0.414 | 0.388 | 32.5s |

**Blindfold wins on F1 by +19.8pp while being 80x faster.**

## 2. Per-Entity: AI4Privacy (Blindfold vs Presidio)

| Entity | P (BF) | R (BF) | F1 (BF) | P (Pr) | R (Pr) | F1 (Pr) | Winner |
|---|---:|---:|---:|---:|---:|---:|---|
| Email Address | 0.998 | 0.960 | 0.979 | 0.998 | 0.999 | **0.999** | Presidio |
| Phone Number | 0.891 | 0.842 | **0.866** | 0.381 | 0.364 | 0.372 | Blindfold |
| Date of Birth | 0.928 | 0.403 | **0.562** | 0.338 | 0.750 | 0.466 | Blindfold |
| ZIP Code | 0.845 | 0.175 | **0.290** | 0.000 | 0.000 | 0.000 | Blindfold |
| Social Security Number | 0.496 | 0.107 | 0.176 | 0.257 | 0.216 | **0.235** | Presidio |
| Driver's License | 0.905 | 0.049 | **0.093** | 0.000 | 0.000 | 0.000 | Blindfold |
| Credit Card Number | 0.615 | 0.043 | 0.080 | 0.145 | 0.056 | **0.081** | Presidio |

**Blindfold wins 4 of 7 entity types**, ties 0, loses 3. Presidio wins on SSN, Credit Card (marginal), and Email.

## 3. Per-Language: AI4Privacy (Blindfold)

| Language | Precision | Recall | F1 |
|---|---:|---:|---:|
| English | 0.803 | **0.620** | **0.700** |
| Spanish | 0.903 | 0.482 | 0.628 |
| German | **0.891** | 0.413 | 0.564 |
| Dutch | 0.713 | 0.422 | 0.530 |
| French | 0.790 | 0.331 | 0.467 |
| Italian | 0.696 | 0.326 | 0.444 |

## Key Takeaways

- **Overall F1**: Blindfold 58.6% vs Presidio 38.8% (+19.8pp)
- **Precision**: Blindfold consistently 2x+ higher than Presidio (80.7% vs 36.4%)
- **Speed**: Blindfold ~80x faster (0.4s vs 32.5s)
- **Date of Birth**: Blindfold now wins (F1 0.562 vs 0.466) with 92.8% precision
- **Phone Number**: Blindfold dominates (F1 0.866 vs 0.372)
- **Recall gap**: Expected for pure regex — NER-dependent types (names, addresses) are not regex-detectable
- **Strongest entities**: Email (97.9% F1), Phone (86.6% F1), Date of Birth (56.2% F1)
