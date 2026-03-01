using System.Text.Json.Serialization;

namespace Blindfold.Sdk.Policies;

internal class PolicyDefinition
{
    [JsonPropertyName("entities")]
    public List<string> Entities { get; set; } = new();

    [JsonPropertyName("threshold")]
    public double? Threshold { get; set; }
}
