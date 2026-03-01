package dev.blindfold.sdk.regex;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.*;

public class PIIScanner {

    private final DetectorRegistry registry;

    public PIIScanner() {
        this(null);
    }

    public PIIScanner(List<String> locales) {
        this.registry = new DetectorRegistry(locales);
    }

    // ---- Result classes ----

    public static class TokenizeResult {
        private final String text;
        private final Map<String, String> mapping;
        private final List<PIIMatch> matches;

        public TokenizeResult(String text, Map<String, String> mapping, List<PIIMatch> matches) {
            this.text = text;
            this.mapping = mapping;
            this.matches = matches;
        }

        public String getText() { return text; }
        public Map<String, String> getMapping() { return mapping; }
        public List<PIIMatch> getMatches() { return matches; }
    }

    public static class RedactResult {
        private final String text;
        private final List<PIIMatch> matches;

        public RedactResult(String text, List<PIIMatch> matches) {
            this.text = text;
            this.matches = matches;
        }

        public String getText() { return text; }
        public List<PIIMatch> getMatches() { return matches; }
    }

    public static class MaskResult {
        private final String text;
        private final List<PIIMatch> matches;

        public MaskResult(String text, List<PIIMatch> matches) {
            this.text = text;
            this.matches = matches;
        }

        public String getText() { return text; }
        public List<PIIMatch> getMatches() { return matches; }
    }

    public static class HashResult {
        private final String text;
        private final List<PIIMatch> matches;

        public HashResult(String text, List<PIIMatch> matches) {
            this.text = text;
            this.matches = matches;
        }

        public String getText() { return text; }
        public List<PIIMatch> getMatches() { return matches; }
    }

    public static class EncryptResult {
        private final String text;
        private final List<PIIMatch> matches;

        public EncryptResult(String text, List<PIIMatch> matches) {
            this.text = text;
            this.matches = matches;
        }

        public String getText() { return text; }
        public List<PIIMatch> getMatches() { return matches; }
    }

    public static class SynthesizeResult {
        private final String text;
        private final List<PIIMatch> matches;

        public SynthesizeResult(String text, List<PIIMatch> matches) {
            this.text = text;
            this.matches = matches;
        }

        public String getText() { return text; }
        public List<PIIMatch> getMatches() { return matches; }
    }

    // ---- Public methods ----

    public List<PIIMatch> detect(String text) {
        return detect(text, null);
    }

    public List<PIIMatch> detect(String text, List<String> entities) {
        List<Detector> detectors = registry.getDetectors();
        if (entities != null && !entities.isEmpty()) {
            Set<String> entitySet = new HashSet<>(entities);
            List<Detector> filtered = new ArrayList<>();
            for (Detector d : detectors) {
                if (entitySet.contains(d.getEntityType().getValue())) {
                    filtered.add(d);
                }
            }
            detectors = filtered;
        }

        boolean hasDigit = false;
        for (int i = 0; i < text.length(); i++) {
            if (Character.isDigit(text.charAt(i))) {
                hasDigit = true;
                break;
            }
        }

        String textLower = text.toLowerCase();
        List<PIIMatch> allMatches = new ArrayList<>();

        for (Detector detector : detectors) {
            if (detector.needsDigit() && !hasDigit) continue;
            detector.setTextLower(textLower);
            allMatches.addAll(detector.iterMatches(text));
            detector.clearTextLower();
        }

        return deduplicate(allMatches);
    }

    public RedactResult redact(String text) {
        return redact(text, null);
    }

    public RedactResult redact(String text, List<String> entities) {
        List<PIIMatch> matches = detect(text, entities);
        if (matches.isEmpty()) return new RedactResult(text, matches);

        List<PIIMatch> sorted = new ArrayList<>(matches);
        sorted.sort((a, b) -> Integer.compare(b.getStart(), a.getStart()));

        String result = text;
        for (PIIMatch m : sorted) {
            int start = m.getStart();
            if (start > 0 && result.charAt(start - 1) == ' ') start--;
            result = result.substring(0, start) + result.substring(m.getEnd());
        }

        return new RedactResult(result, matches);
    }

