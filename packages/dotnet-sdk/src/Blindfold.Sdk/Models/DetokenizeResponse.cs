using System.Text.Json.Serialization;

namespace Blindfold.Sdk.Models;

public class DetokenizeResponse
{
    [JsonPropertyName("text")]
    public string Text { get; set; } = "";

    [JsonPropertyName("replacements_made")]
    public int ReplacementsMade { get; set; }
}
