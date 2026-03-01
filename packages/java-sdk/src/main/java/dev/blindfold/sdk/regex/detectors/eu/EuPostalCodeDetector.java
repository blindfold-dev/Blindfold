package dev.blindfold.sdk.regex.detectors.eu;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

public class EuPostalCodeDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("eu", EuPostalCodeDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b(?:\\d{5}|\\d{4}\\s?[A-Z]{2})\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "postal", "postcode", "post code", "zip", "plz", "postleitzahl", "code postal"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.EU_POSTAL_CODE;
    }

    @Override
    public double getScore() {
        return 0.70;
    }

    @Override
    public Pattern getPattern() {
        return PATTERN;
    }

    @Override
    public boolean isContextRequired() {
        return true;
    }

    @Override
    public int getContextWindow() {
        return 50;
    }

    @Override
    public List<String> getContextKeywords() {
        return CONTEXT_KEYWORDS;
    }
}
