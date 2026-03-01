package dev.blindfold.sdk.regex.detectors.it;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class ItCodiceFiscaleDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("it", ItCodiceFiscaleDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b[A-Z]{6}\\d{2}[A-Z]\\d{2}[A-Z]\\d{3}[A-Z]\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "codice fiscale", "cf", "fiscal code"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.IT_CODICE_FISCALE;
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
        return Validators::itCodiceFiscaleCheck;
    }
}
