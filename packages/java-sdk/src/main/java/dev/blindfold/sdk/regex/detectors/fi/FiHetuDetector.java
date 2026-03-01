package dev.blindfold.sdk.regex.detectors.fi;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class FiHetuDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("fi", FiHetuDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b\\d{6}[-+ABCDEFYXWVUabcdefyxwvu]\\d{3}[0-9A-Za-z]\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "henkilotunnus", "hetu", "personal identity code",
        "sosiaaliturvatunnus"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.FI_HETU;
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
        return Validators::fiHetuChecksum;
    }
}
