"""Tests for region support in client initialization"""

import pytest

from blindfold import AsyncBlindfold, Blindfold
from blindfold.client import DEFAULT_BASE_URL, REGION_URLS


class TestRegionSync:
    def test_default_base_url_when_no_region(self):
        c = Blindfold(api_key="k")
        assert c.base_url == DEFAULT_BASE_URL
        assert c.region is None

    def test_eu_region_resolves_to_eu_url(self):
        c = Blindfold(api_key="k", region="eu")
        assert c.base_url == REGION_URLS["eu"]
        assert "eu-api" in c.base_url
        assert c.region == "eu"

    def test_us_region_resolves_to_us_url(self):
        c = Blindfold(api_key="k", region="us")
        assert c.base_url == REGION_URLS["us"]
        assert "us-api" in c.base_url
        assert c.region == "us"

    def test_region_is_case_insensitive(self):
        c = Blindfold(api_key="k", region="EU")
        assert c.base_url == REGION_URLS["eu"]

    def test_invalid_region_raises_value_error(self):
        with pytest.raises(ValueError, match="Invalid region"):
            Blindfold(api_key="k", region="ap")

    def test_explicit_base_url_overrides_region(self):
        custom = "https://custom.api.dev/v1"
        c = Blindfold(api_key="k", base_url=custom, region="us")
        assert c.base_url == custom

    def test_region_ignored_when_base_url_is_custom(self):
        custom = "https://my.server.dev/api"
        c = Blindfold(api_key="k", base_url=custom, region="eu")
        assert c.base_url == custom


class TestRegionAsync:
    def test_default_base_url_when_no_region(self):
        c = AsyncBlindfold(api_key="k")
        assert c.base_url == DEFAULT_BASE_URL
        assert c.region is None

    def test_eu_region_resolves_to_eu_url(self):
        c = AsyncBlindfold(api_key="k", region="eu")
        assert c.base_url == REGION_URLS["eu"]

    def test_us_region_resolves_to_us_url(self):
        c = AsyncBlindfold(api_key="k", region="us")
        assert c.base_url == REGION_URLS["us"]

    def test_region_is_case_insensitive(self):
        c = AsyncBlindfold(api_key="k", region="US")
        assert c.base_url == REGION_URLS["us"]

    def test_invalid_region_raises_value_error(self):
        with pytest.raises(ValueError, match="Invalid region"):
            AsyncBlindfold(api_key="k", region="asia")

    def test_explicit_base_url_overrides_region(self):
        custom = "https://custom.api.dev/v1"
        c = AsyncBlindfold(api_key="k", base_url=custom, region="us")
        assert c.base_url == custom
