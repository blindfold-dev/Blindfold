using System.Text.Json.Serialization;

namespace Blindfold.Sdk.Models;

public class TokenizeResponse
{
    [JsonPropertyName("text")]
    public string Text { get; set; } = "";

    [JsonPropertyName("mapping")]
    public Dictionary<string, string> Mapping { get; set; } = new();

    [JsonPropertyName("detected_entities")]
    public List<DetectedEntity> DetectedEntities { get; set; } = new();

    [JsonPropertyName("entities_count")]
    public int EntitiesCount { get; set; }
}
