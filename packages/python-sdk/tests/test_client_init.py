"""Tests for client initialization"""

from blindfold import AsyncBlindfold, Blindfold


class TestClientInit:
    def test_default_config(self, client):
        assert client.api_key == "test-key"
        assert client.base_url == "https://api.blindfold.dev/api/public/v1"
        assert client.timeout == 30.0
        assert client.user_id is None

    def test_custom_config(self):
        c = Blindfold(
            api_key="test-key",
            base_url="https://custom.api.dev/v1",
            timeout=60.0,
            user_id="user-123",
        )
        assert c.base_url == "https://custom.api.dev/v1"
        assert c.timeout == 60.0
        assert c.user_id == "user-123"

    def test_trailing_slash_stripped(self):
        c = Blindfold(api_key="k", base_url="https://api.dev/v1/")
        assert c.base_url == "https://api.dev/v1"

    def test_context_manager(self):
        with Blindfold(api_key="k") as c:
            assert c is not None

    def test_client_creates_httpx_client(self, client):
        assert client.client is not None

    def test_close(self, client):
        _ = client.client
        client.close()
        assert client._client is None


class TestAsyncClientInit:
    def test_default_config(self, async_client):
        assert async_client.api_key == "test-key"
        assert async_client.base_url == "https://api.blindfold.dev/api/public/v1"
        assert async_client.timeout == 30.0
        assert async_client.user_id is None

    def test_custom_config(self):
        c = AsyncBlindfold(
            api_key="test-key",
            base_url="https://custom.api.dev/v1",
            timeout=60.0,
            user_id="user-456",
        )
        assert c.user_id == "user-456"
        assert c.timeout == 60.0
