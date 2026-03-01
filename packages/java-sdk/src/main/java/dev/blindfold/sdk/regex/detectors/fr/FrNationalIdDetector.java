package dev.blindfold.sdk.regex.detectors.fr;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class FrNationalIdDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("fr", FrNationalIdDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b[12]\\s?\\d{2}\\s?(?:0[1-9]|1[0-2]|[2-9]\\d)\\s?\\d{2,3}\\s?\\d{3}\\s?\\d{3}\\s?\\d{2}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "nir", "securite sociale", "social security", "numero national", "insee"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.FR_NATIONAL_ID;
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
        return Validators::frNirChecksum;
    }
}
