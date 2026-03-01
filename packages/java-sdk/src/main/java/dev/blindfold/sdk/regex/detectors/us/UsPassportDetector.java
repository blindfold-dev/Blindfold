package dev.blindfold.sdk.regex.detectors.us;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

public class UsPassportDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("us", UsPassportDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile("\\b\\d{9}\\b");

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "passport", "passport#", "passport #", "passport number", "passport no"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.US_PASSPORT;
    }

    @Override
    public double getScore() {
        return 0.75;
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
}
