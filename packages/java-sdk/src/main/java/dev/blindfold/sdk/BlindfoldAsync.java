package dev.blindfold.sdk;

import dev.blindfold.sdk.models.*;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.ForkJoinPool;

public class BlindfoldAsync {
    private final Blindfold client;
    private final Executor executor;

    public BlindfoldAsync(BlindfoldOptions options) {
        this.client = new Blindfold(options);
        this.executor = ForkJoinPool.commonPool();
    }

    public BlindfoldAsync(BlindfoldOptions options, Executor executor) {
        this.client = new Blindfold(options);
        this.executor = executor;
    }

    // ---- Detect ----

    public CompletableFuture<DetectResponse> detectAsync(String text) {
        return CompletableFuture.supplyAsync(() -> client.detect(text), executor);
    }

    public CompletableFuture<DetectResponse> detectAsync(String text, List<String> entities) {
        return CompletableFuture.supplyAsync(() -> client.detect(text, entities), executor);
    }

    public CompletableFuture<DetectResponse> detectAsync(String text, String policy) {
        return CompletableFuture.supplyAsync(() -> client.detect(text, policy), executor);
    }

    // ---- Tokenize ----

    public CompletableFuture<TokenizeResponse> tokenizeAsync(String text) {
        return CompletableFuture.supplyAsync(() -> client.tokenize(text), executor);
    }

    public CompletableFuture<TokenizeResponse> tokenizeAsync(String text, List<String> entities) {
        return CompletableFuture.supplyAsync(() -> client.tokenize(text, entities), executor);
    }

    public CompletableFuture<TokenizeResponse> tokenizeAsync(String text, String policy) {
        return CompletableFuture.supplyAsync(() -> client.tokenize(text, policy), executor);
    }

    // ---- Detokenize ----

    public CompletableFuture<DetokenizeResponse> detokenizeAsync(String text, Map<String, String> mapping) {
        return CompletableFuture.supplyAsync(() -> client.detokenize(text, mapping), executor);
    }

    // ---- Redact ----

    public CompletableFuture<RedactResponse> redactAsync(String text) {
        return CompletableFuture.supplyAsync(() -> client.redact(text), executor);
    }

    public CompletableFuture<RedactResponse> redactAsync(String text, List<String> entities) {
        return CompletableFuture.supplyAsync(() -> client.redact(text, entities), executor);
    }

    public CompletableFuture<RedactResponse> redactAsync(String text, String policy) {
        return CompletableFuture.supplyAsync(() -> client.redact(text, policy), executor);
    }

    // ---- Mask ----

    public CompletableFuture<MaskResponse> maskAsync(String text) {
        return CompletableFuture.supplyAsync(() -> client.mask(text), executor);
    }

    public CompletableFuture<MaskResponse> maskAsync(String text, int charsToShow, boolean fromEnd, String maskingChar, List<String> entities) {
        return CompletableFuture.supplyAsync(() -> client.mask(text, charsToShow, fromEnd, maskingChar, entities), executor);
    }

    public CompletableFuture<MaskResponse> maskAsync(String text, int charsToShow, boolean fromEnd, String maskingChar, String policy) {
        return CompletableFuture.supplyAsync(() -> client.mask(text, charsToShow, fromEnd, maskingChar, policy), executor);
    }

    // ---- Hash ----

    public CompletableFuture<HashResponse> hashAsync(String text) {
        return CompletableFuture.supplyAsync(() -> client.hash(text), executor);
    }

    public CompletableFuture<HashResponse> hashAsync(String text, String hashType, String hashPrefix, int hashLength, List<String> entities) {
        return CompletableFuture.supplyAsync(() -> client.hash(text, hashType, hashPrefix, hashLength, entities), executor);
    }

    public CompletableFuture<HashResponse> hashAsync(String text, String hashType, String hashPrefix, int hashLength, String policy) {
        return CompletableFuture.supplyAsync(() -> client.hash(text, hashType, hashPrefix, hashLength, policy), executor);
    }

    // ---- Encrypt ----

    public CompletableFuture<EncryptResponse> encryptAsync(String text, String encryptionKey) {
        return CompletableFuture.supplyAsync(() -> client.encrypt(text, encryptionKey), executor);
    }

    public CompletableFuture<EncryptResponse> encryptAsync(String text, String encryptionKey, List<String> entities) {
        return CompletableFuture.supplyAsync(() -> client.encrypt(text, encryptionKey, entities), executor);
    }

    public CompletableFuture<EncryptResponse> encryptAsync(String text, String encryptionKey, String policy) {
        return CompletableFuture.supplyAsync(() -> client.encrypt(text, encryptionKey, policy), executor);
    }

    // ---- Synthesize ----

    public CompletableFuture<SynthesizeResponse> synthesizeAsync(String text) {
        return CompletableFuture.supplyAsync(() -> client.synthesize(text), executor);
    }

    public CompletableFuture<SynthesizeResponse> synthesizeAsync(String text, String language, List<String> entities) {
        return CompletableFuture.supplyAsync(() -> client.synthesize(text, language, entities), executor);
    }

    public CompletableFuture<SynthesizeResponse> synthesizeAsync(String text, String language, String policy) {
        return CompletableFuture.supplyAsync(() -> client.synthesize(text, language, policy), executor);
    }

    // ---- Batch ----

    public CompletableFuture<BatchResponse<DetectResponse>> detectBatchAsync(List<String> texts) {
        return CompletableFuture.supplyAsync(() -> client.detectBatch(texts), executor);
    }

    public CompletableFuture<BatchResponse<DetectResponse>> detectBatchAsync(List<String> texts, List<String> entities) {
        return CompletableFuture.supplyAsync(() -> client.detectBatch(texts, entities), executor);
    }

    public CompletableFuture<BatchResponse<DetectResponse>> detectBatchAsync(List<String> texts, String policy) {
        return CompletableFuture.supplyAsync(() -> client.detectBatch(texts, policy), executor);
    }

    public CompletableFuture<BatchResponse<TokenizeResponse>> tokenizeBatchAsync(List<String> texts) {
        return CompletableFuture.supplyAsync(() -> client.tokenizeBatch(texts), executor);
    }

    public CompletableFuture<BatchResponse<TokenizeResponse>> tokenizeBatchAsync(List<String> texts, List<String> entities) {
        return CompletableFuture.supplyAsync(() -> client.tokenizeBatch(texts, entities), executor);
    }

    public CompletableFuture<BatchResponse<TokenizeResponse>> tokenizeBatchAsync(List<String> texts, String policy) {
        return CompletableFuture.supplyAsync(() -> client.tokenizeBatch(texts, policy), executor);
    }
}
