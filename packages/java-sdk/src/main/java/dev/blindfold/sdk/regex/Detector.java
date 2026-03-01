package dev.blindfold.sdk.regex;

import java.util.Collections;
import java.util.List;

public abstract class Detector {
    private String textLower;

    public abstract EntityType getEntityType();

    public double getScore() { return 0.85; }

    /** Score when no context found. Return null for backward compat (uses getScore()). */
    public Double getBaseScore() { return null; }

    public List<String> getContextKeywords() { return Collections.emptyList(); }

    public boolean isContextRequired() { return false; }

    public int getContextWindow() { return 50; }

    public boolean needsDigit() { return true; }

    public abstract List<PIIMatch> iterMatches(String text);

    protected boolean hasContext(String text, int start) {
        return hasContext(text, start, 0);
    }

    protected boolean hasContext(String text, int start, int end) {
        List<String> keywords = getContextKeywords();
        if (keywords.isEmpty()) {
            return true;
        }
        String lower = textLower != null ? textLower : text.toLowerCase();
        int windowStart = Math.max(0, start - getContextWindow());
        String before = lower.substring(windowStart, start);
        String after = end > 0 ? lower.substring(end, Math.min(lower.length(), end + getContextWindow())) : "";
        String window = before + " " + after;
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
