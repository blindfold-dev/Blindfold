package blindfold

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"sort"
	"strings"
)

// PIIScanner performs local PII detection and transformation.
type PIIScanner struct {
	registry *DetectorRegistry
}

// NewPIIScanner creates a scanner with detectors for the given locales.
func NewPIIScanner(locales []string) *PIIScanner {
	return &PIIScanner{registry: NewDetectorRegistry(locales)}
}

// ---- Result types ----

// TokenizeResult holds tokenization output.
type TokenizeResult struct {
	Text    string
	Mapping map[string]string
	Matches []PIIMatch
}

// TextResult holds results with transformed text.
type TextResult struct {
	Text    string
	Matches []PIIMatch
}

// ---- Detect ----

// Detect finds PII in text, optionally filtered to specific entities.
func (s *PIIScanner) Detect(text string, entities []string) []PIIMatch {
	detectors := s.registry.Detectors()
	if len(entities) > 0 {
		entitySet := make(map[string]bool, len(entities))
		for _, e := range entities {
			entitySet[e] = true
		}
		var filtered []Detector
		for _, d := range detectors {
			if entitySet[d.EntityType()] {
				filtered = append(filtered, d)
			}
		}
		detectors = filtered
	}

	textHasDigit := hasDigit(text)
	textLower := strings.ToLower(text)

	var allMatches []PIIMatch
	for _, d := range detectors {
		if d.NeedsDigit() && !textHasDigit {
			continue
		}
		allMatches = append(allMatches, d.IterMatches(text, textLower)...)
	}

	return deduplicate(allMatches)
}

// ---- Tokenize ----

// Tokenize replaces PII with tokens like <Entity Type_1>.
func (s *PIIScanner) Tokenize(text string, entities []string) TokenizeResult {
	matches := s.Detect(text, entities)
	if len(matches) == 0 {
		return TokenizeResult{Text: text, Mapping: map[string]string{}, Matches: matches}
	}

	// Assign per-type counters in reading order (already sorted by start)
	counters := make(map[string]int)
	type tokenEntry struct {
		match PIIMatch
		token string
	}
	entries := make([]tokenEntry, len(matches))
	mapping := make(map[string]string)

	for i, m := range matches {
		counters[m.EntityType]++
		token := fmt.Sprintf("<%s_%d>", m.EntityType, counters[m.EntityType])
		entries[i] = tokenEntry{match: m, token: token}
		mapping[token] = m.Text
	}

	// Replace in descending order
	result := text
	for i := len(entries) - 1; i >= 0; i-- {
		e := entries[i]
		result = result[:e.match.Start] + e.token + result[e.match.End:]
	}

	return TokenizeResult{Text: result, Mapping: mapping, Matches: matches}
}

// ---- Detokenize (client-side only) ----

// Detokenize restores tokenized text using a mapping.
func (s *PIIScanner) Detokenize(text string, mapping map[string]string) string {
	if len(mapping) == 0 {
		return text
	}
	// Sort tokens by length descending to avoid partial replacements
	tokens := make([]string, 0, len(mapping))
	for k := range mapping {
		tokens = append(tokens, k)
	}
	sort.Slice(tokens, func(i, j int) bool {
		return len(tokens[i]) > len(tokens[j])
	})
	result := text
	for _, token := range tokens {
		result = strings.ReplaceAll(result, token, mapping[token])
	}
	return result
}

// ---- Redact ----

// Redact removes PII from text.
func (s *PIIScanner) Redact(text string, entities []string) TextResult {
	matches := s.Detect(text, entities)
	if len(matches) == 0 {
		return TextResult{Text: text, Matches: matches}
	}

	// Replace in reverse order
	result := text
	for i := len(matches) - 1; i >= 0; i-- {
		m := matches[i]
		start := m.Start
		if start > 0 && result[start-1] == ' ' {
			start--
		}
		result = result[:start] + result[m.End:]
	}

	return TextResult{Text: result, Matches: matches}
}

// ---- Mask ----

