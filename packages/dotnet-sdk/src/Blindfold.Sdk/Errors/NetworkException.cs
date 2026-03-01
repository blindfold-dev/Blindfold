namespace Blindfold.Sdk.Errors;

public class NetworkException : BlindfoldException
{
    public NetworkException(string message) : base(message) { }

    public NetworkException(string message, Exception innerException) : base(message, innerException) { }
}
