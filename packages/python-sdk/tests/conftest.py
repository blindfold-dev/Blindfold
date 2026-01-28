"""Shared fixtures and helpers for tests"""

import sys
from pathlib import Path
from unittest.mock import MagicMock

# Add src directory to Python path BEFORE any blindfold imports
src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))

import httpx
import pytest

from blindfold import AsyncBlindfold, Blindfold

SAMPLE_ENTITY = {
    "entity_type": "person",
    "text": "John Doe",
    "start": 0,
    "end": 8,
    "score": 0.95,
}


def make_response(status_code: int = 200, json_data: dict = None, text: str = ""):
    """Create a mock httpx.Response"""
    resp = MagicMock(spec=httpx.Response)
    resp.status_code = status_code
    resp.is_success = 200 <= status_code < 300
    resp.json.return_value = json_data or {}
    resp.text = text or ""
    return resp


@pytest.fixture
def client():
    return Blindfold(api_key="test-key")


@pytest.fixture
def async_client():
    return AsyncBlindfold(api_key="test-key")
