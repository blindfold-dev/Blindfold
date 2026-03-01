package dev.blindfold.sdk.regex.detectors.tr;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class TrKimlikDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("tr", TrKimlikDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b[1-9]\\d{10}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "tc kimlik", "kimlik no", "tckn", "vatandas", "nufus"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.TR_KIMLIK;
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
        return Validators::trKimlikChecksum;
    }
}
