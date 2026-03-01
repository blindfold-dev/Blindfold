package blindfold

import "regexp"

func init() {
	// Spanish DNI
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityESDNI,
			Pattern:    regexp.MustCompile(`\b\d{8}[-\s]?[A-Z]\b`),
			Score:      0.90,
			NeedsDigit: true,
			Validator:  esDniLetter,
		})
	})

	// Spanish NIE
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityESNIE,
			Pattern:    regexp.MustCompile(`\b[XYZ]\d{7}[-\s]?[A-Z]\b`),
			Score:      0.90,
			NeedsDigit: true,
			Validator:  esNieLetter,
		})
	})

	// Spanish NSS
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityESNSS,
			Pattern:         regexp.MustCompile(`\b\d{2}[-\s]?\d{8}[-\s]?\d{2}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"nss", "seguridad social", "social security", "afiliación"},
			Validator:       esNssChecksum,
		})
	})

	// Spanish CIF
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityESCIF,
			Pattern:    regexp.MustCompile(`\b[A-HJ-NP-SUVW]\d{7}[0-9A-J]\b`),
			Score:      0.85,
			NeedsDigit: true,
			Validator:  esCifChecksum,
		})
	})
}
