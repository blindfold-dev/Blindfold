package blindfold

import "regexp"

func init() {
	// Danish CPR
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityDKCPR,
			Pattern:         regexp.MustCompile(`\b(?:0[1-9]|[12]\d|3[01])(?:0[1-9]|1[0-2])\d{2}[-\s]?\d{4}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"cpr", "personnummer", "personal", "cprnr"},
			Validator:       dkCprValidDate,
		})
	})

	// Danish CVR
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityDKCVR,
			Pattern:         regexp.MustCompile(`\b(?:DK)?\d{8}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"cvr", "company", "virksomhed", "cvrnr"},
			Validator:       dkCvrChecksum,
		})
	})

	// Swedish Personnummer
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntitySEPersonnummer,
			Pattern:    regexp.MustCompile(`\b(?:\d{8}|\d{6})[-+]?\d{4}\b`),
			Score:      0.90,
			NeedsDigit: true,
			Validator:  sePersonnummerLuhn,
		})
	})

	// Swedish Organisationsnummer
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntitySEOrgnr,
			Pattern:         regexp.MustCompile(`\b\d{6}-?\d{4}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"organisationsnummer", "orgnr", "org.nr", "organisation", "company"},
			Validator:       seOrgnrChecksum,
		})
	})

	// Norwegian Birth Number
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityNOBirthNumber,
			Pattern:    regexp.MustCompile(`\b(?:0[1-9]|[12]\d|3[01])(?:0[1-9]|1[0-2])\d{7}\b`),
			Score:      0.90,
			NeedsDigit: true,
			Validator:  noBirthNumberChecksum,
		})
	})

	// Norwegian Organisasjonsnummer
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityNOOrgnr,
			Pattern:         regexp.MustCompile(`\b\d{9}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"organisasjonsnummer", "orgnr", "org.nr", "organisation", "company"},
			Validator:       noOrgnrChecksum,
		})
	})

	// Finnish HETU
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityFIHETU,
			Pattern:    regexp.MustCompile(`\b\d{6}[-+ABCDEFYXWVUabcdefyxwvu]\d{3}[0-9A-Za-z]\b`),
			Score:      0.85,
			NeedsDigit: true,
			Validator:  fiHetuChecksum,
		})
	})

	// Finnish Y-tunnus
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityFIYtunnus,
			Pattern:         regexp.MustCompile(`\b\d{7}-\d\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"y-tunnus", "ytunnus", "business id", "yritys"},
			Validator:       fiYtunnusChecksum,
		})
	})
}
