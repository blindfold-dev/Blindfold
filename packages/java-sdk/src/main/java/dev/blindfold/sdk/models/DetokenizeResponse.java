package dev.blindfold.sdk.models;

import com.google.gson.annotations.SerializedName;

public class DetokenizeResponse {
    private String text;

    @SerializedName("replacements_made")
    private int replacementsMade;

    public DetokenizeResponse() {}

    public String getText() { return text; }
    public int getReplacementsMade() { return replacementsMade; }
}
