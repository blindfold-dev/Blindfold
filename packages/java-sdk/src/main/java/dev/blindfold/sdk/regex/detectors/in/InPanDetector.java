package dev.blindfold.sdk.regex.detectors.in;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class InPanDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("in", InPanDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b[A-Z]{3}[ABCFGHLJPT][A-Z]\\d{4}[A-Z]\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "pan", "permanent account number", "income tax", "pan card"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.IN_PAN;
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
    public boolean isContextRequired() {
        return false;
    }

    @Override
    public int getContextWindow() {
        return 50;
    }

    @Override
    public List<String> getContextKeywords() {
        return CONTEXT_KEYWORDS;
    }

    @Override
    public Predicate<String> getValidator() {
        return Validators::inPanValid;
    }
}
