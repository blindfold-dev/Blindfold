package dev.blindfold.sdk.regex.detectors.lv;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class LvPersonalCodeDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("lv", LvPersonalCodeDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b\\d{6}-?\\d{5}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "personas kods", "personal code", "personas"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.LV_PERSONAL_CODE;
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
        return Validators::lvPersonalCodeChecksum;
    }
}
