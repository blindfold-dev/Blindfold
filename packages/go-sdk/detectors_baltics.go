package blindfold

import "regexp"

func init() {
	// Lithuanian Personal Code
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityLTPersonalCode,
			Pattern:         regexp.MustCompile(`\b[1-6]\d{10}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"asmens kodas", "personal code", "asmens"},
			Validator:       ltPersonalCodeChecksum,
		})
	})

	// Latvian Personal Code
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityLVPersonalCode,
			Pattern:         regexp.MustCompile(`\b\d{6}-?\d{5}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"personas kods", "personal code", "personas"},
			Validator:       lvPersonalCodeChecksum,
		})
	})

	// Estonian Personal Code
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityEEPersonalCode,
			Pattern:         regexp.MustCompile(`\b[1-6]\d{10}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"isikukood", "personal code", "isiku"},
			Validator:       eePersonalCodeChecksum,
		})
	})
}
