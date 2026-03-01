package blindfold

import "regexp"

func init() {
	// Portuguese NIF
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityPTNIF,
			Pattern:         regexp.MustCompile(`\b[1-3589]\d{8}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"nif", "contribuinte", "fiscal", "tax"},
			Validator:       ptNifChecksum,
		})
	})
}
