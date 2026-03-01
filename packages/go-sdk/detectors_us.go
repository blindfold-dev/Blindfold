package blindfold

import "regexp"

func init() {
	// SSN (custom: dual pattern with different context requirements)
	RegisterRegion("us", func() Detector { return &ssnDetector{} })

	// Driver's License
	RegisterRegion("us", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityDriversLicense,
			Pattern:         regexp.MustCompile(`\b(?:[A-Z]\d{14}|[A-Z]\d{4,8}|[A-Z]{2}\d{6,10}|\d{7,9})\b`),
			Score:           0.75,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"driver", "license", "licence", "dl", "dl#", "driving", "dmv"},
		})
	})

	// US Passport
	RegisterRegion("us", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityUSPassport,
			Pattern:         regexp.MustCompile(`\b\d{9}\b`),
			Score:           0.75,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"passport", "passport number", "passport no", "passport#"},
		})
	})

	// US Tax ID
	RegisterRegion("us", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityTaxID,
			Pattern:         regexp.MustCompile(`\b\d{2}-\d{7}\b`),
			Score:           0.80,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"ein", "tax", "employer", "fein", "tax id", "taxpayer"},
		})
	})

	// ZIP Code
	RegisterRegion("us", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityZIPCode,
			Pattern:         regexp.MustCompile(`\b\d{5}(?:-\d{4})?\b`),
			Score:           0.70,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextWindow:   150,
			ContextKeywords: []string{"zip", "zip code", "zipcode", "postal", "postal code", "mailing", "address", "shipping"},
			Validator:       zipValid,
		})
	})

	// ITIN
	RegisterRegion("us", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityUSITIN,
			Pattern:         regexp.MustCompile(`\b9\d{2}[-\s]?\d{2}[-\s]?\d{4}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"itin", "individual taxpayer", "tax id", "tin"},
			Validator:       usItinValid,
		})
	})
}

// ---- SSN (custom) ----

var ssnWithSep = regexp.MustCompile(`\b\d{3}[-\s.]\d{2}[-\s.]\d{4}\b`)
var ssnWithoutSep = regexp.MustCompile(`\b\d{9}\b`)
var ssnContextKeywords = []string{
	"ssn", "social security", "social sec", "ss#", "ss #", "social",
	"tax id", "taxpayer", "tin", "social number", "soc number", "socialnum",
}

type ssnDetector struct{}

func (d *ssnDetector) EntityType() string { return EntitySSN }
func (d *ssnDetector) NeedsDigit() bool   { return true }

func (d *ssnDetector) IterMatches(text, textLower string) []PIIMatch {
	var results []PIIMatch

	// Branch 1: With separators — no context required
	for _, loc := range ssnWithSep.FindAllStringIndex(text, -1) {
		matched := text[loc[0]:loc[1]]
		if !ssnValidFormat(matched) {
			continue
		}
		hasCtx := hasContextWindow(textLower, loc[0], 100, ssnContextKeywords)
		score := 0.85
		if hasCtx {
			score = 1.0
		}
		results = append(results, PIIMatch{EntitySSN, matched, loc[0], loc[1], score})
	}

	// Branch 2: Without separators — context required
	for _, loc := range ssnWithoutSep.FindAllStringIndex(text, -1) {
		matched := text[loc[0]:loc[1]]
		if !ssnValidFormat(matched) {
			continue
		}
		if !hasContextWindow(textLower, loc[0], 100, ssnContextKeywords) {
			continue
		}
		results = append(results, PIIMatch{EntitySSN, matched, loc[0], loc[1], 1.0})
	}

	return results
}

