package blindfold

// DetectedEntity represents a single PII entity found in text.
type DetectedEntity struct {
	Type  string  `json:"type"`
	Text  string  `json:"text"`
	Start int     `json:"start"`
	End   int     `json:"end"`
	Score float64 `json:"score"`
}

// DetectResponse is the result of a detect operation.
type DetectResponse struct {
	DetectedEntities []DetectedEntity `json:"detected_entities"`
	EntitiesCount    int              `json:"entities_count"`
}

// TokenizeResponse is the result of a tokenize operation.
type TokenizeResponse struct {
	Text             string            `json:"text"`
	Mapping          map[string]string `json:"mapping"`
	DetectedEntities []DetectedEntity  `json:"detected_entities"`
	EntitiesCount    int               `json:"entities_count"`
}

// DetokenizeResponse is the result of a detokenize operation.
type DetokenizeResponse struct {
	Text             string `json:"text"`
	ReplacementsMade int    `json:"replacements_made"`
}

// RedactResponse is the result of a redact operation.
type RedactResponse struct {
	Text             string           `json:"text"`
	DetectedEntities []DetectedEntity `json:"detected_entities"`
	EntitiesCount    int              `json:"entities_count"`
}

// MaskResponse is the result of a mask operation.
type MaskResponse struct {
	Text             string           `json:"text"`
	DetectedEntities []DetectedEntity `json:"detected_entities"`
	EntitiesCount    int              `json:"entities_count"`
}

// HashResponse is the result of a hash operation.
type HashResponse struct {
	Text             string           `json:"text"`
	DetectedEntities []DetectedEntity `json:"detected_entities"`
	EntitiesCount    int              `json:"entities_count"`
}

// EncryptResponse is the result of an encrypt operation.
type EncryptResponse struct {
	Text             string           `json:"text"`
	DetectedEntities []DetectedEntity `json:"detected_entities"`
	EntitiesCount    int              `json:"entities_count"`
}

// SynthesizeResponse is the result of a synthesize operation.
type SynthesizeResponse struct {
	Text             string           `json:"text"`
	DetectedEntities []DetectedEntity `json:"detected_entities"`
	EntitiesCount    int              `json:"entities_count"`
}

// BatchResponse wraps batch results for any operation type.
type BatchResponse[T any] struct {
	Results   []T `json:"results"`
	Total     int `json:"total"`
	Succeeded int `json:"succeeded"`
	Failed    int `json:"failed"`
}
