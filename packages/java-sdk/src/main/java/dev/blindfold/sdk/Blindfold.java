package dev.blindfold.sdk;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
import com.google.gson.reflect.TypeToken;
import dev.blindfold.sdk.errors.*;
import dev.blindfold.sdk.models.*;
import dev.blindfold.sdk.regex.PIIMatch;
import dev.blindfold.sdk.regex.PIIScanner;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

public class Blindfold {
    private static final Set<Integer> RETRYABLE_CODES = Set.of(429, 500, 502, 503, 504);
    private static final Gson GSON = new Gson();

    private final String apiKey;
    private final String baseUrl;
    private final String mode;
    private final int maxRetries;
    private final Duration retryDelay;
    private final Duration timeout;
    private final String userId;
    private final HttpClient httpClient;
    private final PIIScanner scanner;
    private final Map<String, PolicyDefinition> policies;
    private final String defaultPolicy;

    private static class PolicyDefinition {
        List<String> entities;
        Double threshold;
    }

    private static class PolicyResolution {
        final List<String> entities;
        final Double threshold;

        PolicyResolution(List<String> entities, Double threshold) {
            this.entities = entities;
            this.threshold = threshold;
        }
    }

    // Construct with options
    public Blindfold(BlindfoldOptions options) {
        this.apiKey = options.getApiKey();
        this.mode = options.getMode();
        this.maxRetries = options.getMaxRetries();
        this.retryDelay = options.getRetryDelay();
        this.timeout = options.getTimeout();
        this.userId = options.getUserId();
        this.scanner = new PIIScanner(options.getLocales());
        this.defaultPolicy = options.getPolicy();
        this.policies = loadPolicies(options.getPoliciesFile());

        // Determine base URL
        if (options.getBaseUrl() != null) {
            this.baseUrl = options.getBaseUrl();
        } else if ("eu".equalsIgnoreCase(options.getRegion())) {
            this.baseUrl = "https://eu-api.blindfold.dev";
        } else if ("us".equalsIgnoreCase(options.getRegion())) {
            this.baseUrl = "https://us-api.blindfold.dev";
        } else {
            this.baseUrl = "https://eu-api.blindfold.dev";
        }

        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(timeout)
            .build();
    }

    // Convenience: local-only mode (no API key)
    public Blindfold() {
        this(BlindfoldOptions.builder().build());
    }

    // Convenience: API mode with key
    public Blindfold(String apiKey) {
        this(BlindfoldOptions.builder().apiKey(apiKey).build());
    }

    private boolean useLocal() {
        if ("local".equalsIgnoreCase(mode)) return true;
        return apiKey == null;
    }

    // ---- Policy loading and resolution ----

