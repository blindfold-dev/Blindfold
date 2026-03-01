package dev.blindfold.sdk.regex.detectors.ch;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class ChAhvDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("ch", ChAhvDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b756[. ]?\\d{4}[. ]?\\d{4}[. ]?\\d{2}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "ahv", "avs", "oasi", "sozialversicherungsnummer", "ahv-nr"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.CH_AHV;
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
        return Validators::chAhvChecksum;
    }
}
