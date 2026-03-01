package dev.blindfold.sdk.errors;

public class AuthenticationException extends BlindfoldException {
    public AuthenticationException(String message) {
        super(message, 401);
    }
}
