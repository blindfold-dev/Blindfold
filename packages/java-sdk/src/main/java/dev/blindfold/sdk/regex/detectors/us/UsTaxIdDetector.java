package dev.blindfold.sdk.regex.detectors.us;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

public class UsTaxIdDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("us", UsTaxIdDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile("\\b\\d{2}-\\d{7}\\b");

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "ein", "tax id", "tax identification", "employer identification",
        "tin", "tax #", "ein#"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.TAX_ID;
    }

    @Override
    public double getScore() {
        return 0.80;
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
