package blindfold

import "regexp"

func init() {
	// Swiss AHV
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityCHAHV,
			Pattern:    regexp.MustCompile(`\b756[.\s]?\d{4}[.\s]?\d{4}[.\s]?\d{2}\b`),
			Score:      0.85,
			NeedsDigit: true,
			Validator:  chAhvChecksum,
		})
	})
}
