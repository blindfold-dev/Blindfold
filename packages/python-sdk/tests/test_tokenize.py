"""Tests for tokenize method"""

from unittest.mock import patch

import httpx

from conftest import SAMPLE_ENTITY, make_response


class TestTokenize:
    @patch.object(httpx.Client, "request")
    def test_basic(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "<Person_1> called yesterday",
            "mapping": {"<Person_1>": "John Doe"},
            "detected_entities": [SAMPLE_ENTITY],
            "entities_count": 1,
        })

        result = client.tokenize(text="John Doe called yesterday")

        assert result.text == "<Person_1> called yesterday"
        assert result.mapping == {"<Person_1>": "John Doe"}
        assert len(result.detected_entities) == 1
        assert result.entities_count == 1

    @patch.object(httpx.Client, "request")
    def test_sends_correct_endpoint(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "", "mapping": {}, "detected_entities": [], "entities_count": 0,
        })

        client.tokenize(text="test")

        call_kwargs = mock_request.call_args
        assert call_kwargs.kwargs["method"] == "POST"
        assert call_kwargs.kwargs["url"] == "/tokenize"

    @patch.object(httpx.Client, "request")
    def test_with_all_options(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "<Person_1> called",
            "mapping": {"<Person_1>": "John"},
            "detected_entities": [SAMPLE_ENTITY],
            "entities_count": 1,
        })

        client.tokenize(
            text="John called",
            entities=["person"],
            score_threshold=0.8,
            policy="gdpr_eu",
        )

        payload = mock_request.call_args.kwargs["json"]
        assert payload["entities"] == ["person"]
        assert payload["score_threshold"] == 0.8
        assert payload["policy"] == "gdpr_eu"

    @patch.object(httpx.Client, "request")
    def test_with_config(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "text", "mapping": {}, "detected_entities": [], "entities_count": 0,
        })

        client.tokenize(text="hello", config={"custom_param": "value"})

        payload = mock_request.call_args.kwargs["json"]
        assert payload["custom_param"] == "value"

    @patch.object(httpx.Client, "request")
    def test_omits_none_params(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "", "mapping": {}, "detected_entities": [], "entities_count": 0,
        })

        client.tokenize(text="hello")

        payload = mock_request.call_args.kwargs["json"]
        assert "entities" not in payload
        assert "score_threshold" not in payload
        assert "policy" not in payload


class TestAsyncTokenize:
    @patch.object(httpx.AsyncClient, "request")
    async def test_basic(self, mock_request, async_client):
        mock_request.return_value = make_response(200, {
            "text": "<Person_1> called",
            "mapping": {"<Person_1>": "John"},
            "detected_entities": [SAMPLE_ENTITY],
            "entities_count": 1,
        })

        result = await async_client.tokenize(text="John called")

        assert result.text == "<Person_1> called"
        assert result.mapping == {"<Person_1>": "John"}
