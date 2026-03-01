package dev.blindfold.sdk.regex.detectors.it;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class ItPartitaIvaDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("it", ItPartitaIvaDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b(?:IT)?\\d{11}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "partita iva", "p.iva", "p. iva", "vat", "iva"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.IT_PARTITA_IVA;
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
        return Validators::itPartitaIvaChecksum;
    }
}
