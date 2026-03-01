using System.Text.RegularExpressions;

namespace Blindfold.Sdk.Local.Detectors;

internal static class ChDetectors
{
    static ChDetectors()
    {
        // Swiss AHV
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.CHAHV,
            Pattern = new Regex(@"\b756[.\s]?\d{4}[.\s]?\d{4}[.\s]?\d{2}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            Validator = Validators.ChAhvChecksum
        }));
    }

    public static void EnsureRegistered() { }
}
