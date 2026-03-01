package dev.blindfold.sdk.regex.detectors.ru;

import dev.blindfold.sdk.regex.Detector;
import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.PIIMatch;
import dev.blindfold.sdk.regex.Validators;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RuInnDetector extends Detector {

    static {
        DetectorRegistry.registerRegion("ru", RuInnDetector::new);
    }

    private static final Pattern PATTERN_10 = Pattern.compile("\\b\\d{10}\\b");
    private static final Pattern PATTERN_12 = Pattern.compile("\\b\\d{12}\\b");

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "inn", "\u0438\u043d\u043d", "taxpayer", "\u043d\u0430\u043b\u043e\u0433"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.RU_INN;
    }

    @Override
    public double getScore() {
        return 0.85;
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
    public List<PIIMatch> iterMatches(String text) {
        List<PIIMatch> results = new ArrayList<>();
        processPattern(PATTERN_10, text, results);
        processPattern(PATTERN_12, text, results);
        return results;
    }

    private void processPattern(Pattern pattern, String text, List<PIIMatch> results) {
        Matcher matcher = pattern.matcher(text);
        while (matcher.find()) {
            String matchedText = matcher.group();
            int start = matcher.start();
            int end = matcher.end();

            if (isContextRequired() && !hasContext(text, start)) {
                continue;
            }

            if (!Validators.ruInnChecksum(matchedText)) {
                continue;
            }

            results.add(new PIIMatch(
                getEntityType().getValue(),
                matchedText,
                start,
                end,
                1.0
            ));
        }
    }
}