// Mask partially hides PII in text.
func (s *PIIScanner) Mask(text string, charsToShow int, fromEnd bool, maskingChar string, entities []string) TextResult {
	matches := s.Detect(text, entities)
	if len(matches) == 0 {
		return TextResult{Text: text, Matches: matches}
	}

	result := text
	for i := len(matches) - 1; i >= 0; i-- {
		m := matches[i]
		original := m.Text
		show := charsToShow
		if show > len(original) {
			show = len(original)
		}
		maskLen := len(original) - show

		var masked string
		if fromEnd {
			masked = strings.Repeat(maskingChar, maskLen) + original[maskLen:]
		} else {
			masked = original[:show] + strings.Repeat(maskingChar, maskLen)
		}
		result = result[:m.Start] + masked + result[m.End:]
	}

	return TextResult{Text: result, Matches: matches}
}

// ---- Hash ----

// Hash replaces PII with hash values.
func (s *PIIScanner) Hash(text, hashType, hashPrefix string, hashLength int, entities []string) TextResult {
	matches := s.Detect(text, entities)
	if len(matches) == 0 {
		return TextResult{Text: text, Matches: matches}
	}

	result := text
	for i := len(matches) - 1; i >= 0; i-- {
		m := matches[i]
		h := sha256.Sum256([]byte(m.Text))
		hexStr := hex.EncodeToString(h[:])
		if hashLength < len(hexStr) {
			hexStr = hexStr[:hashLength]
		}
		replacement := hashPrefix + hexStr
		result = result[:m.Start] + replacement + result[m.End:]
	}

	return TextResult{Text: result, Matches: matches}
}

// ---- Encrypt ----

// Encrypt replaces PII with AES-CBC encrypted values.
func (s *PIIScanner) Encrypt(text, encryptionKey string, entities []string) (TextResult, error) {
	if len(encryptionKey) < 16 {
		return TextResult{}, fmt.Errorf("encryption_key is required and must be at least 16 characters for local encryption")
	}

	matches := s.Detect(text, entities)
	if len(matches) == 0 {
		return TextResult{Text: text, Matches: matches}, nil
	}

	// Derive 256-bit key from password
	keyHash := sha256.Sum256([]byte(encryptionKey))

	result := text
	for i := len(matches) - 1; i >= 0; i-- {
		m := matches[i]

		// Generate random IV
		iv := make([]byte, aes.BlockSize)
		if _, err := rand.Read(iv); err != nil {
			return TextResult{}, fmt.Errorf("encryption failed: %w", err)
		}

		block, err := aes.NewCipher(keyHash[:])
		if err != nil {
			return TextResult{}, fmt.Errorf("encryption failed: %w", err)
		}

		// PKCS7 padding
		plaintext := []byte(m.Text)
		padding := aes.BlockSize - (len(plaintext) % aes.BlockSize)
		for j := 0; j < padding; j++ {
			plaintext = append(plaintext, byte(padding))
		}

		ciphertext := make([]byte, len(plaintext))
		mode := cipher.NewCBCEncrypter(block, iv)
		mode.CryptBlocks(ciphertext, plaintext)

		// IV + ciphertext, base64 encoded
		combined := append(iv, ciphertext...)
		replacement := base64.StdEncoding.EncodeToString(combined)
		result = result[:m.Start] + replacement + result[m.End:]
	}

	return TextResult{Text: result, Matches: matches}, nil
}

// ---- Synthesize ----

// Synthesize replaces PII with realistic fake data.
func (s *PIIScanner) Synthesize(text, language string, entities []string) TextResult {
	matches := s.Detect(text, entities)
	if len(matches) == 0 {
		return TextResult{Text: text, Matches: matches}
	}

	result := text
	for i := len(matches) - 1; i >= 0; i-- {
		m := matches[i]
		replacement := SynthesizeValue(m.EntityType, m.Text)
		result = result[:m.Start] + replacement + result[m.End:]
	}

	return TextResult{Text: result, Matches: matches}
}
