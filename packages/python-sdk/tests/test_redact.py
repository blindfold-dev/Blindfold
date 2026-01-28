"""Tests for redact method"""

from unittest.mock import patch

import httpx

from conftest import SAMPLE_ENTITY, make_response


class TestRedact:
    @patch.object(httpx.Client, "request")
    def test_basic(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "******** called yesterday",
            "detected_entities": [SAMPLE_ENTITY],
            "entities_count": 1,
        })

        result = client.redact(text="John Doe called yesterday")

        assert result.text == "******** called yesterday"
        assert result.entities_count == 1

    @patch.object(httpx.Client, "request")
    def test_default_masking_char(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "***", "detected_entities": [], "entities_count": 0,
        })

        client.redact(text="test")

        payload = mock_request.call_args.kwargs["json"]
        assert payload["masking_char"] == "*"

    @patch.object(httpx.Client, "request")
    def test_custom_masking_char(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "XXXX called",
            "detected_entities": [SAMPLE_ENTITY],
            "entities_count": 1,
        })

        client.redact(text="John Doe called", masking_char="X")

        payload = mock_request.call_args.kwargs["json"]
        assert payload["masking_char"] == "X"

    @patch.object(httpx.Client, "request")
    def test_with_policy_and_entities(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "*** called",
            "detected_entities": [], "entities_count": 0,
        })

        client.redact(text="John called", policy="gdpr_eu", entities=["person"])

        payload = mock_request.call_args.kwargs["json"]
        assert payload["policy"] == "gdpr_eu"
        assert payload["entities"] == ["person"]


class TestAsyncRedact:
    @patch.object(httpx.AsyncClient, "request")
    async def test_basic(self, mock_request, async_client):
        mock_request.return_value = make_response(200, {
            "text": "*** called",
            "detected_entities": [SAMPLE_ENTITY],
            "entities_count": 1,
        })

        result = await async_client.redact(text="John called")

        assert result.text == "*** called"
