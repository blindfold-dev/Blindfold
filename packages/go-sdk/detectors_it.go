package blindfold

import "regexp"

func init() {
	// Italian Codice Fiscale
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityITCodiceFiscale,
			Pattern:    regexp.MustCompile(`\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b`),
			Score:      0.90,
			NeedsDigit: true,
			Validator:  itCodiceFiscaleCheck,
		})
	})

	// Italian Partita IVA
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityITPartitaIVA,
			Pattern:         regexp.MustCompile(`\b(?:IT)?\d{11}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"partita iva", "p.iva", "vat", "iva", "tax"},
			Validator:       itPartitaIvaChecksum,
		})
	})
}
