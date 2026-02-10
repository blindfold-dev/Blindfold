"""Tests for detect method"""

from unittest.mock import patch

import httpx

from conftest import SAMPLE_ENTITY, make_response


class TestDetect:
    @patch.object(httpx.Client, "request")
    def test_basic(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "detected_entities": [SAMPLE_ENTITY],
            "entities_count": 1,
        })

        result = client.detect(text="John Doe called yesterday")

        assert len(result.detected_entities) == 1
        assert result.detected_entities[0].type == "person"
        assert result.detected_entities[0].text == "John Doe"
        assert result.detected_entities[0].score == 0.95
        assert result.entities_count == 1

    @patch.object(httpx.Client, "request")
    def test_sends_correct_endpoint(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "detected_entities": [], "entities_count": 0,
        })

        client.detect(text="test")

        call_kwargs = mock_request.call_args
        assert call_kwargs.kwargs["url"] == "/detect"

    @patch.object(httpx.Client, "request")
    def test_with_options(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "detected_entities": [], "entities_count": 0,
        })

        client.detect(
            text="test",
            entities=["email address", "phone number"],
            score_threshold=0.5,
            policy="hipaa_us",
        )

        payload = mock_request.call_args.kwargs["json"]
        assert payload["entities"] == ["email address", "phone number"]
        assert payload["score_threshold"] == 0.5
        assert payload["policy"] == "hipaa_us"

    @patch.object(httpx.Client, "request")
    def test_no_entities_found(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "detected_entities": [], "entities_count": 0,
        })

        result = client.detect(text="Hello world")

        assert result.detected_entities == []
        assert result.entities_count == 0


class TestAsyncDetect:
    @patch.object(httpx.AsyncClient, "request")
    async def test_basic(self, mock_request, async_client):
        mock_request.return_value = make_response(200, {
            "detected_entities": [SAMPLE_ENTITY],
            "entities_count": 1,
        })

        result = await async_client.detect(text="John Doe")

        assert result.entities_count == 1
