package dev.blindfold.sdk.errors;

public class BlindfoldException extends RuntimeException {
    private final int statusCode;

    public BlindfoldException(String message) {
        super(message);
        this.statusCode = 0;
    }

    public BlindfoldException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public BlindfoldException(String message, Throwable cause) {
        super(message, cause);
        this.statusCode = 0;
    }

    public int getStatusCode() { return statusCode; }
}
