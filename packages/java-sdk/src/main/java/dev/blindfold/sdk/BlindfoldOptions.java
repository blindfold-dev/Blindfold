package dev.blindfold.sdk;

import java.time.Duration;
import java.util.List;

public class BlindfoldOptions {
    private final String apiKey;
    private final String region;
    private final String baseUrl;
    private final String mode;
    private final List<String> locales;
    private final int maxRetries;
    private final Duration retryDelay;
    private final Duration timeout;
    private final String userId;

    private BlindfoldOptions(Builder builder) {
        this.apiKey = builder.apiKey;
        this.region = builder.region;
        this.baseUrl = builder.baseUrl;
        this.mode = builder.mode;
        this.locales = builder.locales;
        this.maxRetries = builder.maxRetries;
        this.retryDelay = builder.retryDelay;
        this.timeout = builder.timeout;
        this.userId = builder.userId;
    }

    public static Builder builder() { return new Builder(); }

    // Getters
    public String getApiKey() { return apiKey; }
    public String getRegion() { return region; }
    public String getBaseUrl() { return baseUrl; }
    public String getMode() { return mode; }
    public List<String> getLocales() { return locales; }
    public int getMaxRetries() { return maxRetries; }
    public Duration getRetryDelay() { return retryDelay; }
    public Duration getTimeout() { return timeout; }
    public String getUserId() { return userId; }

    public static class Builder {
        private String apiKey;
        private String region;
        private String baseUrl;
        private String mode;
        private List<String> locales;
        private int maxRetries = 2;
        private Duration retryDelay = Duration.ofMillis(500);
        private Duration timeout = Duration.ofSeconds(30);
        private String userId;

        public Builder apiKey(String apiKey) { this.apiKey = apiKey; return this; }
        public Builder region(String region) { this.region = region; return this; }
        public Builder baseUrl(String baseUrl) { this.baseUrl = baseUrl; return this; }
        public Builder mode(String mode) { this.mode = mode; return this; }
        public Builder locales(List<String> locales) { this.locales = locales; return this; }
        public Builder maxRetries(int maxRetries) { this.maxRetries = maxRetries; return this; }
        public Builder retryDelay(Duration retryDelay) { this.retryDelay = retryDelay; return this; }
        public Builder timeout(Duration timeout) { this.timeout = timeout; return this; }
        public Builder userId(String userId) { this.userId = userId; return this; }
        public BlindfoldOptions build() { return new BlindfoldOptions(this); }
    }
}
