package blindfold

import "strings"

type detectorFactory func() Detector

var (
	universalDetectors []detectorFactory
	regionalDetectors  = map[string][]detectorFactory{
		"us": {},
		"eu": {},
		"uk": {},
	}
)

// RegisterUniversal registers a detector factory that applies to all locales.
func RegisterUniversal(factory detectorFactory) {
	universalDetectors = append(universalDetectors, factory)
}

// RegisterRegion registers a detector factory for a specific locale.
func RegisterRegion(locale string, factory detectorFactory) {
	key := strings.ToLower(locale)
	regionalDetectors[key] = append(regionalDetectors[key], factory)
}

// DetectorRegistry builds the detector list for given locales.
type DetectorRegistry struct {
	detectors []Detector
}

// NewDetectorRegistry creates a registry with detectors for the given locales.
func NewDetectorRegistry(locales []string) *DetectorRegistry {
	effectiveLocales := locales
	if len(effectiveLocales) == 0 {
		effectiveLocales = []string{"us"}
	}

	var detectors []Detector
	for _, factory := range universalDetectors {
		detectors = append(detectors, factory())
	}
	for _, locale := range effectiveLocales {
		key := strings.ToLower(locale)
		if factories, ok := regionalDetectors[key]; ok {
			for _, factory := range factories {
				detectors = append(detectors, factory())
			}
		}
	}
	return &DetectorRegistry{detectors: detectors}
}

// Detectors returns all registered detectors.
func (r *DetectorRegistry) Detectors() []Detector {
	return r.detectors
}
