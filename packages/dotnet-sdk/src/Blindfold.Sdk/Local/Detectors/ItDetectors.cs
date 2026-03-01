using System.Text.RegularExpressions;

namespace Blindfold.Sdk.Local.Detectors;

internal static class ItDetectors
{
    static ItDetectors()
    {
        // Italian Codice Fiscale
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.ITCodiceFiscale,
            Pattern = new Regex(@"\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b", RegexOptions.Compiled),
            Score = 0.90,
            NeedsDigit = true,
            Validator = Validators.ItCodiceFiscaleCheck
        }));

        // Italian Partita IVA
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.ITPartitaIVA,
            Pattern = new Regex(@"\b(?:IT)?\d{11}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "partita iva", "p.iva", "p. iva", "vat", "iva", "partita" },
            Validator = Validators.ItPartitaIvaChecksum
        }));
    }

    public static void EnsureRegistered() { }
}
