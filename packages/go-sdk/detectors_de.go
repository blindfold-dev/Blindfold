package blindfold

import "regexp"

func init() {
	// German Personal ID
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityDEPersonalID,
			Pattern:         regexp.MustCompile(`\b[CFGHJKLMNPRTVWXYZ][0-9A-Z]\d{7}\d\b`),
			Score:           0.75,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"personalausweis", "personal id", "ausweis", "identity card", "id card", "ausweisnum"},
		})
	})

	// German Tax ID
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityDETaxID,
			Pattern:    regexp.MustCompile(`\b\d{2}\s?\d{3}\s?\d{3}\s?\d{3}\b`),
			Score:      0.85,
			NeedsDigit: true,
			Validator:  deTaxIdChecksum,
		})
	})
}
