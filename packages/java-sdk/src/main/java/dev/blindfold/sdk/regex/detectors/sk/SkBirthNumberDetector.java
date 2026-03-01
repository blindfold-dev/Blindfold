package dev.blindfold.sdk.regex.detectors.sk;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class SkBirthNumberDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("sk", SkBirthNumberDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b\\d{6}/?\\d{3,4}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "rodne cislo", "birth number", "rc", "rodn\u00e9 \u010d\u00edslo"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.SK_BIRTH_NUMBER;
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
        return Validators::skBirthNumberValid;
    }
}
