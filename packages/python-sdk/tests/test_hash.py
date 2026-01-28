"""Tests for hash method"""

from unittest.mock import patch

import httpx

from conftest import SAMPLE_ENTITY, make_response


class TestHash:
    @patch.object(httpx.Client, "request")
    def test_basic(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "HASH_a1b2c3d4e5f67890 called yesterday",
            "detected_entities": [SAMPLE_ENTITY],
            "entities_count": 1,
        })

        result = client.hash(text="John Doe called yesterday")

        assert "HASH_" in result.text
        assert result.entities_count == 1

    @patch.object(httpx.Client, "request")
    def test_default_params(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "hashed", "detected_entities": [], "entities_count": 0,
        })

        client.hash(text="test")

        payload = mock_request.call_args.kwargs["json"]
        assert payload["hash_type"] == "sha256"
        assert payload["hash_prefix"] == "HASH_"
        assert payload["hash_length"] == 16

    @patch.object(httpx.Client, "request")
    def test_custom_options(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "H_abcdef12 called",
            "detected_entities": [SAMPLE_ENTITY],
            "entities_count": 1,
        })

        client.hash(
            text="John Doe called",
            hash_type="md5",
            hash_prefix="H_",
            hash_length=8,
        )

        payload = mock_request.call_args.kwargs["json"]
        assert payload["hash_type"] == "md5"
        assert payload["hash_prefix"] == "H_"
        assert payload["hash_length"] == 8

    @patch.object(httpx.Client, "request")
    def test_with_entities_filter(self, mock_request, client):
        mock_request.return_value = make_response(200, {
            "text": "hashed", "detected_entities": [], "entities_count": 0,
        })

        client.hash(text="test", entities=["email address"], score_threshold=0.7)

        payload = mock_request.call_args.kwargs["json"]
        assert payload["entities"] == ["email address"]
        assert payload["score_threshold"] == 0.7


class TestAsyncHash:
    @patch.object(httpx.AsyncClient, "request")
    async def test_basic(self, mock_request, async_client):
        mock_request.return_value = make_response(200, {
            "text": "HASH_abc123 called",
            "detected_entities": [SAMPLE_ENTITY],
            "entities_count": 1,
        })

        result = await async_client.hash(text="John Doe called")

        assert "HASH_" in result.text
