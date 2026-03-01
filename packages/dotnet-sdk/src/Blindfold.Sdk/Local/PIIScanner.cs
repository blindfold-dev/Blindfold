using System.Security.Cryptography;
using System.Text;

namespace Blindfold.Sdk.Local;

internal class TokenizeResult
{
    public string Text { get; set; } = "";
    public Dictionary<string, string> Mapping { get; set; } = new();
    public List<PIIMatch> Matches { get; set; } = new();
}

internal class TextResult
{
    public string Text { get; set; } = "";
    public List<PIIMatch> Matches { get; set; } = new();
}

internal class PIIScanner
{
    private readonly List<IDetector> _detectors;

    public PIIScanner(string[]? locales)
    {
        _detectors = DetectorRegistration.BuildDetectors(locales);
    }

    // ---- Detect ----

    public List<PIIMatch> Detect(string text, List<string>? entities)
    {
        var detectors = _detectors;
        if (entities != null && entities.Count > 0)
        {
            var entitySet = new HashSet<string>(entities);
            detectors = detectors.Where(d => entitySet.Contains(d.EntityType)).ToList();
        }

        var textHasDigit = text.Any(char.IsDigit);
        var textLower = text.ToLowerInvariant();

        var allMatches = new List<PIIMatch>();
        foreach (var d in detectors)
        {
            if (d.NeedsDigit && !textHasDigit)
                continue;
            allMatches.AddRange(d.IterMatches(text, textLower));
        }

        return Deduplicate(allMatches);
    }

    // ---- Tokenize ----

    public TokenizeResult Tokenize(string text, List<string>? entities)
    {
        var matches = Detect(text, entities);
        if (matches.Count == 0)
            return new TokenizeResult { Text = text };

        var counters = new Dictionary<string, int>();
        var entries = new List<(PIIMatch Match, string Token)>();
        var mapping = new Dictionary<string, string>();

        foreach (var m in matches)
        {
            if (!counters.ContainsKey(m.EntityType)) counters[m.EntityType] = 0;
            counters[m.EntityType]++;
            var token = $"<{m.EntityType}_{counters[m.EntityType]}>";
            entries.Add((m, token));
            mapping[token] = m.Text;
        }

        var result = text;
        for (var i = entries.Count - 1; i >= 0; i--)
        {
            var (match, token) = entries[i];
            result = result.Substring(0, match.Start) + token + result.Substring(match.End);
        }

        return new TokenizeResult { Text = result, Mapping = mapping, Matches = matches };
    }

    // ---- Detokenize ----

    public string Detokenize(string text, Dictionary<string, string>? mapping)
    {
        if (mapping == null || mapping.Count == 0)
            return text;

        var tokens = mapping.Keys.OrderByDescending(k => k.Length).ToList();
        var result = text;
        foreach (var token in tokens)
            result = result.Replace(token, mapping[token]);
        return result;
    }

    // ---- Redact ----

    public TextResult Redact(string text, List<string>? entities)
    {
        var matches = Detect(text, entities);
        if (matches.Count == 0)
            return new TextResult { Text = text, Matches = matches };

        var result = text;
        for (var i = matches.Count - 1; i >= 0; i--)
        {
            var m = matches[i];
            var start = m.Start;
            if (start > 0 && result[start - 1] == ' ')
                start--;
            result = result.Substring(0, start) + result.Substring(m.End);
        }

        return new TextResult { Text = result, Matches = matches };
    }

    // ---- Mask ----

    public TextResult Mask(string text, int charsToShow, bool fromEnd, string maskingChar, List<string>? entities)
    {
        var matches = Detect(text, entities);
        if (matches.Count == 0)
            return new TextResult { Text = text, Matches = matches };

        var result = text;
        for (var i = matches.Count - 1; i >= 0; i--)
        {
            var m = matches[i];
            var original = m.Text;
            var show = Math.Min(charsToShow, original.Length);
            var maskLen = original.Length - show;

            string masked;
            if (fromEnd)
                masked = new string(maskingChar[0], maskLen) + original.Substring(maskLen);
            else
                masked = original.Substring(0, show) + new string(maskingChar[0], maskLen);

            result = result.Substring(0, m.Start) + masked + result.Substring(m.End);
        }

        return new TextResult { Text = result, Matches = matches };
    }

