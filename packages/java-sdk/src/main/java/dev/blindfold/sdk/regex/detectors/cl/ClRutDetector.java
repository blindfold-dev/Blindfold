package dev.blindfold.sdk.regex.detectors.cl;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class ClRutDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("cl", ClRutDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b\\d{1,2}\\.?\\d{3}\\.?\\d{3}-?[\\dkK]\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "rut", "run", "rol unico tributario", "rol unico nacional"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.CL_RUT;
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
        return Validators::clRutChecksum;
    }
}
