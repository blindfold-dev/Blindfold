"""Tests for error handling"""

from unittest.mock import patch

import httpx
import pytest

from blindfold import AsyncBlindfold
from blindfold.errors import APIError, AuthenticationError, NetworkError

from conftest import SAMPLE_ENTITY, make_response


class TestAuthenticationErrors:
    @patch.object(httpx.Client, "request")
    def test_401_raises_authentication_error(self, mock_request, client):
        mock_request.return_value = make_response(401)

        with pytest.raises(AuthenticationError):
            client.tokenize(text="test")

    @patch.object(httpx.Client, "request")
    def test_403_raises_authentication_error(self, mock_request, client):
        mock_request.return_value = make_response(403)

        with pytest.raises(AuthenticationError):
            client.detect(text="test")


class TestAPIErrors:
    @patch.object(httpx.Client, "request")
    def test_500_with_detail(self, mock_request, client):
        mock_request.return_value = make_response(
            500, json_data={"detail": "Internal server error"},
        )

        with pytest.raises(APIError) as exc_info:
            client.redact(text="test")

        assert exc_info.value.status_code == 500
        assert "Internal server error" in str(exc_info.value)

    @patch.object(httpx.Client, "request")
    def test_422_with_message(self, mock_request, client):
        mock_request.return_value = make_response(
            422, json_data={"message": "Validation failed"},
        )

        with pytest.raises(APIError) as exc_info:
            client.mask(text="test")

        assert exc_info.value.status_code == 422
        assert "Validation failed" in str(exc_info.value)

    @patch.object(httpx.Client, "request")
    def test_unparseable_body(self, mock_request, client):
        resp = make_response(500, text="Bad Gateway")
        resp.json.side_effect = ValueError("No JSON")
        mock_request.return_value = resp

        with pytest.raises(APIError):
            client.synthesize(text="test")

    @patch.object(httpx.Client, "request")
    def test_response_body_preserved(self, mock_request, client):
        body = {"detail": "Rate limited", "retry_after": 60}
        mock_request.return_value = make_response(429, json_data=body)

        with pytest.raises(APIError) as exc_info:
            client.tokenize(text="test")

        assert exc_info.value.response_body == body


class TestNetworkErrors:
    @patch.object(httpx.Client, "request")
    def test_connect_error(self, mock_request, client):
        mock_request.side_effect = httpx.ConnectError("Connection refused")

        with pytest.raises(NetworkError):
            client.tokenize(text="test")

    @patch.object(httpx.Client, "request")
    def test_timeout(self, mock_request, client):
        mock_request.side_effect = httpx.TimeoutException("Timeout")

        with pytest.raises(NetworkError):
            client.hash(text="test")

    @patch.object(httpx.Client, "request")
    def test_unexpected_error(self, mock_request, client):
        mock_request.side_effect = RuntimeError("Something weird")

        with pytest.raises(NetworkError):
            client.encrypt(text="test")


class TestAsyncErrors:
    @patch.object(httpx.AsyncClient, "request")
    async def test_401_raises_auth_error(self, mock_request, async_client):
        mock_request.return_value = make_response(401)

        with pytest.raises(AuthenticationError):
            await async_client.tokenize(text="test")

    @patch.object(httpx.AsyncClient, "request")
    async def test_network_error(self, mock_request, async_client):
        mock_request.side_effect = httpx.ConnectError("Connection refused")

        with pytest.raises(NetworkError):
            await async_client.tokenize(text="test")

    @patch.object(httpx.AsyncClient, "request")
    async def test_context_manager(self, mock_request):
        mock_request.return_value = make_response(200, {
            "text": "<Person_1>",
            "mapping": {"<Person_1>": "John"},
            "detected_entities": [SAMPLE_ENTITY],
            "entities_count": 1,
        })

        async with AsyncBlindfold(api_key="test-key") as c:
            result = await c.tokenize(text="John")
            assert result.text == "<Person_1>"
