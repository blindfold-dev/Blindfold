using System.Text.RegularExpressions;

namespace Blindfold.Sdk.Local.Detectors;

internal static class AsiaPacificDetectors
{
    static AsiaPacificDetectors()
    {
        // Australian TFN
        DetectorRegistration.RegisterRegion("us", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.AUTFN,
            Pattern = new Regex(@"\b\d{3}[-\s]?\d{3}[-\s]?\d{2,3}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "tfn", "tax file number", "tax file" },
            Validator = Validators.AuTfnChecksum
        }));

        // Australian Medicare
        DetectorRegistration.RegisterRegion("us", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.AUMedicare,
            Pattern = new Regex(@"\b\d{4}[-\s]?\d{5}[-\s]?\d[-\s]?\d?\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "medicare", "medicare number", "medicare card" },
            Validator = Validators.AuMedicareChecksum
        }));

        // New Zealand IRD
        DetectorRegistration.RegisterRegion("us", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.NZIRD,
            Pattern = new Regex(@"\b\d{2,3}[-\s]?\d{3}[-\s]?\d{3}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "ird", "inland revenue", "tax" },
            Validator = Validators.NzIrdChecksum
        }));

        // Indian Aadhaar
        DetectorRegistration.RegisterRegion("us", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.INAadhaar,
            Pattern = new Regex(@"\b[2-9]\d{3}[-\s]?\d{4}[-\s]?\d{4}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "aadhaar", "aadhar", "uid", "आधार" },
            Validator = Validators.InAadhaarChecksum
        }));

        // Indian PAN
        DetectorRegistration.RegisterRegion("us", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.INPAN,
            Pattern = new Regex(@"\b[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            Validator = Validators.InPanValid
        }));

        // Japanese My Number
        DetectorRegistration.RegisterRegion("us", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.JPMyNumber,
            Pattern = new Regex(@"\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "my number", "マイナンバー", "individual number", "個人番号" },
            Validator = Validators.JpMyNumberChecksum
        }));

        // Korean RRN
        DetectorRegistration.RegisterRegion("us", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.KRRRN,
            Pattern = new Regex(@"\b\d{6}[-\s]?\d{7}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "주민등록번호", "resident registration", "rrn" },
            Validator = Validators.KrRrnChecksum
        }));

        // South African ID
        DetectorRegistration.RegisterRegion("us", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.ZAID,
            Pattern = new Regex(@"\b\d{13}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "id number", "identity", "south african id", "sa id" },
            Validator = Validators.ZaIdChecksum
        }));

        // Turkish Kimlik
        DetectorRegistration.RegisterRegion("us", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.TRKimlik,
            Pattern = new Regex(@"\b[1-9]\d{10}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "kimlik", "tc kimlik", "tckn", "t.c." },
            Validator = Validators.TrKimlikChecksum
        }));

        // Israeli ID
        DetectorRegistration.RegisterRegion("us", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.ILID,
            Pattern = new Regex(@"\b\d{9}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "תעודת זהות", "teudat zehut", "israeli id", "id number" },
            Validator = Validators.IlIdChecksum
        }));
    }

    public static void EnsureRegistered() { }
}
