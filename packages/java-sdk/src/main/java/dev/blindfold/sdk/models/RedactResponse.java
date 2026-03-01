package dev.blindfold.sdk.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class RedactResponse {
    private String text;

    @SerializedName("detected_entities")
    private List<DetectedEntity> detectedEntities;

    @SerializedName("entities_count")
    private int entitiesCount;

    public RedactResponse() {}

    public String getText() { return text; }
    public List<DetectedEntity> getDetectedEntities() { return detectedEntities; }
    public int getEntitiesCount() { return entitiesCount; }
}
