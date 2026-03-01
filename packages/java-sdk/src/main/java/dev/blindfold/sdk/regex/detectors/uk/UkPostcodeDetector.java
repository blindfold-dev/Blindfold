package dev.blindfold.sdk.regex.detectors.uk;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;

import java.util.regex.Pattern;

public class UkPostcodeDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("uk", UkPostcodeDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b(?:[A-Z]{1,2}\\d[A-Z\\d]?\\s?\\d[A-Z]{2})\\b"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.UK_POSTCODE;
    }

    @Override
    public double getScore() {
        return 0.85;
    }

    @Override
    public Pattern getPattern() {
        return PATTERN;
    }

    @Override
    public boolean needsDigit() {
        return false;
    }
}
