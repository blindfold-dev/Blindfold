using System.Text.RegularExpressions;

namespace Blindfold.Sdk.Local.Detectors;

internal static class RuDetectors
{
    static RuDetectors()
    {
        DetectorRegistration.RegisterRegion("ru", () => new RuInnDetector());

        // Russian SNILS
        DetectorRegistration.RegisterRegion("ru", () => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.RUSNILS,
            Pattern = new Regex(@"\b\d{3}[-\s]?\d{3}[-\s]?\d{3}[-\s]?\d{2}\b", RegexOptions.Compiled),
            Score = 0.85,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "snils", "\u0441\u043d\u0438\u043b\u0441", "pension", "\u043f\u0435\u043d\u0441\u0438" },
            Validator = Validators.RuSnilsChecksum
        }));
    }

    public static void EnsureRegistered() { }
}

internal class RuInnDetector : IDetector
{
    private static readonly Regex Inn10 = new(@"\b\d{10}\b", RegexOptions.Compiled);
    private static readonly Regex Inn12 = new(@"\b\d{12}\b", RegexOptions.Compiled);
    private static readonly string[] CtxKeywords = { "inn", "\u0438\u043d\u043d", "taxpayer", "\u043d\u0430\u043b\u043e\u0433" };

    public string EntityType => EntityTypes.RUINN;
    public bool NeedsDigit => true;

    public List<PIIMatch> IterMatches(string text, string textLower)
    {
        var results = new List<PIIMatch>();
        Process(Inn10, text, textLower, results);
        Process(Inn12, text, textLower, results);
        return results;
    }

    private void Process(Regex pattern, string text, string textLower, List<PIIMatch> results)
    {
        foreach (Match m in pattern.Matches(text))
        {
            var ws = Math.Max(0, m.Index - 50);
            var we = Math.Min(textLower.Length, m.Index + 50);
            var w = textLower.Substring(ws, we - ws);
            if (!CtxKeywords.Any(kw => w.Contains(kw))) continue;
            if (!Validators.RuInnChecksum(m.Value)) continue;
            results.Add(new PIIMatch { EntityType = EntityTypes.RUINN, Text = m.Value, Start = m.Index, End = m.Index + m.Length, Score = 1.0 });
        }
    }
}
