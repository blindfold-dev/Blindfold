"""Tests for retry logic with exponential backoff"""

from unittest.mock import MagicMock, patch

import httpx
import pytest

from blindfold import Blindfold
from blindfold.errors import APIError, AuthenticationError, NetworkError
from conftest import make_response


class TestRetrySync:
    def test_retry_on_network_error_then_success(self):
        """Should retry on network error and succeed on second attempt."""
        client = Blindfold(api_key="test-key", max_retries=2, retry_delay=0.01)

        with patch.object(httpx.Client, "request") as mock_request:
            mock_request.side_effect = [
                httpx.ConnectError("Connection refused"),
                make_response(200, {"text": "ok", "mapping": {}, "detected_entities": [], "entities_count": 0}),
            ]

            with patch("blindfold.client.time.sleep") as mock_sleep:
                result = client.tokenize("test")
                assert result.text == "ok"
                assert mock_request.call_count == 2
                mock_sleep.assert_called_once()

    def test_retry_on_429_then_success(self):
        """Should retry on 429 rate limit and succeed on second attempt."""
        client = Blindfold(api_key="test-key", max_retries=2, retry_delay=0.01)

        with patch.object(httpx.Client, "request") as mock_request:
            mock_request.side_effect = [
                make_response(429, {"detail": "Rate limited"}),
                make_response(200, {"text": "ok", "mapping": {}, "detected_entities": [], "entities_count": 0}),
            ]

            with patch("blindfold.client.time.sleep") as mock_sleep:
                result = client.tokenize("test")
                assert result.text == "ok"
                assert mock_request.call_count == 2
                mock_sleep.assert_called_once()

    def test_retry_on_500_then_success(self):
        """Should retry on 500 server error and succeed on second attempt."""
        client = Blindfold(api_key="test-key", max_retries=2, retry_delay=0.01)

        with patch.object(httpx.Client, "request") as mock_request:
            mock_request.side_effect = [
                make_response(500, {"detail": "Internal error"}),
                make_response(200, {"text": "ok", "mapping": {}, "detected_entities": [], "entities_count": 0}),
            ]

            with patch("blindfold.client.time.sleep") as mock_sleep:
                result = client.tokenize("test")
                assert result.text == "ok"
                assert mock_request.call_count == 2
                mock_sleep.assert_called_once()

    def test_no_retry_on_401(self):
        """Should NOT retry on authentication errors."""
        client = Blindfold(api_key="test-key", max_retries=2, retry_delay=0.01)

        with patch.object(httpx.Client, "request") as mock_request:
            mock_request.return_value = make_response(401, {"detail": "Unauthorized"})

            with patch("blindfold.client.time.sleep") as mock_sleep:
                with pytest.raises(AuthenticationError):
                    client.tokenize("test")
                assert mock_request.call_count == 1
                mock_sleep.assert_not_called()

    def test_no_retry_on_400(self):
        """Should NOT retry on 400 bad request."""
        client = Blindfold(api_key="test-key", max_retries=2, retry_delay=0.01)

        with patch.object(httpx.Client, "request") as mock_request:
            mock_request.return_value = make_response(400, {"detail": "Bad request"})

            with patch("blindfold.client.time.sleep") as mock_sleep:
                with pytest.raises(APIError) as exc_info:
                    client.tokenize("test")
                assert exc_info.value.status_code == 400
                assert mock_request.call_count == 1
                mock_sleep.assert_not_called()

    def test_max_retries_exhausted(self):
        """Should raise after all retries are exhausted."""
        client = Blindfold(api_key="test-key", max_retries=2, retry_delay=0.01)

        with patch.object(httpx.Client, "request") as mock_request:
            mock_request.side_effect = httpx.ConnectError("Connection refused")

            with patch("blindfold.client.time.sleep"):
                with pytest.raises(NetworkError):
                    client.tokenize("test")
                assert mock_request.call_count == 3  # 1 initial + 2 retries

    def test_retries_disabled(self):
        """Should not retry when max_retries=0."""
        client = Blindfold(api_key="test-key", max_retries=0, retry_delay=0.01)

        with patch.object(httpx.Client, "request") as mock_request:
            mock_request.side_effect = httpx.ConnectError("Connection refused")

            with patch("blindfold.client.time.sleep") as mock_sleep:
                with pytest.raises(NetworkError):
                    client.tokenize("test")
                assert mock_request.call_count == 1
                mock_sleep.assert_not_called()

    def test_retry_on_502_503_504(self):
        """Should retry on 502, 503, 504 status codes."""
        for status in [502, 503, 504]:
            client = Blindfold(api_key="test-key", max_retries=1, retry_delay=0.01)

            with patch.object(httpx.Client, "request") as mock_request:
                mock_request.side_effect = [
                    make_response(status, {"detail": "Error"}),
                    make_response(200, {"text": "ok", "mapping": {}, "detected_entities": [], "entities_count": 0}),
                ]

                with patch("blindfold.client.time.sleep"):
                    result = client.tokenize("test")
                    assert result.text == "ok"
                    assert mock_request.call_count == 2

    def test_exponential_backoff(self):
        """Should increase delay exponentially between retries."""
        client = Blindfold(api_key="test-key", max_retries=2, retry_delay=1.0)

        with patch.object(httpx.Client, "request") as mock_request:
            mock_request.side_effect = httpx.ConnectError("Connection refused")

            with patch("blindfold.client.time.sleep") as mock_sleep:
                with patch("blindfold.client.random.random", return_value=0.0):
                    with pytest.raises(NetworkError):
                        client.tokenize("test")

                    delays = [call.args[0] for call in mock_sleep.call_args_list]
                    assert len(delays) == 2
                    assert delays[0] == pytest.approx(1.0, abs=0.2)  # 1.0 * 2^0
                    assert delays[1] == pytest.approx(2.0, abs=0.4)  # 1.0 * 2^1

    def test_default_retry_config(self):
        """Default config should have max_retries=2, retry_delay=0.5."""
        client = Blindfold(api_key="test-key")
        assert client.max_retries == 2
        assert client.retry_delay == 0.5
