package dev.blindfold.sdk.regex;

import java.util.HashSet;
import java.util.Set;

public final class Validators {

    private Validators() {}

    // ---- Luhn ----

    public static boolean luhnChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length < 2) return false;
        int total = 0;
        for (int i = digits.length - 1, pos = 0; i >= 0; i--, pos++) {
            int d = digits[i];
            if (pos % 2 == 1) {
                d *= 2;
                if (d > 9) d -= 9;
            }
            total += d;
        }
        return total % 10 == 0;
    }

    // ---- IBAN mod-97 ----

    public static boolean ibanMod97(String iban) {
        String cleaned = iban.replace(" ", "").replace("-", "").toUpperCase();
        if (cleaned.length() < 5) return false;
        if (!Character.isLetter(cleaned.charAt(0)) || !Character.isLetter(cleaned.charAt(1))) return false;
        if (!Character.isDigit(cleaned.charAt(2)) || !Character.isDigit(cleaned.charAt(3))) return false;
        String rearranged = cleaned.substring(4) + cleaned.substring(0, 4);
        StringBuilder numeric = new StringBuilder();
        for (char c : rearranged.toCharArray()) {
            if (Character.isDigit(c)) {
                numeric.append(c);
            } else if (Character.isLetter(c)) {
                numeric.append(c - 'A' + 10);
            } else {
                return false;
            }
        }
        // Process in chunks to avoid BigInteger dependency
        long remainder = 0;
        String numStr = numeric.toString();
        for (int i = 0; i < numStr.length(); i++) {
            remainder = (remainder * 10 + (numStr.charAt(i) - '0')) % 97;
        }
        return remainder == 1;
    }

    // ---- SSN ----

    public static boolean ssnValidFormat(String ssn) {
        String digits = extractDigitString(ssn);
        if (digits.length() != 9) return false;
        int area = Integer.parseInt(digits.substring(0, 3));
        int group = Integer.parseInt(digits.substring(3, 5));
        int serial = Integer.parseInt(digits.substring(5));
        return area != 0 && area != 666 && area < 900 && group != 0 && serial != 0;
    }

    // ---- German Tax ID (ISO 7064 Mod 11,10) ----

    public static boolean deTaxIdChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 11) return false;
        int product = 10;
        for (int i = 0; i < 10; i++) {
            int total = (digits[i] + product) % 10;
            if (total == 0) total = 10;
            product = (total * 2) % 11;
        }
        int check = 11 - product;
        if (check == 10) check = 0;
        return digits[10] == check;
    }

    // ---- French NIR (mod 97) ----

    public static boolean frNirChecksum(String number) {
        String upper = number.toUpperCase().replace("2A", "19").replace("2B", "18");
        String cleaned = extractDigitString(upper);
        if (cleaned.length() != 15) return false;
        long base = Long.parseLong(cleaned.substring(0, 13));
        int key = Integer.parseInt(cleaned.substring(13, 15));
        return key == (97 - (base % 97));
    }

    // ---- Spanish DNI ----

    private static final String ES_DNI_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";

    public static boolean esDniLetter(String number) {
        String cleaned = extractAlnum(number);
        if (cleaned.length() != 9) return false;
        String digitsStr = cleaned.substring(0, 8);
        char letter = Character.toUpperCase(cleaned.charAt(8));
        if (!isAllDigits(digitsStr)) return false;
        char expected = ES_DNI_LETTERS.charAt(Integer.parseInt(digitsStr) % 23);
        return letter == expected;
    }

    // ---- Spanish NIE ----

    public static boolean esNieLetter(String number) {
        String cleaned = extractAlnum(number);
        if (cleaned.length() != 9) return false;
        char prefix = Character.toUpperCase(cleaned.charAt(0));
        String mapping;
        switch (prefix) {
            case 'X': mapping = "0"; break;
            case 'Y': mapping = "1"; break;
            case 'Z': mapping = "2"; break;
            default: return false;
        }
        String digitsStr = mapping + cleaned.substring(1, 8);
        char letter = Character.toUpperCase(cleaned.charAt(8));
        if (!isAllDigits(digitsStr)) return false;
        char expected = ES_DNI_LETTERS.charAt(Integer.parseInt(digitsStr) % 23);
        return letter == expected;
    }

    // ---- Italian Codice Fiscale ----

    private static final int[] IT_ODD = new int[128];
    private static final int[] IT_EVEN = new int[128];
    static {
        int[] oddVals = {1,0,5,7,9,13,15,17,19,21, 1,0,5,7,9,13,15,17,19,21,
                         2,4,18,20,11,3,6,8,12,14,16,10,22,25,24,23};
        char[] oddKeys = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();
        for (int i = 0; i < oddKeys.length; i++) IT_ODD[oddKeys[i]] = oddVals[i];
        char[] evenKeys = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();
        for (int i = 0; i < evenKeys.length; i++) IT_EVEN[evenKeys[i]] = i < 10 ? i : i - 10;
    }

    public static boolean itCodiceFiscaleCheck(String code) {
        String cleaned = extractAlnum(code).toUpperCase();
        if (cleaned.length() != 16) return false;
        int total = 0;
        for (int i = 0; i < 15; i++) {
            char c = cleaned.charAt(i);
            if (c >= 128) return false;
            total += ((i + 1) % 2 == 1) ? IT_ODD[c] : IT_EVEN[c];
        }
        char expected = (char) (total % 26 + 'A');
        return cleaned.charAt(15) == expected;
    }

    // ---- Portuguese NIF ----

    public static boolean ptNifChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 9) return false;
        int first = digits[0];
        if (first != 1 && first != 2 && first != 3 && first != 5 && first != 6 && first != 8 && first != 9)
            return false;
        int total = 0;
        for (int i = 0; i < 8; i++) total += digits[i] * (9 - i);
        int remainder = total % 11;
        int check = remainder < 2 ? 0 : 11 - remainder;
        return digits[8] == check;
    }

    // ---- Polish PESEL ----

    public static boolean plPeselChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 11) return false;
        int[] weights = {1, 3, 7, 9, 1, 3, 7, 9, 1, 3};
        int total = 0;
        for (int i = 0; i < 10; i++) total += digits[i] * weights[i];
        int check = (10 - (total % 10)) % 10;
        return digits[10] == check;
    }

    // ---- Polish NIP ----

    public static boolean plNipChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 10) return false;
        int[] weights = {6, 5, 7, 2, 3, 4, 5, 6, 7};
        int total = 0;
        for (int i = 0; i < 9; i++) total += digits[i] * weights[i];
        int check = total % 11;
        if (check == 10) return false;
        return digits[9] == check;
    }

    // ---- Czech Birth Number ----

    public static boolean czBirthNumberValid(String number) {
        String cleaned = number.replace("/", "").replace(" ", "");
        if (!isAllDigits(cleaned)) return false;
        if (cleaned.length() != 9 && cleaned.length() != 10) return false;
        if (cleaned.length() == 10 && Long.parseLong(cleaned) % 11 != 0) return false;
        int month = Integer.parseInt(cleaned.substring(2, 4));
        int baseMonth = month % 50;
        if (baseMonth > 20) baseMonth -= 20;
        return baseMonth >= 1 && baseMonth <= 12;
    }

    // ---- Czech ICO ----

    public static boolean czIcoChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 8) return false;
        int[] weights = {8, 7, 6, 5, 4, 3, 2};
        int total = 0;
        for (int i = 0; i < 7; i++) total += digits[i] * weights[i];
        int remainder = total % 11;
        int check;
        if (remainder == 0) check = 1;
        else if (remainder == 1) check = 0;
        else check = 11 - remainder;
        return digits[7] == check;
    }

    // ---- Czech DIC ----

    public static boolean czDicValid(String number) {
        String cleaned = number.trim();
        if (cleaned.toUpperCase().startsWith("CZ")) cleaned = cleaned.substring(2);
        if (!isAllDigits(cleaned)) return false;
        if (cleaned.length() == 8) return czIcoChecksum(cleaned);
        if (cleaned.length() == 10) return Long.parseLong(cleaned) % 11 == 0;
        if (cleaned.length() == 9) {
            int month = Integer.parseInt(cleaned.substring(2, 4));
            int baseMonth = month % 50;
            if (baseMonth > 20) baseMonth -= 20;
            return baseMonth >= 1 && baseMonth <= 12;
        }
        return false;
    }

    // ---- Czech Bank Account ----

    public static boolean czBankAccountValid(String number) {
        String[] parts = number.split("/");
        if (parts.length != 2) return false;
        String bankCode = parts[1];
        if (!isAllDigits(bankCode) || bankCode.length() != 4) return false;
        String accountPart = parts[0];
        String prefix = "";
        String account = accountPart;
        if (accountPart.contains("-")) {
            String[] split = accountPart.split("-");
            if (split.length != 2) return false;
            prefix = split[0];
            account = split[1];
        }
        if (!prefix.isEmpty() && (!isAllDigits(prefix) || prefix.length() > 6)) return false;
        if (!isAllDigits(account) || account.length() < 2 || account.length() > 10) return false;
        int[] weights = {6, 3, 7, 9, 10, 5, 8, 4, 2, 1};
        int[] accDigits = padLeft(account, 10);
        int total = 0;
        for (int i = 0; i < 10; i++) total += accDigits[i] * weights[i];
        if (total % 11 != 0) return false;
        if (!prefix.isEmpty()) {
            int[] prefDigits = padLeft(prefix, 6);
            int[] prefWeights = {10, 5, 8, 4, 2, 1};
            int prefTotal = 0;
            for (int i = 0; i < 6; i++) prefTotal += prefDigits[i] * prefWeights[i];
            if (prefTotal % 11 != 0) return false;
        }
        return true;
    }

    // ---- Slovak Birth Number ----

    public static boolean skBirthNumberValid(String number) {
        return czBirthNumberValid(number);
    }

    // ---- Slovak ICO ----

    public static boolean skIcoChecksum(String number) {
        return czIcoChecksum(number);
    }

    // ---- Slovak DIC ----

    public static boolean skDicValid(String number) {
        String cleaned = number.trim();
        if (cleaned.toUpperCase().startsWith("SK")) cleaned = cleaned.substring(2);
        if (!isAllDigits(cleaned) || cleaned.length() != 10) return false;
        return Long.parseLong(cleaned) % 11 == 0;
    }

    // ---- Russian INN ----

    public static boolean ruInnChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length == 10) {
            int[] weights = {2, 4, 10, 3, 5, 9, 4, 6, 8};
            int total = 0;
            for (int i = 0; i < 9; i++) total += digits[i] * weights[i];
            return digits[9] == (total % 11) % 10;
        } else if (digits.length == 12) {
            int[] w1 = {7, 2, 4, 10, 3, 5, 9, 4, 6, 8};
            int t1 = 0;
            for (int i = 0; i < 10; i++) t1 += digits[i] * w1[i];
            if (digits[10] != (t1 % 11) % 10) return false;
            int[] w2 = {3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8};
            int t2 = 0;
            for (int i = 0; i < 11; i++) t2 += digits[i] * w2[i];
            return digits[11] == (t2 % 11) % 10;
        }
        return false;
    }

    // ---- Russian SNILS ----

    public static boolean ruSnilsChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 11) return false;
        long base = 0;
        for (int i = 0; i < 9; i++) base = base * 10 + digits[i];
        if (base <= 1001998) return true;
        int total = 0;
        for (int i = 0; i < 9; i++) total += digits[i] * (9 - i);
        int check = total % 101;
        if (check == 100) check = 0;
        int checkValue = digits[9] * 10 + digits[10];
        return checkValue == check;
    }

    // ---- Dutch BSN (11-test) ----

    public static boolean nlBsn11Test(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 9) return false;
        int total = 0;
        for (int i = 0; i < 8; i++) total += digits[i] * (9 - i);
        total -= digits[8];
        return total % 11 == 0 && total != 0;
    }

    // ---- Romanian CNP ----

    public static boolean roCnpChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 13) return false;
        if (digits[0] < 1 || digits[0] > 8) return false;
        int[] weights = {2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9};
        int total = 0;
        for (int i = 0; i < 12; i++) total += digits[i] * weights[i];
        int check = total % 11;
        if (check == 10) check = 1;
        return digits[12] == check;
    }

    // ---- Romanian CUI ----

    public static boolean roCuiChecksum(String number) {
        String cleaned = number.trim().toUpperCase();
        if (cleaned.startsWith("RO")) cleaned = cleaned.substring(2);
        int[] digits = extractDigits(cleaned);
        if (digits.length < 2 || digits.length > 10) return false;
        int[] weights = {7, 5, 3, 2, 1, 7, 5, 3, 2};
        int[] padded = new int[10];
        int offset = 10 - digits.length;
        System.arraycopy(digits, 0, padded, offset, digits.length);
        int check = padded[9];
        int total = 0;
        for (int i = 0; i < 9; i++) total += padded[i] * weights[i];
        int expected = (total * 10) % 11;
        if (expected == 10) expected = 0;
        return check == expected;
    }

    // ---- Danish CPR valid date ----

    public static boolean dkCprValidDate(String number) {
        String digits = extractDigitString(number);
        if (digits.length() != 10) return false;
        int day = Integer.parseInt(digits.substring(0, 2));
        int month = Integer.parseInt(digits.substring(2, 4));
        return day >= 1 && day <= 31 && month >= 1 && month <= 12;
    }

    // ---- Danish CVR ----

    public static boolean dkCvrChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 8) return false;
        int[] weights = {2, 7, 6, 5, 4, 3, 2, 1};
        int total = 0;
        for (int i = 0; i < 8; i++) total += digits[i] * weights[i];
        return total % 11 == 0;
    }

    // ---- Swedish Personnummer (Luhn on last 10) ----

    public static boolean sePersonnummerLuhn(String number) {
        String digits = extractDigitString(number);
        if (digits.length() == 12) digits = digits.substring(2);
        if (digits.length() != 10) return false;
        int month = Integer.parseInt(digits.substring(2, 4));
        int day = Integer.parseInt(digits.substring(4, 6));
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        return luhnChecksum(digits);
    }

    // ---- Swedish Organisationsnummer ----

    public static boolean seOrgnrChecksum(String number) {
        String digits = extractDigitString(number);
        if (digits.length() != 10) return false;
        if (digits.charAt(2) - '0' < 2) return false;
        return luhnChecksum(digits);
    }

    // ---- Norwegian Birth Number ----

    public static boolean noBirthNumberChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 11) return false;
        int[] w1 = {3, 7, 6, 1, 8, 9, 4, 5, 2};
        int t1 = 0;
        for (int i = 0; i < 9; i++) t1 += digits[i] * w1[i];
        int c1 = 11 - (t1 % 11);
        if (c1 == 11) c1 = 0;
        if (c1 == 10) return false;
        if (digits[9] != c1) return false;
        int[] w2 = {5, 4, 3, 2, 7, 6, 5, 4, 3, 2};
        int t2 = 0;
        for (int i = 0; i < 10; i++) t2 += digits[i] * w2[i];
        int c2 = 11 - (t2 % 11);
        if (c2 == 11) c2 = 0;
        if (c2 == 10) return false;
        return digits[10] == c2;
    }

    // ---- Norwegian Organisasjonsnummer ----

    public static boolean noOrgnrChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 9) return false;
        int[] weights = {3, 2, 7, 6, 5, 4, 3, 2};
        int total = 0;
        for (int i = 0; i < 8; i++) total += digits[i] * weights[i];
        int remainder = total % 11;
        if (remainder == 1) return false;
        int check = remainder == 0 ? 0 : 11 - remainder;
        return digits[8] == check;
    }

    // ---- Belgian National Number ----

    public static boolean beNationalNumberChecksum(String number) {
        String digits = extractDigitString(number);
        if (digits.length() != 11) return false;
        long base = Long.parseLong(digits.substring(0, 9));
        int check = Integer.parseInt(digits.substring(9, 11));
        if (97 - (base % 97) == check) return true;
        long base2000 = Long.parseLong("2" + digits.substring(0, 9));
        return 97 - (base2000 % 97) == check;
    }

    // ---- Belgian Enterprise Number ----

    public static boolean beEnterpriseChecksum(String number) {
        String digits = extractDigitString(number);
        if (digits.length() != 10) return false;
        if (digits.charAt(0) != '0' && digits.charAt(0) != '1') return false;
        long base = Long.parseLong(digits.substring(0, 8));
        int check = Integer.parseInt(digits.substring(8, 10));
        return 97 - (base % 97) == check;
    }

    // ---- Austrian SVNR ----

    public static boolean atSvnrChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 10) return false;
        int[] weights = {3, 7, 9, 0, 5, 8, 4, 2, 1, 6};
        int total = 0;
        for (int i = 0; i < 10; i++) total += digits[i] * weights[i];
        return total % 11 == digits[3];
    }

    // ---- Irish PPS ----

    public static boolean iePpsChecksum(String number) {
        String cleaned = extractAlnum(number).toUpperCase();
        if (cleaned.length() != 8 && cleaned.length() != 9) return false;
        int total = 0;
        for (int i = 0; i < 7; i++) {
            if (!Character.isDigit(cleaned.charAt(i))) return false;
            total += (cleaned.charAt(i) - '0') * (8 - i);
        }
        if (cleaned.length() == 9 && Character.isLetter(cleaned.charAt(8))) {
            total += (cleaned.charAt(8) - 'A' + 1) * 9;
        }
        int remainder = total % 23;
        char expected = remainder == 0 ? 'W' : (char) ('A' + remainder - 1);
        return cleaned.charAt(7) == expected;
    }

    // ---- Finnish HETU ----

    public static boolean fiHetuChecksum(String number) {
        String cleaned = number.replace(" ", "").replace("-", "");
        if (cleaned.length() != 11) {
            cleaned = number.trim();
        }
        if (cleaned.length() != 11) return false;
        String datePart = cleaned.substring(0, 6);
        if (!isAllDigits(datePart)) return false;
        char sep = cleaned.charAt(6);
        if ("-+ABCDEFYXWVUabcdefyxwvu".indexOf(sep) < 0) return false;
        String numPart = cleaned.substring(7, 10);
        if (!isAllDigits(numPart)) return false;
        String checkChars = "0123456789ABCDEFHJKLMNPRSTUVWXY";
        int combined = Integer.parseInt(datePart + numPart);
        char expected = checkChars.charAt(combined % 31);
        return Character.toUpperCase(cleaned.charAt(10)) == expected;
    }

    // ---- Finnish Y-tunnus ----

    public static boolean fiYtunnusChecksum(String number) {
        String digits = extractDigitString(number);
        if (digits.length() != 8) return false;
        int[] weights = {7, 9, 10, 5, 8, 4, 2};
        int total = 0;
        for (int i = 0; i < 7; i++) total += (digits.charAt(i) - '0') * weights[i];
        int remainder = total % 11;
        if (remainder == 1) return false;
        int check = remainder == 0 ? 0 : 11 - remainder;
        return (digits.charAt(7) - '0') == check;
    }

    // ---- Hungarian Tax ID ----

    public static boolean huTaxIdChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 10) return false;
        if (digits[0] != 8) return false;
        int[] weights = {1, 2, 3, 4, 5, 6, 7, 8, 9};
        int total = 0;
        for (int i = 0; i < 9; i++) total += digits[i] * weights[i];
        return digits[9] == total % 11;
    }

    // ---- Hungarian TAJ ----

    public static boolean huTajChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 9) return false;
        int total = 0;
        for (int i = 0; i < 8; i++) total += digits[i] * (i % 2 == 0 ? 3 : 7);
        return digits[8] == total % 10;
    }

    // ---- Bulgarian EGN ----

    public static boolean bgEgnChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 10) return false;
        String raw = extractDigitString(number);
        int month = Integer.parseInt(raw.substring(2, 4));
        int baseMonth = month > 40 ? month - 40 : month > 20 ? month - 20 : month;
        if (baseMonth < 1 || baseMonth > 12) return false;
        int[] weights = {2, 4, 8, 5, 10, 9, 7, 3, 6};
        int total = 0;
        for (int i = 0; i < 9; i++) total += digits[i] * weights[i];
        int check = total % 11;
        if (check == 10) check = 0;
        return digits[9] == check;
    }

    // ---- Croatian OIB (ISO 7064 MOD 11,2) ----

    public static boolean hrOibChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 11) return false;
        int remainder = 10;
        for (int i = 0; i < 10; i++) {
            remainder = (remainder + digits[i]) % 10;
            if (remainder == 0) remainder = 10;
            remainder = (remainder * 2) % 11;
        }
        int check = 11 - remainder;
        if (check == 10) check = 0;
        return digits[10] == check;
    }

    // ---- Slovenian EMSO ----

    public static boolean siEmsoChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 13) return false;
        int[] weights = {7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2};
        int total = 0;
        for (int i = 0; i < 12; i++) total += digits[i] * weights[i];
        int remainder = total % 11;
        int check = remainder == 0 ? 0 : 11 - remainder;
        if (check == 10) return false;
        return digits[12] == check;
    }

    // ---- Slovenian Tax Number ----

    public static boolean siTaxNumberChecksum(String number) {
        String cleaned = number.trim().toUpperCase();
        if (cleaned.startsWith("SI")) cleaned = cleaned.substring(2);
        int[] digits = extractDigits(cleaned);
        if (digits.length != 8) return false;
        int[] weights = {8, 7, 6, 5, 4, 3, 2};
        int total = 0;
        for (int i = 0; i < 7; i++) total += digits[i] * weights[i];
        int remainder = total % 11;
        if (remainder == 0 || remainder == 1) return digits[7] == 0;
        return digits[7] == 11 - remainder;
    }

    // ---- Lithuanian Personal Code ----

    public static boolean ltPersonalCodeChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 11) return false;
        if (digits[0] < 1 || digits[0] > 6) return false;
        int[] w1 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 1};
        int total = 0;
        for (int i = 0; i < 10; i++) total += digits[i] * w1[i];
        int check = total % 11;
        if (check == 10) {
            int[] w2 = {3, 4, 5, 6, 7, 8, 9, 1, 2, 3};
            total = 0;
            for (int i = 0; i < 10; i++) total += digits[i] * w2[i];
            check = total % 11;
            if (check == 10) check = 0;
        }
        return digits[10] == check;
    }

    // ---- Latvian Personal Code ----

    public static boolean lvPersonalCodeChecksum(String number) {
        String digits = extractDigitString(number);
        if (digits.length() != 11) return false;
        int day = Integer.parseInt(digits.substring(0, 2));
        int month = Integer.parseInt(digits.substring(2, 4));
        if (digits.charAt(0) == '3' && digits.charAt(1) == '2') return true;
        if (day < 1 || day > 31) return false;
        if (month < 1 || month > 12) return false;
        int[] weights = {1, 6, 3, 7, 9, 10, 5, 8, 4, 2};
        int total = 0;
        for (int i = 0; i < 10; i++) total += (digits.charAt(i) - '0') * weights[i];
        int check = ((1101 - total) % 11) % 10;
        return (digits.charAt(10) - '0') == check;
    }

    // ---- Estonian Personal Code ----

    public static boolean eePersonalCodeChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 11) return false;
        if (digits[0] < 1 || digits[0] > 6) return false;
        int[] w1 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 1};
        int total = 0;
        for (int i = 0; i < 10; i++) total += digits[i] * w1[i];
        int check = total % 11;
        if (check == 10) {
            int[] w2 = {3, 4, 5, 6, 7, 8, 9, 1, 2, 3};
            total = 0;
            for (int i = 0; i < 10; i++) total += digits[i] * w2[i];
            check = total % 11;
            if (check == 10) check = 0;
        }
        return digits[10] == check;
    }

    // ---- Canadian SIN (uses Luhn) ----
    // Use luhnChecksum directly

    // ---- Swiss AHV (EAN-13) ----

    public static boolean chAhvChecksum(String number) {
        String digits = extractDigitString(number);
        if (digits.length() != 13) return false;
        if (!digits.startsWith("756")) return false;
        int total = 0;
        for (int i = 0; i < 12; i++) {
            total += (digits.charAt(i) - '0') * (i % 2 == 0 ? 1 : 3);
        }
        int check = (10 - (total % 10)) % 10;
        return (digits.charAt(12) - '0') == check;
    }

    // ---- Australian TFN ----

    public static boolean auTfnChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length == 8) {
            int[] weights = {10, 7, 8, 4, 6, 3, 5, 1};
            int total = 0;
            for (int i = 0; i < 8; i++) total += digits[i] * weights[i];
            return total % 11 == 0;
        }
        if (digits.length == 9) {
            int[] weights = {1, 4, 3, 7, 5, 8, 6, 9, 10};
            int total = 0;
            for (int i = 0; i < 9; i++) total += digits[i] * weights[i];
            return total % 11 == 0;
        }
        return false;
    }

    // ---- Australian Medicare ----

    public static boolean auMedicareChecksum(String number) {
        String digits = extractDigitString(number);
        if (digits.length() < 10 || digits.length() > 11) return false;
        int[] weights = {1, 3, 7, 9, 1, 3, 7, 9};
        int total = 0;
        for (int i = 0; i < 8; i++) total += (digits.charAt(i) - '0') * weights[i];
        return (digits.charAt(8) - '0') == total % 10;
    }

    // ---- New Zealand IRD ----

    public static boolean nzIrdChecksum(String number) {
        String digits = extractDigitString(number);
        if (digits.length() != 8 && digits.length() != 9) return false;
        if (digits.length() == 8) digits = "0" + digits;
        int[] d = new int[9];
        for (int i = 0; i < 9; i++) d[i] = digits.charAt(i) - '0';
        int[] w1 = {3, 2, 7, 6, 5, 4, 3, 2};
        int total = 0;
        for (int i = 0; i < 8; i++) total += d[i] * w1[i];
        int r = total % 11;
        if (r == 0) return d[8] == 0;
        if (11 - r != 10) return d[8] == 11 - r;
        int[] w2 = {7, 4, 3, 2, 5, 2, 7, 6};
        total = 0;
        for (int i = 0; i < 8; i++) total += d[i] * w2[i];
        int r2 = total % 11;
        if (r2 == 0) return d[8] == 0;
        return d[8] == 11 - r2;
    }

    // ---- Indian Aadhaar (Verhoeff) ----

    private static final int[][] VERHOEFF_D = {
        {0,1,2,3,4,5,6,7,8,9}, {1,2,3,4,0,6,7,8,9,5},
        {2,3,4,0,1,7,8,9,5,6}, {3,4,0,1,2,8,9,5,6,7},
        {4,0,1,2,3,9,5,6,7,8}, {5,9,8,7,6,0,4,3,2,1},
        {6,5,9,8,7,1,0,4,3,2}, {7,6,5,9,8,2,1,0,4,3},
        {8,7,6,5,9,3,2,1,0,4}, {9,8,7,6,5,4,3,2,1,0},
    };
    private static final int[][] VERHOEFF_P = {
        {0,1,2,3,4,5,6,7,8,9}, {1,5,7,6,2,8,3,0,9,4},
        {5,8,0,3,7,9,6,1,4,2}, {8,9,1,6,0,4,3,5,2,7},
        {9,4,5,3,1,2,6,8,7,0}, {4,2,8,6,5,7,3,9,0,1},
        {2,7,9,3,8,0,6,4,1,5}, {7,0,4,6,9,1,3,2,5,8},
    };

    public static boolean inAadhaarChecksum(String number) {
        String digits = extractDigitString(number);
        if (digits.length() != 12) return false;
        if (digits.charAt(0) == '0' || digits.charAt(0) == '1') return false;
        int c = 0;
        for (int i = digits.length() - 1; i >= 0; i--) {
            c = VERHOEFF_D[c][VERHOEFF_P[(digits.length() - 1 - i) % 8][digits.charAt(i) - '0']];
        }
        return c == 0;
    }

    // ---- Indian PAN ----

    public static boolean inPanValid(String number) {
        String cleaned = number.trim().toUpperCase();
        if (cleaned.length() != 10) return false;
        return cleaned.matches("^[A-Z]{3}[ABCFGHLJPT][A-Z]\\d{4}[A-Z]$");
    }

    // ---- Japanese My Number ----

    public static boolean jpMyNumberChecksum(String number) {
        String digits = extractDigitString(number);
        if (digits.length() != 12) return false;
        int total = 0;
        for (int i = 0; i < 11; i++) {
            int p = 11 - i;
            int q = p <= 6 ? p + 1 : p - 5;
            total += (digits.charAt(i) - '0') * q;
        }
        int remainder = total % 11;
        int check = remainder <= 1 ? 0 : 11 - remainder;
        return (digits.charAt(11) - '0') == check;
    }

    // ---- Korean RRN ----

    public static boolean krRrnChecksum(String number) {
        String digits = extractDigitString(number);
        if (digits.length() != 13) return false;
        int[] weights = {2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5};
        int total = 0;
        for (int i = 0; i < 12; i++) total += (digits.charAt(i) - '0') * weights[i];
        int check = (11 - (total % 11)) % 10;
        return (digits.charAt(12) - '0') == check;
    }

    // ---- South African ID (Luhn) ----
    // Use luhnChecksum directly

    // ---- Turkish Kimlik ----

    public static boolean trKimlikChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 11) return false;
        if (digits[0] == 0) return false;
        int oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
        int evenSum = digits[1] + digits[3] + digits[5] + digits[7];
        int check1 = ((oddSum * 7) - evenSum) % 10;
        if (check1 < 0) check1 += 10;
        if (check1 != digits[9]) return false;
        int total = 0;
        for (int i = 0; i < 10; i++) total += digits[i];
        return total % 10 == digits[10];
    }

    // ---- Argentine CUIT ----

    public static boolean arCuitChecksum(String number) {
        String digits = extractDigitString(number);
        if (digits.length() != 11) return false;
        int[] weights = {5, 4, 3, 2, 7, 6, 5, 4, 3, 2};
        int total = 0;
        for (int i = 0; i < 10; i++) total += (digits.charAt(i) - '0') * weights[i];
        int remainder = total % 11;
        int check;
        if (remainder == 0) check = 0;
        else if (remainder == 1) check = 9;
        else check = 11 - remainder;
        return (digits.charAt(10) - '0') == check;
    }

    // ---- Chilean RUT ----

    public static boolean clRutChecksum(String number) {
        String cleaned = number.replace(".", "").replace(" ", "").toUpperCase();
        if (cleaned.contains("-")) {
            String[] parts = cleaned.split("-");
            if (parts.length != 2) return false;
            cleaned = parts[0] + parts[1];
        }
        if (cleaned.length() < 2) return false;
        String body = cleaned.substring(0, cleaned.length() - 1);
        char checkChar = cleaned.charAt(cleaned.length() - 1);
        if (!isAllDigits(body)) return false;
        int total = 0;
        int mul = 2;
        for (int i = body.length() - 1; i >= 0; i--) {
            total += (body.charAt(i) - '0') * mul;
            mul = mul == 7 ? 2 : mul + 1;
        }
        int remainder = 11 - (total % 11);
        char expected;
        if (remainder == 11) expected = '0';
        else if (remainder == 10) expected = 'K';
        else expected = (char) ('0' + remainder);
        return checkChar == expected;
    }

    // ---- Colombian NIT ----

    public static boolean coNitChecksum(String number) {
        String digits = extractDigitString(number);
        if (digits.length() < 8 || digits.length() > 10) return false;
        String body = digits.substring(0, digits.length() - 1);
        int check = digits.charAt(digits.length() - 1) - '0';
        int[] weights = {3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71};
        int total = 0;
        for (int i = 0; i < body.length(); i++) {
            total += (body.charAt(body.length() - 1 - i) - '0') * weights[i];
        }
        int remainder = total % 11;
        int expected;
        if (remainder == 0) expected = 0;
        else if (remainder == 1) expected = 1;
        else expected = 11 - remainder;
        return check == expected;
    }

    // ---- Brazilian CPF ----

    public static boolean brCpfChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 11) return false;
        Set<Integer> unique = new HashSet<>();
        for (int d : digits) unique.add(d);
        if (unique.size() == 1) return false;
        int t1 = 0;
        for (int i = 0; i < 9; i++) t1 += digits[i] * (10 - i);
        int c1 = (t1 * 10) % 11;
        if (c1 == 10) c1 = 0;
        if (digits[9] != c1) return false;
        int t2 = 0;
        for (int i = 0; i < 10; i++) t2 += digits[i] * (11 - i);
        int c2 = (t2 * 10) % 11;
        if (c2 == 10) c2 = 0;
        return digits[10] == c2;
    }

    // ---- Brazilian CNPJ ----

    public static boolean brCnpjChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 14) return false;
        int[] w1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int t1 = 0;
        for (int i = 0; i < 12; i++) t1 += digits[i] * w1[i];
        int c1 = t1 % 11;
        c1 = c1 < 2 ? 0 : 11 - c1;
        if (digits[12] != c1) return false;
        int[] w2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int t2 = 0;
        for (int i = 0; i < 13; i++) t2 += digits[i] * w2[i];
        int c2 = t2 % 11;
        c2 = c2 < 2 ? 0 : 11 - c2;
        return digits[13] == c2;
    }

    // ---- US ITIN ----

    public static boolean usItinValid(String number) {
        String digits = extractDigitString(number);
        if (digits.length() != 9) return false;
        if (digits.charAt(0) != '9') return false;
        return (digits.charAt(3) - '0') >= 7;
    }

    // ---- UK UTR ----

    public static boolean ukUtrChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 10) return false;
        int[] weights = {6, 7, 8, 9, 10, 5, 4, 3, 2};
        int total = 0;
        for (int i = 0; i < 9; i++) total += digits[i + 1] * weights[i];
        int remainder = total % 11;
        int check = (11 - remainder >= 10) ? 0 : 11 - remainder;
        return digits[0] == check;
    }

    // ---- NHS ----

    public static boolean nhsChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 10) return false;
        int[] weights = {10, 9, 8, 7, 6, 5, 4, 3, 2};
        int total = 0;
        for (int i = 0; i < 9; i++) total += digits[i] * weights[i];
        int remainder = total % 11;
        int check = 11 - remainder;
        if (check == 11) check = 0;
        if (check == 10) return false;
        return digits[9] == check;
    }

    // ---- Spanish NSS ----

    public static boolean esNssChecksum(String number) {
        String digits = extractDigitString(number);
        if (digits.length() != 12) return false;
        int province = Integer.parseInt(digits.substring(0, 2));
        if (province < 1 || province > 53) return false;
        long baseNum = Long.parseLong(digits.substring(0, 10));
        int check = Integer.parseInt(digits.substring(10, 12));
        return baseNum % 97 == check;
    }

    // ---- Spanish CIF ----

    public static boolean esCifChecksum(String number) {
        String cleaned = extractAlnum(number).toUpperCase();
        if (cleaned.length() != 9) return false;
        char letter = cleaned.charAt(0);
        if ("ABCDEFGHJNPQRSUVW".indexOf(letter) < 0) return false;
        int totalEven = 0, totalOdd = 0;
        for (int i = 1; i <= 7; i++) {
            if (!Character.isDigit(cleaned.charAt(i))) return false;
            int d = cleaned.charAt(i) - '0';
            if (i % 2 == 0) {
                totalEven += d;
            } else {
                int doubled = d * 2;
                totalOdd += doubled / 10 + doubled % 10;
            }
        }
        int total = totalEven + totalOdd;
        int checkDigit = (10 - (total % 10)) % 10;
        char control = cleaned.charAt(8);
        if ("KPQS".indexOf(letter) >= 0) {
            return control == (char) ('A' + checkDigit);
        }
        if ("ABEH".indexOf(letter) >= 0) {
            return control == (char) ('0' + checkDigit);
        }
        return control == (char) ('0' + checkDigit) || control == (char) ('A' + checkDigit);
    }

    // ---- Italian Partita IVA ----

    public static boolean itPartitaIvaChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length != 11) return false;
        boolean allZero = true;
        for (int d : digits) if (d != 0) { allZero = false; break; }
        if (allZero) return false;
        int total = 0;
        for (int i = 0; i < 10; i++) {
            if (i % 2 == 0) {
                total += digits[i];
            } else {
                int doubled = digits[i] * 2;
                total += doubled > 9 ? doubled - 9 : doubled;
            }
        }
        int check = (10 - (total % 10)) % 10;
        return digits[10] == check;
    }

    // ---- Polish REGON ----

    public static boolean plRegonChecksum(String number) {
        int[] digits = extractDigits(number);
        if (digits.length == 9) {
            int[] weights = {8, 9, 2, 3, 4, 5, 6, 7};
            int total = 0;
            for (int i = 0; i < 8; i++) total += digits[i] * weights[i];
            int check = total % 11 == 10 ? 0 : total % 11;
            return digits[8] == check;
        }
        if (digits.length == 14) {
            int[] w9 = {8, 9, 2, 3, 4, 5, 6, 7};
            int t9 = 0;
            for (int i = 0; i < 8; i++) t9 += digits[i] * w9[i];
            int c9 = t9 % 11 == 10 ? 0 : t9 % 11;
            if (digits[8] != c9) return false;
            int[] w14 = {2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8};
            int t14 = 0;
            for (int i = 0; i < 13; i++) t14 += digits[i] * w14[i];
            int c14 = t14 % 11 == 10 ? 0 : t14 % 11;
            return digits[13] == c14;
        }
        return false;
    }

    // ---- Phone length check ----

    public static boolean phoneLengthCheck(String number) {
        String digits = extractDigitString(number);
        if (digits.length() < 7 || digits.length() > 15) return false;
        // Reject date-like patterns
        if (number.matches(".*\\d{1,2}[-./]\\d{1,2}[-./]\\d{2,4}.*")) return false;
        // Reject SSN-like patterns
        if (number.matches(".*\\d{3}[-.]\\d{2}[-.]\\d{4}.*")) return false;
        return true;
    }

    // ---- URL TLD validation ----

    private static final Set<String> VALID_TLDS = new HashSet<>();
    static {
        String[] tlds = {"com","org","net","edu","gov","mil","int","co","io","dev","app","ai",
            "me","us","uk","ca","au","de","fr","es","it","nl","be","at","ch","ru","cn","jp",
            "kr","in","br","mx","ar","za","nz","se","no","dk","fi","pl","cz","sk","hu","ro",
            "bg","hr","si","lt","lv","ee","ie","pt","il","tr","info","biz","name","museum",
            "travel","aero","coop","pro","jobs","tel","mobi","asia","cat","xxx","post","bike",
            "clothing","guru","holdings","plumbing","singles","ventures","voyage","expert",
            "agency","company","estate","gallery","graphics","lighting","management","menu",
            "photography","solutions","support","systems","technology","tips","today","training",
            "directory","kitchen","land","construction","contractors","diamonds","enterprises",
            "equipment","recipes","shoes","tattoo","uno","academy","cab","camera","camp","center",
            "computer","education","email","glass","institute","international","marketing",
            "pub","repair","social","supply","wiki","xyz","club","digital","link","lol","ltd",
            "moe","ong","online","store","tech","site","space","website","fun","host","press",
            "live","cloud","page","tv","cc","ly","gg","to","fm","ac","sh","ws"};
        for (String tld : tlds) VALID_TLDS.add(tld.toLowerCase());
    }

    public static boolean urlValidTld(String url) {
        int slashIdx = url.indexOf("://");
        String host = slashIdx >= 0 ? url.substring(slashIdx + 3) : url;
        int pathIdx = host.indexOf('/');
        if (pathIdx >= 0) host = host.substring(0, pathIdx);
        int portIdx = host.indexOf(':');
        if (portIdx >= 0) host = host.substring(0, portIdx);
        int lastDot = host.lastIndexOf('.');
        if (lastDot < 0) return false;
        String tld = host.substring(lastDot + 1).toLowerCase();
        return VALID_TLDS.contains(tld);
    }

    // ---- ZIP valid ----

    public static boolean zipValid(String zip) {
        String digits = extractDigitString(zip);
        return digits.length() >= 5 && !digits.startsWith("000");
    }

    // ---- Date plausibility ----

    public static boolean validDate(String text) {
        // If text contains month names, accept
        String lower = text.toLowerCase();
        String[] months = {"january","february","march","april","may","june","july",
            "august","september","october","november","december",
            "jan","feb","mar","apr","jun","jul","aug","sep","oct","nov","dec"};
        for (String m : months) {
            if (lower.contains(m)) return true;
        }
        // For numeric dates, check we have at least 3 digit groups
        String digits = extractDigitString(text);
        return digits.length() >= 4;
    }

    // ---- Utility methods ----

    private static int[] extractDigits(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (Character.isDigit(c)) sb.append(c);
        }
        int[] result = new int[sb.length()];
        for (int i = 0; i < sb.length(); i++) result[i] = sb.charAt(i) - '0';
        return result;
    }

    static String extractDigitString(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (Character.isDigit(c)) sb.append(c);
        }
        return sb.toString();
    }

    private static String extractAlnum(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (Character.isLetterOrDigit(c)) sb.append(c);
        }
        return sb.toString();
    }

    private static boolean isAllDigits(String s) {
        for (char c : s.toCharArray()) {
            if (!Character.isDigit(c)) return false;
        }
        return !s.isEmpty();
    }

    private static int[] padLeft(String digits, int length) {
        int[] result = new int[length];
        int offset = length - digits.length();
        for (int i = 0; i < digits.length(); i++) {
            result[offset + i] = digits.charAt(i) - '0';
        }
        return result;
    }
}
