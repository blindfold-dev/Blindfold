package dev.blindfold.sdk.regex.detectors.de;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class DeTaxIdDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("de", DeTaxIdDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b\\d{2}\\s?\\d{3}\\s?\\d{3}\\s?\\d{3}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "steuer", "tax id", "steueridentifikationsnummer", "tin",
        "identifikationsnummer", "steuernummer"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.DE_TAX_ID;
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
    public List<String> getContextKeywords() {
        return CONTEXT_KEYWORDS;
    }

    @Override
    public Predicate<String> getValidator() {
        return Validators::deTaxIdChecksum;
    }
}
