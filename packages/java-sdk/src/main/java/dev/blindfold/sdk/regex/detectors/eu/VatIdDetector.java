package dev.blindfold.sdk.regex.detectors.eu;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;

import java.util.regex.Pattern;

public class VatIdDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("eu", VatIdDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b(?:ATU\\d{8}|BE[01]\\d{9}|DE\\d{9}|DK\\d{8}|ES[A-Z0-9]\\d{7}[A-Z0-9]|FI\\d{8}|FR[A-Z0-9]{2}\\d{9}|IT\\d{11}|LU\\d{8}|NL\\d{9}B\\d{2}|PL\\d{10}|PT\\d{9}|SE\\d{12})\\b"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.VAT_ID;
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
}
