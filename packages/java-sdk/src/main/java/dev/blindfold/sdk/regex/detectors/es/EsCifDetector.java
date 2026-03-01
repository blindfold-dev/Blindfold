package dev.blindfold.sdk.regex.detectors.es;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class EsCifDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("es", EsCifDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b[A-HJ-NP-SUVW]\\d{7}[0-9A-J]\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "cif", "codigo de identificacion fiscal", "tax id", "nif empresa"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.ES_CIF;
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
        return Validators::esCifChecksum;
    }
}
