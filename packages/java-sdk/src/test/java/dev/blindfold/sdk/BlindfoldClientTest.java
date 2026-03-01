package dev.blindfold.sdk;

import dev.blindfold.sdk.models.*;
import org.junit.jupiter.api.Test;
import java.util.Arrays;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class BlindfoldClientTest {

    @Test
    void localModeWithNoKey() {
        Blindfold client = new Blindfold();
        DetectResponse response = client.detect("Email john@example.com");
        assertNotNull(response.getDetectedEntities());
        assertFalse(response.getDetectedEntities().isEmpty());
        assertEquals("Email Address", response.getDetectedEntities().get(0).getType());
    }

    @Test
    void localModeExplicit() {
        Blindfold client = new Blindfold(BlindfoldOptions.builder()
            .apiKey("test-key")
            .mode("local")
            .build());
        DetectResponse response = client.detect("Email john@example.com");
        assertFalse(response.getDetectedEntities().isEmpty());
    }

    @Test
    void tokenizeAndDetokenize() {
        Blindfold client = new Blindfold();
        TokenizeResponse tokenized = client.tokenize("Email john@example.com");
        assertNotNull(tokenized.getText());
        assertTrue(tokenized.getText().contains("<Email Address_1>"));

        DetokenizeResponse restored = client.detokenize(tokenized.getText(), tokenized.getMapping());
        assertEquals("Email john@example.com", restored.getText());
    }

    @Test
    void redactLocal() {
        Blindfold client = new Blindfold();
        RedactResponse response = client.redact("SSN: 123-45-6789");
        assertFalse(response.getText().contains("123-45-6789"));
    }

    @Test
    void maskLocal() {
        Blindfold client = new Blindfold();
        MaskResponse response = client.mask("Email john@example.com");
        assertTrue(response.getText().contains("*"));
    }

    @Test
    void hashLocal() {
        Blindfold client = new Blindfold();
        HashResponse response = client.hash("Email john@example.com");
        assertTrue(response.getText().contains("HASH_"));
    }

    @Test
    void encryptLocal() {
        Blindfold client = new Blindfold();
        EncryptResponse response = client.encrypt("Email john@example.com", "mysecretkey123456");
        assertFalse(response.getText().contains("john@example.com"));
    }

    @Test
    void synthesizeLocal() {
        Blindfold client = new Blindfold();
        SynthesizeResponse response = client.synthesize("Email john@example.com");
        assertFalse(response.getText().contains("john@example.com"));
    }

    @Test
    void builderDefaults() {
        BlindfoldOptions options = BlindfoldOptions.builder().build();
        assertNull(options.getApiKey());
        assertNull(options.getMode());
        assertEquals(2, options.getMaxRetries());
    }

    @Test
    void regionUrlResolution() {
        // EU region
        BlindfoldOptions euOptions = BlindfoldOptions.builder().region("eu").apiKey("k").build();
        assertEquals("eu", euOptions.getRegion());

        // US region
        BlindfoldOptions usOptions = BlindfoldOptions.builder().region("us").apiKey("k").build();
        assertEquals("us", usOptions.getRegion());
    }

    @Test
    void asyncClient() throws Exception {
        BlindfoldAsync asyncClient = new BlindfoldAsync(BlindfoldOptions.builder().build());
        DetectResponse response = asyncClient.detectAsync("Email john@example.com").get();
        assertFalse(response.getDetectedEntities().isEmpty());
    }

    @Test
    void detectWithEntities() {
        Blindfold client = new Blindfold();
        DetectResponse response = client.detect(
            "Email john@acme.com, SSN 123-45-6789",
            Arrays.asList("Email Address")
        );
        assertEquals(1, response.getDetectedEntities().size());
        assertEquals("Email Address", response.getDetectedEntities().get(0).getType());
    }
}
