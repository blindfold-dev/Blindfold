package dev.blindfold.sdk.regex.detectors.il;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class IlIdDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("il", IlIdDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b\\d{9}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "teudat zehut", "mispar zehut", "identity number",
        "\u05ea.\u05d6", "tz"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.IL_ID;
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
        return Validators::luhnChecksum;
    }
}
