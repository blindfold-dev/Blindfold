package blindfold

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

// Client is the Blindfold PII detection client.
type Client struct {
	apiKey        string
	baseURL       string
	mode          string
	maxRetries    int
	retryDelay    time.Duration
	userID        string
	defaultPolicy string
	httpClient    *http.Client
	scanner       *PIIScanner
	policies      map[string]policyDefinition
}

// New creates a new Blindfold client with the given options.
func New(opts ...Option) *Client {
	cfg := defaultConfig()
	for _, o := range opts {
		o(cfg)
	}

	baseURL := cfg.baseURL
	if baseURL == "" {
		switch strings.ToLower(cfg.region) {
		case "us":
			baseURL = "https://us-api.blindfold.dev"
		default:
			baseURL = "https://eu-api.blindfold.dev"
		}
	}

	hc := cfg.httpClient
	if hc == nil {
		hc = &http.Client{Timeout: cfg.timeout}
	}

	return &Client{
		apiKey:        cfg.apiKey,
		baseURL:       baseURL,
		mode:          cfg.mode,
		maxRetries:    cfg.maxRetries,
		retryDelay:    cfg.retryDelay,
		userID:        cfg.userID,
		defaultPolicy: cfg.policy,
		httpClient:    hc,
		scanner:       NewPIIScanner(cfg.locales),
		policies:      loadPolicies(cfg.policiesFile),
	}
}

func (c *Client) useLocal() bool {
	if strings.EqualFold(c.mode, "local") {
		return true
	}
	return c.apiKey == ""
}

func applyCallOpts(opts []CallOption) *callConfig {
	cc := defaultCallConfig()
	for _, o := range opts {
		o(cc)
	}
	return cc
}

func (c *Client) resolve(cc *callConfig) policyResolution {
	return resolvePolicy(c.policies, c.defaultPolicy, cc.policy, cc.entities)
}

func applyThreshold(matches []PIIMatch, threshold *float64) []PIIMatch {
	if threshold == nil {
		return matches
	}
	var filtered []PIIMatch
	for _, m := range matches {
		if m.Score >= *threshold {
			filtered = append(filtered, m)
		}
	}
	return filtered
}

func matchesToEntities(matches []PIIMatch) []DetectedEntity {
	entities := make([]DetectedEntity, len(matches))
	for i, m := range matches {
		entities[i] = DetectedEntity{
			Type:  m.EntityType,
			Text:  m.Text,
			Start: m.Start,
			End:   m.End,
			Score: m.Score,
		}
	}
	return entities
}

// redetectWithThreshold re-runs detection when threshold filtering removes matches.
func (c *Client) redetectEntities(text string, resolved policyResolution) []string {
	allMatches := c.scanner.Detect(text, resolved.entities)
	qualifying := applyThreshold(allMatches, resolved.threshold)
	seen := make(map[string]bool)
	var types []string
	for _, m := range qualifying {
		if !seen[m.EntityType] {
			seen[m.EntityType] = true
			types = append(types, m.EntityType)
		}
	}
	if len(types) == 0 {
		return []string{"__none__"}
	}
	return types
}

// ---- Detect ----

// Detect finds PII entities in text.
func (c *Client) Detect(ctx context.Context, text string, opts ...CallOption) (*DetectResponse, error) {
	cc := applyCallOpts(opts)
	resolved := c.resolve(cc)

	if c.useLocal() {
		matches := c.scanner.Detect(text, resolved.entities)
		matches = applyThreshold(matches, resolved.threshold)
		return &DetectResponse{
			DetectedEntities: matchesToEntities(matches),
			EntitiesCount:    len(matches),
		}, nil
	}

	body := map[string]interface{}{"text": text}
	if resolved.entities != nil {
		body["entities"] = resolved.entities
	}
	if resolved.threshold != nil {
		body["score_threshold"] = *resolved.threshold
	}
	data, err := c.post(ctx, "/detect", body)
	if err != nil {
		return nil, err
	}
	var resp DetectResponse
	if err := json.Unmarshal(data, &resp); err != nil {
		return nil, &NetworkError{BlindfoldError{Message: "failed to parse response", Err: err}}
	}
	return &resp, nil
}

// ---- Tokenize ----

// Tokenize replaces PII with tokens and returns a mapping.
func (c *Client) Tokenize(ctx context.Context, text string, opts ...CallOption) (*TokenizeResponse, error) {
	cc := applyCallOpts(opts)
	resolved := c.resolve(cc)

	if c.useLocal() {
		result := c.scanner.Tokenize(text, resolved.entities)
		if resolved.threshold != nil {
			filtered := applyThreshold(result.Matches, resolved.threshold)
			if len(filtered) < len(result.Matches) {
				types := c.redetectEntities(text, resolved)
				result = c.scanner.Tokenize(text, types)
			}
		}
		return &TokenizeResponse{
			Text:             result.Text,
			Mapping:          result.Mapping,
			DetectedEntities: matchesToEntities(result.Matches),
			EntitiesCount:    len(result.Matches),
		}, nil
	}

	body := map[string]interface{}{"text": text}
	if resolved.entities != nil {
		body["entities"] = resolved.entities
	}
	if resolved.threshold != nil {
		body["score_threshold"] = *resolved.threshold
	}
	data, err := c.post(ctx, "/tokenize", body)
	if err != nil {
		return nil, err
	}
	var resp TokenizeResponse
	if err := json.Unmarshal(data, &resp); err != nil {
		return nil, &NetworkError{BlindfoldError{Message: "failed to parse response", Err: err}}
	}
	return &resp, nil
}

