package dev.blindfold.sdk.regex;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public abstract class RegexDetector extends Detector {

    public abstract Pattern getPattern();

    public Predicate<String> getValidator() { return null; }

    public boolean preCheck(String text) { return true; }

    @Override
    public List<PIIMatch> iterMatches(String text) {
        if (!preCheck(text)) {
            return new ArrayList<>();
        }

        List<PIIMatch> results = new ArrayList<>();
        Matcher matcher = getPattern().matcher(text);
        Predicate<String> validator = getValidator();

        while (matcher.find()) {
            String matchedText = matcher.group();
            int start = matcher.start();
            int end = matcher.end();

            if (isContextRequired() && !hasContext(text, start)) {
                continue;
            }

            double score = getScore();
            if (validator != null) {
                if (!validator.test(matchedText)) {
                    continue;
                }
                score = 1.0;
            } else if (!getContextKeywords().isEmpty() && hasContext(text, start)) {
                score = Math.min(score + 0.05, 0.95);
            }

            results.add(new PIIMatch(
                getEntityType().getValue(),
                matchedText,
                start,
                end,
                score
            ));
        }
        return results;
    }
}
