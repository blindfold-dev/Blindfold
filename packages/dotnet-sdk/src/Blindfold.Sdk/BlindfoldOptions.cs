namespace Blindfold.Sdk;

public class BlindfoldOptions
{
    public string? ApiKey { get; init; }
    public string Region { get; init; } = "eu";
    public string? BaseUrl { get; init; }
    public string? Mode { get; init; }
    public string[]? Locales { get; init; }
    public int MaxRetries { get; init; } = 2;
    public TimeSpan RetryDelay { get; init; } = TimeSpan.FromMilliseconds(500);
    public TimeSpan Timeout { get; init; } = TimeSpan.FromSeconds(30);
    public string? UserId { get; init; }
    public string? Policy { get; init; }
    public string? PoliciesFile { get; init; }
    public HttpClient? HttpClient { get; init; }
}
