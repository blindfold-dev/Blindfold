package dev.blindfold.sdk.regex.detectors.ie;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class IePpsDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("ie", IePpsDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b\\d{7}[A-Z]{1,2}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "pps", "ppsn", "personal public service", "revenue"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.IE_PPS;
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
        return false;
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
        return Validators::iePpsChecksum;
    }
}
