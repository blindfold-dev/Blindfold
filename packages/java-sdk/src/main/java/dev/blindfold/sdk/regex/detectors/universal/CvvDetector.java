package dev.blindfold.sdk.regex.detectors.universal;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

public class CvvDetector extends RegexDetector {

    static {
        DetectorRegistry.registerUniversal(CvvDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile("\\b\\d{3,4}\\b");

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "cvv", "cvc", "security code", "card verification", "cvv2", "cvc2", "csv"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.CVV;
    }

    @Override
    public double getScore() {
        return 0.80;
    }

    @Override
    public boolean needsDigit() {
        return true;
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
