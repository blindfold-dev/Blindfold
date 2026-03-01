namespace Blindfold.Sdk.Errors;

public class AuthenticationException : BlindfoldException
{
    public AuthenticationException(string message) : base(message, 401) { }
}
