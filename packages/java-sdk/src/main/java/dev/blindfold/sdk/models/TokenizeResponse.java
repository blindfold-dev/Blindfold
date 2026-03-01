package dev.blindfold.sdk.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;
import java.util.Map;

public class TokenizeResponse {
    private String text;
    private Map<String, String> mapping;

    @SerializedName("detected_entities")
    private List<DetectedEntity> detectedEntities;

    @SerializedName("entities_count")
    private int entitiesCount;

    public TokenizeResponse() {}

    public String getText() { return text; }
    public Map<String, String> getMapping() { return mapping; }
    public List<DetectedEntity> getDetectedEntities() { return detectedEntities; }
    public int getEntitiesCount() { return entitiesCount; }
}
