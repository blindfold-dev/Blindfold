package dev.blindfold.sdk.regex.detectors.pl;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class PlPeselDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("pl", PlPeselDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b\\d{11}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "pesel"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.PL_PESEL;
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
        return Validators::plPeselChecksum;
    }
}
