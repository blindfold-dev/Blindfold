using System.Text.RegularExpressions;

namespace Blindfold.Sdk.Local.Detectors;

internal static class PtDetectors
{
    static PtDetectors()
    {
        // Portuguese NIF
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.PTNIF,
            Pattern = new Regex(@"\b[1-3589]\d{8}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "nif", "contribuinte", "numero de contribuinte", "número de contribuinte", "tax number", "fiscal" },
            Validator = Validators.PtNifChecksum
        }));
    }

    public static void EnsureRegistered() { }
}
