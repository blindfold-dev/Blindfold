package dev.blindfold.sdk.regex;

import java.util.Random;

public final class Synthesizers {
    private static final Random RANDOM = new Random();
    private static final String DIGITS = "0123456789";
    private static final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String HEX = "0123456789abcdef";

    private Synthesizers() {}

    public static String synthesizeValue(String entityType, String originalText) {
        switch (entityType) {
            case "Email Address": return synthesizeEmail();
            case "URL": return synthesizeUrl();
            case "IP Address": return synthesizeIp();
            case "Credit Card Number": return synthesizeCreditCard(originalText);
            case "IBAN": return synthesizeIban(originalText);
            default: return formatPreserving(originalText);
        }
    }

    static String formatPreserving(String original) {
        char[] chars = new char[original.length()];
        for (int i = 0; i < original.length(); i++) {
            char ch = original.charAt(i);
            if (Character.isDigit(ch)) {
                chars[i] = DIGITS.charAt(RANDOM.nextInt(10));
            } else if (Character.isUpperCase(ch)) {
                chars[i] = UPPER.charAt(RANDOM.nextInt(26));
            } else if (Character.isLowerCase(ch)) {
                chars[i] = LOWER.charAt(RANDOM.nextInt(26));
            } else {
                chars[i] = ch;
            }
        }
        String result = new String(chars);
        if (result.equals(original)) {
            return formatPreserving(original);
        }
        return result;
    }

    private static String synthesizeEmail() {
        return "user" + randHex(8) + "@example.com";
    }

    private static String synthesizeUrl() {
        return "https://example.com/" + randHex(10);
    }

    private static String synthesizeIp() {
        int a = RANDOM.nextInt(254) + 1;
        int b = RANDOM.nextInt(256);
        int c = RANDOM.nextInt(256);
        int d = RANDOM.nextInt(254) + 1;
        return a + "." + b + "." + c + "." + d;
    }

    private static String synthesizeCreditCard(String original) {
        // Extract digits
        StringBuilder digitsOnly = new StringBuilder();
        for (char ch : original.toCharArray()) {
            if (Character.isDigit(ch)) digitsOnly.append(ch);
        }
        int numDigits = digitsOnly.length();

        // Generate random payload (all but last digit)
        int[] payload = new int[numDigits];
        for (int i = 0; i < numDigits - 1; i++) {
            payload[i] = RANDOM.nextInt(10);
        }

        // Calculate Luhn check digit
        int total = 0;
        for (int i = numDigits - 2; i >= 0; i--) {
            int d = payload[i];
            if ((numDigits - 2 - i) % 2 == 0) {
                d *= 2;
                if (d > 9) d -= 9;
            }
            total += d;
        }
        payload[numDigits - 1] = (10 - (total % 10)) % 10;

        // Re-insert separators
        StringBuilder result = new StringBuilder();
        int digitIdx = 0;
        for (char ch : original.toCharArray()) {
            if (Character.isDigit(ch)) {
                result.append(payload[digitIdx++]);
            } else {
                result.append(ch);
            }
        }
        return result.toString();
    }

    private static String synthesizeIban(String original) {
        String stripped = original.replace(" ", "");
        int length = stripped.length();
        if (length < 5) return formatPreserving(original);

        int bbanLen = length - 4;
        StringBuilder bban = new StringBuilder();
        for (int i = 0; i < bbanLen; i++) {
            bban.append(RANDOM.nextInt(10));
        }

        // Calculate check digits: "XX00" + bban → numeric → mod-97
        String numericStr = bban.toString() + "333300";
        long remainder = 0;
        for (char ch : numericStr.toCharArray()) {
            remainder = (remainder * 10 + (ch - '0')) % 97;
        }
        String checkDigits = String.format("%02d", 98 - remainder);
        String iban = "XX" + checkDigits + bban;

        // Re-insert spaces if original had them
        if (original.contains(" ")) {
            StringBuilder result = new StringBuilder();
            int ibanIdx = 0;
            for (char ch : original.toCharArray()) {
                if (ch == ' ') {
                    result.append(' ');
                } else {
                    result.append(ibanIdx < iban.length() ? iban.charAt(ibanIdx) : '0');
                    ibanIdx++;
                }
            }
            return result.toString();
        }
        return iban;
    }

    private static String randHex(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(HEX.charAt(RANDOM.nextInt(16)));
        }
        return sb.toString();
    }
}
