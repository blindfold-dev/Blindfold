using System.Text.RegularExpressions;

namespace Blindfold.Sdk.Local.Detectors;

internal static class EuDetectors
{
    static EuDetectors()
    {
        // IBAN
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.IBAN,
            Pattern = new Regex(@"\b[A-Z]{2}\d{2}\s?[\dA-Z]{4}(?:\s?[\dA-Z]{4}){1,7}(?:\s?[\dA-Z]{1,4})?\b", RegexOptions.Compiled),
            Score = 0.90,
            Validator = Validators.IbanMod97
        }));

        // EU Postal Code
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.PostalCode,
            Pattern = new Regex(@"\b(?:\d{5}|\d{4}\s?[A-Z]{2})\b", RegexOptions.Compiled),
            Score = 0.70,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "postal", "postal code", "postcode", "zip", "plz", "code postal", "postleitzahl", "codigo postal" }
        }));

        // VAT ID
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.VATID,
            Pattern = new Regex(@"\b(?:ATU\d{8}|BE[01]\d{9}|DE\d{9}|DK\d{8}|ES[A-Z0-9]\d{7}[A-Z0-9]|FI\d{8}|FR[A-Z0-9]{2}\d{9}|IT\d{11}|LU\d{8}|NL\d{9}B\d{2}|PL\d{10}|PT\d{9}|SE\d{12})\b", RegexOptions.Compiled),
            Score = 0.90,
            NeedsDigit = true
        }));
    }

    public static void EnsureRegistered() { }
}
