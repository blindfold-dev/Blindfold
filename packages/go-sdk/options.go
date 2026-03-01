package blindfold

import (
	"net/http"
	"time"
)

// Option configures the Client at construction time.
type Option func(*config)

type config struct {
	apiKey       string
	region       string
	baseURL      string
	mode         string
	locales      []string
	maxRetries   int
	retryDelay   time.Duration
	timeout      time.Duration
	userID       string
	policy       string
	policiesFile string
	httpClient   *http.Client
}

func defaultConfig() *config {
	return &config{
		maxRetries: 2,
		retryDelay: 500 * time.Millisecond,
		timeout:    30 * time.Second,
	}
}

// WithAPIKey sets the API key for authenticated requests.
func WithAPIKey(key string) Option {
	return func(c *config) { c.apiKey = key }
}

// WithRegion sets the API region ("eu" or "us").
func WithRegion(region string) Option {
	return func(c *config) { c.region = region }
}

// WithBaseURL overrides the default API endpoint.
func WithBaseURL(url string) Option {
	return func(c *config) { c.baseURL = url }
}

// WithMode sets the operating mode ("local" or "api").
func WithMode(mode string) Option {
	return func(c *config) { c.mode = mode }
}

// WithLocales sets the locale list for detector selection (e.g., "us", "eu", "uk").
func WithLocales(locales []string) Option {
	return func(c *config) { c.locales = locales }
}

// WithMaxRetries sets the maximum number of retry attempts.
func WithMaxRetries(n int) Option {
	return func(c *config) { c.maxRetries = n }
}

// WithRetryDelay sets the base delay between retries.
func WithRetryDelay(d time.Duration) Option {
	return func(c *config) { c.retryDelay = d }
}

// WithTimeout sets the HTTP request timeout.
func WithTimeout(d time.Duration) Option {
	return func(c *config) { c.timeout = d }
}

// WithUserID sets the X-Blindfold-User-Id header.
func WithUserID(id string) Option {
	return func(c *config) { c.userID = id }
}

// WithPolicy sets the default policy name.
func WithPolicy(name string) Option {
	return func(c *config) { c.policy = name }
}

// WithPoliciesFile loads additional policies from a JSON file.
func WithPoliciesFile(path string) Option {
	return func(c *config) { c.policiesFile = path }
}

// WithHTTPClient provides a custom http.Client.
func WithHTTPClient(client *http.Client) Option {
	return func(c *config) { c.httpClient = client }
}

// CallOption configures a single method call.
type CallOption func(*callConfig)

type callConfig struct {
	entities      []string
	policy        string
	charsToShow   int
	fromEnd       bool
	maskingChar   string
	hashType      string
	hashPrefix    string
	hashLength    int
	language      string
}

func defaultCallConfig() *callConfig {
	return &callConfig{
		charsToShow: 3,
		maskingChar: "*",
		hashType:    "SHA-256",
		hashPrefix:  "HASH_",
		hashLength:  16,
	}
}

// WithEntities filters detection to specific entity types.
func WithEntities(entities []string) CallOption {
	return func(c *callConfig) { c.entities = entities }
}

// WithCallPolicy sets the policy for this call.
func WithCallPolicy(policy string) CallOption {
	return func(c *callConfig) { c.policy = policy }
}

// WithCharsToShow sets how many characters remain visible when masking.
func WithCharsToShow(n int) CallOption {
	return func(c *callConfig) { c.charsToShow = n }
}

// WithFromEnd shows characters from the end when masking.
func WithFromEnd(b bool) CallOption {
	return func(c *callConfig) { c.fromEnd = b }
}

// WithMaskingChar sets the masking character.
func WithMaskingChar(ch string) CallOption {
	return func(c *callConfig) { c.maskingChar = ch }
}

// WithHashType sets the hash algorithm (e.g., "SHA-256").
func WithHashType(t string) CallOption {
	return func(c *callConfig) { c.hashType = t }
}

// WithHashPrefix sets the prefix for hashed replacements.
func WithHashPrefix(p string) CallOption {
	return func(c *callConfig) { c.hashPrefix = p }
}

// WithHashLength sets the length of the hash output.
func WithHashLength(n int) CallOption {
	return func(c *callConfig) { c.hashLength = n }
}

// WithLanguage sets the language for synthesize.
func WithLanguage(lang string) CallOption {
	return func(c *callConfig) { c.language = lang }
}
