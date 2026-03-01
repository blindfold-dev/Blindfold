package dev.blindfold.sdk.regex.detectors.universal;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;

import java.util.regex.Pattern;

public class MacAddressDetector extends RegexDetector {

    static {
        DetectorRegistry.registerUniversal(MacAddressDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b(?:[0-9A-Fa-f]{2}[:\\-]){5}[0-9A-Fa-f]{2}\\b"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.MAC_ADDRESS;
    }

    @Override
    public double getScore() {
        return 0.95;
    }

    @Override
    public boolean needsDigit() {
        return true;
    }

    @Override
    public Pattern getPattern() {
        return PATTERN;
    }
}
