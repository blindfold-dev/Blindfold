using System.Text.RegularExpressions;

namespace Blindfold.Sdk.Local;

internal class RegexDetectorConfig
{
    public string EntityType { get; set; } = "";
    public Regex Pattern { get; set; } = null!;
    public double Score { get; set; }
    public double? BaseScore { get; set; }
    public bool NeedsDigit { get; set; }
    public bool ContextRequired { get; set; }
    public string[]? ContextKeywords { get; set; }
    public int ContextWindow { get; set; } = 50;
    public Func<string, bool>? Validator { get; set; }
    public Func<string, bool>? PreCheck { get; set; }
}

internal class RegexDetector : IDetector
{
    private readonly string _entityType;
    private readonly Regex _pattern;
    private readonly double _score;
    private readonly double? _baseScore;
    private readonly bool _needsDigit;
    private readonly bool _contextRequired;
    private readonly string[]? _contextKeywords;
    private readonly int _contextWindow;
    private readonly Func<string, bool>? _validator;
    private readonly Func<string, bool>? _preCheck;

    public RegexDetector(RegexDetectorConfig config)
    {
        _entityType = config.EntityType;
        _pattern = config.Pattern;
        _score = config.Score;
        _baseScore = config.BaseScore;
        _needsDigit = config.NeedsDigit;
        _contextRequired = config.ContextRequired;
        _contextKeywords = config.ContextKeywords;
        _contextWindow = config.ContextWindow > 0 ? config.ContextWindow : 50;
        _validator = config.Validator;
        _preCheck = config.PreCheck;
    }

    public string EntityType => _entityType;
    public bool NeedsDigit => _needsDigit;

    public List<PIIMatch> IterMatches(string text, string textLower)
    {
        if (_preCheck != null && !_preCheck(text))
            return new List<PIIMatch>();

        var matches = _pattern.Matches(text);
        if (matches.Count == 0)
            return new List<PIIMatch>();

        var results = new List<PIIMatch>();
        foreach (Match m in matches)
        {
            var start = m.Index;
            var end = m.Index + m.Length;
            var matchedText = m.Value;

            var hasCtx = HasContext(textLower, start, end);

            if (_contextRequired && !hasCtx)
                continue;

            double score;
            if (_validator != null)
            {
                if (!_validator(matchedText))
                    continue;

                score = hasCtx ? 1.0 : _score;
            }
            else
            {
                if (hasCtx)
                    score = _score;
                else if (_baseScore.HasValue)
                    score = _baseScore.Value;
                else
                    score = _score;
            }

            results.Add(new PIIMatch
            {
                EntityType = _entityType,
                Text = matchedText,
                Start = start,
                End = end,
                Score = score
            });
        }

        return results;
    }

    private bool HasContext(string textLower, int start, int end)
    {
        if (_contextKeywords == null || _contextKeywords.Length == 0)
            return true;

        var windowStart = Math.Max(0, start - _contextWindow);
        var windowEnd = Math.Min(textLower.Length, end + _contextWindow);
        var before = textLower.Substring(windowStart, start - windowStart);
        var after = textLower.Substring(end, windowEnd - end);
        var window = before + " " + after;

        foreach (var kw in _contextKeywords)
        {
            if (window.Contains(kw))
                return true;
        }
        return false;
    }
}
