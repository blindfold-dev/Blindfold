package blindfold

import (
	"regexp"
	"strings"
)

func init() {
	// Email
	RegisterUniversal(func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityEmailAddress,
			Pattern:    regexp.MustCompile(`\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b`),
			Score:      0.95,
			NeedsDigit: false,
			PreCheck:   func(s string) bool { return strings.Contains(s, "@") },
		})
	})

	// URL
	RegisterUniversal(func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityURL,
			Pattern:    regexp.MustCompile(`https?://(?:[\w\-]+\.)+[a-zA-Z]{2,}(?:/[^\s<>"'\)\]]*)?`),
			Score:      0.85,
			NeedsDigit: false,
			Validator:  urlValidTld,
			PreCheck:   func(s string) bool { return strings.Contains(s, "://") },
		})
	})

	// MAC Address
	RegisterUniversal(func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityMACAddress,
			Pattern:    regexp.MustCompile(`\b(?:[0-9A-Fa-f]{2}[:\-]){5}[0-9A-Fa-f]{2}\b`),
			Score:      0.95,
			NeedsDigit: true,
		})
	})

	// CVV
	RegisterUniversal(func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityCVV,
			Pattern:         regexp.MustCompile(`\b\d{3,4}\b`),
			Score:           0.80,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"cvv", "cvc", "cvv2", "cvc2", "security code", "card verification", "cid"},
		})
	})

	// Credit Card (custom detector)
	RegisterUniversal(func() Detector { return &creditCardDetector{} })

	// Phone (custom detector)
	RegisterUniversal(func() Detector { return &phoneDetector{} })

	// Date of Birth
	RegisterUniversal(func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityDateOfBirth,
			Pattern: regexp.MustCompile(`(?:^|[^\d])` +
				`(?:` +
				`(?:0?[1-9]|1[0-2])[/\-.](?:0?[1-9]|[12]\d|3[01])[/\-.](?:19|20)\d{2}` +
				`|(?:0?[1-9]|[12]\d|3[01])[/\-.](?:0?[1-9]|1[0-2])[/\-.](?:19|20)\d{2}` +
				`|(?:19|20)\d{2}[/\-.](?:0?[1-9]|1[0-2])[/\-.](?:0?[1-9]|[12]\d|3[01])` +
				`|(?i:January|February|March|April|May|June|July|August|September|October|November|December` +
				`|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+(?:0?[1-9]|[12]\d|3[01])(?:st|nd|rd|th)?,?\s+(?:19|20)\d{2}` +
				`|(?:0?[1-9]|[12]\d|3[01])(?:st|nd|rd|th)?\s+(?i:January|February|March|April|May|June|July|August|September|October|November|December` +
				`|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?,?\s+(?:19|20)\d{2}` +
				`|(?:0?[1-9]|[12]\d|3[01])[/\-.](?:0?[1-9]|1[0-2])[/\-.]\d{2}(?:[^\d]|$)` +
				`|(?:0?[1-9]|1[0-2])[/\-.](?:0?[1-9]|[12]\d|3[01])[/\-.]\d{2}(?:[^\d]|$)` +
				`)`),
			Score:           0.75,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextWindow:   100,
			ContextKeywords: []string{
				"born", "dob", "date of birth", "birthday", "birthdate", "d.o.b",
				"birth date", "birth", "b-day", "bday", "age", "d/o/b", "born on",
				"date de naissance", "geburtsdatum", "fecha de nacimiento",
				"geboortedatum", "data di nascita",
			},
			Validator: validDate,
		})
	})

	// IP Address (custom detector)
	RegisterUniversal(func() Detector { return &ipAddressDetector{} })
}

// ---- Credit Card (custom) ----

var ccKnownIIN = regexp.MustCompile(
	`\b(?:` +
		`4\d{3}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}(?:[-\s]?\d{3})?` +
		`|5[1-5]\d{2}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}` +
		`|3[47]\d{1,2}[-\s]?\d{4,6}[-\s]?\d{4,5}(?:[-\s]?\d{3,4})?` +
		`|6(?:011|5\d{2}|4[4-9]\d|22[1-9]|2[3-6]\d{2}|27[01]\d|2720)[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}` +
		`|(?:2131|1800|35\d{3})[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{3,4}` +
		`|3(?:0[0-5]|[68]\d)\d[-\s]?\d{4,6}[-\s]?\d{4,5}` +
		`)\b`)

var ccGeneric = regexp.MustCompile(`\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{1,7}\b`)

var ccContextKeywords = []string{
	"credit card", "card number", "card no", "card #", "cc:", "cc #",
	"payment card", "debit card", "billing", "card:", "credit", "payment",
}

type creditCardDetector struct{}

func (d *creditCardDetector) EntityType() string { return EntityCreditCard }
func (d *creditCardDetector) NeedsDigit() bool   { return true }

