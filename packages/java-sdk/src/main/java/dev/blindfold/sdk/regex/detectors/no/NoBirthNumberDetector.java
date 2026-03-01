package dev.blindfold.sdk.regex.detectors.no;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class NoBirthNumberDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("no", NoBirthNumberDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b(?:0[1-9]|[12]\\d|3[01])(?:0[1-9]|1[0-2])\\d{7}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "fodselsnummer", "birth number", "personnummer", "f\u00f8dselsnummer"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.NO_BIRTH_NUMBER;
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
        return Validators::noBirthNumberChecksum;
    }
}
