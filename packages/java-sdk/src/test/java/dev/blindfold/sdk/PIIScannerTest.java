package dev.blindfold.sdk;

import dev.blindfold.sdk.regex.PIIMatch;
import dev.blindfold.sdk.regex.PIIScanner;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

class PIIScannerTest {
    private PIIScanner scanner;

    @BeforeEach
    void setUp() {
        scanner = new PIIScanner(Arrays.asList("us", "eu", "uk"));
    }

    // ---- Detect ----

    @Test
    void detectEmail() {
        List<PIIMatch> matches = scanner.detect("Contact john@example.com for info");
        assertEquals(1, matches.size());
        assertEquals("Email Address", matches.get(0).getEntityType());
        assertEquals("john@example.com", matches.get(0).getText());
    }

    @Test
    void detectMultipleTypes() {
        List<PIIMatch> matches = scanner.detect("Email john@acme.com, SSN 123-45-6789");
        assertTrue(matches.size() >= 2);
        Set<String> types = new HashSet<>();
        for (PIIMatch m : matches) types.add(m.getEntityType());
        assertTrue(types.contains("Email Address"));
        assertTrue(types.contains("Social Security Number"));
    }

    @Test
    void detectCreditCard() {
        List<PIIMatch> matches = scanner.detect("Card: 4111-1111-1111-1111");
        assertEquals(1, matches.size());
        assertEquals("Credit Card Number", matches.get(0).getEntityType());
    }

    @Test
    void detectPhone() {
        List<PIIMatch> matches = scanner.detect("Call (555) 234-5678 today");
        assertEquals(1, matches.size());
        assertEquals("Phone Number", matches.get(0).getEntityType());
    }

    @Test
    void detectIpAddress() {
        List<PIIMatch> matches = scanner.detect("Server IP is 192.168.1.1");
        assertEquals(1, matches.size());
        assertEquals("IP Address", matches.get(0).getEntityType());
    }

    @Test
    void detectUrl() {
        List<PIIMatch> matches = scanner.detect("Visit https://example.com/page for details");
        assertEquals(1, matches.size());
        assertEquals("URL", matches.get(0).getEntityType());
    }

    @Test
    void detectIban() {
        List<PIIMatch> matches = scanner.detect("IBAN: DE89 3704 0044 0532 0130 00");
        assertEquals(1, matches.size());
        assertEquals("IBAN", matches.get(0).getEntityType());
    }

    @Test
    void detectNoMatches() {
        List<PIIMatch> matches = scanner.detect("Hello world, no PII here");
        assertTrue(matches.isEmpty());
    }

    @Test
    void detectWithEntityFilter() {
        List<PIIMatch> matches = scanner.detect(
            "Email john@acme.com, SSN 123-45-6789",
            Arrays.asList("Email Address")
        );
        assertEquals(1, matches.size());
        assertEquals("Email Address", matches.get(0).getEntityType());
    }

    @Test
    void detectDeduplicatesOverlapping() {
        // Ensure overlapping matches are deduplicated
        List<PIIMatch> matches = scanner.detect("john@example.com");
        assertEquals(1, matches.size());
    }

    @Test
    void detectPositionsCorrect() {
        String text = "Email: john@example.com is valid";
        List<PIIMatch> matches = scanner.detect(text);
        assertEquals(1, matches.size());
        PIIMatch m = matches.get(0);
        assertEquals("john@example.com", text.substring(m.getStart(), m.getEnd()));
    }

    // ---- Redact ----

    @Test
    void redactRemovesPii() {
        PIIScanner.RedactResult result = scanner.redact("Email john@example.com please");
        assertFalse(result.getText().contains("john@example.com"));
        assertFalse(result.getMatches().isEmpty());
    }

    // ---- Tokenize ----

    @Test
    void tokenizeReplacesWithTokens() {
        PIIScanner.TokenizeResult result = scanner.tokenize("Email john@example.com");
        assertTrue(result.getText().contains("<Email Address_1>"));
        assertEquals("john@example.com", result.getMapping().get("<Email Address_1>"));
    }

    @Test
    void tokenizeMultipleSameType() {
        PIIScanner.TokenizeResult result = scanner.tokenize("Send to a@b.com and c@d.com");
        assertTrue(result.getText().contains("<Email Address_1>"));
        assertTrue(result.getText().contains("<Email Address_2>"));
    }

    // ---- Detokenize ----

    @Test
    void detokenizeRestoresOriginal() {
        String original = "Email john@example.com";
        PIIScanner.TokenizeResult tokenized = scanner.tokenize(original);
        String restored = scanner.detokenize(tokenized.getText(), tokenized.getMapping());
        assertEquals(original, restored);
    }

    // ---- Mask ----

    @Test
    void maskPartiallyHides() {
        PIIScanner.MaskResult result = scanner.mask("Email john@example.com", 3, false, "*", null);
        assertTrue(result.getText().contains("joh"));
        assertTrue(result.getText().contains("*"));
    }

    @Test
    void maskFromEnd() {
        PIIScanner.MaskResult result = scanner.mask("Email john@example.com", 4, true, "#", null);
        assertTrue(result.getText().contains(".com"));
    }

    // ---- Hash ----

    @Test
    void hashProducesDeterministicOutput() {
        PIIScanner.HashResult r1 = scanner.hash("Email john@example.com");
        PIIScanner.HashResult r2 = scanner.hash("Email john@example.com");
        assertEquals(r1.getText(), r2.getText());
        assertTrue(r1.getText().contains("HASH_"));
    }

    // ---- Encrypt ----

    @Test
    void encryptProducesBase64() {
        PIIScanner.EncryptResult result = scanner.encrypt("Email john@example.com", "mysecretkey12345678");
        assertFalse(result.getText().contains("john@example.com"));
        assertFalse(result.getMatches().isEmpty());
    }

    @Test
    void encryptRejectsShortKey() {
        assertThrows(IllegalArgumentException.class, () -> {
            scanner.encrypt("test", "short");
        });
    }

    // ---- Synthesize ----

    @Test
    void synthesizeReplacesWithFakeData() {
        PIIScanner.SynthesizeResult result = scanner.synthesize("Email john@example.com");
        assertFalse(result.getText().contains("john@example.com"));
        assertTrue(result.getText().contains("@example.com")); // synthesized email uses @example.com
    }

    // ---- Locale filtering ----

    @Test
    void localeFilteringWorks() {
        PIIScanner usOnly = new PIIScanner(Arrays.asList("us"));
        List<PIIMatch> matches = usOnly.detect("SSN: 123-45-6789");
        assertFalse(matches.isEmpty());
    }

    @Test
    void defaultLocaleIsUs() {
        PIIScanner defaultScanner = new PIIScanner();
        List<PIIMatch> matches = defaultScanner.detect("SSN: 123-45-6789");
        assertFalse(matches.isEmpty());
    }
}
