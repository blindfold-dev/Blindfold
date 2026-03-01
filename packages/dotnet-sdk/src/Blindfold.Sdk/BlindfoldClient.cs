using System.Text.Json;
using Blindfold.Sdk.Errors;
using Blindfold.Sdk.Http;
using Blindfold.Sdk.Local;
using Blindfold.Sdk.Models;
using Blindfold.Sdk.Policies;

namespace Blindfold.Sdk;

public class BlindfoldClient : IDisposable
{
    private readonly string? _apiKey;
    private readonly string? _mode;
    private readonly string? _defaultPolicy;
    private readonly BlindfoldHttpClient _httpClient;
    private readonly PIIScanner _scanner;
    private readonly Dictionary<string, PolicyDefinition> _policies;
    private readonly HttpClient? _ownedHttpClient;

    public BlindfoldClient() : this(new BlindfoldOptions()) { }

    public BlindfoldClient(string apiKey) : this(new BlindfoldOptions { ApiKey = apiKey }) { }

    public BlindfoldClient(BlindfoldOptions options)
    {
        _apiKey = options.ApiKey;
        _mode = options.Mode;
        _defaultPolicy = options.Policy;

        var baseUrl = options.BaseUrl;
        if (string.IsNullOrEmpty(baseUrl))
        {
            baseUrl = string.Equals(options.Region, "us", StringComparison.OrdinalIgnoreCase)
                ? "https://us-api.blindfold.dev"
                : "https://eu-api.blindfold.dev";
        }

        HttpClient httpClient;
        if (options.HttpClient != null)
        {
            httpClient = options.HttpClient;
        }
        else
        {
            _ownedHttpClient = new HttpClient { Timeout = options.Timeout };
            httpClient = _ownedHttpClient;
        }

        _httpClient = new BlindfoldHttpClient(
            httpClient, baseUrl, _apiKey, options.UserId,
            options.MaxRetries, options.RetryDelay);

        _scanner = new PIIScanner(options.Locales);
        _policies = PolicyResolver.LoadPolicies(options.PoliciesFile);
    }

    public void Dispose()
    {
        _ownedHttpClient?.Dispose();
        GC.SuppressFinalize(this);
    }

    private bool UseLocal()
    {
        if (string.Equals(_mode, "local", StringComparison.OrdinalIgnoreCase)) return true;
        return string.IsNullOrEmpty(_apiKey);
    }

    private PolicyResolution Resolve(string? policy, string[]? entities)
    {
        return PolicyResolver.Resolve(_policies, _defaultPolicy, policy, entities);
    }

    private static List<DetectedEntity> ToEntities(List<PIIMatch> matches)
    {
        return matches.Select(m => new DetectedEntity
        {
            Type = m.EntityType,
            Text = m.Text,
            Start = m.Start,
            End = m.End,
            Score = m.Score
        }).ToList();
    }

    private static List<PIIMatch> ApplyThreshold(List<PIIMatch> matches, double? threshold)
    {
        if (threshold == null) return matches;
        return matches.Where(m => m.Score >= threshold.Value).ToList();
    }

    private List<string> RedetectEntities(string text, PolicyResolution resolved)
    {
        var allMatches = _scanner.Detect(text, resolved.Entities);
        var qualifying = ApplyThreshold(allMatches, resolved.Threshold);
        var types = qualifying.Select(m => m.EntityType).Distinct().ToList();
        return types.Count == 0 ? new List<string> { "__none__" } : types;
    }

    // ---- Detect ----

    public async Task<DetectResponse> DetectAsync(
        string text, CancellationToken cancellationToken = default)
    {
        return await DetectInternalAsync(text, null, null, cancellationToken).ConfigureAwait(false);
    }

    public async Task<DetectResponse> DetectAsync(
        string text, string[] entities, CancellationToken cancellationToken = default)
    {
        return await DetectInternalAsync(text, null, entities, cancellationToken).ConfigureAwait(false);
    }

    public async Task<DetectResponse> DetectAsync(
        string text, string policy, CancellationToken cancellationToken = default)
    {
        return await DetectInternalAsync(text, policy, null, cancellationToken).ConfigureAwait(false);
    }

