using System.Text.RegularExpressions;

namespace Blindfold.Sdk.Local.Detectors;

internal static class UniversalDetectors
{
    static UniversalDetectors()
    {
        // Email
        DetectorRegistration.RegisterUniversal(() => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.EmailAddress,
            Pattern = new Regex(@"\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b", RegexOptions.Compiled),
            Score = 0.95,
            PreCheck = s => s.Contains("@")
        }));

        // URL
        DetectorRegistration.RegisterUniversal(() => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.URL,
            Pattern = new Regex(@"https?://(?:[\w\-]+\.)+[a-zA-Z]{2,}(?:/[^\s<>""'\)\]]*)?", RegexOptions.Compiled),
            Score = 0.85,
            Validator = Validators.UrlValidTld,
            PreCheck = s => s.Contains("://")
        }));

        // MAC Address
        DetectorRegistration.RegisterUniversal(() => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.MACAddress,
            Pattern = new Regex(@"\b(?:[0-9A-Fa-f]{2}[:\-]){5}[0-9A-Fa-f]{2}\b", RegexOptions.Compiled),
            Score = 0.95,
            NeedsDigit = true
        }));

        // CVV
        DetectorRegistration.RegisterUniversal(() => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.CVV,
            Pattern = new Regex(@"\b\d{3,4}\b", RegexOptions.Compiled),
            Score = 0.80,
            NeedsDigit = true,
            ContextRequired = true,
            ContextKeywords = new[] { "cvv", "cvc", "cvv2", "cvc2", "security code", "card verification", "cid" }
        }));

        // Credit Card (custom)
        DetectorRegistration.RegisterUniversal(() => new CreditCardDetector());

        // Phone (custom)
        DetectorRegistration.RegisterUniversal(() => new PhoneDetector());

        // Date of Birth
        DetectorRegistration.RegisterUniversal(() => new RegexDetector(new RegexDetectorConfig
        {
            EntityType = EntityTypes.DateOfBirth,
            Pattern = new Regex(@"(?:^|[^\d])(?:(?:0?[1-9]|1[0-2])[/\-.](?:0?[1-9]|[12]\d|3[01])[/\-.](?:19|20)\d{2}|(?:0?[1-9]|[12]\d|3[01])[/\-.](?:0?[1-9]|1[0-2])[/\-.](?:19|20)\d{2}|(?:19|20)\d{2}[/\-.](?:0?[1-9]|1[0-2])[/\-.](?:0?[1-9]|[12]\d|3[01])|(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+(?:0?[1-9]|[12]\d|3[01])(?:st|nd|rd|th)?,?\s+(?:19|20)\d{2}|(?:0?[1-9]|[12]\d|3[01])(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?,?\s+(?:19|20)\d{2}|(?:0?[1-9]|[12]\d|3[01])[/\-.](?:0?[1-9]|1[0-2])[/\-.]\d{2}(?:[^\d]|$)|(?:0?[1-9]|1[0-2])[/\-.](?:0?[1-9]|[12]\d|3[01])[/\-.]\d{2}(?:[^\d]|$))", RegexOptions.Compiled | RegexOptions.IgnoreCase),
            Score = 0.75,
            NeedsDigit = true,
            ContextRequired = true,
            ContextWindow = 100,
            ContextKeywords = new[] { "born", "dob", "date of birth", "birthday", "birthdate", "d.o.b", "birth date", "birth", "b-day", "bday", "age", "d/o/b", "born on", "date de naissance", "geburtsdatum", "fecha de nacimiento", "geboortedatum", "data di nascita" },
            Validator = Validators.ValidDate
        }));

        // IP Address (custom)
        DetectorRegistration.RegisterUniversal(() => new IpAddressDetector());
    }

    public static void EnsureRegistered() { }
}

// ---- Credit Card (custom) ----

internal class CreditCardDetector : IDetector
{
    private static readonly Regex KnownIIN = new(
        @"\b(?:4\d{3}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}(?:[-\s]?\d{3})?|5[1-5]\d{2}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}|3[47]\d{1,2}[-\s]?\d{4,6}[-\s]?\d{4,5}(?:[-\s]?\d{3,4})?|6(?:011|5\d{2}|4[4-9]\d|22[1-9]|2[3-6]\d{2}|27[01]\d|2720)[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}|(?:2131|1800|35\d{3})[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{3,4}|3(?:0[0-5]|[68]\d)\d[-\s]?\d{4,6}[-\s]?\d{4,5})\b", RegexOptions.Compiled);
    private static readonly Regex Generic = new(@"\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{1,7}\b", RegexOptions.Compiled);
    private static readonly string[] CtxKeywords = { "credit card", "card number", "card no", "card #", "cc:", "cc #", "payment card", "debit card", "billing", "card:", "credit", "payment" };

    public string EntityType => EntityTypes.CreditCard;
    public bool NeedsDigit => true;

