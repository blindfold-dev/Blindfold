package blindfold

import "regexp"

func init() {
	// French National ID (NIR)
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityFRNationalID,
			Pattern:    regexp.MustCompile(`\b[12]\s?\d{2}\s?(?:0[1-9]|1[0-2]|[2-9]\d)\s?\d{2,3}\s?\d{3}\s?\d{3}\s?\d{2}\b`),
			Score:      0.90,
			NeedsDigit: true,
			Validator:  frNirChecksum,
		})
	})

	// French SIREN
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityFRSIREN,
			Pattern:         regexp.MustCompile(`\b\d{3}[-\s]?\d{3}[-\s]?\d{3}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"siren", "siret", "entreprise", "company", "société", "rcs"},
			Validator:       luhnChecksum,
		})
	})
}