    private async Task<DetectResponse> DetectInternalAsync(
        string text, string? policy, string[]? entities, CancellationToken cancellationToken)
    {
        var resolved = Resolve(policy, entities);

        if (UseLocal())
        {
            var matches = _scanner.Detect(text, resolved.Entities);
            matches = ApplyThreshold(matches, resolved.Threshold);
            return new DetectResponse
            {
                DetectedEntities = ToEntities(matches),
                EntitiesCount = matches.Count
            };
        }

        var body = new Dictionary<string, object> { ["text"] = text };
        if (resolved.Entities != null) body["entities"] = resolved.Entities;
        if (resolved.Threshold != null) body["score_threshold"] = resolved.Threshold.Value;

        var json = await _httpClient.PostAsync("/detect", body, cancellationToken).ConfigureAwait(false);
        return JsonSerializer.Deserialize<DetectResponse>(json) ?? new DetectResponse();
    }

    // ---- Tokenize ----

    public async Task<TokenizeResponse> TokenizeAsync(
        string text, CancellationToken cancellationToken = default)
    {
        return await TokenizeInternalAsync(text, null, null, cancellationToken).ConfigureAwait(false);
    }

    public async Task<TokenizeResponse> TokenizeAsync(
        string text, string[] entities, CancellationToken cancellationToken = default)
    {
        return await TokenizeInternalAsync(text, null, entities, cancellationToken).ConfigureAwait(false);
    }

    public async Task<TokenizeResponse> TokenizeAsync(
        string text, string policy, CancellationToken cancellationToken = default)
    {
        return await TokenizeInternalAsync(text, policy, null, cancellationToken).ConfigureAwait(false);
    }

    private async Task<TokenizeResponse> TokenizeInternalAsync(
        string text, string? policy, string[]? entities, CancellationToken cancellationToken)
    {
        var resolved = Resolve(policy, entities);

        if (UseLocal())
        {
            var result = _scanner.Tokenize(text, resolved.Entities);
            if (resolved.Threshold != null)
            {
                var filtered = ApplyThreshold(result.Matches, resolved.Threshold);
                if (filtered.Count < result.Matches.Count)
                {
                    var types = RedetectEntities(text, resolved);
                    result = _scanner.Tokenize(text, types);
                }
            }
            return new TokenizeResponse
            {
                Text = result.Text,
                Mapping = result.Mapping,
                DetectedEntities = ToEntities(result.Matches),
                EntitiesCount = result.Matches.Count
            };
        }

        var body = new Dictionary<string, object> { ["text"] = text };
        if (resolved.Entities != null) body["entities"] = resolved.Entities;
        if (resolved.Threshold != null) body["score_threshold"] = resolved.Threshold.Value;

        var json = await _httpClient.PostAsync("/tokenize", body, cancellationToken).ConfigureAwait(false);
        return JsonSerializer.Deserialize<TokenizeResponse>(json) ?? new TokenizeResponse();
    }

    // ---- Detokenize (client-side only) ----

    public DetokenizeResponse Detokenize(string text, Dictionary<string, string> mapping)
    {
        var result = _scanner.Detokenize(text, mapping);
        return new DetokenizeResponse { Text = result, ReplacementsMade = mapping?.Count ?? 0 };
    }

    // ---- Redact ----

    public async Task<RedactResponse> RedactAsync(
        string text, CancellationToken cancellationToken = default)
    {
        return await RedactInternalAsync(text, null, null, cancellationToken).ConfigureAwait(false);
    }

    public async Task<RedactResponse> RedactAsync(
        string text, string[] entities, CancellationToken cancellationToken = default)
    {
        return await RedactInternalAsync(text, null, entities, cancellationToken).ConfigureAwait(false);
    }

    public async Task<RedactResponse> RedactAsync(
        string text, string policy, CancellationToken cancellationToken = default)
    {
        return await RedactInternalAsync(text, policy, null, cancellationToken).ConfigureAwait(false);
    }

