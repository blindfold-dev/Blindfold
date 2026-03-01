package dev.blindfold.sdk.regex.detectors.ro;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class RoCnpDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("ro", RoCnpDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b[1-8]\\d{12}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "cnp", "cod numeric personal", "personal numeric code"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.RO_CNP;
    }

    @Override
    public double getScore() {
        return 0.90;
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
        return Validators::roCnpChecksum;
    }
}
