package dev.blindfold.sdk.regex.detectors.in;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class InAadhaarDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("in", InAadhaarDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b[2-9]\\d{3}[- ]?\\d{4}[- ]?\\d{4}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "aadhaar", "aadhar", "uidai", "unique identification"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.IN_AADHAAR;
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

    @Override
    public Predicate<String> getValidator() {
        return Validators::inAadhaarChecksum;
    }
}
