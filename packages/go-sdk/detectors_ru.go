package blindfold

import "regexp"

var ruInn10 = regexp.MustCompile(`\b\d{10}\b`)
var ruInn12 = regexp.MustCompile(`\b\d{12}\b`)
var ruInnContext = []string{"inn", "\u0438\u043d\u043d", "taxpayer", "\u043d\u0430\u043b\u043e\u0433"}

type ruInnDetector struct{}

func (d *ruInnDetector) EntityType() string { return EntityRUINN }
func (d *ruInnDetector) NeedsDigit() bool   { return true }

func (d *ruInnDetector) IterMatches(text, textLower string) []PIIMatch {
	var results []PIIMatch
	d.processPattern(ruInn10, text, textLower, &results)
	d.processPattern(ruInn12, text, textLower, &results)
	return results
}

func (d *ruInnDetector) processPattern(pattern *regexp.Regexp, text, textLower string, results *[]PIIMatch) {
	for _, loc := range pattern.FindAllStringIndex(text, -1) {
		matched := text[loc[0]:loc[1]]
		if !hasContextWindow(textLower, loc[0], 50, ruInnContext) {
			continue
		}
		if !ruInnChecksum(matched) {
			continue
		}
		*results = append(*results, PIIMatch{EntityRUINN, matched, loc[0], loc[1], 1.0})
	}
}

func init() {
	RegisterRegion("ru", func() Detector { return &ruInnDetector{} })

	// Russian SNILS
	RegisterRegion("ru", func() Detector {
		return NewRegexDetector(RegexDetectorConfig{
			EntityType:      EntityRUSNILS,
			Pattern:         regexp.MustCompile(`\b\d{3}[-\s]?\d{3}[-\s]?\d{3}[-\s]?\d{2}\b`),
			Score:           0.85,
			NeedsDigit:      true,
			ContextRequired: true,
			ContextKeywords: []string{"snils", "\u0441\u043d\u0438\u043b\u0441", "pension", "\u043f\u0435\u043d\u0441\u0438"},
			Validator:       ruSnilsChecksum,
		})
	})

}