    public TokenizeResult tokenize(String text) {
        return tokenize(text, null);
    }

    public TokenizeResult tokenize(String text, List<String> entities) {
        List<PIIMatch> matches = detect(text, entities);
        if (matches.isEmpty()) {
            return new TokenizeResult(text, Collections.emptyMap(), matches);
        }

        // Assign per-type counters in reading order
        List<PIIMatch> sortedAsc = new ArrayList<>(matches);
        sortedAsc.sort(Comparator.comparingInt(PIIMatch::getStart));

        Map<String, Integer> counters = new HashMap<>();
        Map<PIIMatch, String> tokenMap = new IdentityHashMap<>();
        Map<String, String> mapping = new LinkedHashMap<>();

        for (PIIMatch m : sortedAsc) {
            int count = counters.getOrDefault(m.getEntityType(), 0) + 1;
            counters.put(m.getEntityType(), count);
            String token = "<" + m.getEntityType() + "_" + count + ">";
            tokenMap.put(m, token);
            mapping.put(token, m.getText());
        }

        // Replace in descending order
        List<PIIMatch> sortedDesc = new ArrayList<>(matches);
        sortedDesc.sort((a, b) -> Integer.compare(b.getStart(), a.getStart()));

        String result = text;
        for (PIIMatch m : sortedDesc) {
            String token = tokenMap.get(m);
            result = result.substring(0, m.getStart()) + token + result.substring(m.getEnd());
        }

        return new TokenizeResult(result, mapping, matches);
    }

    public MaskResult mask(String text) {
        return mask(text, 3, false, "*", null);
    }

    public MaskResult mask(String text, int charsToShow, boolean fromEnd, String maskingChar, List<String> entities) {
        List<PIIMatch> matches = detect(text, entities);
        if (matches.isEmpty()) return new MaskResult(text, matches);

        List<PIIMatch> sorted = new ArrayList<>(matches);
        sorted.sort((a, b) -> Integer.compare(b.getStart(), a.getStart()));

        String result = text;
        for (PIIMatch m : sorted) {
            String original = m.getText();
            int show = Math.min(charsToShow, original.length());
            int maskLen = original.length() - show;
            StringBuilder masked = new StringBuilder();
            if (fromEnd) {
                for (int i = 0; i < maskLen; i++) masked.append(maskingChar);
                masked.append(original.substring(maskLen));
            } else {
                masked.append(original, 0, show);
                for (int i = 0; i < maskLen; i++) masked.append(maskingChar);
            }
            result = result.substring(0, m.getStart()) + masked + result.substring(m.getEnd());
        }

        return new MaskResult(result, matches);
    }

    public HashResult hash(String text) {
        return hash(text, "SHA-256", "HASH_", 16, null);
    }

    public HashResult hash(String text, String hashType, String hashPrefix, int hashLength, List<String> entities) {
        List<PIIMatch> matches = detect(text, entities);
        if (matches.isEmpty()) return new HashResult(text, matches);

        List<PIIMatch> sorted = new ArrayList<>(matches);
        sorted.sort((a, b) -> Integer.compare(b.getStart(), a.getStart()));

        String result = text;
        try {
            for (PIIMatch m : sorted) {
                MessageDigest digest = MessageDigest.getInstance(hashType);
                byte[] hashBytes = digest.digest(m.getText().getBytes(StandardCharsets.UTF_8));
                StringBuilder hexString = new StringBuilder();
                for (byte b : hashBytes) {
                    hexString.append(String.format("%02x", b));
                }
                String truncated = hexString.substring(0, Math.min(hashLength, hexString.length()));
                String replacement = hashPrefix + truncated;
                result = result.substring(0, m.getStart()) + replacement + result.substring(m.getEnd());
            }
        } catch (Exception e) {
            throw new RuntimeException("Hash algorithm not available: " + hashType, e);
        }

        return new HashResult(result, matches);
    }

