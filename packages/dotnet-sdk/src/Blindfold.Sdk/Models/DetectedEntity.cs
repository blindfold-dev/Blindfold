using System.Text.Json.Serialization;

namespace Blindfold.Sdk.Models;

public class DetectedEntity
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = "";

    [JsonPropertyName("text")]
    public string Text { get; set; } = "";

    [JsonPropertyName("start")]
    public int Start { get; set; }

    [JsonPropertyName("end")]
    public int End { get; set; }

    [JsonPropertyName("score")]
    public double Score { get; set; }
}
