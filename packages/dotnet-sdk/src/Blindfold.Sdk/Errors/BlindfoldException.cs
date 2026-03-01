namespace Blindfold.Sdk.Errors;

public class BlindfoldException : Exception
{
    public int? StatusCode { get; }

    public BlindfoldException(string message) : base(message) { }

    public BlindfoldException(string message, int statusCode) : base(message)
    {
        StatusCode = statusCode;
    }

    public BlindfoldException(string message, Exception innerException) : base(message, innerException) { }
}
