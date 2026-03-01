using System.Text.RegularExpressions;

namespace Blindfold.Sdk.Local.Detectors;

internal static class BeneluxDetectors
{
    static BeneluxDetectors()
    {
        // Belgian National Number
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.BENational,
            Pattern = new Regex(@"\b\d{2}[.\s]?\d{2}[.\s]?\d{2}[-\s]?\d{3}[.\s]?\d{2}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "national", "rijksregister", "registre national", "nn", "nrn" },
            Validator = Validators.BeNationalNumberChecksum
        }));

        // Belgian Enterprise Number
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.BEEnterprise,
            Pattern = new Regex(@"\b[01]\d{3}[.\s]?\d{3}[.\s]?\d{3}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "enterprise", "ondernemingsnummer", "kbo", "bce", "company" },
            Validator = Validators.BeEnterpriseChecksum
        }));

        // Dutch BSN
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.NLBSN,
            Pattern = new Regex(@"\b\d{9}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "bsn", "burgerservicenummer", "sofinummer", "citizen", "service number" },
            Validator = Validators.NlBsn11Test
        }));

        // Austrian SVNR
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.ATSVNR,
            Pattern = new Regex(@"\b\d{4}[-\s]?\d{6}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "svnr", "sozialversicherung", "versicherungsnummer", "insurance" },
            Validator = Validators.AtSvnrChecksum
        }));
    }

    public static void EnsureRegistered() { }
}