    private Map<String, PolicyDefinition> loadPolicies(String policiesFile) {
        Map<String, PolicyDefinition> result = new HashMap<>();

        // Load bundled policies from classpath
        try (InputStream is = getClass().getResourceAsStream("/policies.json")) {
            if (is != null) {
                try (Reader reader = new InputStreamReader(is, StandardCharsets.UTF_8)) {
                    Map<String, PolicyDefinition> bundled = GSON.fromJson(reader,
                        new TypeToken<Map<String, PolicyDefinition>>(){}.getType());
                    if (bundled != null) {
                        result.putAll(bundled);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Warning: Failed to load bundled policies: " + e.getMessage());
        }

        // Merge custom policies file if provided
        if (policiesFile != null) {
            try {
                String json = Files.readString(Path.of(policiesFile), StandardCharsets.UTF_8);
                Map<String, PolicyDefinition> custom = GSON.fromJson(json,
                    new TypeToken<Map<String, PolicyDefinition>>(){}.getType());
                if (custom != null) {
                    result.putAll(custom);
                }
            } catch (Exception e) {
                System.err.println("Warning: Failed to load custom policies from '" + policiesFile + "': " + e.getMessage());
            }
        }

        return result;
    }

    private PolicyResolution resolvePolicy(String policy, List<String> entities) {
        // Priority: explicit entities > named policy > detect all
        if (entities != null && !entities.isEmpty()) {
            return new PolicyResolution(entities, null);
        }
        String policyName = policy != null ? policy : this.defaultPolicy;
        if (policyName != null) {
            PolicyDefinition def = this.policies.get(policyName);
            if (def != null) {
                return new PolicyResolution(def.entities, def.threshold);
            }
            System.err.println("Warning: Unknown policy '" + policyName + "', detecting all entities");
        }
        return new PolicyResolution(null, null);
    }

    private List<PIIMatch> applyThreshold(List<PIIMatch> matches, Double threshold) {
        if (threshold == null) return matches;
        return matches.stream()
            .filter(m -> m.getScore() >= threshold)
            .collect(Collectors.toList());
    }

    // ---- Detect ----

    public DetectResponse detect(String text) {
        return detectInternal(text, null, null);
    }

    public DetectResponse detect(String text, List<String> entities) {
        return detectInternal(text, null, entities);
    }

    public DetectResponse detect(String text, String policy) {
        return detectInternal(text, policy, null);
    }

    private DetectResponse detectInternal(String text, String policy, List<String> entities) {
        PolicyResolution resolved = resolvePolicy(policy, entities);
        if (useLocal()) {
            List<PIIMatch> matches = scanner.detect(text, resolved.entities);
            matches = applyThreshold(matches, resolved.threshold);
            return toDetectResponse(matches);
        }
        JsonObject body = new JsonObject();
        body.addProperty("text", text);
        if (resolved.entities != null) body.add("entities", GSON.toJsonTree(resolved.entities));
        if (resolved.threshold != null) body.addProperty("score_threshold", resolved.threshold);
        String json = post("/detect", body.toString());
        return GSON.fromJson(json, DetectResponse.class);
    }

    // ---- Tokenize ----

    public TokenizeResponse tokenize(String text) {
        return tokenizeInternal(text, null, null);
    }

    public TokenizeResponse tokenize(String text, List<String> entities) {
        return tokenizeInternal(text, null, entities);
    }

    public TokenizeResponse tokenize(String text, String policy) {
        return tokenizeInternal(text, policy, null);
    }

    private TokenizeResponse tokenizeInternal(String text, String policy, List<String> entities) {
        PolicyResolution resolved = resolvePolicy(policy, entities);
        if (useLocal()) {
            PIIScanner.TokenizeResult result = scanner.tokenize(text, resolved.entities);
            if (resolved.threshold != null) {
                List<PIIMatch> filtered = applyThreshold(result.getMatches(), resolved.threshold);
                if (filtered.size() < result.getMatches().size()) {
                    List<PIIMatch> allMatches = scanner.detect(text, resolved.entities);
                    List<PIIMatch> qualifying = applyThreshold(allMatches, resolved.threshold);
                    List<String> qualifyingTypes = qualifying.stream()
                        .map(PIIMatch::getEntityType)
                        .distinct()
                        .collect(Collectors.toList());
                    result = scanner.tokenize(text, qualifyingTypes.isEmpty() ? List.of("__none__") : qualifyingTypes);
                }
            }
            return toTokenizeResponse(result);
        }
        JsonObject body = new JsonObject();
        body.addProperty("text", text);
        if (resolved.entities != null) body.add("entities", GSON.toJsonTree(resolved.entities));
        if (resolved.threshold != null) body.addProperty("score_threshold", resolved.threshold);
        String json = post("/tokenize", body.toString());
        return GSON.fromJson(json, TokenizeResponse.class);
    }

    // ---- Detokenize (client-side only) ----

    public DetokenizeResponse detokenize(String text, Map<String, String> mapping) {
        String result = scanner.detokenize(text, mapping);
        return makeDetokenizeResponse(result, mapping != null ? mapping.size() : 0);
    }

    // ---- Redact ----

    public RedactResponse redact(String text) {
        return redactInternal(text, null, null);
    }

    public RedactResponse redact(String text, List<String> entities) {
        return redactInternal(text, null, entities);
    }

    public RedactResponse redact(String text, String policy) {
        return redactInternal(text, policy, null);
    }

    private RedactResponse redactInternal(String text, String policy, List<String> entities) {
        PolicyResolution resolved = resolvePolicy(policy, entities);
        if (useLocal()) {
            PIIScanner.RedactResult result = scanner.redact(text, resolved.entities);
            if (resolved.threshold != null) {
                // Filter matches and rebuild redacted text with only qualifying matches
                List<PIIMatch> filtered = applyThreshold(result.getMatches(), resolved.threshold);
                if (filtered.size() < result.getMatches().size()) {
                    // Re-detect to get only entities above threshold, then redact those
                    List<PIIMatch> allMatches = scanner.detect(text, resolved.entities);
                    List<PIIMatch> qualifying = applyThreshold(allMatches, resolved.threshold);
                    List<String> qualifyingTypes = qualifying.stream()
                        .map(PIIMatch::getEntityType)
                        .distinct()
                        .collect(Collectors.toList());
                    result = scanner.redact(text, qualifyingTypes.isEmpty() ? List.of("__none__") : qualifyingTypes);
                }
            }
            return toRedactResponse(result);
        }
        JsonObject body = new JsonObject();
        body.addProperty("text", text);
        if (resolved.entities != null) body.add("entities", GSON.toJsonTree(resolved.entities));
        if (resolved.threshold != null) body.addProperty("score_threshold", resolved.threshold);
        String json = post("/redact", body.toString());
        return GSON.fromJson(json, RedactResponse.class);
    }

    // ---- Mask ----

    public MaskResponse mask(String text) {
        return maskInternal(text, 3, false, "*", null, null);
    }

    public MaskResponse mask(String text, int charsToShow, boolean fromEnd, String maskingChar, List<String> entities) {
        return maskInternal(text, charsToShow, fromEnd, maskingChar, null, entities);
    }

    public MaskResponse mask(String text, int charsToShow, boolean fromEnd, String maskingChar, String policy) {
        return maskInternal(text, charsToShow, fromEnd, maskingChar, policy, null);
    }

    private MaskResponse maskInternal(String text, int charsToShow, boolean fromEnd, String maskingChar, String policy, List<String> entities) {
        PolicyResolution resolved = resolvePolicy(policy, entities);
        if (useLocal()) {
            PIIScanner.MaskResult result = scanner.mask(text, charsToShow, fromEnd, maskingChar, resolved.entities);
            if (resolved.threshold != null) {
                List<PIIMatch> filtered = applyThreshold(result.getMatches(), resolved.threshold);
                if (filtered.size() < result.getMatches().size()) {
                    List<PIIMatch> allMatches = scanner.detect(text, resolved.entities);
                    List<PIIMatch> qualifying = applyThreshold(allMatches, resolved.threshold);
                    List<String> qualifyingTypes = qualifying.stream()
                        .map(PIIMatch::getEntityType)
                        .distinct()
                        .collect(Collectors.toList());
                    result = scanner.mask(text, charsToShow, fromEnd, maskingChar, qualifyingTypes.isEmpty() ? List.of("__none__") : qualifyingTypes);
                }
            }
            return toMaskResponse(result);
        }
        JsonObject body = new JsonObject();
        body.addProperty("text", text);
        body.addProperty("chars_to_show", charsToShow);
        body.addProperty("from_end", fromEnd);
        body.addProperty("masking_char", maskingChar);
        if (resolved.entities != null) body.add("entities", GSON.toJsonTree(resolved.entities));
        if (resolved.threshold != null) body.addProperty("score_threshold", resolved.threshold);
        String json = post("/mask", body.toString());
        return GSON.fromJson(json, MaskResponse.class);
    }

    // ---- Hash ----

    public HashResponse hash(String text) {
        return hashInternal(text, "SHA-256", "HASH_", 16, null, null);
    }

    public HashResponse hash(String text, String hashType, String hashPrefix, int hashLength, List<String> entities) {
        return hashInternal(text, hashType, hashPrefix, hashLength, null, entities);
    }

    public HashResponse hash(String text, String hashType, String hashPrefix, int hashLength, String policy) {
        return hashInternal(text, hashType, hashPrefix, hashLength, policy, null);
    }

    private HashResponse hashInternal(String text, String hashType, String hashPrefix, int hashLength, String policy, List<String> entities) {
        PolicyResolution resolved = resolvePolicy(policy, entities);
        if (useLocal()) {
            PIIScanner.HashResult result = scanner.hash(text, hashType, hashPrefix, hashLength, resolved.entities);
            if (resolved.threshold != null) {
                List<PIIMatch> filtered = applyThreshold(result.getMatches(), resolved.threshold);
                if (filtered.size() < result.getMatches().size()) {
                    List<PIIMatch> allMatches = scanner.detect(text, resolved.entities);
                    List<PIIMatch> qualifying = applyThreshold(allMatches, resolved.threshold);
                    List<String> qualifyingTypes = qualifying.stream()
                        .map(PIIMatch::getEntityType)
                        .distinct()
                        .collect(Collectors.toList());
                    result = scanner.hash(text, hashType, hashPrefix, hashLength, qualifyingTypes.isEmpty() ? List.of("__none__") : qualifyingTypes);
                }
            }
            return toHashResponse(result);
        }
        JsonObject body = new JsonObject();
        body.addProperty("text", text);
        body.addProperty("hash_type", hashType);
        body.addProperty("hash_prefix", hashPrefix);
        body.addProperty("hash_length", hashLength);
        if (resolved.entities != null) body.add("entities", GSON.toJsonTree(resolved.entities));
        if (resolved.threshold != null) body.addProperty("score_threshold", resolved.threshold);
        String json = post("/hash", body.toString());
        return GSON.fromJson(json, HashResponse.class);
    }

    // ---- Encrypt ----

    public EncryptResponse encrypt(String text, String encryptionKey) {
        return encryptInternal(text, encryptionKey, null, null);
    }

    public EncryptResponse encrypt(String text, String encryptionKey, List<String> entities) {
        return encryptInternal(text, encryptionKey, null, entities);
    }

    public EncryptResponse encrypt(String text, String encryptionKey, String policy) {
        return encryptInternal(text, encryptionKey, policy, null);
    }

    private EncryptResponse encryptInternal(String text, String encryptionKey, String policy, List<String> entities) {
        PolicyResolution resolved = resolvePolicy(policy, entities);
        if (useLocal()) {
            PIIScanner.EncryptResult result = scanner.encrypt(text, encryptionKey, resolved.entities);
            if (resolved.threshold != null) {
                List<PIIMatch> filtered = applyThreshold(result.getMatches(), resolved.threshold);
                if (filtered.size() < result.getMatches().size()) {
                    List<PIIMatch> allMatches = scanner.detect(text, resolved.entities);
                    List<PIIMatch> qualifying = applyThreshold(allMatches, resolved.threshold);
                    List<String> qualifyingTypes = qualifying.stream()
                        .map(PIIMatch::getEntityType)
                        .distinct()
                        .collect(Collectors.toList());
                    result = scanner.encrypt(text, encryptionKey, qualifyingTypes.isEmpty() ? List.of("__none__") : qualifyingTypes);
                }
            }
            return toEncryptResponse(result);
        }
        JsonObject body = new JsonObject();
        body.addProperty("text", text);
        body.addProperty("encryption_key", encryptionKey);
        if (resolved.entities != null) body.add("entities", GSON.toJsonTree(resolved.entities));
        if (resolved.threshold != null) body.addProperty("score_threshold", resolved.threshold);
        String json = post("/encrypt", body.toString());
        return GSON.fromJson(json, EncryptResponse.class);
    }

    // ---- Synthesize ----

    public SynthesizeResponse synthesize(String text) {
        return synthesizeInternal(text, null, null, null);
    }

    public SynthesizeResponse synthesize(String text, String language, List<String> entities) {
        return synthesizeInternal(text, language, null, entities);
    }

    public SynthesizeResponse synthesize(String text, String language, String policy) {
        return synthesizeInternal(text, language, policy, null);
    }

    private SynthesizeResponse synthesizeInternal(String text, String language, String policy, List<String> entities) {
        PolicyResolution resolved = resolvePolicy(policy, entities);
        if (useLocal()) {
            PIIScanner.SynthesizeResult result = scanner.synthesize(text, language, resolved.entities);
            if (resolved.threshold != null) {
                List<PIIMatch> filtered = applyThreshold(result.getMatches(), resolved.threshold);
                if (filtered.size() < result.getMatches().size()) {
                    List<PIIMatch> allMatches = scanner.detect(text, resolved.entities);
                    List<PIIMatch> qualifying = applyThreshold(allMatches, resolved.threshold);
                    List<String> qualifyingTypes = qualifying.stream()
                        .map(PIIMatch::getEntityType)
                        .distinct()
                        .collect(Collectors.toList());
                    result = scanner.synthesize(text, language, qualifyingTypes.isEmpty() ? List.of("__none__") : qualifyingTypes);
                }
            }
            return toSynthesizeResponse(result);
        }
        JsonObject body = new JsonObject();
        body.addProperty("text", text);
        if (language != null) body.addProperty("language", language);
        if (resolved.entities != null) body.add("entities", GSON.toJsonTree(resolved.entities));
        if (resolved.threshold != null) body.addProperty("score_threshold", resolved.threshold);
        String json = post("/synthesize", body.toString());
        return GSON.fromJson(json, SynthesizeResponse.class);
    }

    // ---- Batch methods ----

    public BatchResponse<DetectResponse> detectBatch(List<String> texts) {
        return detectBatchInternal(texts, null, null);
    }

    public BatchResponse<DetectResponse> detectBatch(List<String> texts, List<String> entities) {
        return detectBatchInternal(texts, null, entities);
    }

    public BatchResponse<DetectResponse> detectBatch(List<String> texts, String policy) {
        return detectBatchInternal(texts, policy, null);
    }

    private BatchResponse<DetectResponse> detectBatchInternal(List<String> texts, String policy, List<String> entities) {
        PolicyResolution resolved = resolvePolicy(policy, entities);
        JsonObject body = new JsonObject();
        body.add("texts", GSON.toJsonTree(texts));
        if (resolved.entities != null) body.add("entities", GSON.toJsonTree(resolved.entities));
        if (resolved.threshold != null) body.addProperty("score_threshold", resolved.threshold);
        String json = post("/detect", body.toString());
        return GSON.fromJson(json, new TypeToken<BatchResponse<DetectResponse>>(){}.getType());
    }

    public BatchResponse<TokenizeResponse> tokenizeBatch(List<String> texts) {
        return tokenizeBatchInternal(texts, null, null);
    }

    public BatchResponse<TokenizeResponse> tokenizeBatch(List<String> texts, List<String> entities) {
        return tokenizeBatchInternal(texts, null, entities);
    }

    public BatchResponse<TokenizeResponse> tokenizeBatch(List<String> texts, String policy) {
        return tokenizeBatchInternal(texts, policy, null);
    }

    private BatchResponse<TokenizeResponse> tokenizeBatchInternal(List<String> texts, String policy, List<String> entities) {
        PolicyResolution resolved = resolvePolicy(policy, entities);
        JsonObject body = new JsonObject();
        body.add("texts", GSON.toJsonTree(texts));
        if (resolved.entities != null) body.add("entities", GSON.toJsonTree(resolved.entities));
        if (resolved.threshold != null) body.addProperty("score_threshold", resolved.threshold);
        String json = post("/tokenize", body.toString());
        return GSON.fromJson(json, new TypeToken<BatchResponse<TokenizeResponse>>(){}.getType());
    }

    // ---- HTTP plumbing ----

    private String post(String path, String jsonBody) {
        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                HttpRequest.Builder reqBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + path))
                    .header("Content-Type", "application/json")
                    .header("X-API-Key", apiKey)
                    .timeout(timeout)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8));

