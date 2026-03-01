package dev.blindfold.sdk.regex.detectors.cz;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class CzDicDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("cz", CzDicDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\bCZ\\d{8,10}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "dic", "di\u010d", "danove identifikacni cislo",
        "da\u0148ov\u00e9 identifika\u010dn\u00ed \u010d\u00edslo", "vat", "tax id"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.CZ_DIC;
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
        return Validators::czDicValid;
    }
}
