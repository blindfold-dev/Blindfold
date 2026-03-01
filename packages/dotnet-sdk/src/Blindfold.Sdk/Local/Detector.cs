namespace Blindfold.Sdk.Local;

internal interface IDetector
{
    string EntityType { get; }
    bool NeedsDigit { get; }
    List<PIIMatch> IterMatches(string text, string textLower);
}
