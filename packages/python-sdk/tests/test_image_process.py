"""Tests for image processing methods (tokenize, redact, mask, synthesize, hash, encrypt)."""

import json
from unittest.mock import MagicMock, patch

import httpx
import pytest

from blindfold import Blindfold, AsyncBlindfold, ImageProcessResponse
from conftest import SAMPLE_ENTITY


# -- Helpers ------------------------------------------------------------------

PNG_BYTES = b"\x89PNG\r\n\x1a\nfake-image-data"


def make_image_response(
    status_code: int = 200,
    content: bytes = PNG_BYTES,
    entities: list | None = None,
    mapping: dict | None = None,
    ocr_confidence: float | None = 85.3,
) -> MagicMock:
    """Create a mock httpx.Response that returns image/png with metadata headers."""
    entities = entities if entities is not None else [SAMPLE_ENTITY]
    mapping = mapping if mapping is not None else {"John Doe": "<Person_1>"}

    headers = httpx.Headers({
        "content-type": "image/png",
        "x-entities-count": str(len(entities)),
        "x-detected-entities": json.dumps(entities),
        "x-mapping": json.dumps(mapping),
        "x-ocr-confidence": str(ocr_confidence) if ocr_confidence is not None else "",
    })

    resp = MagicMock(spec=httpx.Response)
    resp.status_code = status_code
    resp.is_success = 200 <= status_code < 300
    resp.content = content
    resp.headers = headers
    resp.text = ""
    return resp


def make_error_response(status_code: int, detail: str = "error") -> MagicMock:
    resp = MagicMock(spec=httpx.Response)
    resp.status_code = status_code
    resp.is_success = False
    resp.json.return_value = {"detail": detail}
    resp.text = detail
    resp.headers = httpx.Headers({"content-type": "application/json"})
    return resp


# -- Sync tests ---------------------------------------------------------------

class TestImageTokenize:
    @patch.object(httpx.Client, "post")
    def test_basic(self, mock_post, client):
        mock_post.return_value = make_image_response()
        result = client.image_tokenize(b"fake-image")
        assert isinstance(result, ImageProcessResponse)
        assert result.image == PNG_BYTES
        assert result.entities_count == 1
        assert result.mapping == {"John Doe": "<Person_1>"}
        assert result.ocr_confidence == 85.3

    @patch.object(httpx.Client, "post")
    def test_endpoint_url(self, mock_post, client):
        mock_post.return_value = make_image_response()
        client.image_tokenize(b"img")
        call_args = mock_post.call_args
        assert call_args[1].get("data", {}).get("language") == "eng" or "/file/tokenize" in str(call_args)

    @patch.object(httpx.Client, "post")
    def test_with_options(self, mock_post, client):
        mock_post.return_value = make_image_response()
        client.image_tokenize(
            b"img", language="deu", entities=["person", "email address"],
            score_threshold=0.8, policy="gdpr_eu",
        )
        data = mock_post.call_args[1]["data"]
        assert data["language"] == "deu"
        assert data["entities"] == "person,email address"
        assert data["score_threshold"] == "0.8"
        assert data["policy"] == "gdpr_eu"


class TestImageRedact:
    @patch.object(httpx.Client, "post")
    def test_basic(self, mock_post, client):
        mock_post.return_value = make_image_response()
        result = client.image_redact(b"fake-image")
        assert isinstance(result, ImageProcessResponse)
        assert result.image == PNG_BYTES
        assert result.entities_count == 1


class TestImageMask:
    @patch.object(httpx.Client, "post")
    def test_basic(self, mock_post, client):
        mock_post.return_value = make_image_response()
        result = client.image_mask(b"img")
        assert isinstance(result, ImageProcessResponse)
        assert result.image == PNG_BYTES

    @patch.object(httpx.Client, "post")
    def test_mask_params(self, mock_post, client):
        mock_post.return_value = make_image_response()
        client.image_mask(b"img", chars_to_show=5, from_end=True, masking_char="#")
        data = mock_post.call_args[1]["data"]
        assert data["chars_to_show"] == "5"
        assert data["from_end"] == "true"
        assert data["masking_char"] == "#"

    @patch.object(httpx.Client, "post")
    def test_mask_defaults(self, mock_post, client):
        mock_post.return_value = make_image_response()
        client.image_mask(b"img")
        data = mock_post.call_args[1]["data"]
        assert data["chars_to_show"] == "3"
        assert data["masking_char"] == "*"
        assert "from_end" not in data


class TestImageSynthesize:
    @patch.object(httpx.Client, "post")
    def test_basic(self, mock_post, client):
        mock_post.return_value = make_image_response()
        result = client.image_synthesize(b"img")
        assert isinstance(result, ImageProcessResponse)

    @patch.object(httpx.Client, "post")
    def test_synthesis_language(self, mock_post, client):
        mock_post.return_value = make_image_response()
        client.image_synthesize(b"img", synthesis_language="de")
        data = mock_post.call_args[1]["data"]
        assert data["synthesis_language"] == "de"


