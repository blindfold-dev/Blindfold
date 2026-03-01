package dev.blindfold.sdk.regex.detectors.dk;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class DkCprDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("dk", DkCprDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b(?:0[1-9]|[12]\\d|3[01])(?:0[1-9]|1[0-2])\\d{2}[-\\s]?\\d{4}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "cpr", "personnummer", "cpr-nummer", "central person"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.DK_CPR;
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

    @Override
    public Predicate<String> getValidator() {
        return Validators::dkCprValidDate;
    }
}
