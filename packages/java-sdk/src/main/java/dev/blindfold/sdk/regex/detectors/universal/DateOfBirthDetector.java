package dev.blindfold.sdk.regex.detectors.universal;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class DateOfBirthDetector extends RegexDetector {

    static {
        DetectorRegistry.registerUniversal(DateOfBirthDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "(?<!\\d)" +
        "(?:" +
            "(?:0?[1-9]|1[0-2])[/\\-.](?:0?[1-9]|[12]\\d|3[01])[/\\-.](?:19|20)\\d{2}" +
            "|(?:0?[1-9]|[12]\\d|3[01])[/\\-.](?:0?[1-9]|1[0-2])[/\\-.](?:19|20)\\d{2}" +
            "|(?:19|20)\\d{2}[/\\-.](?:0?[1-9]|1[0-2])[/\\-.](?:0?[1-9]|[12]\\d|3[01])" +
            "|(?:January|February|March|April|May|June|July|August|September|October|November|December" +
                "|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\.?\\s+(?:0?[1-9]|[12]\\d|3[01])(?:st|nd|rd|th)?,?\\s+(?:19|20)\\d{2}" +
            "|(?:0?[1-9]|[12]\\d|3[01])(?:st|nd|rd|th)?\\s+(?:January|February|March|April|May|June|July|August|September|October|November|December" +
                "|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\.?,?\\s+(?:19|20)\\d{2}" +
            "|(?:0?[1-9]|[12]\\d|3[01])[/\\-.](?:0?[1-9]|1[0-2])[/\\-.]\\d{2}(?!\\d)" +
            "|(?:0?[1-9]|1[0-2])[/\\-.](?:0?[1-9]|[12]\\d|3[01])[/\\-.]\\d{2}(?!\\d)" +
        ")" +
        "(?!\\d)",
        Pattern.CASE_INSENSITIVE
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "born", "dob", "date of birth", "birthday", "birthdate", "d.o.b",
        "birth date", "birth", "b-day", "bday", "age", "d/o/b", "born on",
        "date de naissance", "geburtsdatum", "fecha de nacimiento",
        "geboortedatum", "data di nascita"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.DATE_OF_BIRTH;
    }

    @Override
    public double getScore() {
        return 0.75;
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
    public boolean isContextRequired() {
        return true;
    }

    @Override
    public int getContextWindow() {
        return 100;
    }

    @Override
    public List<String> getContextKeywords() {
        return CONTEXT_KEYWORDS;
    }

    @Override
    public Predicate<String> getValidator() {
        return Validators::validDate;
    }
}