func (d *creditCardDetector) IterMatches(text, textLower string) []PIIMatch {
	var results []PIIMatch
	var knownRanges [][2]int

	// Branch 1: Known IIN patterns
	for _, loc := range ccKnownIIN.FindAllStringIndex(text, -1) {
		matched := text[loc[0]:loc[1]]
		if luhnChecksum(matched) {
			results = append(results, PIIMatch{EntityCreditCard, matched, loc[0], loc[1], 1.0})
			knownRanges = append(knownRanges, [2]int{loc[0], loc[1]})
		}
	}

	// Branch 2: Generic patterns (context + Luhn)
	for _, loc := range ccGeneric.FindAllStringIndex(text, -1) {
		start, end := loc[0], loc[1]
		overlaps := false
		for _, r := range knownRanges {
			if start < r[1] && end > r[0] {
				overlaps = true
				break
			}
		}
		if overlaps {
			continue
		}
		if !hasContextWindow(textLower, start, 100, ccContextKeywords) {
			continue
		}
		matched := text[start:end]
		if luhnChecksum(matched) {
			results = append(results, PIIMatch{EntityCreditCard, matched, start, end, 1.0})
		}
	}
	return results
}

// ---- Phone (custom for Go RE2 - no lookbehind) ----

var phonePattern = regexp.MustCompile(
	`(?:` +
		`(?:\+?1[-. ]?)?\([2-9]\d{2}\)[-. ]?[2-9]\d{2}[-. ]?\d{4}` +
		`|(?:\+?1[-. ]?)?[2-9]\d{2}[-. ][2-9]\d{2}[-. ]?\d{4}` +
		`|\+[1-9]\d{0,2}[-. ]?\(?\d{1,4}\)?[-. ]?\d{1,4}[-. ]?\d{1,9}` +
		`|0\d{1,3}[-. ]\d{2,4}[-. ]?\d{2,4}[-. ]?\d{0,4}` +
		`)` +
		`(?:\s?(?:x|ext\.?)\s?\d{1,5})?`)

var phoneContextKeywords = []string{
	"phone", "tel", "telephone", "call", "mobile", "cell", "fax",
	"contact", "dial", "reach", "ring", "text", "sms", "whatsapp",
	"number", "ph#", "ph #", "cell#", "cell #",
}

type phoneDetector struct{}

func (d *phoneDetector) EntityType() string { return EntityPhoneNumber }
func (d *phoneDetector) NeedsDigit() bool   { return true }

func (d *phoneDetector) IterMatches(text, textLower string) []PIIMatch {
	var results []PIIMatch
	for _, loc := range phonePattern.FindAllStringIndex(text, -1) {
		start, end := loc[0], loc[1]
		// Post-match boundary check (replaces lookbehind)
		if start > 0 && text[start-1] >= '0' && text[start-1] <= '9' {
			continue
		}
		if end < len(text) && text[end] >= '0' && text[end] <= '9' {
			continue
		}
		matched := text[start:end]
		if !phoneLengthCheck(matched) {
			continue
		}
		hasCtx := hasContextWindow(textLower, start, 80, phoneContextKeywords)
		score := 0.85
		if hasCtx {
			score = 1.0
		}
		results = append(results, PIIMatch{EntityPhoneNumber, matched, start, end, score})
	}
	return results
}

// ---- IP Address (custom) ----

var ipv4Pattern = regexp.MustCompile(`\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b`)
var ipv6Pattern = regexp.MustCompile(`\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b` +
	`|\b(?:[0-9a-fA-F]{1,4}:){1,7}:\b` +
	`|\b::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}\b`)
var versionPrefix = regexp.MustCompile(`(?i:v|version\s*)$`)

type ipAddressDetector struct{}

func (d *ipAddressDetector) EntityType() string { return EntityIPAddress }
func (d *ipAddressDetector) NeedsDigit() bool   { return true }

func (d *ipAddressDetector) IterMatches(text, textLower string) []PIIMatch {
	var results []PIIMatch

	for _, loc := range ipv4Pattern.FindAllStringIndex(text, -1) {
		before := text[:loc[0]]
		if versionPrefix.MatchString(before) {
			continue
		}
		results = append(results, PIIMatch{EntityIPAddress, text[loc[0]:loc[1]], loc[0], loc[1], 0.95})
	}

	for _, loc := range ipv6Pattern.FindAllStringIndex(text, -1) {
		results = append(results, PIIMatch{EntityIPAddress, text[loc[0]:loc[1]], loc[0], loc[1], 0.95})
	}

	return results
}

// ---- Shared context helper ----

func hasContextWindow(textLower string, start, window int, keywords []string) bool {
	if len(keywords) == 0 {
		return true
	}
	ws := start - window
	if ws < 0 {
		ws = 0
	}
	we := start + window
	if we > len(textLower) {
		we = len(textLower)
	}
	w := textLower[ws:we]
	for _, kw := range keywords {
		if strings.Contains(w, kw) {
			return true
		}
	}
	return false
}
