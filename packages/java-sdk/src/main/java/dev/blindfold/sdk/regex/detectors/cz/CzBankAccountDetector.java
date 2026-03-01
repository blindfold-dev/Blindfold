package dev.blindfold.sdk.regex.detectors.cz;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class CzBankAccountDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("cz", CzBankAccountDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b(?:\\d{1,6}-)?\\d{2,10}/\\d{4}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "ucet", "\u00fa\u010det", "cislo uctu", "\u010d\u00edslo \u00fa\u010dtu",
        "bank account", "bankovni", "bankovn\u00ed"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.CZ_BANK_ACCOUNT;
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
        return Validators::czBankAccountValid;
    }
}
