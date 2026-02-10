"""Tests for batch processing methods"""

from unittest.mock import patch

import httpx
import pytest

from blindfold import Blindfold, AsyncBlindfold, BatchResponse
from conftest import make_response


BATCH_RESPONSE_DATA = {
    "results": [
        {"text": "<Person_1>", "mapping": {"<Person_1>": "John"}, "detected_entities": [{"entity_type": "Person", "text": "John", "start": 0, "end": 4, "score": 0.95}], "entities_count": 1},
        {"text": "no PII here", "mapping": {}, "detected_entities": [], "entities_count": 0},
        {"text": "<Email Address_1>", "mapping": {"<Email Address_1>": "john@example.com"}, "detected_entities": [{"entity_type": "Email Address", "text": "john@example.com", "start": 0, "end": 16, "score": 0.98}], "entities_count": 1},
    ],
    "total": 3,
    "succeeded": 3,
    "failed": 0,
}

BATCH_DETECT_RESPONSE_DATA = {
    "results": [
        {"detected_entities": [{"entity_type": "Person", "text": "John", "start": 0, "end": 4, "score": 0.95}], "entities_count": 1},
        {"detected_entities": [], "entities_count": 0},
    ],
    "total": 2,
    "succeeded": 2,
    "failed": 0,
}

BATCH_WITH_FAILURE_DATA = {
    "results": [
        {"text": "<Person_1>", "mapping": {"<Person_1>": "John"}, "detected_entities": [], "entities_count": 1},
        {"error": "Processing failed"},
    ],
    "total": 2,
    "succeeded": 1,
    "failed": 1,
}