    // ---- Hash ----

    public TextResult Hash(string text, string hashType, string hashPrefix, int hashLength, List<string>? entities)
    {
        var matches = Detect(text, entities);
        if (matches.Count == 0)
            return new TextResult { Text = text, Matches = matches };

        using var sha = SHA256.Create();
        var result = text;
        for (var i = matches.Count - 1; i >= 0; i--)
        {
            var m = matches[i];
            var hash = sha.ComputeHash(Encoding.UTF8.GetBytes(m.Text));
            var hexStr = BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
            if (hashLength < hexStr.Length)
                hexStr = hexStr.Substring(0, hashLength);
            var replacement = hashPrefix + hexStr;
            result = result.Substring(0, m.Start) + replacement + result.Substring(m.End);
        }

        return new TextResult { Text = result, Matches = matches };
    }

    // ---- Encrypt ----

    public TextResult Encrypt(string text, string encryptionKey, List<string>? entities)
    {
        if (encryptionKey.Length < 16)
            throw new ArgumentException("encryption_key is required and must be at least 16 characters for local encryption");

        var matches = Detect(text, entities);
        if (matches.Count == 0)
            return new TextResult { Text = text, Matches = matches };

        using var sha = SHA256.Create();
        var keyHash = sha.ComputeHash(Encoding.UTF8.GetBytes(encryptionKey));

        var result = text;
        for (var i = matches.Count - 1; i >= 0; i--)
        {
            var m = matches[i];
            using var aes = Aes.Create();
            aes.Key = keyHash;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;
            aes.GenerateIV();

            using var encryptor = aes.CreateEncryptor();
            var plaintext = Encoding.UTF8.GetBytes(m.Text);
            var ciphertext = encryptor.TransformFinalBlock(plaintext, 0, plaintext.Length);

            var combined = new byte[aes.IV.Length + ciphertext.Length];
            Buffer.BlockCopy(aes.IV, 0, combined, 0, aes.IV.Length);
            Buffer.BlockCopy(ciphertext, 0, combined, aes.IV.Length, ciphertext.Length);

            var replacement = Convert.ToBase64String(combined);
            result = result.Substring(0, m.Start) + replacement + result.Substring(m.End);
        }

        return new TextResult { Text = result, Matches = matches };
    }

    // ---- Synthesize ----

    public TextResult Synthesize(string text, string? language, List<string>? entities)
    {
        var matches = Detect(text, entities);
        if (matches.Count == 0)
            return new TextResult { Text = text, Matches = matches };

        var result = text;
        for (var i = matches.Count - 1; i >= 0; i--)
        {
            var m = matches[i];
            var replacement = Synthesizers.SynthesizeValue(m.EntityType, m.Text);
            result = result.Substring(0, m.Start) + replacement + result.Substring(m.End);
        }

        return new TextResult { Text = result, Matches = matches };
    }

    // ---- Deduplication ----

    private static List<PIIMatch> Deduplicate(List<PIIMatch> matches)
    {
        if (matches.Count == 0) return matches;

        matches.Sort((a, b) =>
        {
            var cmp = a.Start.CompareTo(b.Start);
            if (cmp != 0) return cmp;
            cmp = b.Score.CompareTo(a.Score); // higher score first
            if (cmp != 0) return cmp;
            return (b.End - b.Start).CompareTo(a.End - a.Start); // longer first
        });

        var result = new List<PIIMatch>();
        var lastEnd = -1;
        foreach (var m in matches)
        {
            if (m.Start >= lastEnd)
            {
                result.Add(m);
                lastEnd = m.End;
            }
        }
        return result;
    }
}
