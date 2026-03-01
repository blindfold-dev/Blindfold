package dev.blindfold.sdk.regex.detectors.us;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class ZipCodeDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("us", ZipCodeDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile("\\b\\d{5}(?:-\\d{4})?\\b");

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "zip", "postal", "zip code", "zipcode", "postal code", "address",
        "city", "state", "mailing", "shipping", "billing", "delivery",
        "location", "resident", "zip+4", "usa", "united states"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.ZIP_CODE;
    }

    @Override
    public double getScore() {
        return 0.70;
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
        return 150;
    }

    @Override
    public List<String> getContextKeywords() {
        return CONTEXT_KEYWORDS;
    }

    @Override
    public Predicate<String> getValidator() {
        return Validators::zipValid;
    }
}
