"""Tests for encrypt method"""

from unittest.mock import patch

import httpx

from conftest import SAMPLE_ENTITY, make_response


class TestEncrypt:
    @patch.object(httpx.Client, "request")
    def test_basic(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "ENC(abc123xyz) called yesterday",
            "detected_entities": [SAMPLE_ENTITY],
            "entities_count": 1,
        })

        result = client.encrypt(text="John Doe called yesterday")

        assert result.text == "ENC(abc123xyz) called yesterday"
        assert result.entities_count == 1

    @patch.object(httpx.Client, "request")
    def test_without_key(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "enc", "detected_entities": [], "entities_count": 0,
        })

        client.encrypt(text="test")

        payload = mock_request.call_args.kwargs["json"]
        assert "encryption_key" not in payload

    @patch.object(httpx.Client, "request")
    def test_with_key(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "ENC(xyz) called",
            "detected_entities": [SAMPLE_ENTITY],
            "entities_count": 1,
        })

        client.encrypt(text="John Doe called", encryption_key="my-secret-key")

        payload = mock_request.call_args.kwargs["json"]
        assert payload["encryption_key"] == "my-secret-key"

    @patch.object(httpx.Client, "request")
    def test_with_policy_and_entities(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "encrypted", "detected_entities": [], "entities_count": 0,
        })

        client.encrypt(text="test", policy="gdpr_eu", entities=["person"])

        payload = mock_request.call_args.kwargs["json"]
        assert payload["policy"] == "gdpr_eu"
        assert payload["entities"] == ["person"]


class TestAsyncEncrypt:
    @patch.object(httpx.AsyncClient, "request")
    async def test_basic(self, mock_request, async_client):
        mock_request.return_value = make_response(200, {
            "text": "ENC(xyz) called",
            "detected_entities": [SAMPLE_ENTITY],
            "entities_count": 1,
        })

        result = await async_client.encrypt(text="John Doe called")

        assert result.text == "ENC(xyz) called"
