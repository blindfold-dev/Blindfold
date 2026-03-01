using System.Net;
using System.Text;
using System.Text.Json;
using Blindfold.Sdk.Errors;

namespace Blindfold.Sdk.Http;

internal class BlindfoldHttpClient
{
    private static readonly HashSet<int> RetryableCodes = new() { 429, 500, 502, 503, 504 };

    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;
    private readonly string? _apiKey;
    private readonly string? _userId;
    private readonly int _maxRetries;
    private readonly TimeSpan _retryDelay;

    public BlindfoldHttpClient(
        HttpClient httpClient,
        string baseUrl,
        string? apiKey,
        string? userId,
        int maxRetries,
        TimeSpan retryDelay)
    {
        _httpClient = httpClient;
        _baseUrl = baseUrl;
        _apiKey = apiKey;
        _userId = userId;
        _maxRetries = maxRetries;
        _retryDelay = retryDelay;
    }

    public async Task<string> PostAsync(
        string path,
        object body,
        CancellationToken cancellationToken = default)
    {
        var jsonBody = JsonSerializer.Serialize(body);
        Exception? lastException = null;

        for (var attempt = 0; attempt <= _maxRetries; attempt++)
        {
            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Post, _baseUrl + path);
                request.Content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
                request.Headers.TryAddWithoutValidation("X-API-Key", _apiKey ?? "");
                if (!string.IsNullOrEmpty(_userId))
                    request.Headers.TryAddWithoutValidation("X-Blindfold-User-Id", _userId);

                using var response = await _httpClient.SendAsync(request, cancellationToken).ConfigureAwait(false);
                var responseBody = await response.Content.ReadAsStringAsync().ConfigureAwait(false);

                if (response.IsSuccessStatusCode)
                    return responseBody;

                if (response.StatusCode == HttpStatusCode.Unauthorized)
                    throw new AuthenticationException("Invalid API key");

                var statusCode = (int)response.StatusCode;
                if (RetryableCodes.Contains(statusCode) && attempt < _maxRetries)
                {
                    var delay = TimeSpan.FromMilliseconds(_retryDelay.TotalMilliseconds * Math.Pow(2, attempt));
                    if (statusCode == 429)
                        delay = ParseRetryAfter(responseBody, delay);

                    await Task.Delay(delay, cancellationToken).ConfigureAwait(false);
                    lastException = new ApiException($"API error: {statusCode} {responseBody}", statusCode);
                    continue;
                }

                throw new ApiException($"API error: {statusCode} {responseBody}", statusCode);
            }
            catch (AuthenticationException) { throw; }
            catch (ApiException ex) when (attempt >= _maxRetries) { throw; }
            catch (ApiException) { continue; }
            catch (OperationCanceledException) { throw; }
            catch (Exception ex)
            {
                lastException = new NetworkException($"Network error: {ex.Message}", ex);
                if (attempt < _maxRetries)
                {
                    var delay = TimeSpan.FromMilliseconds(_retryDelay.TotalMilliseconds * Math.Pow(2, attempt));
                    await Task.Delay(delay, cancellationToken).ConfigureAwait(false);
                    continue;
                }
                throw lastException;
            }
        }

        throw lastException ?? new NetworkException("Max retries exceeded");
    }

    private static TimeSpan ParseRetryAfter(string responseBody, TimeSpan fallback)
    {
        try
        {
            using var doc = JsonDocument.Parse(responseBody);
            if (doc.RootElement.TryGetProperty("retry_after", out var retryAfter))
            {
                var seconds = retryAfter.GetDouble();
                if (seconds > 0)
                    return TimeSpan.FromSeconds(seconds);
            }
        }
        catch { }
        return fallback;
    }
}
