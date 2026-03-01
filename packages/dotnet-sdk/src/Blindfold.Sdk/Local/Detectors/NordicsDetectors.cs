using System.Text.RegularExpressions;

namespace Blindfold.Sdk.Local.Detectors;

internal static class NordicsDetectors
{
    static NordicsDetectors()
    {
        // Danish CPR
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.DKCPR,
            Pattern = new Regex(@"\b(?:0[1-9]|[12]\d|3[01])(?:0[1-9]|1[0-2])\d{2}[-\s]?\d{4}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "cpr", "personnummer", "personal", "cprnr" },
            Validator = Validators.DkCprValidDate
        }));

        // Danish CVR
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.DKCVR,
            Pattern = new Regex(@"\b(?:DK)?\d{8}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "cvr", "company", "virksomhed", "cvrnr" },
            Validator = Validators.DkCvrChecksum
        }));

        // Swedish Personnummer
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.SEPersonnummer,
            Pattern = new Regex(@"\b(?:\d{8}|\d{6})[-+]?\d{4}\b", RegexOptions.Compiled),
            Score = 0.90,
            NeedsDigit = true,
            Validator = Validators.SePersonnummerLuhn
        }));

        // Swedish Organisationsnummer
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.SEOrgnr,
            Pattern = new Regex(@"\b\d{6}-?\d{4}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "organisationsnummer", "orgnr", "org.nr", "organisation", "company" },
            Validator = Validators.SeOrgnrChecksum
        }));

        // Norwegian Birth Number
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.NOBirthNumber,
            Pattern = new Regex(@"\b(?:0[1-9]|[12]\d|3[01])(?:0[1-9]|1[0-2])\d{7}\b", RegexOptions.Compiled),
            Score = 0.90,
            NeedsDigit = true,
            Validator = Validators.NoBirthNumberChecksum
        }));

        // Norwegian Organisasjonsnummer
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.NOOrgnr,
            Pattern = new Regex(@"\b\d{9}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "organisasjonsnummer", "orgnr", "org.nr", "organisation", "company" },
            Validator = Validators.NoOrgnrChecksum
        }));

        // Finnish HETU
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.FIHETU,
            Pattern = new Regex(@"\b\d{6}[-+ABCDEFYXWVUabcdefyxwvu]\d{3}[0-9A-Za-z]\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            Validator = Validators.FiHetuChecksum
        }));

        // Finnish Y-tunnus
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.FIYtunnus,
            Pattern = new Regex(@"\b\d{7}-\d\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "y-tunnus", "ytunnus", "business id", "yritys" },
            Validator = Validators.FiYtunnusChecksum
        }));
    }

    public static void EnsureRegistered() { }
}
