"""Tests for mask method"""

from unittest.mock import patch

import httpx

from conftest import SAMPLE_ENTITY, make_response


class TestMask:
    @patch.object(httpx.Client, "request")
    def test_basic(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "Joh***** called yesterday",
            "detected_entities": [SAMPLE_ENTITY],
            "entities_count": 1,
        })

        result = client.mask(text="John Doe called yesterday")

        assert "***" in result.text
        assert result.entities_count == 1

    @patch.object(httpx.Client, "request")
    def test_default_params(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "masked", "detected_entities": [], "entities_count": 0,
        })

        client.mask(text="test")

        payload = mock_request.call_args.kwargs["json"]
        assert payload["chars_to_show"] == 3
        assert payload["from_end"] is False
        assert payload["masking_char"] == "*"

    @patch.object(httpx.Client, "request")
    def test_from_end(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "*****Doe called",
            "detected_entities": [SAMPLE_ENTITY],
            "entities_count": 1,
        })

        client.mask(text="John Doe called", chars_to_show=3, from_end=True)

        payload = mock_request.call_args.kwargs["json"]
        assert payload["from_end"] is True
        assert payload["chars_to_show"] == 3

    @patch.object(httpx.Client, "request")
    def test_custom_options(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "masked", "detected_entities": [], "entities_count": 0,
        })

        client.mask(
            text="test",
            chars_to_show=5,
            from_end=True,
            masking_char="#",
            score_threshold=0.9,
        )

        payload = mock_request.call_args.kwargs["json"]
        assert payload["chars_to_show"] == 5
        assert payload["from_end"] is True
        assert payload["masking_char"] == "#"
        assert payload["score_threshold"] == 0.9


class TestAsyncMask:
    @patch.object(httpx.AsyncClient, "request")
    async def test_basic(self, mock_request, async_client):
        mock_request.return_value = make_response(200, {
            "text": "Joh***** called",
            "detected_entities": [SAMPLE_ENTITY],
            "entities_count": 1,
        })

        result = await async_client.mask(text="John Doe called")

        assert "***" in result.text
