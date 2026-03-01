package dev.blindfold.sdk.models;

import com.google.gson.annotations.SerializedName;

public class DetectedEntity {
    private String type;
    private String text;
    private int start;
    private int end;
    private double score;

    // Default constructor for Gson
    public DetectedEntity() {}

    public DetectedEntity(String type, String text, int start, int end, double score) {
        this.type = type;
        this.text = text;
        this.start = start;
        this.end = end;
        this.score = score;
    }

    public String getType() { return type; }
    public String getText() { return text; }
    public int getStart() { return start; }
    public int getEnd() { return end; }
    public double getScore() { return score; }

    @Override
    public String toString() {
        return "DetectedEntity{type='" + type + "', text='" + text + "', start=" + start + ", end=" + end + ", score=" + score + "}";
    }
}