// ---- Detokenize (client-side only) ----

// Detokenize restores tokenized text using a mapping. This is client-side only.
func (c *Client) Detokenize(text string, mapping map[string]string) *DetokenizeResponse {
	result := c.scanner.Detokenize(text, mapping)
	count := len(mapping)
	return &DetokenizeResponse{Text: result, ReplacementsMade: count}
}

// ---- Redact ----

// Redact removes PII from text.
func (c *Client) Redact(ctx context.Context, text string, opts ...CallOption) (*RedactResponse, error) {
	cc := applyCallOpts(opts)
	resolved := c.resolve(cc)

	if c.useLocal() {
		result := c.scanner.Redact(text, resolved.entities)
		if resolved.threshold != nil {
			filtered := applyThreshold(result.Matches, resolved.threshold)
			if len(filtered) < len(result.Matches) {
				types := c.redetectEntities(text, resolved)
				result = c.scanner.Redact(text, types)
			}
		}
		return &RedactResponse{
			Text:             result.Text,
			DetectedEntities: matchesToEntities(result.Matches),
			EntitiesCount:    len(result.Matches),
		}, nil
	}

	body := map[string]interface{}{"text": text}
	if resolved.entities != nil {
		body["entities"] = resolved.entities
	}
	if resolved.threshold != nil {
		body["score_threshold"] = *resolved.threshold
	}
	data, err := c.post(ctx, "/redact", body)
	if err != nil {
		return nil, err
	}
	var resp RedactResponse
	if err := json.Unmarshal(data, &resp); err != nil {
		return nil, &NetworkError{BlindfoldError{Message: "failed to parse response", Err: err}}
	}
	return &resp, nil
}

// ---- Mask ----

// Mask partially hides PII in text.
func (c *Client) Mask(ctx context.Context, text string, opts ...CallOption) (*MaskResponse, error) {
	cc := applyCallOpts(opts)
	resolved := c.resolve(cc)

	if c.useLocal() {
		result := c.scanner.Mask(text, cc.charsToShow, cc.fromEnd, cc.maskingChar, resolved.entities)
		if resolved.threshold != nil {
			filtered := applyThreshold(result.Matches, resolved.threshold)
			if len(filtered) < len(result.Matches) {
				types := c.redetectEntities(text, resolved)
				result = c.scanner.Mask(text, cc.charsToShow, cc.fromEnd, cc.maskingChar, types)
			}
		}
		return &MaskResponse{
			Text:             result.Text,
			DetectedEntities: matchesToEntities(result.Matches),
			EntitiesCount:    len(result.Matches),
		}, nil
	}

	body := map[string]interface{}{
		"text":          text,
		"chars_to_show": cc.charsToShow,
		"from_end":      cc.fromEnd,
		"masking_char":  cc.maskingChar,
	}
	if resolved.entities != nil {
		body["entities"] = resolved.entities
	}
	if resolved.threshold != nil {
		body["score_threshold"] = *resolved.threshold
	}
	data, err := c.post(ctx, "/mask", body)
	if err != nil {
		return nil, err
	}
	var resp MaskResponse
	if err := json.Unmarshal(data, &resp); err != nil {
		return nil, &NetworkError{BlindfoldError{Message: "failed to parse response", Err: err}}
	}
	return &resp, nil
}

// ---- Hash ----

// Hash replaces PII with hash values.
func (c *Client) Hash(ctx context.Context, text string, opts ...CallOption) (*HashResponse, error) {
	cc := applyCallOpts(opts)
	resolved := c.resolve(cc)

	if c.useLocal() {
		result := c.scanner.Hash(text, cc.hashType, cc.hashPrefix, cc.hashLength, resolved.entities)
		if resolved.threshold != nil {
			filtered := applyThreshold(result.Matches, resolved.threshold)
			if len(filtered) < len(result.Matches) {
				types := c.redetectEntities(text, resolved)
				result = c.scanner.Hash(text, cc.hashType, cc.hashPrefix, cc.hashLength, types)
			}
		}
		return &HashResponse{
			Text:             result.Text,
			DetectedEntities: matchesToEntities(result.Matches),
			EntitiesCount:    len(result.Matches),
		}, nil
	}

	body := map[string]interface{}{
		"text":        text,
		"hash_type":   cc.hashType,
		"hash_prefix": cc.hashPrefix,
		"hash_length": cc.hashLength,
	}
	if resolved.entities != nil {
		body["entities"] = resolved.entities
	}
	if resolved.threshold != nil {
		body["score_threshold"] = *resolved.threshold
	}
	data, err := c.post(ctx, "/hash", body)
	if err != nil {
		return nil, err
	}
	var resp HashResponse
	if err := json.Unmarshal(data, &resp); err != nil {
		return nil, &NetworkError{BlindfoldError{Message: "failed to parse response", Err: err}}
	}
	return &resp, nil
}