class TestBatchSync:
    def test_tokenize_batch(self):
        client = Blindfold(api_key="test-key", max_retries=0)

        with patch.object(httpx.Client, "request") as mock_request:
            mock_request.return_value = make_response(200, BATCH_RESPONSE_DATA)

            result = client.tokenize_batch(["John", "no PII here", "john@example.com"])

            assert isinstance(result, BatchResponse)
            assert result.total == 3
            assert result.succeeded == 3
            assert result.failed == 0
            assert len(result.results) == 3
            assert result.results[0]["text"] == "<Person_1>"

            call_args = mock_request.call_args
            payload = call_args.kwargs.get("json") or call_args[1].get("json")
            assert payload["texts"] == ["John", "no PII here", "john@example.com"]

    def test_detect_batch(self):
        client = Blindfold(api_key="test-key", max_retries=0)

        with patch.object(httpx.Client, "request") as mock_request:
            mock_request.return_value = make_response(200, BATCH_DETECT_RESPONSE_DATA)

            result = client.detect_batch(["John Doe", "no PII"])

            assert isinstance(result, BatchResponse)
            assert result.total == 2
            assert result.succeeded == 2
            assert result.results[0]["entities_count"] == 1

    def test_redact_batch(self):
        client = Blindfold(api_key="test-key", max_retries=0)

        with patch.object(httpx.Client, "request") as mock_request:
            mock_request.return_value = make_response(200, BATCH_RESPONSE_DATA)

            result = client.redact_batch(["text1", "text2", "text3"], masking_char="#")

            assert isinstance(result, BatchResponse)
            call_args = mock_request.call_args
            payload = call_args.kwargs.get("json") or call_args[1].get("json")
            assert payload["masking_char"] == "#"

    def test_mask_batch(self):
        client = Blindfold(api_key="test-key", max_retries=0)

        with patch.object(httpx.Client, "request") as mock_request:
            mock_request.return_value = make_response(200, BATCH_RESPONSE_DATA)

            result = client.mask_batch(["text1", "text2"], chars_to_show=4, from_end=True)

            assert isinstance(result, BatchResponse)
            call_args = mock_request.call_args
            payload = call_args.kwargs.get("json") or call_args[1].get("json")
            assert payload["chars_to_show"] == 4
            assert payload["from_end"] is True

    def test_synthesize_batch(self):
        client = Blindfold(api_key="test-key", max_retries=0)

        with patch.object(httpx.Client, "request") as mock_request:
            mock_request.return_value = make_response(200, BATCH_RESPONSE_DATA)

            result = client.synthesize_batch(["text1", "text2"], language="de")

            assert isinstance(result, BatchResponse)
            call_args = mock_request.call_args
            payload = call_args.kwargs.get("json") or call_args[1].get("json")
            assert payload["language"] == "de"

    def test_hash_batch(self):
        client = Blindfold(api_key="test-key", max_retries=0)

        with patch.object(httpx.Client, "request") as mock_request:
            mock_request.return_value = make_response(200, BATCH_RESPONSE_DATA)

            result = client.hash_batch(["text1"], hash_type="md5", hash_length=8)

            assert isinstance(result, BatchResponse)
            call_args = mock_request.call_args
            payload = call_args.kwargs.get("json") or call_args[1].get("json")
            assert payload["hash_type"] == "md5"
            assert payload["hash_length"] == 8

    def test_encrypt_batch(self):
        client = Blindfold(api_key="test-key", max_retries=0)

        with patch.object(httpx.Client, "request") as mock_request:
            mock_request.return_value = make_response(200, BATCH_RESPONSE_DATA)

            result = client.encrypt_batch(["text1", "text2"], encryption_key="my-secret-key-1234")

            assert isinstance(result, BatchResponse)
            call_args = mock_request.call_args
            payload = call_args.kwargs.get("json") or call_args[1].get("json")
            assert payload["encryption_key"] == "my-secret-key-1234"

    def test_batch_with_policy(self):
        client = Blindfold(api_key="test-key", max_retries=0)

        with patch.object(httpx.Client, "request") as mock_request:
            mock_request.return_value = make_response(200, BATCH_RESPONSE_DATA)

            result = client.tokenize_batch(
                ["text1", "text2"],
                policy="gdpr_eu",
                entities=["Person", "Email Address"],
                score_threshold=0.7,
            )

            assert isinstance(result, BatchResponse)
            call_args = mock_request.call_args
            payload = call_args.kwargs.get("json") or call_args[1].get("json")
            assert payload["policy"] == "gdpr_eu"
            assert payload["entities"] == ["Person", "Email Address"]
            assert payload["score_threshold"] == 0.7
            assert "text" not in payload

    def test_batch_with_partial_failure(self):
        client = Blindfold(api_key="test-key", max_retries=0)

        with patch.object(httpx.Client, "request") as mock_request:
            mock_request.return_value = make_response(200, BATCH_WITH_FAILURE_DATA)

            result = client.tokenize_batch(["text1", "text2"])

            assert result.total == 2
            assert result.succeeded == 1
            assert result.failed == 1
            assert "error" in result.results[1]

    def test_batch_sends_texts_not_text(self):
        """Verify batch methods send 'texts' key, not 'text'."""
        client = Blindfold(api_key="test-key", max_retries=0)

        with patch.object(httpx.Client, "request") as mock_request:
            mock_request.return_value = make_response(200, BATCH_RESPONSE_DATA)

            client.tokenize_batch(["a", "b"])

            call_args = mock_request.call_args
            payload = call_args.kwargs.get("json") or call_args[1].get("json")
            assert "texts" in payload
            assert "text" not in payload


class TestBatchAsync:
    @pytest.mark.asyncio
    async def test_tokenize_batch_async(self):
        client = AsyncBlindfold(api_key="test-key", max_retries=0)

        with patch.object(httpx.AsyncClient, "request") as mock_request:
            mock_request.return_value = make_response(200, BATCH_RESPONSE_DATA)

            result = await client.tokenize_batch(["John", "no PII"])

            assert isinstance(result, BatchResponse)
            assert result.total == 3
            assert result.succeeded == 3

    @pytest.mark.asyncio
    async def test_detect_batch_async(self):
        client = AsyncBlindfold(api_key="test-key", max_retries=0)

        with patch.object(httpx.AsyncClient, "request") as mock_request:
            mock_request.return_value = make_response(200, BATCH_DETECT_RESPONSE_DATA)

            result = await client.detect_batch(["John Doe", "no PII"])

            assert isinstance(result, BatchResponse)
            assert result.total == 2

    @pytest.mark.asyncio
    async def test_all_batch_methods_exist_async(self):
        """All 7 batch methods should exist on AsyncBlindfold."""
        client = AsyncBlindfold(api_key="test-key")
        methods = [
            "tokenize_batch", "detect_batch", "redact_batch",
            "mask_batch", "synthesize_batch", "hash_batch", "encrypt_batch",
        ]
        for method in methods:
            assert hasattr(client, method), f"Missing async method: {method}"
            assert callable(getattr(client, method))
