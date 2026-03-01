package dev.blindfold.sdk.errors;

public class ApiException extends BlindfoldException {
    public ApiException(String message, int statusCode) {
        super(message, statusCode);
    }
}
