package blindfold

import (
	"regexp"
	"strings"
	"unicode"
)

// Detector is the interface for all PII detectors.
type Detector interface {
	EntityType() string
	NeedsDigit() bool
	IterMatches(text, textLower string) []PIIMatch
}

// PIIMatch represents a single detected PII entity.
type PIIMatch struct {
	EntityType string
	Text       string
	Start      int
	End        int
	Score      float64
}

// RegexDetector is a configurable regex-based detector.
type RegexDetector struct {
	entityType      string
	pattern         *regexp.Regexp
	score           float64
	baseScore       *float64
	needsDigit      bool
	contextRequired bool
	contextKeywords []string
	contextWindow   int
	validator       func(string) bool
	preCheck        func(string) bool
}

// RegexDetectorConfig holds configuration for building a RegexDetector.
type RegexDetectorConfig struct {
	EntityType      string
	Pattern         *regexp.Regexp
	Score           float64
	BaseScore       *float64
	NeedsDigit      bool
	ContextRequired bool
	ContextKeywords []string
	ContextWindow   int
	Validator       func(string) bool
	PreCheck        func(string) bool
}

// NewRegexDetector creates a RegexDetector from config.
func NewRegexDetector(cfg RegexDetectorConfig) *RegexDetector {
	cw := cfg.ContextWindow
	if cw == 0 {
		cw = 50
	}
	return &RegexDetector{
		entityType:      cfg.EntityType,
		pattern:         cfg.Pattern,
		score:           cfg.Score,
		baseScore:       cfg.BaseScore,
		needsDigit:      cfg.NeedsDigit,
		contextRequired: cfg.ContextRequired,
		contextKeywords: cfg.ContextKeywords,
		contextWindow:   cw,
		validator:       cfg.Validator,
		preCheck:        cfg.PreCheck,
	}
}

func (d *RegexDetector) EntityType() string { return d.entityType }
func (d *RegexDetector) NeedsDigit() bool   { return d.needsDigit }

func (d *RegexDetector) IterMatches(text, textLower string) []PIIMatch {
	if d.preCheck != nil && !d.preCheck(text) {
		return nil
	}

	locs := d.pattern.FindAllStringIndex(text, -1)
	if len(locs) == 0 {
		return nil
	}

	var results []PIIMatch
	for _, loc := range locs {
		start, end := loc[0], loc[1]
		matchedText := text[start:end]

		hasCtx := d.hasContext(textLower, start, end)

		if d.contextRequired && !hasCtx {
			continue
		}

		var score float64
		if d.validator != nil {
			if !d.validator(matchedText) {
				continue
			}
			if hasCtx {
				score = 1.0
			} else {
				score = d.score
			}
		} else {
			if hasCtx {
				score = d.score
			} else if d.baseScore != nil {
				score = *d.baseScore
			} else {
				score = d.score
			}
		}

		results = append(results, PIIMatch{
			EntityType: d.entityType,
			Text:       matchedText,
			Start:      start,
			End:        end,
			Score:      score,
		})
	}
	return results
}

func (d *RegexDetector) hasContext(textLower string, start, end int) bool {
	if len(d.contextKeywords) == 0 {
		return true
	}
	windowStart := start - d.contextWindow
	if windowStart < 0 {
		windowStart = 0
	}
	before := textLower[windowStart:start]
	windowEnd := end + d.contextWindow
	if windowEnd > len(textLower) {
		windowEnd = len(textLower)
	}
	after := textLower[end:windowEnd]
	window := before + " " + after
	for _, kw := range d.contextKeywords {
		if strings.Contains(window, kw) {
			return true
		}
	}
	return false
}

// hasDigit checks if text contains any digit.
func hasDigit(text string) bool {
	for _, r := range text {
		if unicode.IsDigit(r) {
			return true
		}
	}
	return false
}

// Deduplicate removes overlapping matches, keeping higher-scored ones.
func deduplicate(matches []PIIMatch) []PIIMatch {
	if len(matches) == 0 {
		return matches
	}
	// Sort by start asc, then score desc, then length desc
	sortMatches(matches)

	var result []PIIMatch
	lastEnd := -1
	for _, m := range matches {
		if m.Start >= lastEnd {
			result = append(result, m)
			lastEnd = m.End
		}
	}
	return result
}

func sortMatches(matches []PIIMatch) {
	// Simple insertion sort (stable, good for typical sizes)
	for i := 1; i < len(matches); i++ {
		key := matches[i]
		j := i - 1
		for j >= 0 && matchLess(key, matches[j]) {
			matches[j+1] = matches[j]
			j--
		}
		matches[j+1] = key
	}
}

func matchLess(a, b PIIMatch) bool {
	if a.Start != b.Start {
		return a.Start < b.Start
	}
	if a.Score != b.Score {
		return a.Score > b.Score // higher score first
	}
	return (a.End - a.Start) > (b.End - b.Start) // longer first
}
