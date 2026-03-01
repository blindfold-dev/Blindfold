package blindfold

import "regexp"

func init() {
	// IBAN
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityIBAN,
			Pattern:    regexp.MustCompile(`\b[A-Z]{2}\d{2}\s?[\dA-Z]{4}(?:\s?[\dA-Z]{4}){1,7}(?:\s?[\dA-Z]{1,4})?\b`),
			Score:      0.90,
			NeedsDigit: false,
			Validator:  ibanMod97,
		})
	})

	// EU Postal Code
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityPostalCode,
			Pattern:         regexp.MustCompile(`\b(?:\d{5}|\d{4}\s?[A-Z]{2})\b`),
			Score:           0.70,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"postal", "postcode", "zip", "plz", "code postal", "postleitzahl"},
		})
	})

	// VAT ID
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityVATID,
			Pattern: regexp.MustCompile(`\b(?:ATU\d{8}|BE[01]\d{9}|DE\d{9}|DK\d{8}|` +
				`ES[A-Z0-9]\d{7}[A-Z0-9]|FI\d{8}|FR[A-Z0-9]{2}\d{9}|IT\d{11}|LU\d{8}|` +
				`NL\d{9}B\d{2}|PL\d{10}|PT\d{9}|SE\d{12})\b`),
			Score:      0.90,
			NeedsDigit: true,
		})
	})
}
