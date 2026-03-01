package dev.blindfold.sdk.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class BatchResponse<T> {
    private List<T> results;
    private int total;
    private int succeeded;
    private int failed;

    public BatchResponse() {}

    public List<T> getResults() { return results; }
    public int getTotal() { return total; }
    public int getSucceeded() { return succeeded; }
    public int getFailed() { return failed; }
}
