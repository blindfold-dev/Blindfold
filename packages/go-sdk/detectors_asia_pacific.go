package blindfold

import "regexp"

func init() {
	// Australian TFN
	RegisterRegion("us", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityAUTFN,
			Pattern:         regexp.MustCompile(`\b\d{3}[-\s]?\d{3}[-\s]?\d{2,3}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"tfn", "tax file number", "tax file"},
			Validator:       auTfnChecksum,
		})
	})

	// Australian Medicare
	RegisterRegion("us", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityAUMedicare,
			Pattern:         regexp.MustCompile(`\b\d{4}[-\s]?\d{5}[-\s]?\d[-\s]?\d?\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"medicare", "medicare number", "medicare card"},
			Validator:       auMedicareChecksum,
		})
	})

	// New Zealand IRD
	RegisterRegion("us", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityNZIRD,
			Pattern:         regexp.MustCompile(`\b\d{2,3}[-\s]?\d{3}[-\s]?\d{3}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"ird", "inland revenue", "tax"},
			Validator:       nzIrdChecksum,
		})
	})

	// Indian Aadhaar
	RegisterRegion("us", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityINAadhaar,
			Pattern:         regexp.MustCompile(`\b[2-9]\d{3}[-\s]?\d{4}[-\s]?\d{4}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"aadhaar", "aadhar", "uid", "आधार"},
			Validator:       inAadhaarChecksum,
		})
	})

	// Indian PAN
	RegisterRegion("us", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityINPAN,
			Pattern:    regexp.MustCompile(`\b[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]\b`),
			Score:      0.85,
			NeedsDigit: true,
			Validator:  inPanValid,
		})
	})

	// Japanese My Number
	RegisterRegion("us", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityJPMyNumber,
			Pattern:         regexp.MustCompile(`\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"my number", "マイナンバー", "individual number", "個人番号"},
			Validator:       jpMyNumberChecksum,
		})
	})

	// Korean RRN
	RegisterRegion("us", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityKRRRN,
			Pattern:         regexp.MustCompile(`\b\d{6}[-\s]?\d{7}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"주민등록번호", "resident registration", "rrn"},
			Validator:       krRrnChecksum,
		})
	})

	// South African ID
	RegisterRegion("us", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityZAID,
			Pattern:         regexp.MustCompile(`\b\d{13}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"id number", "identity", "south african id", "sa id"},
			Validator:       luhnChecksum,
		})
	})

	// Turkish Kimlik
	RegisterRegion("us", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityTRKimlik,
			Pattern:         regexp.MustCompile(`\b[1-9]\d{10}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"kimlik", "tc kimlik", "tckn", "t.c."},
			Validator:       trKimlikChecksum,
		})
	})

	// Israeli ID
	RegisterRegion("us", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityILID,
			Pattern:         regexp.MustCompile(`\b\d{9}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"תעודת זהות", "teudat zehut", "israeli id", "id number"},
			Validator:       luhnChecksum,
		})
	})
}
