package dev.blindfold.sdk.regex.detectors.us;

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

public class SsnDetector extends Detector {

    static {
        DetectorRegistry.registerRegion("us", SsnDetector::new);
    }

    private static final Pattern WITH_SEP = Pattern.compile(
        "\\b(?!000|666|9\\d{2})\\d{3}[-\\s.](?!00)\\d{2}[-\\s.](?!0000)\\d{4}\\b"
    );

    private static final Pattern WITHOUT_SEP = Pattern.compile(
        "\\b(?!000|666|9\\d{2})\\d{3}(?!00)\\d{2}(?!0000)\\d{4}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "ssn", "social security", "social sec", "ss#", "ss #", "social",
        "tax id", "taxpayer", "tin", "social number", "soc number", "socialnum"
    );

    private static final int CONTEXT_WINDOW = 100;

    @Override
    public EntityType getEntityType() {
        return EntityType.SSN;
    }

    @Override
    public double getScore() {
        return 0.85;
    }

    @Override
    public List<String> getContextKeywords() {
        return CONTEXT_KEYWORDS;
    }

    @Override
    public int getContextWindow() {
        return CONTEXT_WINDOW;
    }

    @Override
    public List<PIIMatch> iterMatches(String text) {
        List<PIIMatch> results = new ArrayList<>();

        // Branch 1: With separators — no context required
        Matcher withSep = WITH_SEP.matcher(text);
        while (withSep.find()) {
            String matchedText = withSep.group();
            int start = withSep.start();
            int end = withSep.end();

            if (!Validators.ssnValidFormat(matchedText)) {
                continue;
            }

            boolean hasCtx = hasContext(text, start, end);
            double score = hasCtx ? 1.0 : getScore();

            results.add(new PIIMatch(
                getEntityType().getValue(),
                matchedText,
                start,
                end,
                score
            ));
        }

        // Branch 2: Without separators — context required
        Matcher withoutSep = WITHOUT_SEP.matcher(text);
        while (withoutSep.find()) {
            String matchedText = withoutSep.group();
            int start = withoutSep.start();
            int end = withoutSep.end();

            if (!Validators.ssnValidFormat(matchedText)) {
                continue;
            }

            if (!hasContext(text, start, end)) {
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

        return results;
    }
}
