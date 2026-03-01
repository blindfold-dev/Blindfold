package dev.blindfold.sdk.regex;

public class PIIMatch {
    private final String entityType;
    private final String text;
    private final int start;
    private final int end;
    private final double score;

    public PIIMatch(String entityType, String text, int start, int end, double score) {
        this.entityType = entityType;
        this.text = text;
        this.start = start;
        this.end = end;
        this.score = score;
    }

    public String getEntityType() { return entityType; }
    public String getText() { return text; }
    public int getStart() { return start; }
    public int getEnd() { return end; }
    public double getScore() { return score; }

    @Override
    public String toString() {
        return "PIIMatch{entityType='" + entityType + "', text='" + text +
               "', start=" + start + ", end=" + end + ", score=" + score + "}";
    }
}
