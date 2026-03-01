using System.Text.RegularExpressions;

namespace Blindfold.Sdk.Local.Detectors;

internal static class EsDetectors
{
    static EsDetectors()
    {
        // Spanish DNI
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.ESDNI,
            Pattern = new Regex(@"\b\d{8}[-\s]?[A-Z]\b", RegexOptions.Compiled),
            Score = 0.90,
            NeedsDigit = true,
            Validator = Validators.EsDniLetter
        }));

        // Spanish NIE
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.ESNIE,
            Pattern = new Regex(@"\b[XYZ]\d{7}[-\s]?[A-Z]\b", RegexOptions.Compiled),
            Score = 0.90,
            NeedsDigit = true,
            Validator = Validators.EsNieLetter
        }));

        // Spanish NSS
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.ESNSS,
            Pattern = new Regex(@"\b\d{2}[-\s]?\d{8}[-\s]?\d{2}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "nss", "seguridad social", "social security", "numero de afiliacion", "número de afiliación" },
            Validator = Validators.EsNssChecksum
        }));

        // Spanish CIF
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.ESCIF,
            Pattern = new Regex(@"\b[A-HJ-NP-SUVW]\d{7}[0-9A-J]\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            Validator = Validators.EsCifChecksum
        }));
    }

    public static void EnsureRegistered() { }
}
