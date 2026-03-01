package dev.blindfold.sdk.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class DetectResponse {
    @SerializedName("detected_entities")
    private List<DetectedEntity> detectedEntities;

    @SerializedName("entities_count")
    private int entitiesCount;

    public DetectResponse() {}

    public List<DetectedEntity> getDetectedEntities() { return detectedEntities; }
    public int getEntitiesCount() { return entitiesCount; }
}
