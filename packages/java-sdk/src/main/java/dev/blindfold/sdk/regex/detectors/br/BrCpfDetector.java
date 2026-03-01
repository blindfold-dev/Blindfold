package dev.blindfold.sdk.regex.detectors.br;

import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.RegexDetector;
import dev.blindfold.sdk.regex.Validators;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class BrCpfDetector extends RegexDetector {

    static {
        DetectorRegistry.registerRegion("br", BrCpfDetector::new);
    }

    private static final Pattern PATTERN = Pattern.compile(
        "\\b\\d{3}\\.?\\d{3}\\.?\\d{3}[-.]?\\d{2}\\b"
    );

    private static final List<String> CONTEXT_KEYWORDS = Arrays.asList(
        "cpf", "cadastro de pessoa"
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.BR_CPF;
    }

    @Override
    public double getScore() {
        return 0.90;
    }

    @Override
    public Pattern getPattern() {
        return PATTERN;
    }

    @Override
    public List<String> getContextKeywords() {
        return CONTEXT_KEYWORDS;
    }

    @Override
    public Predicate<String> getValidator() {
        return Validators::brCpfChecksum;
    }
}
