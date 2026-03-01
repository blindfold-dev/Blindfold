package blindfold

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"time"
)

func (c *Client) post(ctx context.Context, path string, body interface{}) ([]byte, error) {
	jsonBody, err := json.Marshal(body)
	if err != nil {
		return nil, &NetworkError{BlindfoldError{Message: "failed to marshal request", Err: err}}
	}

	var lastErr error
	for attempt := 0; attempt <= c.maxRetries; attempt++ {
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+path, bytes.NewReader(jsonBody))
		if err != nil {
			return nil, &NetworkError{BlindfoldError{Message: "failed to create request", Err: err}}
		}
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-API-Key", c.apiKey)
		if c.userID != "" {
			req.Header.Set("X-Blindfold-User-Id", c.userID)
		}

		resp, err := c.httpClient.Do(req)
		if err != nil {
			lastErr = &NetworkError{BlindfoldError{Message: "request failed", Err: err}}
			if attempt < c.maxRetries {
				sleepWithContext(ctx, c.retryDelay*time.Duration(math.Pow(2, float64(attempt))))
				continue
			}
			return nil, lastErr
		}

		data, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			lastErr = &NetworkError{BlindfoldError{Message: "failed to read response", Err: err}}
			if attempt < c.maxRetries {
				sleepWithContext(ctx, c.retryDelay*time.Duration(math.Pow(2, float64(attempt))))
				continue
			}
			return nil, lastErr
		}

		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			return data, nil
		}

		if resp.StatusCode == 401 {
			return nil, &AuthenticationError{BlindfoldError{Message: "Invalid API key", StatusCode: 401}}
		}

		if isRetryable(resp.StatusCode) && attempt < c.maxRetries {
			delay := c.retryDelay * time.Duration(math.Pow(2, float64(attempt)))
			if resp.StatusCode == 429 {
				delay = parseRetryAfter(data, delay)
			}
			sleepWithContext(ctx, delay)
			lastErr = &APIError{BlindfoldError{
				Message:    fmt.Sprintf("API error: %d %s", resp.StatusCode, string(data)),
				StatusCode: resp.StatusCode,
			}}
			continue
		}

		return nil, &APIError{BlindfoldError{
			Message:    fmt.Sprintf("API error: %d %s", resp.StatusCode, string(data)),
			StatusCode: resp.StatusCode,
		}}
	}

	if lastErr != nil {
		return nil, lastErr
	}
	return nil, &NetworkError{BlindfoldError{Message: "max retries exceeded"}}
}

func isRetryable(code int) bool {
	return code == 429 || code == 500 || code == 502 || code == 503 || code == 504
}

func parseRetryAfter(body []byte, fallback time.Duration) time.Duration {
	var resp struct {
		RetryAfter float64 `json:"retry_after"`
	}
	if json.Unmarshal(body, &resp) == nil && resp.RetryAfter > 0 {
		return time.Duration(resp.RetryAfter * float64(time.Second))
	}
	return fallback
}

func sleepWithContext(ctx context.Context, d time.Duration) {
	t := time.NewTimer(d)
	defer t.Stop()
	select {
	case <-ctx.Done():
	case <-t.C:
	}
}
