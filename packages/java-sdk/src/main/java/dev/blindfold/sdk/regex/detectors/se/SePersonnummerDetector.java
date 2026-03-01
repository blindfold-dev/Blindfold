package dev.blindfold.sdk.regex.detectors.se;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class SePersonnummerDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("se", SePersonnummerDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b(?:\\d{8}|\\d{6})[-+]?\\d{4}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "personnummer", "personal number", "pnr"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.SE_PERSONNUMMER;
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
        return Validators::sePersonnummerLuhn;
    }
}
