package dev.blindfold.sdk.regex.detectors.si;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class SiEmsoDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("si", SiEmsoDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b\\d{13}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "emso", "enotna maticna stevilka", "maticna stevilka",
        "personal number"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.SI_EMSO;
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
        return Validators::siEmsoChecksum;
    }
}
