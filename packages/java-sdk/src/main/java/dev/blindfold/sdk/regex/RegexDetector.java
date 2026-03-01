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

            boolean hasCtx = hasContext(text, start, end);

            if (isContextRequired() && !hasCtx) {
                continue;
            }

            double score;
            if (validator != null) {
                if (!validator.test(matchedText)) {
                    continue;
                }
                score = hasCtx ? 1.0 : getScore();
            } else {
                if (hasCtx) {
                    score = getScore();
                } else {
                    Double baseScore = getBaseScore();
                    score = baseScore != null ? baseScore : getScore();
                }
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
