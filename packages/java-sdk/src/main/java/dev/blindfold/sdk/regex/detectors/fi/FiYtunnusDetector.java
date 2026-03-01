package dev.blindfold.sdk.regex.detectors.fi;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class FiYtunnusDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("fi", FiYtunnusDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b\\d{7}-\\d\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "y-tunnus", "ytunnus", "business id", "yritystunnus", "fo-nummer"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.FI_YTUNNUS;
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
        return Validators::fiYtunnusChecksum;
    }
}
