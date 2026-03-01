using System.Text.RegularExpressions;

namespace Blindfold.Sdk.Local.Detectors;

internal static class DeDetectors
{
    static DeDetectors()
    {
        // German Personal ID
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.DEPersonalID,
            Pattern = new Regex(@"\b[CFGHJKLMNPRTVWXYZ][0-9A-Z]\d{7}\d\b", RegexOptions.Compiled),
            Score = 0.75,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "personalausweis", "ausweis", "personal id", "identity card", "id card", "ausweissnummer", "id nummer" }
        }));

        // German Tax ID
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.DETaxID,
            Pattern = new Regex(@"\b\d{2}\s?\d{3}\s?\d{3}\s?\d{3}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            Validator = Validators.DeTaxIdChecksum
        }));
    }

    public static void EnsureRegistered() { }
}
