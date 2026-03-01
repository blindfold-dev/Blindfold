package dev.blindfold.sdk.regex.detectors.ru;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class RuSnilsDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("ru", RuSnilsDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b\\d{3}[-\\s]?\\d{3}[-\\s]?\\d{3}[-\\s]?\\d{2}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "snils", "\u0441\u043d\u0438\u043b\u0441", "pension",
        "\u043f\u0435\u043d\u0441\u0438\u043e\u043d", "\u0441\u0442\u0440\u0430\u0445\u043e\u0432\u043e\u0435 \u0441\u0432\u0438\u0434\u0435\u0442\u0435\u043b\u044c\u0441\u0442\u0432\u043e"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.RU_SNILS;
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
        return Validators::ruSnilsChecksum;
    }
}
