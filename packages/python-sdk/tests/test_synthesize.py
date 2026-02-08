"""Tests for synthesize method"""

from unittest.mock import patch

import httpx

from conftest import SAMPLE_ENTITY, make_response


class TestSynthesize:
    @patch.object(httpx.Client, "request")
    def test_basic(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "Jane Smith called yesterday",
            "detected_entities": [SAMPLE_ENTITY],
            "entities_count": 1,
        })

        result = client.synthesize(text="John Doe called yesterday")

        assert result.text == "Jane Smith called yesterday"
        assert result.entities_count == 1

    @patch.object(httpx.Client, "request")
    def test_default_language(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "synth", "detected_entities": [], "entities_count": 0,
        })

        client.synthesize(text="test")

        payload = mock_request.call_args.kwargs["json"]
        assert payload["language"] == "en"

    @patch.object(httpx.Client, "request")
    def test_custom_language(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "Jan Novak zavolal",
            "detected_entities": [SAMPLE_ENTITY],
            "entities_count": 1,
        })

        client.synthesize(text="John Doe zavolal", language="cs")

        payload = mock_request.call_args.kwargs["json"]
        assert payload["language"] == "cs"

    @patch.object(httpx.Client, "request")
    def test_with_policy_and_entities(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "synth", "detected_entities": [], "entities_count": 0,
        })

        client.synthesize(text="test", policy="hipaa_us", entities=["person"])

        payload = mock_request.call_args.kwargs["json"]
        assert payload["policy"] == "hipaa_us"
        assert payload["entities"] == ["person"]


class TestAsyncSynthesize:
    @patch.object(httpx.AsyncClient, "request")
    async def test_basic(self, mock_request, async_client):
        mock_request.return_value = make_response(200, {
            "text": "Jane Smith called",
            "detected_entities": [SAMPLE_ENTITY],
            "entities_count": 1,
        })

        result = await async_client.synthesize(text="John Doe called")

        assert result.text == "Jane Smith called"