                if (userId != null) {
                    reqBuilder.header("X-Blindfold-User-Id", userId);
                }

                HttpResponse<String> response = httpClient.send(reqBuilder.build(),
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

                int status = response.statusCode();

                if (status >= 200 && status < 300) {
                    return response.body();
                }

                if (status == 401) {
                    throw new AuthenticationException("Invalid API key");
                }

                if (RETRYABLE_CODES.contains(status) && attempt < maxRetries) {
                    long delay = retryDelay.toMillis() * (long) Math.pow(2, attempt);
                    // Check for retry_after in response body
                    if (status == 429) {
                        try {
                            JsonObject errBody = GSON.fromJson(response.body(), JsonObject.class);
                            if (errBody != null && errBody.has("retry_after")) {
                                delay = (long) (errBody.get("retry_after").getAsDouble() * 1000);
                            }
                        } catch (Exception ignored) {}
                    }
                    Thread.sleep(delay);
                    continue;
                }

                throw new ApiException("API error: " + status + " " + response.body(), status);

            } catch (AuthenticationException | ApiException e) {
                throw e;
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new NetworkException("Request interrupted", e);
            } catch (Exception e) {
                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(retryDelay.toMillis() * (long) Math.pow(2, attempt));
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new NetworkException("Request interrupted", ie);
                    }
                    continue;
                }
                throw new NetworkException("Network error: " + e.getMessage(), e);
            }
        }
        throw new NetworkException("Max retries exceeded", null);
    }

    // ---- Local result converters ----

    private DetectResponse toDetectResponse(List<PIIMatch> matches) {
        JsonObject json = new JsonObject();
        JsonArray entities = new JsonArray();
        for (PIIMatch m : matches) {
            JsonObject e = new JsonObject();
            e.addProperty("type", m.getEntityType());
            e.addProperty("text", m.getText());
            e.addProperty("start", m.getStart());
            e.addProperty("end", m.getEnd());
            e.addProperty("score", m.getScore());
            entities.add(e);
        }
        json.add("detected_entities", entities);
        json.addProperty("entities_count", matches.size());
        return GSON.fromJson(json, DetectResponse.class);
    }

    private TokenizeResponse toTokenizeResponse(PIIScanner.TokenizeResult result) {
        JsonObject json = new JsonObject();
        json.addProperty("text", result.getText());
        json.add("mapping", GSON.toJsonTree(result.getMapping()));
        JsonArray entities = new JsonArray();
        for (PIIMatch m : result.getMatches()) {
            JsonObject e = new JsonObject();
            e.addProperty("type", m.getEntityType());
            e.addProperty("text", m.getText());
            e.addProperty("start", m.getStart());
            e.addProperty("end", m.getEnd());
            e.addProperty("score", m.getScore());
            entities.add(e);
        }
        json.add("detected_entities", entities);
        json.addProperty("entities_count", result.getMatches().size());
        return GSON.fromJson(json, TokenizeResponse.class);
    }

    private DetokenizeResponse makeDetokenizeResponse(String text, int replacements) {
        JsonObject json = new JsonObject();
        json.addProperty("text", text);
        json.addProperty("replacements_made", replacements);
        return GSON.fromJson(json, DetokenizeResponse.class);
    }

    private RedactResponse toRedactResponse(PIIScanner.RedactResult result) {
        JsonObject json = new JsonObject();
        json.addProperty("text", result.getText());
        JsonArray entities = new JsonArray();
        for (PIIMatch m : result.getMatches()) {
            JsonObject e = new JsonObject();
            e.addProperty("type", m.getEntityType());
            e.addProperty("text", m.getText());
            e.addProperty("start", m.getStart());
            e.addProperty("end", m.getEnd());
            e.addProperty("score", m.getScore());
            entities.add(e);
        }
        json.add("detected_entities", entities);
        json.addProperty("entities_count", result.getMatches().size());
        return GSON.fromJson(json, RedactResponse.class);
    }

    private MaskResponse toMaskResponse(PIIScanner.MaskResult result) {
        JsonObject json = new JsonObject();
        json.addProperty("text", result.getText());
        JsonArray entities = new JsonArray();
        for (PIIMatch m : result.getMatches()) {
            JsonObject e = new JsonObject();
            e.addProperty("type", m.getEntityType());
            e.addProperty("text", m.getText());
            e.addProperty("start", m.getStart());
            e.addProperty("end", m.getEnd());
            e.addProperty("score", m.getScore());
            entities.add(e);
        }
        json.add("detected_entities", entities);
        json.addProperty("entities_count", result.getMatches().size());
        return GSON.fromJson(json, MaskResponse.class);
    }

    private HashResponse toHashResponse(PIIScanner.HashResult result) {
        JsonObject json = new JsonObject();
        json.addProperty("text", result.getText());
        JsonArray entities = new JsonArray();
        for (PIIMatch m : result.getMatches()) {
            JsonObject e = new JsonObject();
            e.addProperty("type", m.getEntityType());
            e.addProperty("text", m.getText());
            e.addProperty("start", m.getStart());
            e.addProperty("end", m.getEnd());
            e.addProperty("score", m.getScore());
            entities.add(e);
        }
        json.add("detected_entities", entities);
        json.addProperty("entities_count", result.getMatches().size());
        return GSON.fromJson(json, HashResponse.class);
    }

    private EncryptResponse toEncryptResponse(PIIScanner.EncryptResult result) {
        JsonObject json = new JsonObject();
        json.addProperty("text", result.getText());
        JsonArray entities = new JsonArray();
        for (PIIMatch m : result.getMatches()) {
            JsonObject e = new JsonObject();
            e.addProperty("type", m.getEntityType());
            e.addProperty("text", m.getText());
            e.addProperty("start", m.getStart());
            e.addProperty("end", m.getEnd());
            e.addProperty("score", m.getScore());
            entities.add(e);
        }
        json.add("detected_entities", entities);
        json.addProperty("entities_count", result.getMatches().size());
        return GSON.fromJson(json, EncryptResponse.class);
    }

    private SynthesizeResponse toSynthesizeResponse(PIIScanner.SynthesizeResult result) {
        JsonObject json = new JsonObject();
        json.addProperty("text", result.getText());
        JsonArray entities = new JsonArray();
        for (PIIMatch m : result.getMatches()) {
            JsonObject e = new JsonObject();
            e.addProperty("type", m.getEntityType());
            e.addProperty("text", m.getText());
            e.addProperty("start", m.getStart());
            e.addProperty("end", m.getEnd());
            e.addProperty("score", m.getScore());
            entities.add(e);
        }
        json.add("detected_entities", entities);
        json.addProperty("entities_count", result.getMatches().size());
        return GSON.fromJson(json, SynthesizeResponse.class);
    }
}
