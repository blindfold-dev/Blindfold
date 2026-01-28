"""Blindfold client for tokenization and detokenization"""

from typing import Any, Dict, List, Optional

import httpx
from pydantic import ValidationError

from .errors import APIError, AuthenticationError, NetworkError
from .models import (
    APIErrorResponse,
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
    ) -> None:
        """
        Initialize Blindfold client.

        Args:
            api_key: API key for authentication
            base_url: Base URL for the API (default: https://api.blindfold.dev/api/public/v1)
            timeout: Request timeout in seconds (default: 30.0)
            user_id: Optional user ID to track who is making the request
        """
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.user_id = user_id
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
        """Make a synchronous HTTP request"""
        try:
            response = self.client.request(
                method=method,
                url=endpoint,
                json=json,
            )
            return self._handle_response(response)
        except (httpx.ConnectError, httpx.TimeoutException) as e:
            raise NetworkError(
                f"Network request failed. Please check your connection and the API URL: {str(e)}"
            ) from e
        except (AuthenticationError, APIError):
            raise
        except Exception as e:
            raise NetworkError(f"Unexpected error: {str(e)}") from e

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
    ) -> None:
        """
        Initialize async Blindfold client.

        Args:
            api_key: API key for authentication
            base_url: Base URL for the API (default: https://api.blindfold.dev/api/public/v1)
            timeout: Request timeout in seconds (default: 30.0)
            user_id: Optional user ID to track who is making the request
        """
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.user_id = user_id
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
        """Make an asynchronous HTTP request"""
        try:
            response = await self.client.request(
                method=method,
                url=endpoint,
                json=json,
            )
            return self._handle_response(response)
        except (httpx.ConnectError, httpx.TimeoutException) as e:
            raise NetworkError(
                f"Network request failed. Please check your connection and the API URL: {str(e)}"
            ) from e
        except (AuthenticationError, APIError):
            raise
        except Exception as e:
            raise NetworkError(f"Unexpected error: {str(e)}") from e

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
