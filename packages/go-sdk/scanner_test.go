package blindfold

import (
	"strings"
	"testing"
)

func TestScannerDetectEmail(t *testing.T) {
	scanner := NewPIIScanner(nil)
	matches := scanner.Detect("Send to user@example.com", nil)
	if len(matches) == 0 {
		t.Fatal("expected to detect email")
	}
	if matches[0].EntityType != EntityEmailAddress {
		t.Errorf("expected Email Address, got %s", matches[0].EntityType)
	}
	if matches[0].Text != "user@example.com" {
		t.Errorf("expected user@example.com, got %s", matches[0].Text)
	}
}

func TestScannerDetectCreditCard(t *testing.T) {
	scanner := NewPIIScanner(nil)
	matches := scanner.Detect("Credit card 4111111111111111", nil)
	if len(matches) == 0 {
		t.Fatal("expected to detect credit card")
	}
	found := false
	for _, m := range matches {
		if m.EntityType == EntityCreditCard {
			found = true
			break
		}
	}
	if !found {
		t.Error("expected Credit Card Number entity")
	}
}

func TestScannerTokenize(t *testing.T) {
	scanner := NewPIIScanner(nil)
	result := scanner.Tokenize("alice@example.com and bob@example.com", nil)
	if len(result.Mapping) != 2 {
		t.Fatalf("expected 2 mappings, got %d", len(result.Mapping))
	}
	if !strings.Contains(result.Text, "<Email Address_1>") {
		t.Error("expected <Email Address_1> in tokenized text")
	}
	if !strings.Contains(result.Text, "<Email Address_2>") {
		t.Error("expected <Email Address_2> in tokenized text")
	}
}

func TestScannerDetokenize(t *testing.T) {
	scanner := NewPIIScanner(nil)
	mapping := map[string]string{
		"<Email Address_1>": "alice@example.com",
		"<Email Address_2>": "bob@example.com",
	}
	result := scanner.Detokenize("<Email Address_1> and <Email Address_2>", mapping)
	if result != "alice@example.com and bob@example.com" {
		t.Errorf("unexpected result: %s", result)
	}
}

func TestScannerRedact(t *testing.T) {
	scanner := NewPIIScanner(nil)
	result := scanner.Redact("Contact alice@example.com please", nil)
	if strings.Contains(result.Text, "alice@example.com") {
		t.Error("expected email to be redacted")
	}
}

func TestScannerMask(t *testing.T) {
	scanner := NewPIIScanner(nil)
	result := scanner.Mask("Email: alice@example.com", 3, false, "*", nil)
	if result.Text == "Email: alice@example.com" {
		t.Error("expected email to be masked")
	}
	if len(result.Matches) == 0 {
		t.Fatal("expected matches")
	}
}

func TestScannerHash(t *testing.T) {
	scanner := NewPIIScanner(nil)
	result := scanner.Hash("Email: alice@example.com", "SHA-256", "HASH_", 16, nil)
	if !strings.Contains(result.Text, "HASH_") {
		t.Error("expected hash prefix in result")
	}
}

func TestScannerEncrypt(t *testing.T) {
	scanner := NewPIIScanner(nil)
	result, err := scanner.Encrypt("Email: alice@example.com", "my-encryption-key-16", nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Text == "Email: alice@example.com" {
		t.Error("expected encrypted output")
	}
}

func TestScannerSynthesize(t *testing.T) {
	scanner := NewPIIScanner(nil)
	result := scanner.Synthesize("Email: alice@example.com", "", nil)
	if result.Text == "Email: alice@example.com" {
		t.Error("expected synthesized output")
	}
	if !strings.Contains(result.Text, "@example.com") {
		t.Error("expected synthesized email to end with @example.com")
	}
}

func TestScannerDeduplicate(t *testing.T) {
	matches := []PIIMatch{
		{EntityType: "A", Start: 0, End: 5, Score: 0.8},
		{EntityType: "B", Start: 3, End: 8, Score: 0.9}, // overlaps with A
		{EntityType: "C", Start: 10, End: 15, Score: 0.7},
	}
	result := deduplicate(matches)
	if len(result) != 2 {
		t.Fatalf("expected 2 non-overlapping matches, got %d", len(result))
	}
}

func TestScannerDetectWithEntities(t *testing.T) {
	scanner := NewPIIScanner(nil)
	matches := scanner.Detect("alice@example.com 4111111111111111", []string{EntityEmailAddress})
	for _, m := range matches {
		if m.EntityType != EntityEmailAddress {
			t.Errorf("expected only email, got %s", m.EntityType)
		}
	}
}
