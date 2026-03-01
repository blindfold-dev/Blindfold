using System.Text.RegularExpressions;

namespace Blindfold.Sdk.Local.Detectors;

internal static class IeDetectors
{
    static IeDetectors()
    {
        // Irish PPS
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.IEPPS,
            Pattern = new Regex(@"\b\d{7}[A-Z]{1,2}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            Validator = Validators.IePpsChecksum
        }));
    }

    public static void EnsureRegistered() { }
}