// ---- Encrypt ----

// Encrypt replaces PII with AES-encrypted values.
func (c *Client) Encrypt(ctx context.Context, text, encryptionKey string, opts ...CallOption) (*EncryptResponse, error) {
	cc := applyCallOpts(opts)
	resolved := c.resolve(cc)

	if c.useLocal() {
		result, err := c.scanner.Encrypt(text, encryptionKey, resolved.entities)
		if err != nil {
			return nil, err
		}
		if resolved.threshold != nil {
			filtered := applyThreshold(result.Matches, resolved.threshold)
			if len(filtered) < len(result.Matches) {
				types := c.redetectEntities(text, resolved)
				result, err = c.scanner.Encrypt(text, encryptionKey, types)
				if err != nil {
					return nil, err
				}
			}
		}
		return &EncryptResponse{
			Text:             result.Text,
			DetectedEntities: matchesToEntities(result.Matches),
			EntitiesCount:    len(result.Matches),
		}, nil
	}

	body := map[string]interface{}{
		"text":           text,
		"encryption_key": encryptionKey,
	}
	if resolved.entities != nil {
		body["entities"] = resolved.entities
	}
	if resolved.threshold != nil {
		body["score_threshold"] = *resolved.threshold
	}
	data, err := c.post(ctx, "/encrypt", body)
	if err != nil {
		return nil, err
	}
	var resp EncryptResponse
	if err := json.Unmarshal(data, &resp); err != nil {
		return nil, &NetworkError{BlindfoldError{Message: "failed to parse response", Err: err}}
	}
	return &resp, nil
}

// ---- Synthesize ----

// Synthesize replaces PII with realistic fake data.
func (c *Client) Synthesize(ctx context.Context, text string, opts ...CallOption) (*SynthesizeResponse, error) {
	cc := applyCallOpts(opts)
	resolved := c.resolve(cc)

	if c.useLocal() {
		result := c.scanner.Synthesize(text, cc.language, resolved.entities)
		if resolved.threshold != nil {
			filtered := applyThreshold(result.Matches, resolved.threshold)
			if len(filtered) < len(result.Matches) {
				types := c.redetectEntities(text, resolved)
				result = c.scanner.Synthesize(text, cc.language, types)
			}
		}
		return &SynthesizeResponse{
			Text:             result.Text,
			DetectedEntities: matchesToEntities(result.Matches),
			EntitiesCount:    len(result.Matches),
		}, nil
	}

	body := map[string]interface{}{"text": text}
	if cc.language != "" {
		body["language"] = cc.language
	}
	if resolved.entities != nil {
		body["entities"] = resolved.entities
	}
	if resolved.threshold != nil {
		body["score_threshold"] = *resolved.threshold
	}
	data, err := c.post(ctx, "/synthesize", body)
	if err != nil {
		return nil, err
	}
	var resp SynthesizeResponse
	if err := json.Unmarshal(data, &resp); err != nil {
		return nil, &NetworkError{BlindfoldError{Message: "failed to parse response", Err: err}}
	}
	return &resp, nil
}

// ---- Batch methods ----

// DetectBatch runs detect on multiple texts.
func (c *Client) DetectBatch(ctx context.Context, texts []string, opts ...CallOption) (*BatchResponse[DetectResponse], error) {
	cc := applyCallOpts(opts)
	resolved := c.resolve(cc)

	body := map[string]interface{}{"texts": texts}
	if resolved.entities != nil {
		body["entities"] = resolved.entities
	}
	if resolved.threshold != nil {
		body["score_threshold"] = *resolved.threshold
	}
	data, err := c.post(ctx, "/detect", body)
	if err != nil {
		return nil, err
	}
	var resp BatchResponse[DetectResponse]
	if err := json.Unmarshal(data, &resp); err != nil {
		return nil, &NetworkError{BlindfoldError{Message: "failed to parse response", Err: err}}
	}
	return &resp, nil
}

// TokenizeBatch runs tokenize on multiple texts.
func (c *Client) TokenizeBatch(ctx context.Context, texts []string, opts ...CallOption) (*BatchResponse[TokenizeResponse], error) {
	cc := applyCallOpts(opts)
	resolved := c.resolve(cc)

	body := map[string]interface{}{"texts": texts}
	if resolved.entities != nil {
		body["entities"] = resolved.entities
	}
	if resolved.threshold != nil {
		body["score_threshold"] = *resolved.threshold
	}
	data, err := c.post(ctx, "/tokenize", body)
	if err != nil {
		return nil, err
	}
	var resp BatchResponse[TokenizeResponse]
	if err := json.Unmarshal(data, &resp); err != nil {
		return nil, &NetworkError{BlindfoldError{Message: "failed to parse response", Err: err}}
	}
	return &resp, nil
}
