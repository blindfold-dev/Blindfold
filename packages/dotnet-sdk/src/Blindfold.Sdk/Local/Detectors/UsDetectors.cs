using System.Text.RegularExpressions;

namespace Blindfold.Sdk.Local.Detectors;

internal static class UsDetectors
{
    static UsDetectors()
    {
        DetectorRegistration.RegisterRegion("us", () => new SsnDetector());

        DetectorRegistration.RegisterRegion("us", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.DriversLicense,
            Pattern = new Regex(@"\b(?:[A-Z]\d{14}|[A-Z]\d{4,8}|[A-Z]{2}\d{6,10}|\d{7,9})\b", RegexOptions.Compiled),
            Score = 0.75,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "driver", "license", "licence", "dl", "dl#", "driving", "dmv" }
        }));

        DetectorRegistration.RegisterRegion("us", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.USPassport,
            Pattern = new Regex(@"\b\d{9}\b", RegexOptions.Compiled),
            Score = 0.75,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "passport", "passport number", "passport no", "passport#" }
        }));

        DetectorRegistration.RegisterRegion("us", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.TaxID,
            Pattern = new Regex(@"\b\d{2}-\d{7}\b", RegexOptions.Compiled),
            Score = 0.80,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "ein", "tax", "employer", "fein", "tax id", "taxpayer" }
        }));

        DetectorRegistration.RegisterRegion("us", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.ZIPCode,
            Pattern = new Regex(@"\b\d{5}(?:-\d{4})?\b", RegexOptions.Compiled),
            Score = 0.70,
            NeedsDigit = true,
            ContextRequired = true,
            ContextWindow = 150,
            ContextKeywords = new[] { "zip", "zip code", "zipcode", "postal", "postal code", "mailing", "address", "shipping" },
            Validator = Validators.ZipValid
        }));

        DetectorRegistration.RegisterRegion("us", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.USITIN,
            Pattern = new Regex(@"\b9\d{2}[-\s]?\d{2}[-\s]?\d{4}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "itin", "individual taxpayer", "tax id", "tin" },
            Validator = Validators.UsItinValid
        }));
    }

    public static void EnsureRegistered() { }
}

internal class SsnDetector : IDetector
{
    private static readonly Regex WithSep = new(@"\b\d{3}[-\s.]\d{2}[-\s.]\d{4}\b", RegexOptions.Compiled);
    private static readonly Regex WithoutSep = new(@"\b\d{9}\b", RegexOptions.Compiled);
    private static readonly string[] CtxKeywords = { "ssn", "social security", "social sec", "ss#", "ss #", "social", "tax id", "taxpayer", "tin", "social number", "soc number", "socialnum" };

    public string EntityType => EntityTypes.SSN;
    public bool NeedsDigit => true;

    public List<PIIMatch> IterMatches(string text, string textLower)
    {
        var results = new List<PIIMatch>();

        foreach (Match m in WithSep.Matches(text))
        {
            if (!Validators.SsnValidFormat(m.Value)) continue;
            var hasCtx = HasCtx(textLower, m.Index);
            results.Add(new PIIMatch { EntityType = EntityTypes.SSN, Text = m.Value, Start = m.Index, End = m.Index + m.Length, Score = hasCtx ? 1.0 : 0.85 });
        }

        foreach (Match m in WithoutSep.Matches(text))
        {
            if (!Validators.SsnValidFormat(m.Value)) continue;
            if (!HasCtx(textLower, m.Index)) continue;
            results.Add(new PIIMatch { EntityType = EntityTypes.SSN, Text = m.Value, Start = m.Index, End = m.Index + m.Length, Score = 1.0 });
        }
        return results;
    }

    private static bool HasCtx(string textLower, int start)
    {
        var ws = Math.Max(0, start - 100);
        var we = Math.Min(textLower.Length, start + 100);
        var w = textLower.Substring(ws, we - ws);
        return CtxKeywords.Any(kw => w.Contains(kw));
    }
}
