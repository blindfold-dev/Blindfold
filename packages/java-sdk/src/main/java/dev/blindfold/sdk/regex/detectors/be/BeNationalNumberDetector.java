package dev.blindfold.sdk.regex.detectors.be;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class BeNationalNumberDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("be", BeNationalNumberDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b\\d{2}[. ]?\\d{2}[. ]?\\d{2}[- ]?\\d{3}[. ]?\\d{2}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "rijksregisternummer", "national number", "numero national",
        "registre national", "nn"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.BE_NATIONAL_NUMBER;
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
        return Validators::beNationalNumberChecksum;
    }
}
