package dev.blindfold.sdk.regex.detectors.es;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class EsNieDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("es", EsNieDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b[XYZ]\\d{7}[-\\s]?[A-Z]\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "nie", "extranjero", "numero de identidad"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.ES_NIE;
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
        return Validators::esNieLetter;
    }
}
