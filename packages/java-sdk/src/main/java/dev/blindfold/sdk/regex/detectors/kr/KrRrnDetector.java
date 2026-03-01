package dev.blindfold.sdk.regex.detectors.kr;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class KrRrnDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("kr", KrRrnDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b\\d{6}[- ]?\\d{7}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "\uc8fc\ubbfc\ub4f1\ub85d\ubc88\ud638", "resident registration",
        "jumin", "rrn"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.KR_RRN;
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
        return Validators::krRrnChecksum;
    }
}
