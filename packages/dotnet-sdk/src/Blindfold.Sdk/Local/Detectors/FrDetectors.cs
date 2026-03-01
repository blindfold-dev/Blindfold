using System.Text.RegularExpressions;

namespace Blindfold.Sdk.Local.Detectors;

internal static class FrDetectors
{
    static FrDetectors()
    {
        // French National ID (NIR)
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.FRNationalID,
            Pattern = new Regex(@"\b[12]\s?\d{2}\s?(?:0[1-9]|1[0-2]|[2-9]\d)\s?\d{2,3}\s?\d{3}\s?\d{3}\s?\d{2}\b", RegexOptions.Compiled),
            Score = 0.90,
            NeedsDigit = true,
            Validator = Validators.FrNirChecksum
        }));

        // French SIREN
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.FRSIREN,
            Pattern = new Regex(@"\b\d{3}[-\s]?\d{3}[-\s]?\d{3}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "siren", "siret", "entreprise", "societe", "société", "company", "business" },
            Validator = Validators.LuhnChecksum
        }));
    }

    public static void EnsureRegistered() { }
}
