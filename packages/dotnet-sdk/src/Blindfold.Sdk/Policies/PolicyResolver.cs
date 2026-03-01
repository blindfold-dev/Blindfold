using System.Reflection;
using System.Text.Json;

namespace Blindfold.Sdk.Policies;

internal class PolicyResolution
{
    public List<string>? Entities { get; set; }
    public double? Threshold { get; set; }
}

internal static class PolicyResolver
{
    public static Dictionary<string, PolicyDefinition> LoadPolicies(string? policiesFile)
    {
        var policies = new Dictionary<string, PolicyDefinition>();

        // Load bundled policies from embedded resource
        try
        {
            var assembly = typeof(PolicyResolver).Assembly;
            using var stream = assembly.GetManifestResourceStream("Blindfold.Sdk.Policies.policies.json");
            if (stream != null)
            {
                using var reader = new StreamReader(stream);
                var json = reader.ReadToEnd();
                var bundled = JsonSerializer.Deserialize<Dictionary<string, PolicyDefinition>>(json);
                if (bundled != null)
                {
                    foreach (var kvp in bundled)
                        policies[kvp.Key] = kvp.Value;
                }
            }
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Warning: Failed to load bundled policies: {ex.Message}");
        }

        // Merge custom policies file
        if (!string.IsNullOrEmpty(policiesFile))
        {
            try
            {
                var json = File.ReadAllText(policiesFile);
                var custom = JsonSerializer.Deserialize<Dictionary<string, PolicyDefinition>>(json);
                if (custom != null)
                {
                    foreach (var kvp in custom)
                        policies[kvp.Key] = kvp.Value;
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Warning: Failed to load custom policies from '{policiesFile}': {ex.Message}");
            }
        }

        return policies;
    }

    public static PolicyResolution Resolve(
        Dictionary<string, PolicyDefinition> policies,
        string? defaultPolicy,
        string? callPolicy,
        string[]? callEntities)
    {
        // Priority: explicit entities > named policy > detect all
        if (callEntities != null && callEntities.Length > 0)
            return new PolicyResolution { Entities = new List<string>(callEntities) };

        var policyName = !string.IsNullOrEmpty(callPolicy) ? callPolicy : defaultPolicy;
        if (!string.IsNullOrEmpty(policyName))
        {
            if (policies.TryGetValue(policyName, out var def))
                return new PolicyResolution { Entities = def.Entities, Threshold = def.Threshold };

            Console.Error.WriteLine($"Warning: Unknown policy '{policyName}', detecting all entities");
        }

        return new PolicyResolution();
    }
}
