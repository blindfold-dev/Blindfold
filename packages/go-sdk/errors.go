package blindfold

import "fmt"

// BlindfoldError is the base error type for all SDK errors.
type BlindfoldError struct {
	Message    string
	StatusCode int
	Err        error
}

func (e *BlindfoldError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Err)
	}
	return e.Message
}

func (e *BlindfoldError) Unwrap() error { return e.Err }

// AuthenticationError indicates an invalid API key (401).
type AuthenticationError struct {
	BlindfoldError
}

// APIError indicates a non-retryable API error.
type APIError struct {
	BlindfoldError
}

// NetworkError indicates a network-level failure.
type NetworkError struct {
	BlindfoldError
}
