package dev.blindfold.sdk.regex.detectors.sk;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class SkDicDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("sk", SkDicDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\bSK\\d{10}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "dic", "di\u010d", "danove identifikacne cislo",
        "da\u0148ov\u00e9 identifika\u010dn\u00e9 \u010d\u00edslo", "vat", "tax id"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.SK_DIC;
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
        return Validators::skDicValid;
    }
}