    private async Task<RedactResponse> RedactInternalAsync(
        string text, string? policy, string[]? entities, CancellationToken cancellationToken)
    {
        var resolved = Resolve(policy, entities);

        if (UseLocal())
        {
            var result = _scanner.Redact(text, resolved.Entities);
            if (resolved.Threshold != null)
            {
                var filtered = ApplyThreshold(result.Matches, resolved.Threshold);
                if (filtered.Count < result.Matches.Count)
                {
                    var types = RedetectEntities(text, resolved);
                    result = _scanner.Redact(text, types);
                }
            }
            return new RedactResponse
            {
                Text = result.Text,
                DetectedEntities = ToEntities(result.Matches),
                EntitiesCount = result.Matches.Count
            };
        }

        var body = new Dictionary<string, object> { ["text"] = text };
        if (resolved.Entities != null) body["entities"] = resolved.Entities;
        if (resolved.Threshold != null) body["score_threshold"] = resolved.Threshold.Value;

        var json = await _httpClient.PostAsync("/redact", body, cancellationToken).ConfigureAwait(false);
        return JsonSerializer.Deserialize<RedactResponse>(json) ?? new RedactResponse();
    }

    // ---- Mask ----

    public async Task<MaskResponse> MaskAsync(
        string text, CancellationToken cancellationToken = default)
    {
        return await MaskInternalAsync(text, 3, false, "*", null, null, cancellationToken).ConfigureAwait(false);
    }

    public async Task<MaskResponse> MaskAsync(
        string text, int charsToShow, bool fromEnd, string maskingChar,
        string[] entities, CancellationToken cancellationToken = default)
    {
        return await MaskInternalAsync(text, charsToShow, fromEnd, maskingChar, null, entities, cancellationToken).ConfigureAwait(false);
    }

    public async Task<MaskResponse> MaskAsync(
        string text, int charsToShow, bool fromEnd, string maskingChar,
        string policy, CancellationToken cancellationToken = default)
    {
        return await MaskInternalAsync(text, charsToShow, fromEnd, maskingChar, policy, null, cancellationToken).ConfigureAwait(false);
    }

    private async Task<MaskResponse> MaskInternalAsync(
        string text, int charsToShow, bool fromEnd, string maskingChar,
        string? policy, string[]? entities, CancellationToken cancellationToken)
    {
        var resolved = Resolve(policy, entities);

        if (UseLocal())
        {
            var result = _scanner.Mask(text, charsToShow, fromEnd, maskingChar, resolved.Entities);
            if (resolved.Threshold != null)
            {
                var filtered = ApplyThreshold(result.Matches, resolved.Threshold);
                if (filtered.Count < result.Matches.Count)
                {
                    var types = RedetectEntities(text, resolved);
                    result = _scanner.Mask(text, charsToShow, fromEnd, maskingChar, types);
                }
            }
            return new MaskResponse
            {
                Text = result.Text,
                DetectedEntities = ToEntities(result.Matches),
                EntitiesCount = result.Matches.Count
            };
        }

        var body = new Dictionary<string, object>
        {
            ["text"] = text,
            ["chars_to_show"] = charsToShow,
            ["from_end"] = fromEnd,
            ["masking_char"] = maskingChar
        };
        if (resolved.Entities != null) body["entities"] = resolved.Entities;
        if (resolved.Threshold != null) body["score_threshold"] = resolved.Threshold.Value;

        var json = await _httpClient.PostAsync("/mask", body, cancellationToken).ConfigureAwait(false);
        return JsonSerializer.Deserialize<MaskResponse>(json) ?? new MaskResponse();
    }

    // ---- Hash ----

    public async Task<HashResponse> HashAsync(
        string text, CancellationToken cancellationToken = default)
    {
        return await HashInternalAsync(text, "SHA-256", "HASH_", 16, null, null, cancellationToken).ConfigureAwait(false);
    }

    public async Task<HashResponse> HashAsync(
        string text, string hashType, string hashPrefix, int hashLength,
        string[] entities, CancellationToken cancellationToken = default)
    {
        return await HashInternalAsync(text, hashType, hashPrefix, hashLength, null, entities, cancellationToken).ConfigureAwait(false);
    }

    public async Task<HashResponse> HashAsync(
        string text, string hashType, string hashPrefix, int hashLength,
        string policy, CancellationToken cancellationToken = default)
    {
        return await HashInternalAsync(text, hashType, hashPrefix, hashLength, policy, null, cancellationToken).ConfigureAwait(false);
    }

