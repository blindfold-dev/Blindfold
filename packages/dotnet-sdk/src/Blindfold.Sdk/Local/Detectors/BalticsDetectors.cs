using System.Text.RegularExpressions;

namespace Blindfold.Sdk.Local.Detectors;

internal static class BalticsDetectors
{
    static BalticsDetectors()
    {
        // Lithuanian Personal Code
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.LTPersonalCode,
            Pattern = new Regex(@"\b[1-6]\d{10}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "asmens kodas", "personal code", "asmens" },
            Validator = Validators.LtPersonalCodeChecksum
        }));

        // Latvian Personal Code
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.LVPersonalCode,
            Pattern = new Regex(@"\b\d{6}-?\d{5}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "personas kods", "personal code", "personas" },
            Validator = Validators.LvPersonalCodeChecksum
        }));

        // Estonian Personal Code
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.EEPersonalCode,
            Pattern = new Regex(@"\b[1-6]\d{10}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "isikukood", "personal code", "isiku" },
            Validator = Validators.EePersonalCodeChecksum
        }));
    }

    public static void EnsureRegistered() { }
}
