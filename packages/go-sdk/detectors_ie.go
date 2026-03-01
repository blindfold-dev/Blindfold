package blindfold

import "regexp"

func init() {
	// Irish PPS Number
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityIEPPS,
			Pattern:    regexp.MustCompile(`\b\d{7}[A-Z]{1,2}\b`),
			Score:      0.85,
			NeedsDigit: true,
			Validator:  iePpsChecksum,
		})
	})
}
