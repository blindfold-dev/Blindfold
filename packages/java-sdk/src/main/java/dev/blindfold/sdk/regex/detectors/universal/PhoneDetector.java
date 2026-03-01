package dev.blindfold.sdk.regex.detectors.universal;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class PhoneDetector extends RegexDetector {

    static {
        DetectorRegistry.registerUniversal(PhoneDetector::new);
    }

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "phone", "tel", "telephone", "call", "mobile", "cell", "fax",
        "contact", "dial", "reach", "ring", "text", "sms", "whatsapp",
        "number", "ph#", "ph #", "cell#", "cell #"
    );

    private static final Pattern PATTERN = Pattern.compile(
        "(?<!\\d)" +
        "(?:" +
            "(?:\\+?1[-. ]?)?\\([2-9]\\d{2}\\)[-. ]?[2-9]\\d{2}[-. ]?\\d{4}" +
            "|(?:\\+?1[-. ]?)?[2-9]\\d{2}[-. ][2-9]\\d{2}[-. ]?\\d{4}" +
            "|\\+[1-9]\\d{0,2}[-. ]?\\(?\\d{1,4}\\)?[-. ]?\\d{1,4}[-. ]?\\d{1,9}" +
            "|0\\d{1,3}[-. ]\\d{2,4}[-. ]?\\d{2,4}[-. ]?\\d{0,4}" +
        ")" +
        "(?:\\s?(?:x|ext\\.?)\\s?\\d{1,5})?" +
        "(?!\\d)"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.PHONE_NUMBER;
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
        return 80;
    }

    @Override
    public boolean needsDigit() {
        return true;
    }

    @Override
    public Pattern getPattern() {
        return PATTERN;
    }

    @Override
    public Predicate<String> getValidator() {
        return Validators::phoneLengthCheck;
    }
}