    private async Task<HashResponse> HashInternalAsync(
        string text, string hashType, string hashPrefix, int hashLength,
        string? policy, string[]? entities, CancellationToken cancellationToken)
    {
        var resolved = Resolve(policy, entities);

        if (UseLocal())
        {
            var result = _scanner.Hash(text, hashType, hashPrefix, hashLength, resolved.Entities);
            if (resolved.Threshold != null)
            {
                var filtered = ApplyThreshold(result.Matches, resolved.Threshold);
                if (filtered.Count < result.Matches.Count)
                {
                    var types = RedetectEntities(text, resolved);
                    result = _scanner.Hash(text, hashType, hashPrefix, hashLength, types);
                }
            }
            return new HashResponse
            {
                Text = result.Text,
                DetectedEntities = ToEntities(result.Matches),
                EntitiesCount = result.Matches.Count
            };
        }

        var body = new Dictionary<string, object>
        {
            ["text"] = text,
            ["hash_type"] = hashType,
            ["hash_prefix"] = hashPrefix,
            ["hash_length"] = hashLength
        };
        if (resolved.Entities != null) body["entities"] = resolved.Entities;
        if (resolved.Threshold != null) body["score_threshold"] = resolved.Threshold.Value;

        var json = await _httpClient.PostAsync("/hash", body, cancellationToken).ConfigureAwait(false);
        return JsonSerializer.Deserialize<HashResponse>(json) ?? new HashResponse();
    }

    // ---- Encrypt ----

    public async Task<EncryptResponse> EncryptAsync(
        string text, string encryptionKey, CancellationToken cancellationToken = default)
    {
        return await EncryptInternalAsync(text, encryptionKey, null, null, cancellationToken).ConfigureAwait(false);
    }

    public async Task<EncryptResponse> EncryptAsync(
        string text, string encryptionKey, string[] entities, CancellationToken cancellationToken = default)
    {
        return await EncryptInternalAsync(text, encryptionKey, null, entities, cancellationToken).ConfigureAwait(false);
    }

    public async Task<EncryptResponse> EncryptAsync(
        string text, string encryptionKey, string policy, CancellationToken cancellationToken = default)
    {
        return await EncryptInternalAsync(text, encryptionKey, policy, null, cancellationToken).ConfigureAwait(false);
    }

    private async Task<EncryptResponse> EncryptInternalAsync(
        string text, string encryptionKey, string? policy, string[]? entities,
        CancellationToken cancellationToken)
    {
        var resolved = Resolve(policy, entities);

        if (UseLocal())
        {
            var result = _scanner.Encrypt(text, encryptionKey, resolved.Entities);
            if (resolved.Threshold != null)
            {
                var filtered = ApplyThreshold(result.Matches, resolved.Threshold);
                if (filtered.Count < result.Matches.Count)
                {
                    var types = RedetectEntities(text, resolved);
                    result = _scanner.Encrypt(text, encryptionKey, types);
                }
            }
            return new EncryptResponse
            {
                Text = result.Text,
                DetectedEntities = ToEntities(result.Matches),
                EntitiesCount = result.Matches.Count
            };
        }

        var body = new Dictionary<string, object>
        {
            ["text"] = text,
            ["encryption_key"] = encryptionKey
        };
        if (resolved.Entities != null) body["entities"] = resolved.Entities;
        if (resolved.Threshold != null) body["score_threshold"] = resolved.Threshold.Value;

        var json = await _httpClient.PostAsync("/encrypt", body, cancellationToken).ConfigureAwait(false);
        return JsonSerializer.Deserialize<EncryptResponse>(json) ?? new EncryptResponse();
    }

    // ---- Synthesize ----

