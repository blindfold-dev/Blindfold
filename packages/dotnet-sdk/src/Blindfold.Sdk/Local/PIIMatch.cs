namespace Blindfold.Sdk.Local;

internal class PIIMatch
{
    public string EntityType { get; set; } = "";
    public string Text { get; set; } = "";
    public int Start { get; set; }
    public int End { get; set; }
    public double Score { get; set; }
}
