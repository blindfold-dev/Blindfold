# PII Detection Benchmarks

Evaluate Blindfold's regex-based PIIScanner against established PII benchmarks and compare with Presidio.

## Setup

```bash
cd packages/python-sdk

# Install benchmark dependencies
pip install -r benchmarks/requirements.txt

# Download spaCy model (required by Presidio)
python -m spacy download en_core_web_sm

# Install Blindfold SDK (if not already)
pip install -e .
```

## Benchmarks

### 1. Presidio Synthetic Data (`bench_presidio.py`)

Generates 2000 synthetic PII sentences using presidio-evaluator's `PresidioSentenceFaker`, then runs both Blindfold and Presidio on the same texts.

```bash
python benchmarks/bench_presidio.py
```

**Output:** Per-entity P/R/F2 table for both systems + side-by-side comparison.

### 2. AI4Privacy Multilingual (`bench_ai4privacy.py`)

Evaluates Blindfold against the [ai4privacy/pii-masking-400k](https://huggingface.co/datasets/ai4privacy/pii-masking-400k) dataset — 500 samples per language across 6 languages (en, fr, de, it, es, nl).

```bash
python benchmarks/bench_ai4privacy.py
```

**Output:** Per-entity and per-language P/R/F1 tables. Only regex-detectable entity types are evaluated (NER-only types like names and addresses are excluded).

### 3. Head-to-Head Comparison (`bench_comparison.py`)

Runs both Blindfold and Presidio on the same AI4Privacy subset for a direct comparison.

```bash
python benchmarks/bench_comparison.py
```

**Output:** Side-by-side P/R/F1 table per entity type.

## Entity Coverage

Blindfold's regex scanner detects structured PII patterns. Entity types that require NLP/NER (person names, locations, organizations) are excluded from evaluation since they cannot be detected by regex.

**Regex-detectable types evaluated:**
- Email Address, Credit Card Number, Phone Number, IP Address, URL
- Social Security Number, ZIP Code, IBAN, Date of Birth
- Driver's License, MAC Address, US ITIN

**NER-only types (excluded):**
- Person names, Locations, Organizations, Usernames, Passwords

## Evaluation Method

- **Span matching:** IoU (Intersection-over-Union) ≥ 0.5
- **Metrics:** Precision, Recall, F1 (micro-averaged)
- **bench_presidio.py** uses F2 (beta=2) to weight recall higher
