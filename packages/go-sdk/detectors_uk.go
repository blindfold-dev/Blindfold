package blindfold

import "regexp"

func init() {
	// NI Number
	RegisterRegion("uk", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityNINumber,
			Pattern:    regexp.MustCompile(`\b(?:(?:[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]))\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]\b`),
			Score:      0.90,
			NeedsDigit: false,
		})
	})

	// NHS Number
	RegisterRegion("uk", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityNHSNumber,
			Pattern:    regexp.MustCompile(`\b\d{3}\s?\d{3}\s?\d{4}\b`),
			Score:      0.85,
			NeedsDigit: true,
			Validator:  nhsChecksum,
		})
	})

	// UK Postcode
	RegisterRegion("uk", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityUKPostcode,
			Pattern:    regexp.MustCompile(`\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b`),
			Score:      0.85,
			NeedsDigit: false,
		})
	})

	// UK Passport
	RegisterRegion("uk", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityUKPassport,
			Pattern:         regexp.MustCompile(`\b\d{9}\b`),
			Score:           0.75,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"passport", "passport number", "passport no", "passport#"},
		})
	})

	// UK UTR
	RegisterRegion("uk", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityUKUTR,
			Pattern:         regexp.MustCompile(`\b\d{10}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"utr", "unique taxpayer", "tax reference", "self assessment"},
			Validator:       ukUtrChecksum,
		})
	})
}
