package dev.blindfold.sdk.regex.detectors.universal;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;

import java.util.regex.Pattern;

public class EmailDetector extends RegexDetector {

    static {
        DetectorRegistry.registerUniversal(EmailDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}\\b"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.EMAIL_ADDRESS;
    }

    @Override
    public double getScore() {
        return 0.95;
    }

    @Override
    public boolean needsDigit() {
        return false;
    }

    @Override
    public Pattern getPattern() {
        return PATTERN;
    }

    @Override
    public boolean preCheck(String text) {
        return text.contains("@");
    }
}
