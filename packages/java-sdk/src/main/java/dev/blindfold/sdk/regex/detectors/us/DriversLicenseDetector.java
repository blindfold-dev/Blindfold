package dev.blindfold.sdk.regex.detectors.us;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

public class DriversLicenseDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("us", DriversLicenseDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b(?:[A-Z]\\d{14}|[A-Z]\\d{4,8}|[A-Z]{2}\\d{6,10}|\\d{7,9})\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "driver", "license", "licence", "dl", "driver's license",
        "driving license", "dl#", "dl #", "dmv", "permit"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.DRIVERS_LICENSE;
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
