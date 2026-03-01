namespace Blindfold.Sdk.Errors;

public class ApiException : BlindfoldException
{
    public ApiException(string message, int statusCode) : base(message, statusCode) { }
}
