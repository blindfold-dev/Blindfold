package blindfold

import "regexp"

func init() {
	// Canadian SIN
	RegisterRegion("us", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityCASIN,
			Pattern:         regexp.MustCompile(`\b\d{3}[-\s]?\d{3}[-\s]?\d{3}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"sin", "social insurance", "canadian"},
			Validator:       luhnChecksum,
		})
	})

	// Argentine CUIT
	RegisterRegion("us", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityARCUIT,
			Pattern:         regexp.MustCompile(`\b\d{2}-?\d{8}-?\d\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"cuit", "cuil", "tributaria"},
			Validator:       arCuitChecksum,
		})
	})

	// Brazilian CPF
	RegisterRegion("us", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityBRCPF,
			Pattern:    regexp.MustCompile(`\b\d{3}\.?\d{3}\.?\d{3}[-.]?\d{2}\b`),
			Score:      0.90,
			NeedsDigit: true,
			Validator:  brCpfChecksum,
		})
	})

	// Brazilian CNPJ
	RegisterRegion("us", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityBRCNPJ,
			Pattern:    regexp.MustCompile(`\b\d{2}\.?\d{3}\.?\d{3}/?\d{4}[-.]?\d{2}\b`),
			Score:      0.90,
			NeedsDigit: true,
			Validator:  brCnpjChecksum,
		})
	})

	// Chilean RUT
	RegisterRegion("us", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityCLRUT,
			Pattern:         regexp.MustCompile(`\b\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK]\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"rut", "rol unico tributario"},
			Validator:       clRutChecksum,
		})
	})

	// Colombian NIT
	RegisterRegion("us", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityCONIT,
			Pattern:         regexp.MustCompile(`\b\d{3}\.?\d{3}\.?\d{3}-?\d\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"nit", "tributaria"},
			Validator:       coNitChecksum,
		})
	})
}