    public List<PIIMatch> IterMatches(string text, string textLower)
    {
        var results = new List<PIIMatch>();
        var knownRanges = new List<(int Start, int End)>();

        foreach (Match m in KnownIIN.Matches(text))
        {
            if (Validators.LuhnChecksum(m.Value))
            {
                results.Add(new PIIMatch { EntityType = EntityTypes.CreditCard, Text = m.Value, Start = m.Index, End = m.Index + m.Length, Score = 1.0 });
                knownRanges.Add((m.Index, m.Index + m.Length));
            }
        }

        foreach (Match m in Generic.Matches(text))
        {
            var start = m.Index; var end = m.Index + m.Length;
            if (knownRanges.Any(r => start < r.End && end > r.Start)) continue;
            if (!HasContextWindow(textLower, start, 100, CtxKeywords)) continue;
            if (Validators.LuhnChecksum(m.Value))
                results.Add(new PIIMatch { EntityType = EntityTypes.CreditCard, Text = m.Value, Start = start, End = end, Score = 1.0 });
        }
        return results;
    }

    private static bool HasContextWindow(string textLower, int start, int window, string[] keywords)
    {
        var ws = Math.Max(0, start - window);
        var we = Math.Min(textLower.Length, start + window);
        var w = textLower.Substring(ws, we - ws);
        return keywords.Any(kw => w.Contains(kw));
    }
}

// ---- Phone (custom) ----

internal class PhoneDetector : IDetector
{
    private static readonly Regex PhonePattern = new(
        @"(?:(?:\+?1[-. ]?)?\([2-9]\d{2}\)[-. ]?[2-9]\d{2}[-. ]?\d{4}|(?:\+?1[-. ]?)?[2-9]\d{2}[-. ][2-9]\d{2}[-. ]?\d{4}|\+[1-9]\d{0,2}[-. ]?\(?\d{1,4}\)?[-. ]?\d{1,4}[-. ]?\d{1,9}|0\d{1,3}[-. ]\d{2,4}[-. ]?\d{2,4}[-. ]?\d{0,4})(?:\s?(?:x|ext\.?)\s?\d{1,5})?", RegexOptions.Compiled);
    private static readonly string[] CtxKeywords = { "phone", "tel", "telephone", "call", "mobile", "cell", "fax", "contact", "dial", "reach", "ring", "text", "sms", "whatsapp", "number", "ph#", "ph #", "cell#", "cell #" };

    public string EntityType => EntityTypes.PhoneNumber;
    public bool NeedsDigit => true;

    public List<PIIMatch> IterMatches(string text, string textLower)
    {
        var results = new List<PIIMatch>();
        foreach (Match m in PhonePattern.Matches(text))
        {
            var start = m.Index; var end = m.Index + m.Length;
            if (start > 0 && text[start - 1] >= '0' && text[start - 1] <= '9') continue;
            if (end < text.Length && text[end] >= '0' && text[end] <= '9') continue;
            if (!Validators.PhoneLengthCheck(m.Value)) continue;
            var hasCtx = HasContextWindow(textLower, start, 80, CtxKeywords);
            results.Add(new PIIMatch { EntityType = EntityTypes.PhoneNumber, Text = m.Value, Start = start, End = end, Score = hasCtx ? 1.0 : 0.85 });
        }
        return results;
    }

    private static bool HasContextWindow(string textLower, int start, int window, string[] keywords)
    {
        var ws = Math.Max(0, start - window);
        var we = Math.Min(textLower.Length, start + window);
        var w = textLower.Substring(ws, we - ws);
        return keywords.Any(kw => w.Contains(kw));
    }
}

// ---- IP Address (custom) ----

internal class IpAddressDetector : IDetector
{
    private static readonly Regex Ipv4 = new(@"\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b", RegexOptions.Compiled);
    private static readonly Regex Ipv6 = new(@"\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b|\b(?:[0-9a-fA-F]{1,4}:){1,7}:\b|\b::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}\b", RegexOptions.Compiled);
    private static readonly Regex VersionPrefix = new(@"(?:v|version\s*)$", RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public string EntityType => EntityTypes.IPAddress;
    public bool NeedsDigit => true;

    public List<PIIMatch> IterMatches(string text, string textLower)
    {
        var results = new List<PIIMatch>();
        foreach (Match m in Ipv4.Matches(text))
        {
            var before = text.Substring(0, m.Index);
            if (VersionPrefix.IsMatch(before)) continue;
            results.Add(new PIIMatch { EntityType = EntityTypes.IPAddress, Text = m.Value, Start = m.Index, End = m.Index + m.Length, Score = 0.95 });
        }
        foreach (Match m in Ipv6.Matches(text))
        {
            results.Add(new PIIMatch { EntityType = EntityTypes.IPAddress, Text = m.Value, Start = m.Index, End = m.Index + m.Length, Score = 0.95 });
        }
        return results;
    }
}
