"""Exception classes for Blindfold SDK"""

from typing import Any, Optional


class BlindfoldError(Exception):
    """Base exception class for Blindfold SDK"""

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class AuthenticationError(BlindfoldError):
    """Raised when authentication fails"""

    def __init__(
        self, message: str = "Authentication failed. Please check your API key."
    ) -> None:
        super().__init__(message)


class APIError(BlindfoldError):
    """Raised when API request fails"""

    def __init__(
        self, message: str, status_code: int, response_body: Optional[Any] = None
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.response_body = response_body


class NetworkError(BlindfoldError):
    """Raised when network request fails"""

    def __init__(
        self, message: str = "Network request failed. Please check your connection."
    ) -> None:
        super().__init__(message)
