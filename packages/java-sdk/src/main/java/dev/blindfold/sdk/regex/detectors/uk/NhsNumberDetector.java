package dev.blindfold.sdk.regex.detectors.uk;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class NhsNumberDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("uk", NhsNumberDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b\\d{3}\\s?\\d{3}\\s?\\d{4}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "nhs", "national health", "nhs number", "nhs#"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.NHS_NUMBER;
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
    public List<String> getContextKeywords() {
        return CONTEXT_KEYWORDS;
    }

    @Override
    public Predicate<String> getValidator() {
        return Validators::nhsChecksum;
    }
}
