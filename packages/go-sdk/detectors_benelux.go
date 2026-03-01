package blindfold

import "regexp"

func init() {
	// Belgian National Number
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityBENational,
			Pattern:         regexp.MustCompile(`\b\d{2}[.\s]?\d{2}[.\s]?\d{2}[-\s]?\d{3}[.\s]?\d{2}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"national", "rijksregister", "registre national", "nn", "nrn"},
			Validator:       beNationalNumberChecksum,
		})
	})

	// Belgian Enterprise Number
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityBEEnterprise,
			Pattern:         regexp.MustCompile(`\b[01]\d{3}[.\s]?\d{3}[.\s]?\d{3}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"enterprise", "ondernemingsnummer", "kbo", "bce", "company"},
			Validator:       beEnterpriseChecksum,
		})
	})

	// Dutch BSN
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityNLBSN,
			Pattern:         regexp.MustCompile(`\b\d{9}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"bsn", "burgerservicenummer", "sofinummer", "citizen", "service number"},
			Validator:       nlBsn11Test,
		})
	})

	// Austrian SVNR
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityATSVNR,
			Pattern:         regexp.MustCompile(`\b\d{4}[-\s]?\d{6}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"svnr", "sozialversicherung", "versicherungsnummer", "insurance"},
			Validator:       atSvnrChecksum,
		})
	})
}