    public EncryptResult encrypt(String text, String encryptionKey) {
        return encrypt(text, encryptionKey, null);
    }

    public EncryptResult encrypt(String text, String encryptionKey, List<String> entities) {
        if (encryptionKey == null || encryptionKey.length() < 16) {
            throw new IllegalArgumentException(
                "encryption_key is required and must be at least 16 characters for local encryption"
            );
        }

        List<PIIMatch> matches = detect(text, entities);
        if (matches.isEmpty()) return new EncryptResult(text, matches);

        List<PIIMatch> sorted = new ArrayList<>(matches);
        sorted.sort((a, b) -> Integer.compare(b.getStart(), a.getStart()));

        try {
            MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
            byte[] derivedKey = sha256.digest(encryptionKey.getBytes(StandardCharsets.UTF_8));

            SecureRandom secureRandom = new SecureRandom();
            String result = text;

            for (PIIMatch m : sorted) {
                byte[] iv = new byte[16];
                secureRandom.nextBytes(iv);

                Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
                cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(derivedKey, "AES"), new IvParameterSpec(iv));
                byte[] ct = cipher.doFinal(m.getText().getBytes(StandardCharsets.UTF_8));

                byte[] combined = new byte[iv.length + ct.length];
                System.arraycopy(iv, 0, combined, 0, iv.length);
                System.arraycopy(ct, 0, combined, iv.length, ct.length);

                String replacement = Base64.getEncoder().encodeToString(combined);
                result = result.substring(0, m.getStart()) + replacement + result.substring(m.getEnd());
            }

            return new EncryptResult(result, matches);
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    public SynthesizeResult synthesize(String text) {
        return synthesize(text, null, null);
    }

    public SynthesizeResult synthesize(String text, String language, List<String> entities) {
        List<PIIMatch> matches = detect(text, entities);
        if (matches.isEmpty()) return new SynthesizeResult(text, matches);

        List<PIIMatch> sorted = new ArrayList<>(matches);
        sorted.sort((a, b) -> Integer.compare(b.getStart(), a.getStart()));

        String result = text;
        for (PIIMatch m : sorted) {
            String replacement = Synthesizers.synthesizeValue(m.getEntityType(), m.getText());
            result = result.substring(0, m.getStart()) + replacement + result.substring(m.getEnd());
        }

        return new SynthesizeResult(result, matches);
    }

    // ---- Detokenize (client-side only) ----

    public String detokenize(String tokenizedText, Map<String, String> mapping) {
        if (mapping == null || mapping.isEmpty()) return tokenizedText;

        // Sort tokens by length descending (longest first) to avoid partial replacements
        List<Map.Entry<String, String>> entries = new ArrayList<>(mapping.entrySet());
        entries.sort((a, b) -> Integer.compare(b.getKey().length(), a.getKey().length()));

        String result = tokenizedText;
        for (Map.Entry<String, String> entry : entries) {
            result = result.replace(entry.getKey(), entry.getValue());
        }
        return result;
    }

    // ---- Deduplication ----

    static List<PIIMatch> deduplicate(List<PIIMatch> matches) {
        if (matches.isEmpty()) return matches;

        matches.sort((a, b) -> {
            int cmp = Integer.compare(a.getStart(), b.getStart());
            if (cmp != 0) return cmp;
            cmp = Double.compare(b.getScore(), a.getScore());
            if (cmp != 0) return cmp;
            return Integer.compare(b.getEnd() - b.getStart(), a.getEnd() - a.getStart());
        });

        List<PIIMatch> result = new ArrayList<>();
        int lastEnd = -1;
        for (PIIMatch m : matches) {
            if (m.getStart() >= lastEnd) {
                result.add(m);
                lastEnd = m.getEnd();
            }
        }
        return result;
    }
}
