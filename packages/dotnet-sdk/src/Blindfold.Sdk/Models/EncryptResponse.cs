using System.Text.Json.Serialization;

namespace Blindfold.Sdk.Models;

public class EncryptResponse
{
    [JsonPropertyName("text")]
    public string Text { get; set; } = "";

    [JsonPropertyName("detected_entities")]
    public List<DetectedEntity> DetectedEntities { get; set; } = new();

    [JsonPropertyName("entities_count")]
    public int EntitiesCount { get; set; }
}
