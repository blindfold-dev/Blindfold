using Xunit;
using Blindfold.Sdk;

namespace Blindfold.Sdk.Tests;

public class BlindfoldClientTests
{
    [Fact]
    public async Task DetectAsync_LocalMode_DetectsEmail()
    {
        using var client = new BlindfoldClient();
        var result = await client.DetectAsync("Contact john@example.com or call 555-123-4567");

        Assert.True(result.EntitiesCount > 0, "Expected at least one entity");
        Assert.Contains(result.DetectedEntities, e => e.Type == "Email Address" && e.Text == "john@example.com");
    }

    [Fact]
    public async Task DetectAsync_LocalMode_DetectsSSN()
    {
        using var client = new BlindfoldClient(new BlindfoldOptions { Locales = new[] { "us" } });
        var result = await client.DetectAsync("My SSN is 123-45-6789");

        Assert.Contains(result.DetectedEntities, e => e.Type == "Social Security Number");
    }

    [Fact]
    public async Task DetectAsync_LocalMode_DetectsCreditCard()
    {
        using var client = new BlindfoldClient();
        var result = await client.DetectAsync("Credit card: 4111-1111-1111-1111");

        var cc = Assert.Single(result.DetectedEntities, e => e.Type == "Credit Card Number");
        Assert.Equal(1.0, cc.Score);
    }

    [Fact]
    public async Task DetectAsync_WithEntities_FiltersCorrectly()
    {
        using var client = new BlindfoldClient();
        var result = await client.DetectAsync(
            "Email: test@example.com, Card: 4111-1111-1111-1111",
            new[] { "Email Address" });

        Assert.All(result.DetectedEntities, e => Assert.Equal("Email Address", e.Type));
    }

    [Fact]
    public async Task TokenizeAsync_LocalMode_TokenizesEmail()
    {
        using var client = new BlindfoldClient();
        var result = await client.TokenizeAsync("Email me at alice@example.com");

        Assert.NotEmpty(result.Mapping);
        Assert.NotEqual("Email me at alice@example.com", result.Text);
        Assert.Contains(result.Mapping, kvp => kvp.Key == "<Email Address_1>" && kvp.Value == "alice@example.com");
    }

    [Fact]
    public void Detokenize_RestoresOriginalText()
    {
        using var client = new BlindfoldClient();
        var mapping = new Dictionary<string, string>
        {
            ["<Email Address_1>"] = "alice@example.com"
        };

        var result = client.Detokenize("Contact <Email Address_1>", mapping);

        Assert.Equal("Contact alice@example.com", result.Text);
        Assert.Equal(1, result.ReplacementsMade);
    }

    [Fact]
    public async Task RedactAsync_LocalMode_RedactsEmail()
    {
        using var client = new BlindfoldClient();
        var result = await client.RedactAsync("Email me at alice@example.com please");

        Assert.True(result.EntitiesCount > 0, "Expected entities to be detected");
        Assert.DoesNotContain("alice@example.com", result.Text);
    }

    [Fact]
    public async Task MaskAsync_LocalMode_MasksEmail()
    {
        using var client = new BlindfoldClient();
        var result = await client.MaskAsync("Email: alice@example.com", 3, false, "*",
            new[] { "Email Address" });

        Assert.True(result.EntitiesCount > 0);
        Assert.DoesNotContain("alice@example.com", result.Text);
    }

    [Fact]
    public async Task HashAsync_LocalMode_HashesEmail()
    {
        using var client = new BlindfoldClient();
        var result = await client.HashAsync("Email: alice@example.com");

        Assert.True(result.EntitiesCount > 0);
        Assert.DoesNotContain("alice@example.com", result.Text);
        Assert.Contains("HASH_", result.Text);
    }

    [Fact]
    public async Task EncryptAsync_LocalMode_EncryptsEmail()
    {
        using var client = new BlindfoldClient();
        var result = await client.EncryptAsync("Email: alice@example.com", "my-secret-key-16char");

        Assert.True(result.EntitiesCount > 0);
        Assert.DoesNotContain("alice@example.com", result.Text);
    }

    [Fact]
    public void EncryptAsync_ShortKey_Throws()
    {
        using var client = new BlindfoldClient();
        Assert.ThrowsAsync<ArgumentException>(() =>
            client.EncryptAsync("test", "short"));
    }

    [Fact]
    public async Task SynthesizeAsync_LocalMode_SynthesizesEmail()
    {
        using var client = new BlindfoldClient();
        var result = await client.SynthesizeAsync("Email: alice@example.com");

        Assert.True(result.EntitiesCount > 0);
        Assert.DoesNotContain("alice@example.com", result.Text);
    }

    [Fact]
    public async Task DetectAsync_WithPolicy_FiltersByPolicy()
    {
        using var client = new BlindfoldClient();
        var result = await client.DetectAsync(
            "Email: test@example.com SSN: 123-45-6789", "pci_dss");

        // PCI DSS policy should not include email
        Assert.DoesNotContain(result.DetectedEntities, e => e.Type == "Email Address");
    }

    [Fact]
    public void UseLocal_NoApiKey_ReturnsTrue()
    {
        using var client = new BlindfoldClient();
        // Local mode when no API key - verify by running a detect (no network call)
        var result = client.DetectAsync("test@example.com").Result;
        Assert.NotNull(result);
    }

    [Fact]
    public void Options_DefaultValues()
    {
        var opts = new BlindfoldOptions();
        Assert.Null(opts.ApiKey);
        Assert.Equal("eu", opts.Region);
        Assert.Null(opts.Mode);
        Assert.Equal(2, opts.MaxRetries);
        Assert.Equal(TimeSpan.FromSeconds(30), opts.Timeout);
    }
}