class TestImageHash:
    @patch.object(httpx.Client, "post")
    def test_basic(self, mock_post, client):
        mock_post.return_value = make_image_response()
        result = client.image_hash(b"img")
        assert isinstance(result, ImageProcessResponse)

    @patch.object(httpx.Client, "post")
    def test_hash_params(self, mock_post, client):
        mock_post.return_value = make_image_response()
        client.image_hash(b"img", hash_type="md5", hash_prefix="H_", hash_length=8)
        data = mock_post.call_args[1]["data"]
        assert data["hash_type"] == "md5"
        assert data["hash_prefix"] == "H_"
        assert data["hash_length"] == "8"


class TestImageEncrypt:
    @patch.object(httpx.Client, "post")
    def test_basic(self, mock_post, client):
        mock_post.return_value = make_image_response()
        result = client.image_encrypt(b"img")
        assert isinstance(result, ImageProcessResponse)

    @patch.object(httpx.Client, "post")
    def test_encryption_key(self, mock_post, client):
        mock_post.return_value = make_image_response()
        client.image_encrypt(b"img", encryption_key="my-secret-key-1234")
        data = mock_post.call_args[1]["data"]
        assert data["encryption_key"] == "my-secret-key-1234"

    @patch.object(httpx.Client, "post")
    def test_no_key(self, mock_post, client):
        mock_post.return_value = make_image_response()
        client.image_encrypt(b"img")
        data = mock_post.call_args[1]["data"]
        assert "encryption_key" not in data


class TestImageProcessErrors:
    @patch.object(httpx.Client, "post")
    def test_auth_error(self, mock_post, client):
        mock_post.return_value = make_error_response(401, "Unauthorized")
        from blindfold.errors import AuthenticationError
        with pytest.raises(AuthenticationError):
            client.image_tokenize(b"img")

    @patch.object(httpx.Client, "post")
    def test_api_error(self, mock_post, client):
        mock_post.return_value = make_error_response(400, "Bad request")
        from blindfold.errors import APIError
        with pytest.raises(APIError):
            client.image_redact(b"img")


class TestImageProcessMetadata:
    @patch.object(httpx.Client, "post")
    def test_no_entities(self, mock_post, client):
        mock_post.return_value = make_image_response(
            entities=[], mapping={}, ocr_confidence=90.0,
        )
        result = client.image_tokenize(b"img")
        assert result.entities_count == 0
        assert result.detected_entities == []
        assert result.mapping == {}

    @patch.object(httpx.Client, "post")
    def test_no_confidence(self, mock_post, client):
        mock_post.return_value = make_image_response(ocr_confidence=None)
        result = client.image_tokenize(b"img")
        assert result.ocr_confidence is None

    @patch.object(httpx.Client, "post")
    def test_file_path_input(self, mock_post, client, tmp_path):
        img_file = tmp_path / "test.jpg"
        img_file.write_bytes(b"fake-jpeg")
        mock_post.return_value = make_image_response()
        result = client.image_tokenize(str(img_file))
        assert result.image == PNG_BYTES
        files_arg = mock_post.call_args[1]["files"]
        assert files_arg["file"][0] == "test.jpg"


# -- Async tests --------------------------------------------------------------

class TestAsyncImageTokenize:
    @pytest.mark.asyncio
    @patch.object(httpx.AsyncClient, "post")
    async def test_basic(self, mock_post, async_client):
        mock_post.return_value = make_image_response()
        result = await async_client.image_tokenize(b"fake-image")
        assert isinstance(result, ImageProcessResponse)
        assert result.image == PNG_BYTES
        assert result.entities_count == 1


class TestAsyncImageMask:
    @pytest.mark.asyncio
    @patch.object(httpx.AsyncClient, "post")
    async def test_params(self, mock_post, async_client):
        mock_post.return_value = make_image_response()
        await async_client.image_mask(b"img", chars_to_show=2, from_end=True)
        data = mock_post.call_args[1]["data"]
        assert data["chars_to_show"] == "2"
        assert data["from_end"] == "true"


class TestAsyncImageHash:
    @pytest.mark.asyncio
    @patch.object(httpx.AsyncClient, "post")
    async def test_params(self, mock_post, async_client):
        mock_post.return_value = make_image_response()
        await async_client.image_hash(b"img", hash_type="md5", hash_length=8)
        data = mock_post.call_args[1]["data"]
        assert data["hash_type"] == "md5"
        assert data["hash_length"] == "8"


class TestAsyncImageEncrypt:
    @pytest.mark.asyncio
    @patch.object(httpx.AsyncClient, "post")
    async def test_with_key(self, mock_post, async_client):
        mock_post.return_value = make_image_response()
        await async_client.image_encrypt(b"img", encryption_key="test-key-12345678")
        data = mock_post.call_args[1]["data"]
        assert data["encryption_key"] == "test-key-12345678"
