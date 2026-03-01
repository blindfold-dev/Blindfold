package dev.blindfold.sdk.regex.detectors.uk;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;

import java.util.regex.Pattern;

public class NiNumberDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("uk", NiNumberDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b(?!BG)(?!GB)(?!NK)(?!KN)(?!TN)(?!NT)(?!ZZ)[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]\\s?\\d{2}\\s?\\d{2}\\s?\\d{2}\\s?[A-D]\\b"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.NI_NUMBER;
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