    public async Task<SynthesizeResponse> SynthesizeAsync(
        string text, CancellationToken cancellationToken = default)
    {
        return await SynthesizeInternalAsync(text, null, null, null, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SynthesizeResponse> SynthesizeAsync(
        string text, string? language, string[] entities, CancellationToken cancellationToken = default)
    {
        return await SynthesizeInternalAsync(text, language, null, entities, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SynthesizeResponse> SynthesizeAsync(
        string text, string? language, string policy, CancellationToken cancellationToken = default)
    {
        return await SynthesizeInternalAsync(text, language, policy, null, cancellationToken).ConfigureAwait(false);
    }

    private async Task<SynthesizeResponse> SynthesizeInternalAsync(
        string text, string? language, string? policy, string[]? entities,
        CancellationToken cancellationToken)
    {
        var resolved = Resolve(policy, entities);

        if (UseLocal())
        {
            var result = _scanner.Synthesize(text, language, resolved.Entities);
            if (resolved.Threshold != null)
            {
                var filtered = ApplyThreshold(result.Matches, resolved.Threshold);
                if (filtered.Count < result.Matches.Count)
                {
                    var types = RedetectEntities(text, resolved);
                    result = _scanner.Synthesize(text, language, types);
                }
            }
            return new SynthesizeResponse
            {
                Text = result.Text,
                DetectedEntities = ToEntities(result.Matches),
                EntitiesCount = result.Matches.Count
            };
        }

        var body = new Dictionary<string, object> { ["text"] = text };
        if (!string.IsNullOrEmpty(language)) body["language"] = language;
        if (resolved.Entities != null) body["entities"] = resolved.Entities;
        if (resolved.Threshold != null) body["score_threshold"] = resolved.Threshold.Value;

        var json = await _httpClient.PostAsync("/synthesize", body, cancellationToken).ConfigureAwait(false);
        return JsonSerializer.Deserialize<SynthesizeResponse>(json) ?? new SynthesizeResponse();
    }

    // ---- Batch methods ----

    public async Task<BatchResponse<DetectResponse>> DetectBatchAsync(
        string[] texts, CancellationToken cancellationToken = default)
    {
        return await DetectBatchInternalAsync(texts, null, null, cancellationToken).ConfigureAwait(false);
    }

    public async Task<BatchResponse<DetectResponse>> DetectBatchAsync(
        string[] texts, string[] entities, CancellationToken cancellationToken = default)
    {
        return await DetectBatchInternalAsync(texts, null, entities, cancellationToken).ConfigureAwait(false);
    }

    public async Task<BatchResponse<DetectResponse>> DetectBatchAsync(
        string[] texts, string policy, CancellationToken cancellationToken = default)
    {
        return await DetectBatchInternalAsync(texts, policy, null, cancellationToken).ConfigureAwait(false);
    }

    private async Task<BatchResponse<DetectResponse>> DetectBatchInternalAsync(
        string[] texts, string? policy, string[]? entities, CancellationToken cancellationToken)
    {
        var resolved = Resolve(policy, entities);
        var body = new Dictionary<string, object> { ["texts"] = texts };
        if (resolved.Entities != null) body["entities"] = resolved.Entities;
        if (resolved.Threshold != null) body["score_threshold"] = resolved.Threshold.Value;

        var json = await _httpClient.PostAsync("/detect", body, cancellationToken).ConfigureAwait(false);
        return JsonSerializer.Deserialize<BatchResponse<DetectResponse>>(json) ?? new BatchResponse<DetectResponse>();
    }

    public async Task<BatchResponse<TokenizeResponse>> TokenizeBatchAsync(
        string[] texts, CancellationToken cancellationToken = default)
    {
        return await TokenizeBatchInternalAsync(texts, null, null, cancellationToken).ConfigureAwait(false);
    }

    public async Task<BatchResponse<TokenizeResponse>> TokenizeBatchAsync(
        string[] texts, string[] entities, CancellationToken cancellationToken = default)
    {
        return await TokenizeBatchInternalAsync(texts, null, entities, cancellationToken).ConfigureAwait(false);
    }

    public async Task<BatchResponse<TokenizeResponse>> TokenizeBatchAsync(
        string[] texts, string policy, CancellationToken cancellationToken = default)
    {
        return await TokenizeBatchInternalAsync(texts, policy, null, cancellationToken).ConfigureAwait(false);
    }

    private async Task<BatchResponse<TokenizeResponse>> TokenizeBatchInternalAsync(
        string[] texts, string? policy, string[]? entities, CancellationToken cancellationToken)
    {
        var resolved = Resolve(policy, entities);
        var body = new Dictionary<string, object> { ["texts"] = texts };
        if (resolved.Entities != null) body["entities"] = resolved.Entities;
        if (resolved.Threshold != null) body["score_threshold"] = resolved.Threshold.Value;

        var json = await _httpClient.PostAsync("/tokenize", body, cancellationToken).ConfigureAwait(false);
        return JsonSerializer.Deserialize<BatchResponse<TokenizeResponse>>(json) ?? new BatchResponse<TokenizeResponse>();
    }
}
