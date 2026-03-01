package dev.blindfold.sdk.regex.detectors.de;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

public class DePersonalIdDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("de", DePersonalIdDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b[CFGHJKLMNPRTVWXYZ][0-9A-Z]\\d{7}\\d\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "personalausweis", "personal id", "ausweis", "identifikation",
        "id-nummer", "ausweisnummer"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.DE_PERSONAL_ID;
    }

    @Override
    public double getScore() {
        return 0.75;
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
}
