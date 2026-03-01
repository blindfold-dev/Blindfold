package blindfold

import (
	"context"
	"testing"
)

func TestLocalDetect(t *testing.T) {
	client := New()
	resp, err := client.Detect(context.Background(), "Contact john@example.com or call 555-123-4567")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.EntitiesCount == 0 {
		t.Fatal("expected at least one entity")
	}
	found := false
	for _, e := range resp.DetectedEntities {
		if e.Type == EntityEmailAddress && e.Text == "john@example.com" {
			found = true
			break
		}
	}
	if !found {
		t.Error("expected to detect email address john@example.com")
	}
}

func TestLocalDetectSSN(t *testing.T) {
	client := New(WithLocales([]string{"us"}))
	resp, err := client.Detect(context.Background(), "My SSN is 123-45-6789")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	found := false
	for _, e := range resp.DetectedEntities {
		if e.Type == EntitySSN {
			found = true
			break
		}
	}
	if !found {
		t.Error("expected to detect SSN")
	}
}

func TestLocalDetectCreditCard(t *testing.T) {
	client := New()
	resp, err := client.Detect(context.Background(), "Credit card: 4111-1111-1111-1111")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	found := false
	for _, e := range resp.DetectedEntities {
		if e.Type == EntityCreditCard {
			found = true
			if e.Score != 1.0 {
				t.Errorf("expected score 1.0, got %f", e.Score)
			}
			break
		}
	}
	if !found {
		t.Error("expected to detect credit card")
	}
}

func TestLocalDetectWithEntities(t *testing.T) {
	client := New()
	resp, err := client.Detect(context.Background(), "Email: test@example.com, Card: 4111-1111-1111-1111",
		WithEntities([]string{EntityEmailAddress}))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	for _, e := range resp.DetectedEntities {
		if e.Type != EntityEmailAddress {
			t.Errorf("expected only Email Address entities, got %s", e.Type)
		}
	}
}

func TestLocalTokenize(t *testing.T) {
	client := New()
	resp, err := client.Tokenize(context.Background(), "Email me at alice@example.com")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.Mapping == nil || len(resp.Mapping) == 0 {
		t.Fatal("expected non-empty mapping")
	}
	if resp.Text == "Email me at alice@example.com" {
		t.Error("expected text to be tokenized")
	}
	// Verify mapping contains the token
	for token, original := range resp.Mapping {
		if original != "alice@example.com" {
			t.Errorf("expected original alice@example.com, got %s", original)
		}
		if token != "<Email Address_1>" {
			t.Errorf("expected token <Email Address_1>, got %s", token)
		}
	}
}

func TestLocalDetokenize(t *testing.T) {
	client := New()
	mapping := map[string]string{
		"<Email Address_1>": "alice@example.com",
	}
	resp := client.Detokenize("Contact <Email Address_1>", mapping)
	if resp.Text != "Contact alice@example.com" {
		t.Errorf("expected 'Contact alice@example.com', got '%s'", resp.Text)
	}
	if resp.ReplacementsMade != 1 {
		t.Errorf("expected 1 replacement, got %d", resp.ReplacementsMade)
	}
}

func TestLocalRedact(t *testing.T) {
	client := New()
	resp, err := client.Redact(context.Background(), "Email me at alice@example.com please")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.EntitiesCount == 0 {
		t.Fatal("expected entities to be detected")
	}
	if resp.Text == "Email me at alice@example.com please" {
		t.Error("expected text to be redacted")
	}
}

func TestLocalMask(t *testing.T) {
	client := New()
	resp, err := client.Mask(context.Background(), "Email: alice@example.com",
		WithCharsToShow(3), WithMaskingChar("*"))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.EntitiesCount == 0 {
		t.Fatal("expected entities to be detected")
	}
}

func TestLocalHash(t *testing.T) {
	client := New()
	resp, err := client.Hash(context.Background(), "Email: alice@example.com")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.EntitiesCount == 0 {
		t.Fatal("expected entities to be detected")
	}
	if resp.Text == "Email: alice@example.com" {
		t.Error("expected text to be hashed")
	}
}

func TestLocalEncrypt(t *testing.T) {
	client := New()
	resp, err := client.Encrypt(context.Background(), "Email: alice@example.com", "my-secret-key-16char")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.EntitiesCount == 0 {
		t.Fatal("expected entities to be detected")
	}
	if resp.Text == "Email: alice@example.com" {
		t.Error("expected text to be encrypted")
	}
}

func TestLocalEncryptKeyTooShort(t *testing.T) {
	client := New()
	_, err := client.Encrypt(context.Background(), "test", "short")
	if err == nil {
		t.Error("expected error for short encryption key")
	}
}

func TestLocalSynthesize(t *testing.T) {
	client := New()
	resp, err := client.Synthesize(context.Background(), "Email: alice@example.com")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.EntitiesCount == 0 {
		t.Fatal("expected entities to be detected")
	}
	if resp.Text == "Email: alice@example.com" {
		t.Error("expected text to be synthesized")
	}
}

func TestPolicyResolution(t *testing.T) {
	client := New()
	resp, err := client.Detect(context.Background(), "Email: test@example.com SSN: 123-45-6789",
		WithCallPolicy("pci_dss"))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// PCI DSS policy should not include email
	for _, e := range resp.DetectedEntities {
		if e.Type == EntityEmailAddress {
			t.Error("PCI DSS policy should not detect email addresses")
		}
	}
}

func TestUseLocalMode(t *testing.T) {
	// No API key = local mode
	client := New()
	if !client.useLocal() {
		t.Error("expected local mode when no API key")
	}

	// With API key = API mode
	client2 := New(WithAPIKey("test-key"))
	if client2.useLocal() {
		t.Error("expected API mode when API key is set")
	}

	// Force local mode
	client3 := New(WithAPIKey("test-key"), WithMode("local"))
	if !client3.useLocal() {
		t.Error("expected local mode when mode is 'local'")
	}
}
