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

    public CompletableFuture<DetectResponse> detectAsync(String text) {
        return CompletableFuture.supplyAsync(() -> client.detect(text), executor);
    }

    public CompletableFuture<DetectResponse> detectAsync(String text, List<String> entities) {
        return CompletableFuture.supplyAsync(() -> client.detect(text, entities), executor);
    }

    public CompletableFuture<TokenizeResponse> tokenizeAsync(String text) {
        return CompletableFuture.supplyAsync(() -> client.tokenize(text), executor);
    }

    public CompletableFuture<TokenizeResponse> tokenizeAsync(String text, List<String> entities) {
        return CompletableFuture.supplyAsync(() -> client.tokenize(text, entities), executor);
    }

    public CompletableFuture<DetokenizeResponse> detokenizeAsync(String text, Map<String, String> mapping) {
        return CompletableFuture.supplyAsync(() -> client.detokenize(text, mapping), executor);
    }

    public CompletableFuture<RedactResponse> redactAsync(String text) {
        return CompletableFuture.supplyAsync(() -> client.redact(text), executor);
    }

    public CompletableFuture<RedactResponse> redactAsync(String text, List<String> entities) {
        return CompletableFuture.supplyAsync(() -> client.redact(text, entities), executor);
    }

    public CompletableFuture<MaskResponse> maskAsync(String text) {
        return CompletableFuture.supplyAsync(() -> client.mask(text), executor);
    }

    public CompletableFuture<MaskResponse> maskAsync(String text, int charsToShow, boolean fromEnd, String maskingChar, List<String> entities) {
        return CompletableFuture.supplyAsync(() -> client.mask(text, charsToShow, fromEnd, maskingChar, entities), executor);
    }

    public CompletableFuture<HashResponse> hashAsync(String text) {
        return CompletableFuture.supplyAsync(() -> client.hash(text), executor);
    }

    public CompletableFuture<HashResponse> hashAsync(String text, String hashType, String hashPrefix, int hashLength, List<String> entities) {
        return CompletableFuture.supplyAsync(() -> client.hash(text, hashType, hashPrefix, hashLength, entities), executor);
    }

    public CompletableFuture<EncryptResponse> encryptAsync(String text, String encryptionKey) {
        return CompletableFuture.supplyAsync(() -> client.encrypt(text, encryptionKey), executor);
    }

    public CompletableFuture<EncryptResponse> encryptAsync(String text, String encryptionKey, List<String> entities) {
        return CompletableFuture.supplyAsync(() -> client.encrypt(text, encryptionKey, entities), executor);
    }

    public CompletableFuture<SynthesizeResponse> synthesizeAsync(String text) {
        return CompletableFuture.supplyAsync(() -> client.synthesize(text), executor);
    }

    public CompletableFuture<SynthesizeResponse> synthesizeAsync(String text, String language, List<String> entities) {
        return CompletableFuture.supplyAsync(() -> client.synthesize(text, language, entities), executor);
    }
}
