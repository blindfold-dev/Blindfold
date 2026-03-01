package dev.blindfold.sdk.regex.detectors.universal;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.function.Predicate;
import java.util.regex.Pattern;

public class UrlDetector extends RegexDetector {

    static {
        DetectorRegistry.registerUniversal(UrlDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "https?://(?:[\\w\\-]+\\.)+[a-zA-Z]{2,}(?:/[^\\s<>\"')\\]]*)?");

    @Override
    public EntityType getEntityType() {
        return EntityType.URL;
    }

    @Override
    public double getScore() {
        return 0.85;
    }

    @Override
    public boolean needsDigit() {
        return false;
    }

    @Override
    public Pattern getPattern() {
        return PATTERN;
    }

    @Override
    public boolean preCheck(String text) {
        return text.contains("://");
    }

    @Override
    public Predicate<String> getValidator() {
        return Validators::urlValidTld;
    }
}
