package dev.blindfold.sdk.regex;

import java.util.Collections;
import java.util.List;

public abstract class Detector {
    private String textLower;

    public abstract EntityType getEntityType();

    public double getScore() { return 0.85; }

    public List<String> getContextKeywords() { return Collections.emptyList(); }

    public boolean isContextRequired() { return false; }

    public int getContextWindow() { return 50; }

    public boolean needsDigit() { return true; }

    public abstract List<PIIMatch> iterMatches(String text);

    protected boolean hasContext(String text, int start) {
        List<String> keywords = getContextKeywords();
        if (keywords.isEmpty()) {
            return true;
        }
        int windowStart = Math.max(0, start - getContextWindow());
        String lower = textLower != null ? textLower : text.toLowerCase();
        String window = lower.substring(windowStart, start);
        for (String kw : keywords) {
            if (window.contains(kw)) {
                return true;
            }
        }
        return false;
    }

    public void setTextLower(String textLower) {
        this.textLower = textLower;
    }

    public void clearTextLower() {
        this.textLower = null;
    }
}
