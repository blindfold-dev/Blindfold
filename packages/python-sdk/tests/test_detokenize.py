"""Tests for client-side detokenization"""

import pytest

from blindfold import Blindfold


@pytest.fixture
def client():
    """Create a Blindfold client for testing"""
    return Blindfold(api_key="test-key")


def test_detokenize_simple_text(client):
    """Test detokenizing simple text with single token"""
    text = "<Person_1> called yesterday"
    mapping = {"<Person_1>": "John Doe"}

    result = client.detokenize(text, mapping)

    assert result.text == "John Doe called yesterday"
    assert result.replacements_made == 1


def test_detokenize_multiple_tokens(client):
    """Test detokenizing text with multiple tokens"""
    text = "<Person_1> called <Person_2> at <Email Address_1>"
    mapping = {
        "<Person_1>": "John",
        "<Person_2>": "Jane",
        "<Email Address_1>": "jane@example.com",
    }

    result = client.detokenize(text, mapping)

    assert result.text == "John called Jane at jane@example.com"
    assert result.replacements_made == 3


def test_detokenize_repeated_tokens(client):
    """Test detokenizing text with repeated tokens"""
    text = "<Person_1> and <Person_1> went to the store"
    mapping = {"<Person_1>": "Alice"}

    result = client.detokenize(text, mapping)

    assert result.text == "Alice and Alice went to the store"
    assert result.replacements_made == 2


def test_detokenize_similar_prefixes(client):
    """Test handling tokens with similar prefixes correctly"""
    # Sort by length to avoid <Person_1> partially matching <Person_10>
    text = "<Person_1> and <Person_10> are friends"
    mapping = {"<Person_1>": "Bob", "<Person_10>": "Charlie"}

    result = client.detokenize(text, mapping)

    assert result.text == "Bob and Charlie are friends"
    assert result.replacements_made == 2


def test_detokenize_empty_text(client):
    """Test detokenizing empty text"""
    text = ""
    mapping = {"<Person_1>": "John"}

    result = client.detokenize(text, mapping)

    assert result.text == ""
    assert result.replacements_made == 0


def test_detokenize_empty_mapping(client):
    """Test detokenizing with empty mapping"""
    text = "<Person_1> called"
    mapping = {}

    result = client.detokenize(text, mapping)

    assert result.text == "<Person_1> called"
    assert result.replacements_made == 0


def test_detokenize_no_tokens_in_text(client):
    """Test detokenizing text without tokens"""
    text = "Hello world"
    mapping = {"<Person_1>": "John"}

    result = client.detokenize(text, mapping)

    assert result.text == "Hello world"
    assert result.replacements_made == 0


def test_detokenize_special_characters(client):
    """Test detokenizing with special characters in original values"""
    text = "Email: <Email Address_1>"
    mapping = {"<Email Address_1>": "user+test@example.com"}

    result = client.detokenize(text, mapping)

    assert result.text == "Email: user+test@example.com"
    assert result.replacements_made == 1


def test_detokenize_is_synchronous(client):
    """Test that detokenize is synchronous (no API call)"""
    text = "<Person_1> test"
    mapping = {"<Person_1>": "Test"}

    # Should return immediately without needing await
    result = client.detokenize(text, mapping)

    assert result is not None
    assert result.text == "Test test"


def test_detokenize_complex_scenario(client):
    """Test detokenizing a complex real-world scenario"""
    text = """
    Patient: <Person_1> (DOB: <Date Of Birth_1>)
    Email: <Email Address_1>
    Phone: <Phone Number_1>

    Doctor: <Person_2>
    Clinic: <Organization_1>
    """

    mapping = {
        "<Person_1>": "Sarah Jenkins",
        "<Date Of Birth_1>": "1985-04-12",
        "<Email Address_1>": "sarah.j@email.com",
        "<Phone Number_1>": "+1-555-0123",
        "<Person_2>": "Dr. Smith",
        "<Organization_1>": "City Medical Center",
    }

    result = client.detokenize(text, mapping)

    assert "Sarah Jenkins" in result.text
    assert "1985-04-12" in result.text
    assert "sarah.j@email.com" in result.text
    assert "+1-555-0123" in result.text
    assert "Dr. Smith" in result.text
    assert "City Medical Center" in result.text
    assert result.replacements_made == 6


def test_detokenize_unicode(client):
    """Test detokenizing with unicode characters"""
    text = "<Person_1> napsal zprávu <Person_2>"
    mapping = {"<Person_1>": "Petr", "<Person_2>": "Jáně"}

    result = client.detokenize(text, mapping)

    assert result.text == "Petr napsal zprávu Jáně"
    assert result.replacements_made == 2
