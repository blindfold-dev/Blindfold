using System.Text.RegularExpressions;

namespace Blindfold.Sdk.Local.Detectors;

internal static class UkDetectors
{
    static UkDetectors()
    {
        // NI Number
        DetectorRegistration.RegisterRegion("uk", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.NINumber,
            Pattern = new Regex(@"\b(?:(?:[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]))\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]\b", RegexOptions.Compiled),
            Score = 0.90
        }));

        // NHS Number
        DetectorRegistration.RegisterRegion("uk", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.NHSNumber,
            Pattern = new Regex(@"\b\d{3}\s?\d{3}\s?\d{4}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            Validator = Validators.NhsChecksum
        }));

        // UK Postcode
        DetectorRegistration.RegisterRegion("uk", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.UKPostcode,
            Pattern = new Regex(@"\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b", RegexOptions.Compiled),
            Score = 0.85
        }));

        // UK Passport
        DetectorRegistration.RegisterRegion("uk", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.UKPassport,
            Pattern = new Regex(@"\b\d{9}\b", RegexOptions.Compiled),
            Score = 0.75,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "passport", "passport number", "passport no", "passport#" }
        }));

        // UK UTR
        DetectorRegistration.RegisterRegion("uk", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.UKUTR,
            Pattern = new Regex(@"\b\d{10}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "utr", "unique taxpayer", "tax reference", "self assessment", "hmrc" },
            Validator = Validators.UkUtrChecksum
        }));
    }

    public static void EnsureRegistered() { }
}
