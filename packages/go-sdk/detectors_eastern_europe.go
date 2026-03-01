package blindfold

import "regexp"

func init() {
	// Polish PESEL
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityPLPESEL,
			Pattern:    regexp.MustCompile(`\b\d{11}\b`),
			Score:      0.85,
			NeedsDigit: true,
			Validator:  plPeselChecksum,
		})
	})

	// Polish NIP
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityPLNIP,
			Pattern:         regexp.MustCompile(`\b\d{3}[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"nip", "tax", "podatkowy", "vat"},
			Validator:       plNipChecksum,
		})
	})

	// Polish REGON
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityPLREGON,
			Pattern:         regexp.MustCompile(`\b\d{9}(?:\d{5})?\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"regon", "statistical", "statystyczny"},
			Validator:       plRegonChecksum,
		})
	})

	// Czech Birth Number
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityCZBirthNumber,
			Pattern:    regexp.MustCompile(`\b\d{6}/?\d{3,4}\b`),
			Score:      0.85,
			NeedsDigit: true,
			Validator:  czBirthNumberValid,
		})
	})

	// Czech ICO
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityCZICO,
			Pattern:         regexp.MustCompile(`\b\d{8}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"ico", "ičo", "company", "firma"},
			Validator:       czIcoChecksum,
		})
	})

	// Czech DIC
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityCZDIC,
			Pattern:    regexp.MustCompile(`\bCZ\d{8,10}\b`),
			Score:      0.85,
			NeedsDigit: true,
			Validator:  czDicValid,
		})
	})

	// Czech Bank Account
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityCZBankAccount,
			Pattern:    regexp.MustCompile(`\b(?:\d{1,6}-)?\d{2,10}/\d{4}\b`),
			Score:      0.85,
			NeedsDigit: true,
			Validator:  czBankAccountValid,
		})
	})

	// Slovak Birth Number
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntitySKBirthNumber,
			Pattern:    regexp.MustCompile(`\b\d{6}/?\d{3,4}\b`),
			Score:      0.85,
			NeedsDigit: true,
			Validator:  skBirthNumberValid,
		})
	})

	// Slovak ICO
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntitySKICO,
			Pattern:         regexp.MustCompile(`\b\d{8}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"ico", "ičo", "company", "firma"},
			Validator:       skIcoChecksum,
		})
	})

	// Slovak DIC
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntitySKDIC,
			Pattern:    regexp.MustCompile(`\bSK\d{10}\b`),
			Score:      0.85,
			NeedsDigit: true,
			Validator:  skDicValid,
		})
	})

	// Romanian CNP
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType: EntityROCNP,
			Pattern:    regexp.MustCompile(`\b[1-8]\d{12}\b`),
			Score:      0.90,
			NeedsDigit: true,
			Validator:  roCnpChecksum,
		})
	})

	// Romanian CUI
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityROCUI,
			Pattern:         regexp.MustCompile(`\b(?:RO)?\d{2,10}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"cui", "cif", "fiscal", "company"},
			Validator:       roCuiChecksum,
		})
	})

	// Bulgarian EGN
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityBGEGN,
			Pattern:         regexp.MustCompile(`\b\d{10}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"egn", "егн", "personal", "лично"},
			Validator:       bgEgnChecksum,
		})
	})

	// Croatian OIB
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityHROIB,
			Pattern:         regexp.MustCompile(`\b\d{11}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"oib", "osobni identifikacijski broj"},
			Validator:       hrOibChecksum,
		})
	})

	// Slovenian EMSO
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntitySIEMSO,
			Pattern:         regexp.MustCompile(`\b\d{13}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"emso", "matična", "personal"},
			Validator:       siEmsoChecksum,
		})
	})

	// Slovenian Tax Number
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntitySITaxNumber,
			Pattern:         regexp.MustCompile(`\b(?:SI)?\d{8}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"davčna", "tax", "davcna"},
			Validator:       siTaxNumberChecksum,
		})
	})

	// Hungarian Tax ID
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityHUTaxID,
			Pattern:         regexp.MustCompile(`\b8\d{9}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"adóazonosító", "tax", "adószám"},
			Validator:       huTaxIdChecksum,
		})
	})

	// Hungarian TAJ
	RegisterRegion("eu", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityHUTAJ,
			Pattern:         regexp.MustCompile(`\b\d{3}[-\s]?\d{3}[-\s]?\d{3}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"taj", "társadalombiztosítási", "insurance"},
			Validator:       huTajChecksum,
		})
	})
}
