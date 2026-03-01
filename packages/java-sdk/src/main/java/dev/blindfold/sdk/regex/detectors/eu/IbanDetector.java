package dev.blindfold.sdk.regex.detectors.eu;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.function.Predicate;
import java.util.regex.Pattern;

public class IbanDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("eu", IbanDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b[A-Z]{2}\\d{2}\\s?[\\dA-Z]{4}(?:\\s?[\\dA-Z]{4}){1,7}(?:\\s?[\\dA-Z]{1,4})?\\b"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.IBAN;
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
    public boolean needsDigit() {
        return false;
    }

    @Override
    public Predicate<String> getValidator() {
        return Validators::ibanMod97;
    }
}
