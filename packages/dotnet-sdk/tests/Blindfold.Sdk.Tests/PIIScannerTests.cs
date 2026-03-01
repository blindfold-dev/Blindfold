using Xunit;
using Blindfold.Sdk.Local;

namespace Blindfold.Sdk.Tests;

public class PIIScannerTests
{
    private readonly PIIScanner _scanner = new(new[] { "us", "eu", "uk" });

    [Fact]
    public void Detect_Email()
    {
        var matches = _scanner.Detect("Contact john@example.com", null);
        Assert.Contains(matches, m => m.EntityType == "Email Address" && m.Text == "john@example.com");
    }

    [Fact]
    public void Detect_CreditCard()
    {
        var matches = _scanner.Detect("Card: 4111-1111-1111-1111", null);
        Assert.Contains(matches, m => m.EntityType == "Credit Card Number");
    }

    [Fact]
    public void Detect_SSN_WithContext()
    {
        var matches = _scanner.Detect("SSN: 123-45-6789", null);
        Assert.Contains(matches, m => m.EntityType == "Social Security Number");
    }

    [Fact]
    public void Detect_URL()
    {
        var matches = _scanner.Detect("Visit https://www.example.com/page", null);
        Assert.Contains(matches, m => m.EntityType == "URL");
    }

    [Fact]
    public void Detect_IP_v4()
    {
        var matches = _scanner.Detect("Server at 192.168.1.100", null);
        Assert.Contains(matches, m => m.EntityType == "IP Address");
    }

    [Fact]
    public void Detect_NoMatches()
    {
        var matches = _scanner.Detect("This is a normal sentence.", null);
        Assert.Empty(matches);
    }

    [Fact]
    public void Detect_WithEntityFilter()
    {
        var entities = new List<string> { "Email Address" };
        var matches = _scanner.Detect("Email: test@example.com Card: 4111-1111-1111-1111", entities);
        Assert.All(matches, m => Assert.Equal("Email Address", m.EntityType));
    }

    [Fact]
    public void Tokenize_ReplacesAndMaps()
    {
        var result = _scanner.Tokenize("Email: test@example.com", null);
        Assert.Contains("<Email Address_1>", result.Text);
        Assert.True(result.Mapping.ContainsKey("<Email Address_1>"));
        Assert.Equal("test@example.com", result.Mapping["<Email Address_1>"]);
    }

    [Fact]
    public void Tokenize_NoMatches_ReturnsOriginal()
    {
        var result = _scanner.Tokenize("Nothing to see here", null);
        Assert.Equal("Nothing to see here", result.Text);
        Assert.Empty(result.Mapping);
    }

    [Fact]
    public void Detokenize_RestoresText()
    {
        var mapping = new Dictionary<string, string>
        {
            ["<Email Address_1>"] = "test@example.com"
        };
        var result = _scanner.Detokenize("Contact <Email Address_1>", mapping);
        Assert.Equal("Contact test@example.com", result);
    }

    [Fact]
    public void Detokenize_NullMapping()
    {
        var result = _scanner.Detokenize("Some text", null);
        Assert.Equal("Some text", result);
    }

    [Fact]
    public void Redact_RemovesEmail()
    {
        var result = _scanner.Redact("Email me at alice@example.com please", null);
        Assert.DoesNotContain("alice@example.com", result.Text);
        Assert.True(result.Matches.Count > 0);
    }

    [Fact]
    public void Mask_ShowsFirstChars()
    {
        var result = _scanner.Mask("Email: test@example.com", 4, false, "*", null);
        Assert.True(result.Matches.Count > 0);
        Assert.DoesNotContain("test@example.com", result.Text);
    }

    [Fact]
    public void Mask_ShowsLastChars()
    {
        var result = _scanner.Mask("Email: test@example.com", 4, true, "*", null);
        Assert.True(result.Matches.Count > 0);
    }

    [Fact]
    public void Hash_ReplacesWithHash()
    {
        var result = _scanner.Hash("Email: alice@example.com", "SHA-256", "HASH_", 16, null);
        Assert.DoesNotContain("alice@example.com", result.Text);
        Assert.Contains("HASH_", result.Text);
    }

    [Fact]
    public void Hash_Deterministic()
    {
        var result1 = _scanner.Hash("Email: alice@example.com", "SHA-256", "HASH_", 16, null);
        var result2 = _scanner.Hash("Email: alice@example.com", "SHA-256", "HASH_", 16, null);
        Assert.Equal(result1.Text, result2.Text);
    }

    [Fact]
    public void Encrypt_ProducesBase64()
    {
        var result = _scanner.Encrypt("Email: alice@example.com", "my-secret-key-16char", null);
        Assert.DoesNotContain("alice@example.com", result.Text);
        Assert.True(result.Matches.Count > 0);
    }

    [Fact]
    public void Encrypt_ShortKey_Throws()
    {
        Assert.Throws<ArgumentException>(() =>
            _scanner.Encrypt("test", "short", null));
    }

    [Fact]
    public void Synthesize_ProducesDifferentText()
    {
        var result = _scanner.Synthesize("Email: alice@example.com", null, null);
        Assert.DoesNotContain("alice@example.com", result.Text);
        Assert.True(result.Matches.Count > 0);
    }

    [Fact]
    public void Detect_IBAN()
    {
        var matches = _scanner.Detect("IBAN: GB29 NWBK 6016 1331 9268 19", null);
        Assert.Contains(matches, m => m.EntityType == "IBAN");
    }

    [Fact]
    public void Detect_UKPostcode()
    {
        var matches = _scanner.Detect("Address: SW1A 1AA", null);
        Assert.Contains(matches, m => m.EntityType == "UK Postcode");
    }

    [Fact]
    public void Detect_MultipleEntities()
    {
        var matches = _scanner.Detect("Email: test@example.com and card 4111-1111-1111-1111", null);
        var types = matches.Select(m => m.EntityType).Distinct().ToList();
        Assert.True(types.Count >= 2, "Expected at least 2 different entity types");
    }
}
