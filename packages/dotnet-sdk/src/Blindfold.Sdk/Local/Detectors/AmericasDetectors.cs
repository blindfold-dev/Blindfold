using System.Text.RegularExpressions;

namespace Blindfold.Sdk.Local.Detectors;

internal static class AmericasDetectors
{
    static AmericasDetectors()
    {
        // Canadian SIN
        DetectorRegistration.RegisterRegion("us", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.CASIN,
            Pattern = new Regex(@"\b\d{3}[-\s]?\d{3}[-\s]?\d{3}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "sin", "social insurance", "canadian" },
            Validator = Validators.CaSinChecksum
        }));

        // Argentine CUIT
        DetectorRegistration.RegisterRegion("us", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.ARCUIT,
            Pattern = new Regex(@"\b\d{2}-?\d{8}-?\d\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "cuit", "cuil", "tributaria" },
            Validator = Validators.ArCuitChecksum
        }));

        // Brazilian CPF
        DetectorRegistration.RegisterRegion("us", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.BRCPF,
            Pattern = new Regex(@"\b\d{3}\.?\d{3}\.?\d{3}[-.]?\d{2}\b", RegexOptions.Compiled),
            Score = 0.90,
            NeedsDigit = true,
            Validator = Validators.BrCpfChecksum
        }));

        // Brazilian CNPJ
        DetectorRegistration.RegisterRegion("us", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.BRCNPJ,
            Pattern = new Regex(@"\b\d{2}\.?\d{3}\.?\d{3}/?\d{4}[-.]?\d{2}\b", RegexOptions.Compiled),
            Score = 0.90,
            NeedsDigit = true,
            Validator = Validators.BrCnpjChecksum
        }));

        // Chilean RUT
        DetectorRegistration.RegisterRegion("us", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.CLRUT,
            Pattern = new Regex(@"\b\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK]\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "rut", "rol unico tributario" },
            Validator = Validators.ClRutChecksum
        }));

        // Colombian NIT
        DetectorRegistration.RegisterRegion("us", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.CONIT,
            Pattern = new Regex(@"\b\d{3}\.?\d{3}\.?\d{3}-?\d\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "nit", "tributaria" },
            Validator = Validators.CoNitChecksum
        }));
    }

    public static void EnsureRegistered() { }
}
