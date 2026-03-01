package dev.blindfold.sdk.regex.detectors.universal;

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

public class CreditCardDetector extends Detector {

    static {
        DetectorRegistry.registerUniversal(CreditCardDetector::new);
    }

    private static final Pattern KNOWN_IIN = Pattern.compile(
        "\\b(?:" +
            "4\\d{3}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}(?:[-\\s]?\\d{3})?" +
            "|5[1-5]\\d{2}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}" +
            "|3[47]\\d{1,2}[-\\s]?\\d{4,6}[-\\s]?\\d{4,5}(?:[-\\s]?\\d{3,4})?" +
            "|6(?:011|5\\d{2}|4[4-9]\\d|22[1-9]|2[3-6]\\d{2}|27[01]\\d|2720)[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}" +
            "|(?:2131|1800|35\\d{3})[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{3,4}" +
            "|3(?:0[0-5]|[68]\\d)\\d[-\\s]?\\d{4,6}[-\\s]?\\d{4,5}" +
        ")\\b"
    );

    private static final Pattern GENERIC = Pattern.compile(
        "\\b\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{1,7}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "credit card", "card number", "card no", "card #", "cc:", "cc #",
        "payment card", "debit card", "billing", "card:", "credit", "payment"
    );

    private static final int CONTEXT_WINDOW = 100;

    @Override
    public EntityType getEntityType() {
        return EntityType.CREDIT_CARD;
    }

    @Override
    public double getScore() {
        return 0.90;
    }

    @Override
    public boolean needsDigit() {
        return true;
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
        List<int[]> knownRanges = new ArrayList<>();

        // Branch 1: Known IIN patterns
        Matcher knownMatcher = KNOWN_IIN.matcher(text);
        while (knownMatcher.find()) {
            String matchedText = knownMatcher.group();
            int start = knownMatcher.start();
            int end = knownMatcher.end();

            if (Validators.luhnChecksum(matchedText)) {
                results.add(new PIIMatch(
                    getEntityType().getValue(),
                    matchedText,
                    start,
                    end,
                    1.0
                ));
                knownRanges.add(new int[]{start, end});
            }
        }

        // Branch 2: Generic patterns (with context + Luhn)
        Matcher genericMatcher = GENERIC.matcher(text);
        while (genericMatcher.find()) {
            String matchedText = genericMatcher.group();
            int start = genericMatcher.start();
            int end = genericMatcher.end();

            // Skip if overlaps with a known IIN match
            boolean overlaps = false;
            for (int[] range : knownRanges) {
                if (start < range[1] && end > range[0]) {
                    overlaps = true;
                    break;
                }
            }
            if (overlaps) {
                continue;
            }

            // Require context for generic matches
            if (!hasContext(text, start)) {
                continue;
            }

            if (Validators.luhnChecksum(matchedText)) {
                results.add(new PIIMatch(
                    getEntityType().getValue(),
                    matchedText,
                    start,
                    end,
                    1.0
                ));
            }
        }

        return results;
    }
}
