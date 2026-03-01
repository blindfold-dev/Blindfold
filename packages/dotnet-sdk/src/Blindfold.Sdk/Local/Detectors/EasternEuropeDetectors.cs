using System.Text.RegularExpressions;

namespace Blindfold.Sdk.Local.Detectors;

internal static class EasternEuropeDetectors
{
    static EasternEuropeDetectors()
    {
        // Polish PESEL
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.PLPESEL,
            Pattern = new Regex(@"\b\d{11}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            Validator = Validators.PlPeselChecksum
        }));

        // Polish NIP
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.PLNIP,
            Pattern = new Regex(@"\b\d{3}[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "nip", "tax", "podatkowy", "vat" },
            Validator = Validators.PlNipChecksum
        }));

        // Polish REGON
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.PLREGON,
            Pattern = new Regex(@"\b\d{9}(?:\d{5})?\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "regon", "statistical", "statystyczny" },
            Validator = Validators.PlRegonChecksum
        }));

        // Czech Birth Number
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.CZBirthNumber,
            Pattern = new Regex(@"\b\d{6}/?\d{3,4}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            Validator = Validators.CzBirthNumberValid
        }));

        // Czech ICO
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.CZICO,
            Pattern = new Regex(@"\b\d{8}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "ico", "i\u010do", "company", "firma" },
            Validator = Validators.CzIcoChecksum
        }));

        // Czech DIC
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.CZDIC,
            Pattern = new Regex(@"\bCZ\d{8,10}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            Validator = Validators.CzDicValid
        }));

        // Czech Bank Account
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.CZBankAccount,
            Pattern = new Regex(@"\b(?:\d{1,6}-)?\d{2,10}/\d{4}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            Validator = Validators.CzBankAccountValid
        }));

        // Slovak Birth Number
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.SKBirthNumber,
            Pattern = new Regex(@"\b\d{6}/?\d{3,4}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            Validator = Validators.SkBirthNumberValid
        }));

        // Slovak ICO
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.SKICO,
            Pattern = new Regex(@"\b\d{8}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "ico", "i\u010do", "company", "firma" },
            Validator = Validators.SkIcoChecksum
        }));

        // Slovak DIC
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.SKDIC,
            Pattern = new Regex(@"\bSK\d{10}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            Validator = Validators.SkDicValid
        }));

        // Romanian CNP
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.ROCNP,
            Pattern = new Regex(@"\b[1-8]\d{12}\b", RegexOptions.Compiled),
            Score = 0.90,
            NeedsDigit = true,
            Validator = Validators.RoCnpChecksum
        }));

        // Romanian CUI
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.ROCUI,
            Pattern = new Regex(@"\b(?:RO)?\d{2,10}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "cui", "cif", "fiscal", "company" },
            Validator = Validators.RoCuiChecksum
        }));

        // Bulgarian EGN
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.BGEGN,
            Pattern = new Regex(@"\b\d{10}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "egn", "\u0435\u0433\u043d", "personal", "\u043b\u0438\u0447\u043d\u043e" },
            Validator = Validators.BgEgnChecksum
        }));

        // Croatian OIB
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.HROIB,
            Pattern = new Regex(@"\b\d{11}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "oib", "osobni identifikacijski broj" },
            Validator = Validators.HrOibChecksum
        }));

        // Slovenian EMSO
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.SIEMSO,
            Pattern = new Regex(@"\b\d{13}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "emso", "mati\u010dna", "personal" },
            Validator = Validators.SiEmsoChecksum
        }));

        // Slovenian Tax Number
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.SITaxNumber,
            Pattern = new Regex(@"\b(?:SI)?\d{8}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "dav\u010dna", "tax", "davcna" },
            Validator = Validators.SiTaxNumberChecksum
        }));

        // Hungarian Tax ID
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.HUTaxID,
            Pattern = new Regex(@"\b8\d{9}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "ad\u00f3azonos\u00edt\u00f3", "tax", "ad\u00f3sz\u00e1m" },
            Validator = Validators.HuTaxIdChecksum
        }));

        // Hungarian TAJ
        DetectorRegistration.RegisterRegion("eu", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.HUTAJ,
            Pattern = new Regex(@"\b\d{3}[-\s]?\d{3}[-\s]?\d{3}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "taj", "t\u00e1rsadalombiztos\u00edt\u00e1si", "insurance" },
            Validator = Validators.HuTajChecksum
        }));
    }

    public static void EnsureRegistered() { }
}
