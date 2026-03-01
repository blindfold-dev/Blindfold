package dev.blindfold.sdk.regex.detectors.jp;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class JpMyNumberDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("jp", JpMyNumberDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "my number", "\u30de\u30a4\u30ca\u30f3\u30d0\u30fc",
        "kojin bango", "individual number"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.JP_MY_NUMBER;
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
        return Validators::jpMyNumberChecksum;
    }
}
