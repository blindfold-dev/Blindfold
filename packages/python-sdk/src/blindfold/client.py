"""Blindfold client for tokenization and detokenization"""

import asyncio
import random
import time
from typing import Any, Dict, List, Optional

import httpx
from pydantic import ValidationError

from .errors import APIError, AuthenticationError, NetworkError

RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}
from .models import (
    APIErrorResponse,
    BatchResponse,
    DetectResponse,
    DetokenizeResponse,
    EncryptResponse,
    HashResponse,
    MaskResponse,
    RedactResponse,
    SynthesizeResponse,
    TokenizeResponse,
)

DEFAULT_BASE_URL = "https://api.blindfold.dev/api/public/v1"


class Blindfold:
    """
    Blindfold client for tokenization and detokenization operations.

    This client supports both synchronous operations using httpx.Client.
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = 30.0,
        user_id: Optional[str] = None,
        max_retries: int = 2,
        retry_delay: float = 0.5,
    ) -> None:
        """
        Initialize Blindfold client.

        Args:
            api_key: API key for authentication
            base_url: Base URL for the API (default: https://api.blindfold.dev/api/public/v1)
            timeout: Request timeout in seconds (default: 30.0)
            user_id: Optional user ID to track who is making the request
            max_retries: Maximum number of retries on transient errors (default: 2, 0 to disable)
            retry_delay: Initial delay in seconds before first retry (default: 0.5)
        """
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.user_id = user_id
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self._client: Optional[httpx.Client] = None

    @property
    def client(self) -> httpx.Client:
        """Get or create httpx client"""
        if self._client is None:
            headers = {"X-API-Key": self.api_key}
            if self.user_id:
                headers["X-Blindfold-User-Id"] = self.user_id

            self._client = httpx.Client(
                base_url=self.base_url,
                timeout=self.timeout,
                headers=headers,
            )
        return self._client

    def close(self) -> None:
        """Close the HTTP client"""
        if self._client is not None:
            self._client.close()
            self._client = None

    def __enter__(self) -> "Blindfold":
        """Context manager entry"""
        return self

    def __exit__(self, *args: Any) -> None:
        """Context manager exit"""
        self.close()

    def _handle_response(self, response: httpx.Response) -> Dict[str, Any]:
        """Handle HTTP response and raise appropriate exceptions"""
        # Handle authentication errors
        if response.status_code in (401, 403):
            raise AuthenticationError(
                "Authentication failed. Please check your API key."
            )

        # Handle other error responses
        if not response.is_success:
            error_message = f"API request failed with status {response.status_code}"
            response_body = None

            try:
                response_body = response.json()
                error_data = APIErrorResponse(**response_body)
                error_message = error_data.detail or error_data.message or error_message
            except Exception:
                # If we can't parse the error response, use the status text
                error_message = f"{error_message}: {response.text}"

            raise APIError(error_message, response.status_code, response_body)

        try:
            result: Dict[str, Any] = response.json()
            return result
        except Exception as e:
            raise APIError(
                f"Failed to parse response: {str(e)}",
                response.status_code,
                response.text,
            ) from e

    def _request(
        self,
        method: str,
        endpoint: str,
        json: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Make a synchronous HTTP request with retry logic"""
        last_exception: Exception = NetworkError("Request failed")

        for attempt in range(self.max_retries + 1):
            try:
                response = self.client.request(
                    method=method,
                    url=endpoint,
                    json=json,
                )
                return self._handle_response(response)
            except NetworkError as e:
                last_exception = e
                if attempt < self.max_retries:
                    time.sleep(self._retry_wait(attempt))
                    continue
                raise
            except APIError as e:
                last_exception = e
                if e.status_code in RETRYABLE_STATUS_CODES and attempt < self.max_retries:
                    wait = self._retry_wait(attempt, e)
                    time.sleep(wait)
                    continue
                raise
            except AuthenticationError:
                raise
            except (httpx.ConnectError, httpx.TimeoutException) as e:
                last_exception = NetworkError(
                    f"Network request failed. Please check your connection and the API URL: {str(e)}"
                )
                last_exception.__cause__ = e
                if attempt < self.max_retries:
                    time.sleep(self._retry_wait(attempt))
                    continue
                raise last_exception from e
            except Exception as e:
                raise NetworkError(f"Unexpected error: {str(e)}") from e

        raise last_exception

    def _retry_wait(self, attempt: int, error: Optional[APIError] = None) -> float:
        """Calculate retry wait time with exponential backoff and jitter."""
        if error and isinstance(error, APIError) and error.status_code == 429:
            if error.response_body and isinstance(error.response_body, dict):
                retry_after = error.response_body.get("retry_after")
                if retry_after is not None:
                    return float(retry_after)
        delay = self.retry_delay * (2 ** attempt)
        jitter = delay * 0.1 * random.random()
        return delay + jitter

    def tokenize(
        self,
        text: str,
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> TokenizeResponse:
        """
        Tokenize text by replacing sensitive information with tokens.

        Args:
            text: Text to tokenize
            entities: Optional list of entities to detect
            score_threshold: Optional minimum confidence score (0.0-1.0)
            policy: Optional policy name to use (e.g., 'gdpr_eu', 'hipaa_us', 'basic')
            config: Optional additional configuration parameters

        Returns:
            TokenizeResponse with tokenized text and mapping

        Raises:
            AuthenticationError: If authentication fails
            APIError: If API request fails
            NetworkError: If network request fails
        """
        payload: Dict[str, Any] = {"text": text}
        if entities is not None:
            payload["entities"] = entities
        if score_threshold is not None:
            payload["score_threshold"] = score_threshold
        if policy is not None:
            payload["policy"] = policy
        if config:
            payload.update(config)

        response_data = self._request("POST", "/tokenize", json=payload)

        try:
            return TokenizeResponse(**response_data)
        except ValidationError as e:
            raise APIError(
                f"Invalid response format: {str(e)}", 200, response_data
            ) from e

    def detect(
        self,
        text: str,
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> DetectResponse:
        """
        Detect PII in text without modifying it.

        Returns only the detected entities with their types, positions,
        and confidence scores. The original text is not transformed.

        Args:
            text: Text to analyze for PII
            entities: Optional list of entities to detect
            score_threshold: Optional minimum confidence score (0.0-1.0)
            policy: Optional policy name to use (e.g., 'gdpr_eu', 'hipaa_us', 'basic')
            config: Optional additional configuration parameters

        Returns:
            DetectResponse with detected entities

        Raises:
            AuthenticationError: If authentication fails
            APIError: If API request fails
            NetworkError: If network request fails
        """
        payload: Dict[str, Any] = {"text": text}
        if entities is not None:
            payload["entities"] = entities
        if score_threshold is not None:
            payload["score_threshold"] = score_threshold
        if policy is not None:
            payload["policy"] = policy
        if config:
            payload.update(config)

        response_data = self._request("POST", "/detect", json=payload)

        try:
            return DetectResponse(**response_data)
        except ValidationError as e:
            raise APIError(
                f"Invalid response format: {str(e)}", 200, response_data
            ) from e

    def detokenize(
        self,
        text: str,
        mapping: Dict[str, str],
    ) -> DetokenizeResponse:
        """
        Detokenize text by replacing tokens with original values.

        This method performs detokenization CLIENT-SIDE for better performance,
        security, and to work offline. No API call is made.

        Args:
            text: Tokenized text
            mapping: Token mapping from tokenize response

        Returns:
            DetokenizeResponse with original text
        """
        result_text = text
        replacements_made = 0

        # Sort tokens by length (longest first) to avoid partial replacements
        sorted_tokens = sorted(mapping.keys(), key=len, reverse=True)

        for token in sorted_tokens:
            original_value = mapping[token]
            # Count occurrences
            count = result_text.count(token)
            if count > 0:
                result_text = result_text.replace(token, original_value)
                replacements_made += count

        return DetokenizeResponse(text=result_text, replacements_made=replacements_made)

    def redact(
        self,
        text: str,
        masking_char: str = "*",
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> RedactResponse:
        """
        Redact (permanently remove) sensitive information from text.

        WARNING: Redaction is irreversible - original data cannot be restored!

        Args:
            text: Text to redact
            masking_char: Character(s) to use for masking (default: "*")
            entities: Optional list of entities to detect
            score_threshold: Optional minimum confidence score (0.0-1.0)
            policy: Optional policy name to use (e.g., 'gdpr_eu', 'hipaa_us', 'basic')
            config: Optional additional configuration parameters

        Returns:
            RedactResponse with redacted text and detected entities

        Raises:
            AuthenticationError: If authentication fails
            APIError: If API request fails
            NetworkError: If network request fails
        """
        payload: Dict[str, Any] = {"text": text, "masking_char": masking_char}
        if entities is not None:
            payload["entities"] = entities
        if score_threshold is not None:
            payload["score_threshold"] = score_threshold
        if policy is not None:
            payload["policy"] = policy
        if config:
            payload.update(config)

        response_data = self._request("POST", "/redact", json=payload)

        try:
            return RedactResponse(**response_data)
        except ValidationError as e:
            raise APIError(
                f"Invalid response format: {str(e)}", 200, response_data
            ) from e

    def mask(
        self,
        text: str,
        chars_to_show: int = 3,
        from_end: bool = False,
        masking_char: str = "*",
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> MaskResponse:
        """
        Mask (partially hide) sensitive information from text.

        Shows only a specified number of characters and masks the rest.

        Args:
            text: Text to mask
            chars_to_show: Number of characters to show (default: 3)
            from_end: Show characters from the end instead of start (default: False)
            masking_char: Character(s) to use for masking (default: "*")
            entities: Optional list of entities to detect
            score_threshold: Optional minimum confidence score (0.0-1.0)
            policy: Optional policy name to use (e.g., 'gdpr_eu', 'hipaa_us', 'basic')
            config: Optional additional configuration parameters

        Returns:
            MaskResponse with masked text and detected entities

        Raises:
            AuthenticationError: If authentication fails
            APIError: If API request fails
            NetworkError: If network request fails
        """
        payload: Dict[str, Any] = {
            "text": text,
            "chars_to_show": chars_to_show,
            "from_end": from_end,
            "masking_char": masking_char,
        }
        if entities is not None:
            payload["entities"] = entities
        if score_threshold is not None:
            payload["score_threshold"] = score_threshold
        if policy is not None:
            payload["policy"] = policy
        if config:
            payload.update(config)

        response_data = self._request("POST", "/mask", json=payload)

        try:
            return MaskResponse(**response_data)
        except ValidationError as e:
            raise APIError(
                f"Invalid response format: {str(e)}", 200, response_data
            ) from e

    def synthesize(
        self,
        text: str,
        language: str = "en",
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> SynthesizeResponse:
        """
        Synthesize (replace real data with synthetic fake data).

        Replaces real sensitive data with realistic fake data using Faker library.
        This is useful for data science, demos, and testing.

        Args:
            text: Text to synthesize
            language: Language code for synthetic data generation (default: "en")
            entities: Optional list of entities to detect
            score_threshold: Optional minimum confidence score (0.0-1.0)
            policy: Optional policy name to use (e.g., 'gdpr_eu', 'hipaa_us', 'basic')
            config: Optional additional configuration parameters

        Returns:
            SynthesizeResponse with synthetic text and detected entities

        Raises:
            AuthenticationError: If authentication fails
            APIError: If API request fails
            NetworkError: If network request fails
        """
        payload: Dict[str, Any] = {"text": text, "language": language}
        if entities is not None:
            payload["entities"] = entities
        if score_threshold is not None:
            payload["score_threshold"] = score_threshold
        if policy is not None:
            payload["policy"] = policy
        if config:
            payload.update(config)

        response_data = self._request("POST", "/synthesize", json=payload)

        try:
            return SynthesizeResponse(**response_data)
        except ValidationError as e:
            raise APIError(
                f"Invalid response format: {str(e)}", 200, response_data
            ) from e

    def hash(
        self,
        text: str,
        hash_type: str = "sha256",
        hash_prefix: str = "HASH_",
        hash_length: int = 16,
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> HashResponse:
        """
        Hash (replace with deterministic hash values).

        Replaces sensitive data with deterministic hash values. Same input always
        produces the same hash, useful for tracking/matching without revealing original data.

        Args:
            text: Text to hash
            hash_type: Hash algorithm to use (default: "sha256")
            hash_prefix: Prefix to add before hash value (default: "HASH_")
            hash_length: Length of hash to display (default: 16)
            entities: Optional list of entities to detect
            score_threshold: Optional minimum confidence score (0.0-1.0)
            policy: Optional policy name to use (e.g., 'gdpr_eu', 'hipaa_us', 'basic')
            config: Optional additional configuration parameters

        Returns:
            HashResponse with hashed text and detected entities

        Raises:
            AuthenticationError: If authentication fails
            APIError: If API request fails
            NetworkError: If network request fails
        """
        payload: Dict[str, Any] = {
            "text": text,
            "hash_type": hash_type,
            "hash_prefix": hash_prefix,
            "hash_length": hash_length,
        }
        if entities is not None:
            payload["entities"] = entities
        if score_threshold is not None:
            payload["score_threshold"] = score_threshold
        if policy is not None:
            payload["policy"] = policy
        if config:
            payload.update(config)

        response_data = self._request("POST", "/hash", json=payload)

        try:
            return HashResponse(**response_data)
        except ValidationError as e:
            raise APIError(
                f"Invalid response format: {str(e)}", 200, response_data
            ) from e

    def encrypt(
        self,
        text: str,
        encryption_key: Optional[str] = None,
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> EncryptResponse:
        """
        Encrypt (reversibly protect) sensitive data in text using AES encryption.

        Replaces sensitive data with encrypted values that can be decrypted
        using the same key. Useful for secure storage and transmission.

        Args:
            text: Text to encrypt
            encryption_key: Optional encryption key (if not provided, tenant key will be used)
            entities: Optional list of entities to detect
            score_threshold: Optional minimum confidence score (0.0-1.0)
            policy: Optional policy name to use (e.g., 'gdpr_eu', 'hipaa_us', 'basic')
            config: Optional additional configuration parameters

        Returns:
            EncryptResponse with encrypted text and detected entities

        Raises:
            AuthenticationError: If authentication fails
            APIError: If API request fails
            NetworkError: If network request fails
        """
        payload: Dict[str, Any] = {"text": text}
        if encryption_key:
            payload["encryption_key"] = encryption_key
        if entities is not None:
            payload["entities"] = entities
        if score_threshold is not None:
            payload["score_threshold"] = score_threshold
        if policy is not None:
            payload["policy"] = policy
        if config:
            payload.update(config)

        response_data = self._request("POST", "/encrypt", json=payload)

        try:
            return EncryptResponse(**response_data)
        except ValidationError as e:
            raise APIError(
                f"Invalid response format: {str(e)}", 200, response_data
            ) from e

    # ===== Batch methods =====

    def _batch_request(
        self,
        endpoint: str,
        texts: List[str],
        extra: Optional[Dict[str, Any]] = None,
    ) -> BatchResponse:
        """Send a batch request and return BatchResponse."""
        payload: Dict[str, Any] = {"texts": texts}
        if extra:
            payload.update(extra)
        response_data = self._request("POST", endpoint, json=payload)
        try:
            return BatchResponse(**response_data)
        except ValidationError as e:
            raise APIError(
                f"Invalid response format: {str(e)}", 200, response_data
            ) from e

    def tokenize_batch(
        self,
        texts: List[str],
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
    ) -> BatchResponse:
        """Tokenize multiple texts in a single request."""
        extra: Dict[str, Any] = {}
        if entities is not None:
            extra["entities"] = entities
        if score_threshold is not None:
            extra["score_threshold"] = score_threshold
        if policy is not None:
            extra["policy"] = policy
        return self._batch_request("/tokenize", texts, extra or None)

    def detect_batch(
        self,
        texts: List[str],
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
    ) -> BatchResponse:
        """Detect PII in multiple texts in a single request."""
        extra: Dict[str, Any] = {}
        if entities is not None:
            extra["entities"] = entities
        if score_threshold is not None:
            extra["score_threshold"] = score_threshold
        if policy is not None:
            extra["policy"] = policy
        return self._batch_request("/detect", texts, extra or None)

    def redact_batch(
        self,
        texts: List[str],
        masking_char: str = "*",
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
    ) -> BatchResponse:
        """Redact PII from multiple texts in a single request."""
        extra: Dict[str, Any] = {"masking_char": masking_char}
        if entities is not None:
            extra["entities"] = entities
        if score_threshold is not None:
            extra["score_threshold"] = score_threshold
        if policy is not None:
            extra["policy"] = policy
        return self._batch_request("/redact", texts, extra)

    def mask_batch(
        self,
        texts: List[str],
        chars_to_show: int = 3,
        from_end: bool = False,
        masking_char: str = "*",
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
    ) -> BatchResponse:
        """Mask PII in multiple texts in a single request."""
        extra: Dict[str, Any] = {
            "chars_to_show": chars_to_show,
            "from_end": from_end,
            "masking_char": masking_char,
        }
        if entities is not None:
            extra["entities"] = entities
        if score_threshold is not None:
            extra["score_threshold"] = score_threshold
        if policy is not None:
            extra["policy"] = policy
        return self._batch_request("/mask", texts, extra)

    def synthesize_batch(
        self,
        texts: List[str],
        language: str = "en",
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
    ) -> BatchResponse:
        """Synthesize multiple texts in a single request."""
        extra: Dict[str, Any] = {"language": language}
        if entities is not None:
            extra["entities"] = entities
        if score_threshold is not None:
            extra["score_threshold"] = score_threshold
        if policy is not None:
            extra["policy"] = policy
        return self._batch_request("/synthesize", texts, extra)

    def hash_batch(
        self,
        texts: List[str],
        hash_type: str = "sha256",
        hash_prefix: str = "HASH_",
        hash_length: int = 16,
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
    ) -> BatchResponse:
        """Hash PII in multiple texts in a single request."""
        extra: Dict[str, Any] = {
            "hash_type": hash_type,
            "hash_prefix": hash_prefix,
            "hash_length": hash_length,
        }
        if entities is not None:
            extra["entities"] = entities
        if score_threshold is not None:
            extra["score_threshold"] = score_threshold
        if policy is not None:
            extra["policy"] = policy
        return self._batch_request("/hash", texts, extra)

    def encrypt_batch(
        self,
        texts: List[str],
        encryption_key: Optional[str] = None,
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
    ) -> BatchResponse:
        """Encrypt PII in multiple texts in a single request."""
        extra: Dict[str, Any] = {}
        if encryption_key:
            extra["encryption_key"] = encryption_key
        if entities is not None:
            extra["entities"] = entities
        if score_threshold is not None:
            extra["score_threshold"] = score_threshold
        if policy is not None:
            extra["policy"] = policy
        return self._batch_request("/encrypt", texts, extra or None)


class AsyncBlindfold:
    """
    Async Blindfold client for tokenization and detokenization operations.

    This client supports asynchronous operations using httpx.AsyncClient.
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = 30.0,
        user_id: Optional[str] = None,
        max_retries: int = 2,
        retry_delay: float = 0.5,
    ) -> None:
        """
        Initialize async Blindfold client.

        Args:
            api_key: API key for authentication
            base_url: Base URL for the API (default: https://api.blindfold.dev/api/public/v1)
            timeout: Request timeout in seconds (default: 30.0)
            user_id: Optional user ID to track who is making the request
            max_retries: Maximum number of retries on transient errors (default: 2, 0 to disable)
            retry_delay: Initial delay in seconds before first retry (default: 0.5)
        """
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.user_id = user_id
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def client(self) -> httpx.AsyncClient:
        """Get or create async httpx client"""
        if self._client is None:
            headers = {"X-API-Key": self.api_key}
            if self.user_id:
                headers["X-Blindfold-User-Id"] = self.user_id

            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                timeout=self.timeout,
                headers=headers,
            )
        return self._client

    async def close(self) -> None:
        """Close the HTTP client"""
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    async def __aenter__(self) -> "AsyncBlindfold":
        """Async context manager entry"""
        return self

    async def __aexit__(self, *args: Any) -> None:
        """Async context manager exit"""
        await self.close()

    def _handle_response(self, response: httpx.Response) -> Dict[str, Any]:
        """Handle HTTP response and raise appropriate exceptions"""
        # Handle authentication errors
        if response.status_code in (401, 403):
            raise AuthenticationError(
                "Authentication failed. Please check your API key."
            )

        # Handle other error responses
        if not response.is_success:
            error_message = f"API request failed with status {response.status_code}"
            response_body = None

            try:
                response_body = response.json()
                error_data = APIErrorResponse(**response_body)
                error_message = error_data.detail or error_data.message or error_message
            except Exception:
                # If we can't parse the error response, use the status text
                error_message = f"{error_message}: {response.text}"

            raise APIError(error_message, response.status_code, response_body)

        try:
            result: Dict[str, Any] = response.json()
            return result
        except Exception as e:
            raise APIError(
                f"Failed to parse response: {str(e)}",
                response.status_code,
                response.text,
            ) from e

    async def _request(
        self,
        method: str,
        endpoint: str,
        json: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Make an asynchronous HTTP request with retry logic"""
        last_exception: Exception = NetworkError("Request failed")

        for attempt in range(self.max_retries + 1):
            try:
                response = await self.client.request(
                    method=method,
                    url=endpoint,
                    json=json,
                )
                return self._handle_response(response)
            except NetworkError as e:
                last_exception = e
                if attempt < self.max_retries:
                    await asyncio.sleep(self._retry_wait(attempt))
                    continue
                raise
            except APIError as e:
                last_exception = e
                if e.status_code in RETRYABLE_STATUS_CODES and attempt < self.max_retries:
                    wait = self._retry_wait(attempt, e)
                    await asyncio.sleep(wait)
                    continue
                raise
            except AuthenticationError:
                raise
            except (httpx.ConnectError, httpx.TimeoutException) as e:
                last_exception = NetworkError(
                    f"Network request failed. Please check your connection and the API URL: {str(e)}"
                )
                last_exception.__cause__ = e
                if attempt < self.max_retries:
                    await asyncio.sleep(self._retry_wait(attempt))
                    continue
                raise last_exception from e
            except Exception as e:
                raise NetworkError(f"Unexpected error: {str(e)}") from e

        raise last_exception

    def _retry_wait(self, attempt: int, error: Optional[APIError] = None) -> float:
        """Calculate retry wait time with exponential backoff and jitter."""
        if error and isinstance(error, APIError) and error.status_code == 429:
            if error.response_body and isinstance(error.response_body, dict):
                retry_after = error.response_body.get("retry_after")
                if retry_after is not None:
                    return float(retry_after)
        delay = self.retry_delay * (2 ** attempt)
        jitter = delay * 0.1 * random.random()
        return delay + jitter

    async def tokenize(
        self,
        text: str,
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> TokenizeResponse:
        """
        Tokenize text by replacing sensitive information with tokens.

        Args:
            text: Text to tokenize
            entities: Optional list of entities to detect
            score_threshold: Optional minimum confidence score (0.0-1.0)
            policy: Optional policy name to use (e.g., 'gdpr_eu', 'hipaa_us', 'basic')
            config: Optional additional configuration parameters

        Returns:
            TokenizeResponse with tokenized text and mapping

        Raises:
            AuthenticationError: If authentication fails
            APIError: If API request fails
            NetworkError: If network request fails
        """
        payload: Dict[str, Any] = {"text": text}
        if entities is not None:
            payload["entities"] = entities
        if score_threshold is not None:
            payload["score_threshold"] = score_threshold
        if policy is not None:
            payload["policy"] = policy
        if config:
            payload.update(config)

        response_data = await self._request("POST", "/tokenize", json=payload)

        try:
            return TokenizeResponse(**response_data)
        except ValidationError as e:
            raise APIError(
                f"Invalid response format: {str(e)}", 200, response_data
            ) from e

    async def detect(
        self,
        text: str,
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> DetectResponse:
        """
        Detect PII in text without modifying it.

        Returns only the detected entities with their types, positions,
        and confidence scores. The original text is not transformed.

        Args:
            text: Text to analyze for PII
            entities: Optional list of entities to detect
            score_threshold: Optional minimum confidence score (0.0-1.0)
            policy: Optional policy name to use (e.g., 'gdpr_eu', 'hipaa_us', 'basic')
            config: Optional additional configuration parameters

        Returns:
            DetectResponse with detected entities

        Raises:
            AuthenticationError: If authentication fails
            APIError: If API request fails
            NetworkError: If network request fails
        """
        payload: Dict[str, Any] = {"text": text}
        if entities is not None:
            payload["entities"] = entities
        if score_threshold is not None:
            payload["score_threshold"] = score_threshold
        if policy is not None:
            payload["policy"] = policy
        if config:
            payload.update(config)

        response_data = await self._request("POST", "/detect", json=payload)

        try:
            return DetectResponse(**response_data)
        except ValidationError as e:
            raise APIError(
                f"Invalid response format: {str(e)}", 200, response_data
            ) from e

    async def detokenize(
        self,
        text: str,
        mapping: Dict[str, str],
    ) -> DetokenizeResponse:
        """
        Detokenize text by replacing tokens with original values.

        This method performs detokenization CLIENT-SIDE for better performance,
        security, and to work offline. No API call is made.

        Args:
            text: Tokenized text
            mapping: Token mapping from tokenize response

        Returns:
            DetokenizeResponse with original text
        """
        result_text = text
        replacements_made = 0

        # Sort tokens by length (longest first) to avoid partial replacements
        sorted_tokens = sorted(mapping.keys(), key=len, reverse=True)

        for token in sorted_tokens:
            original_value = mapping[token]
            # Count occurrences
            count = result_text.count(token)
            if count > 0:
                result_text = result_text.replace(token, original_value)
                replacements_made += count

        return DetokenizeResponse(text=result_text, replacements_made=replacements_made)

    async def redact(
        self,
        text: str,
        masking_char: str = "*",
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> RedactResponse:
        """
        Redact (permanently remove) sensitive information from text.

        WARNING: Redaction is irreversible - original data cannot be restored!

        Args:
            text: Text to redact
            masking_char: Character(s) to use for masking (default: "*")
            entities: Optional list of entities to detect
            score_threshold: Optional minimum confidence score (0.0-1.0)
            policy: Optional policy name to use (e.g., 'gdpr_eu', 'hipaa_us', 'basic')
            config: Optional additional configuration parameters

        Returns:
            RedactResponse with redacted text and detected entities

        Raises:
            AuthenticationError: If authentication fails
            APIError: If API request fails
            NetworkError: If network request fails
        """
        payload: Dict[str, Any] = {"text": text, "masking_char": masking_char}
        if entities is not None:
            payload["entities"] = entities
        if score_threshold is not None:
            payload["score_threshold"] = score_threshold
        if policy is not None:
            payload["policy"] = policy
        if config:
            payload.update(config)

        response_data = await self._request("POST", "/redact", json=payload)

        try:
            return RedactResponse(**response_data)
        except ValidationError as e:
            raise APIError(
                f"Invalid response format: {str(e)}", 200, response_data
            ) from e

    async def mask(
        self,
        text: str,
        chars_to_show: int = 3,
        from_end: bool = False,
        masking_char: str = "*",
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> MaskResponse:
        """
        Mask (partially hide) sensitive information from text.

        Shows only a specified number of characters and masks the rest.

        Args:
            text: Text to mask
            chars_to_show: Number of characters to show (default: 3)
            from_end: Show characters from the end instead of start (default: False)
            masking_char: Character(s) to use for masking (default: "*")
            entities: Optional list of entities to detect
            score_threshold: Optional minimum confidence score (0.0-1.0)
            policy: Optional policy name to use (e.g., 'gdpr_eu', 'hipaa_us', 'basic')
            config: Optional additional configuration parameters

        Returns:
            MaskResponse with masked text and detected entities

        Raises:
            AuthenticationError: If authentication fails
            APIError: If API request fails
            NetworkError: If network request fails
        """
        payload: Dict[str, Any] = {
            "text": text,
            "chars_to_show": chars_to_show,
            "from_end": from_end,
            "masking_char": masking_char,
        }
        if entities is not None:
            payload["entities"] = entities
        if score_threshold is not None:
            payload["score_threshold"] = score_threshold
        if policy is not None:
            payload["policy"] = policy
        if config:
            payload.update(config)

        response_data = await self._request("POST", "/mask", json=payload)

        try:
            return MaskResponse(**response_data)
        except ValidationError as e:
            raise APIError(
                f"Invalid response format: {str(e)}", 200, response_data
            ) from e

    async def synthesize(
        self,
        text: str,
        language: str = "en",
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> SynthesizeResponse:
        """
        Synthesize (replace real data with synthetic fake data).

        Replaces real sensitive data with realistic fake data using Faker library.
        This is useful for data science, demos, and testing.

        Args:
            text: Text to synthesize
            language: Language code for synthetic data generation (default: "en")
            entities: Optional list of entities to detect
            score_threshold: Optional minimum confidence score (0.0-1.0)
            policy: Optional policy name to use (e.g., 'gdpr_eu', 'hipaa_us', 'basic')
            config: Optional additional configuration parameters

        Returns:
            SynthesizeResponse with synthetic text and detected entities

        Raises:
            AuthenticationError: If authentication fails
            APIError: If API request fails
            NetworkError: If network request fails
        """
        payload: Dict[str, Any] = {"text": text, "language": language}
        if entities is not None:
            payload["entities"] = entities
        if score_threshold is not None:
            payload["score_threshold"] = score_threshold
        if policy is not None:
            payload["policy"] = policy
        if config:
            payload.update(config)

        response_data = await self._request("POST", "/synthesize", json=payload)

        try:
            return SynthesizeResponse(**response_data)
        except ValidationError as e:
            raise APIError(
                f"Invalid response format: {str(e)}", 200, response_data
            ) from e

    async def hash(
        self,
        text: str,
        hash_type: str = "sha256",
        hash_prefix: str = "HASH_",
        hash_length: int = 16,
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> HashResponse:
        """
        Hash (replace with deterministic hash values).

        Replaces sensitive data with deterministic hash values. Same input always
        produces the same hash, useful for tracking/matching without revealing original data.

        Args:
            text: Text to hash
            hash_type: Hash algorithm to use (default: "sha256")
            hash_prefix: Prefix to add before hash value (default: "HASH_")
            hash_length: Length of hash to display (default: 16)
            entities: Optional list of entities to detect
            score_threshold: Optional minimum confidence score (0.0-1.0)
            policy: Optional policy name to use (e.g., 'gdpr_eu', 'hipaa_us', 'basic')
            config: Optional additional configuration parameters

        Returns:
            HashResponse with hashed text and detected entities

        Raises:
            AuthenticationError: If authentication fails
            APIError: If API request fails
            NetworkError: If network request fails
        """
        payload: Dict[str, Any] = {
            "text": text,
            "hash_type": hash_type,
            "hash_prefix": hash_prefix,
            "hash_length": hash_length,
        }
        if entities is not None:
            payload["entities"] = entities
        if score_threshold is not None:
            payload["score_threshold"] = score_threshold
        if policy is not None:
            payload["policy"] = policy
        if config:
            payload.update(config)

        response_data = await self._request("POST", "/hash", json=payload)

        try:
            return HashResponse(**response_data)
        except ValidationError as e:
            raise APIError(
                f"Invalid response format: {str(e)}", 200, response_data
            ) from e

    async def encrypt(
        self,
        text: str,
        encryption_key: Optional[str] = None,
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> EncryptResponse:
        """
        Encrypt (reversibly protect) sensitive data in text using AES encryption.

        Replaces sensitive data with encrypted values that can be decrypted
        using the same key. Useful for secure storage and transmission.

        Args:
            text: Text to encrypt
            encryption_key: Optional encryption key (if not provided, tenant key will be used)
            entities: Optional list of entities to detect
            score_threshold: Optional minimum confidence score (0.0-1.0)
            policy: Optional policy name to use (e.g., 'gdpr_eu', 'hipaa_us', 'basic')
            config: Optional additional configuration parameters

        Returns:
            EncryptResponse with encrypted text and detected entities

        Raises:
            AuthenticationError: If authentication fails
            APIError: If API request fails
            NetworkError: If network request fails
        """
        payload: Dict[str, Any] = {"text": text}
        if encryption_key:
            payload["encryption_key"] = encryption_key
        if entities is not None:
            payload["entities"] = entities
        if score_threshold is not None:
            payload["score_threshold"] = score_threshold
        if policy is not None:
            payload["policy"] = policy
        if config:
            payload.update(config)

        response_data = await self._request("POST", "/encrypt", json=payload)

        try:
            return EncryptResponse(**response_data)
        except ValidationError as e:
            raise APIError(
                f"Invalid response format: {str(e)}", 200, response_data
            ) from e

    # ===== Batch methods =====

    async def _batch_request(
        self,
        endpoint: str,
        texts: List[str],
        extra: Optional[Dict[str, Any]] = None,
    ) -> BatchResponse:
        """Send a batch request and return BatchResponse."""
        payload: Dict[str, Any] = {"texts": texts}
        if extra:
            payload.update(extra)
        response_data = await self._request("POST", endpoint, json=payload)
        try:
            return BatchResponse(**response_data)
        except ValidationError as e:
            raise APIError(
                f"Invalid response format: {str(e)}", 200, response_data
            ) from e

    async def tokenize_batch(
        self,
        texts: List[str],
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
    ) -> BatchResponse:
        """Tokenize multiple texts in a single request."""
        extra: Dict[str, Any] = {}
        if entities is not None:
            extra["entities"] = entities
        if score_threshold is not None:
            extra["score_threshold"] = score_threshold
        if policy is not None:
            extra["policy"] = policy
        return await self._batch_request("/tokenize", texts, extra or None)

    async def detect_batch(
        self,
        texts: List[str],
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
    ) -> BatchResponse:
        """Detect PII in multiple texts in a single request."""
        extra: Dict[str, Any] = {}
        if entities is not None:
            extra["entities"] = entities
        if score_threshold is not None:
            extra["score_threshold"] = score_threshold
        if policy is not None:
            extra["policy"] = policy
        return await self._batch_request("/detect", texts, extra or None)

    async def redact_batch(
        self,
        texts: List[str],
        masking_char: str = "*",
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
    ) -> BatchResponse:
        """Redact PII from multiple texts in a single request."""
        extra: Dict[str, Any] = {"masking_char": masking_char}
        if entities is not None:
            extra["entities"] = entities
        if score_threshold is not None:
            extra["score_threshold"] = score_threshold
        if policy is not None:
            extra["policy"] = policy
        return await self._batch_request("/redact", texts, extra)

    async def mask_batch(
        self,
        texts: List[str],
        chars_to_show: int = 3,
        from_end: bool = False,
        masking_char: str = "*",
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
    ) -> BatchResponse:
        """Mask PII in multiple texts in a single request."""
        extra: Dict[str, Any] = {
            "chars_to_show": chars_to_show,
            "from_end": from_end,
            "masking_char": masking_char,
        }
        if entities is not None:
            extra["entities"] = entities
        if score_threshold is not None:
            extra["score_threshold"] = score_threshold
        if policy is not None:
            extra["policy"] = policy
        return await self._batch_request("/mask", texts, extra)

    async def synthesize_batch(
        self,
        texts: List[str],
        language: str = "en",
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
    ) -> BatchResponse:
        """Synthesize multiple texts in a single request."""
        extra: Dict[str, Any] = {"language": language}
        if entities is not None:
            extra["entities"] = entities
        if score_threshold is not None:
            extra["score_threshold"] = score_threshold
        if policy is not None:
            extra["policy"] = policy
        return await self._batch_request("/synthesize", texts, extra)

    async def hash_batch(
        self,
        texts: List[str],
        hash_type: str = "sha256",
        hash_prefix: str = "HASH_",
        hash_length: int = 16,
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
    ) -> BatchResponse:
        """Hash PII in multiple texts in a single request."""
        extra: Dict[str, Any] = {
            "hash_type": hash_type,
            "hash_prefix": hash_prefix,
            "hash_length": hash_length,
        }
        if entities is not None:
            extra["entities"] = entities
        if score_threshold is not None:
            extra["score_threshold"] = score_threshold
        if policy is not None:
            extra["policy"] = policy
        return await self._batch_request("/hash", texts, extra)

    async def encrypt_batch(
        self,
        texts: List[str],
        encryption_key: Optional[str] = None,
        entities: Optional[List[str]] = None,
        score_threshold: Optional[float] = None,
        policy: Optional[str] = None,
    ) -> BatchResponse:
        """Encrypt PII in multiple texts in a single request."""
        extra: Dict[str, Any] = {}
        if encryption_key:
            extra["encryption_key"] = encryption_key
        if entities is not None:
            extra["entities"] = entities
        if score_threshold is not None:
            extra["score_threshold"] = score_threshold
        if policy is not None:
            extra["policy"] = policy
        return await self._batch_request("/encrypt", texts, extra or None)
