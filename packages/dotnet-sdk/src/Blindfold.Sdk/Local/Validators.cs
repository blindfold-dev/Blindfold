using System.Text;
using System.Text.RegularExpressions;

namespace Blindfold.Sdk.Local;

internal static class Validators
{
    // ---- Utility ----

    private static int[] ExtractDigits(string s) => s.Where(char.IsDigit).Select(c => c - '0').ToArray();

    private static string ExtractDigitString(string s) => new(s.Where(char.IsDigit).ToArray());

    private static string ExtractAlnum(string s) => new(s.Where(char.IsLetterOrDigit).ToArray());

    private static bool IsAllDigits(string s) => s.Length > 0 && s.All(char.IsDigit);

    private static int[] PadLeft(string digitStr, int length)
    {
        var result = new int[length];
        var offset = length - digitStr.Length;
        for (var i = 0; i < digitStr.Length; i++)
            result[offset + i] = digitStr[i] - '0';
        return result;
    }

    // ---- Luhn ----

    public static bool LuhnChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length < 2) return false;
        var total = 0;
        for (int i = digits.Length - 1, pos = 0; i >= 0; i--, pos++)
        {
            var d = digits[i];
            if (pos % 2 == 1) { d *= 2; if (d > 9) d -= 9; }
            total += d;
        }
        return total % 10 == 0;
    }

    // ---- IBAN mod-97 ----

    public static bool IbanMod97(string iban)
    {
        var cleaned = iban.Replace(" ", "").Replace("-", "").ToUpperInvariant();
        if (cleaned.Length < 5) return false;
        if (!char.IsLetter(cleaned[0]) || !char.IsLetter(cleaned[1])) return false;
        if (!char.IsDigit(cleaned[2]) || !char.IsDigit(cleaned[3])) return false;
        var rearranged = cleaned.Substring(4) + cleaned.Substring(0, 4);
        var sb = new StringBuilder();
        foreach (var c in rearranged)
        {
            if (char.IsDigit(c)) sb.Append(c);
            else if (char.IsLetter(c)) sb.Append(c - 'A' + 10);
            else return false;
        }
        long remainder = 0;
        foreach (var c in sb.ToString())
            remainder = (remainder * 10 + (c - '0')) % 97;
        return remainder == 1;
    }

    // ---- SSN ----

    public static bool SsnValidFormat(string ssn)
    {
        var digits = ExtractDigitString(ssn);
        if (digits.Length != 9) return false;
        var area = int.Parse(digits.Substring(0, 3));
        var group = int.Parse(digits.Substring(3, 2));
        var serial = int.Parse(digits.Substring(5, 4));
        return area != 0 && area != 666 && area < 900 && group != 0 && serial != 0;
    }

    // ---- German Tax ID (ISO 7064 Mod 11,10) ----

    public static bool DeTaxIdChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 11) return false;
        var product = 10;
        for (var i = 0; i < 10; i++)
        {
            var total = (digits[i] + product) % 10;
            if (total == 0) total = 10;
            product = (total * 2) % 11;
        }
        var check = 11 - product;
        if (check == 10) check = 0;
        return digits[10] == check;
    }

    // ---- French NIR (mod 97) ----

    public static bool FrNirChecksum(string number)
    {
        var upper = number.ToUpperInvariant().Replace("2A", "19").Replace("2B", "18");
        var cleaned = ExtractDigitString(upper);
        if (cleaned.Length != 15) return false;
        if (!long.TryParse(cleaned.Substring(0, 13), out var baseNum)) return false;
        if (!int.TryParse(cleaned.Substring(13, 2), out var key)) return false;
        return key == (int)(97 - (baseNum % 97));
    }

    // ---- Spanish DNI ----

    private const string EsDNILetters = "TRWAGMYFPDXBNJZSQVHLCKE";

    public static bool EsDniLetter(string number)
    {
        var cleaned = ExtractAlnum(number).ToUpperInvariant();
        if (cleaned.Length != 9) return false;
        var digitsStr = cleaned.Substring(0, 8);
        var letter = cleaned[8];
        if (!IsAllDigits(digitsStr)) return false;
        var num = int.Parse(digitsStr);
        return letter == EsDNILetters[num % 23];
    }

    // ---- Spanish NIE ----

    public static bool EsNieLetter(string number)
    {
        var cleaned = ExtractAlnum(number).ToUpperInvariant();
        if (cleaned.Length != 9) return false;
        var prefix = cleaned[0];
        string mapping = prefix switch
        {
            'X' => "0",
            'Y' => "1",
            'Z' => "2",
            _ => ""
        };
        if (mapping == "") return false;
        var digitsStr = mapping + cleaned.Substring(1, 7);
        var letter = cleaned[8];
        if (!IsAllDigits(digitsStr)) return false;
        var num = int.Parse(digitsStr);
        return letter == EsDNILetters[num % 23];
    }

    // ---- Italian Codice Fiscale ----

    private static readonly int[] ItOdd = new int[128];
    private static readonly int[] ItEven = new int[128];

    static Validators()
    {
        var oddVals = new[] {1,0,5,7,9,13,15,17,19,21,1,0,5,7,9,13,15,17,19,21,
            2,4,18,20,11,3,6,8,12,14,16,10,22,25,24,23};
        var oddKeys = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (var i = 0; i < oddKeys.Length; i++)
            ItOdd[oddKeys[i]] = oddVals[i];
        var evenKeys = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (var i = 0; i < evenKeys.Length; i++)
            ItEven[evenKeys[i]] = i < 10 ? i : i - 10;
    }

    public static bool ItCodiceFiscaleCheck(string code)
    {
        var cleaned = ExtractAlnum(code).ToUpperInvariant();
        if (cleaned.Length != 16) return false;
        var total = 0;
        for (var i = 0; i < 15; i++)
        {
            var c = cleaned[i];
            if (c >= 128) return false;
            total += (i + 1) % 2 == 1 ? ItOdd[c] : ItEven[c];
        }
        var expected = (char)(total % 26 + 'A');
        return cleaned[15] == expected;
    }

    // ---- Portuguese NIF ----

    public static bool PtNifChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 9) return false;
        var first = digits[0];
        if (first != 1 && first != 2 && first != 3 && first != 5 && first != 6 && first != 8 && first != 9)
            return false;
        var total = 0;
        for (var i = 0; i < 8; i++) total += digits[i] * (9 - i);
        var remainder = total % 11;
        var check = remainder >= 2 ? 11 - remainder : 0;
        return digits[8] == check;
    }

    // ---- Polish PESEL ----

    public static bool PlPeselChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 11) return false;
        var weights = new[] {1,3,7,9,1,3,7,9,1,3};
        var total = 0;
        for (var i = 0; i < 10; i++) total += digits[i] * weights[i];
        return digits[10] == (10 - (total % 10)) % 10;
    }

    // ---- Polish NIP ----

    public static bool PlNipChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 10) return false;
        var weights = new[] {6,5,7,2,3,4,5,6,7};
        var total = 0;
        for (var i = 0; i < 9; i++) total += digits[i] * weights[i];
        var check = total % 11;
        return check != 10 && digits[9] == check;
    }

    // ---- Polish REGON ----

    public static bool PlRegonChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length == 9)
        {
            var w = new[] {8,9,2,3,4,5,6,7};
            var t = 0;
            for (var i = 0; i < 8; i++) t += digits[i] * w[i];
            var c = t % 11; if (c == 10) c = 0;
            return digits[8] == c;
        }
        if (digits.Length == 14)
        {
            var w9 = new[] {8,9,2,3,4,5,6,7};
            var t9 = 0;
            for (var i = 0; i < 8; i++) t9 += digits[i] * w9[i];
            var c9 = t9 % 11; if (c9 == 10) c9 = 0;
            if (digits[8] != c9) return false;
            var w14 = new[] {2,4,8,5,0,9,7,3,6,1,2,4,8};
            var t14 = 0;
            for (var i = 0; i < 13; i++) t14 += digits[i] * w14[i];
            var c14 = t14 % 11; if (c14 == 10) c14 = 0;
            return digits[13] == c14;
        }
        return false;
    }

    // ---- Czech Birth Number ----

    public static bool CzBirthNumberValid(string number)
    {
        var cleaned = number.Replace("/", "").Replace(" ", "");
        if (!IsAllDigits(cleaned)) return false;
        if (cleaned.Length != 9 && cleaned.Length != 10) return false;
        if (cleaned.Length == 10)
        {
            if (!long.TryParse(cleaned, out var n) || n % 11 != 0) return false;
        }
        var month = int.Parse(cleaned.Substring(2, 2));
        var baseMonth = month % 50;
        if (baseMonth > 20) baseMonth -= 20;
        return baseMonth >= 1 && baseMonth <= 12;
    }

    // ---- Czech ICO ----

    public static bool CzIcoChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 8) return false;
        var weights = new[] {8,7,6,5,4,3,2};
        var total = 0;
        for (var i = 0; i < 7; i++) total += digits[i] * weights[i];
        var remainder = total % 11;
        int check;
        if (remainder == 0) check = 1;
        else if (remainder == 1) check = 0;
        else check = 11 - remainder;
        return digits[7] == check;
    }

    // ---- Czech DIC ----

    public static bool CzDicValid(string number)
    {
        var cleaned = number.Trim();
        if (cleaned.ToUpperInvariant().StartsWith("CZ")) cleaned = cleaned.Substring(2);
        if (!IsAllDigits(cleaned)) return false;
        if (cleaned.Length == 8) return CzIcoChecksum(cleaned);
        if (cleaned.Length == 10)
        {
            return long.TryParse(cleaned, out var n) && n % 11 == 0;
        }
        if (cleaned.Length == 9)
        {
            var month = int.Parse(cleaned.Substring(2, 2));
            var baseMonth = month % 50;
            if (baseMonth > 20) baseMonth -= 20;
            return baseMonth >= 1 && baseMonth <= 12;
        }
        return false;
    }

    // ---- Czech Bank Account ----

    public static bool CzBankAccountValid(string number)
    {
        var parts = number.Split('/');
        if (parts.Length != 2) return false;
        var bankCode = parts[1];
        if (!IsAllDigits(bankCode) || bankCode.Length != 4) return false;
        var accountPart = parts[0];
        var prefix = "";
        var account = accountPart;
        if (accountPart.Contains('-'))
        {
            var split = accountPart.Split(new[] {'-'}, 2);
            if (split.Length != 2) return false;
            prefix = split[0]; account = split[1];
        }
        if (prefix != "" && (!IsAllDigits(prefix) || prefix.Length > 6)) return false;
        if (!IsAllDigits(account) || account.Length < 2 || account.Length > 10) return false;
        var weights = new[] {6,3,7,9,10,5,8,4,2,1};
        var accDigits = PadLeft(account, 10);
        var total = 0;
        for (var i = 0; i < 10; i++) total += accDigits[i] * weights[i];
        if (total % 11 != 0) return false;
        if (prefix != "")
        {
            var prefDigits = PadLeft(prefix, 6);
            var prefWeights = new[] {10,5,8,4,2,1};
            var prefTotal = 0;
            for (var i = 0; i < 6; i++) prefTotal += prefDigits[i] * prefWeights[i];
            if (prefTotal % 11 != 0) return false;
        }
        return true;
    }

    // ---- Slovak (reuse Czech) ----

    public static bool SkBirthNumberValid(string number) => CzBirthNumberValid(number);
    public static bool SkIcoChecksum(string number) => CzIcoChecksum(number);

    public static bool SkDicValid(string number)
    {
        var cleaned = number.Trim();
        if (cleaned.ToUpperInvariant().StartsWith("SK")) cleaned = cleaned.Substring(2);
        if (!IsAllDigits(cleaned) || cleaned.Length != 10) return false;
        return long.TryParse(cleaned, out var n) && n % 11 == 0;
    }

    // ---- Russian INN ----

    public static bool RuInnChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length == 10)
        {
            var w = new[] {2,4,10,3,5,9,4,6,8};
            var t = 0;
            for (var i = 0; i < 9; i++) t += digits[i] * w[i];
            return digits[9] == (t % 11) % 10;
        }
        if (digits.Length == 12)
        {
            var w1 = new[] {7,2,4,10,3,5,9,4,6,8};
            var t1 = 0;
            for (var i = 0; i < 10; i++) t1 += digits[i] * w1[i];
            if (digits[10] != (t1 % 11) % 10) return false;
            var w2 = new[] {3,7,2,4,10,3,5,9,4,6,8};
            var t2 = 0;
            for (var i = 0; i < 11; i++) t2 += digits[i] * w2[i];
            return digits[11] == (t2 % 11) % 10;
        }
        return false;
    }

    // ---- Russian SNILS ----

    public static bool RuSnilsChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 11) return false;
        long baseNum = 0;
        for (var i = 0; i < 9; i++) baseNum = baseNum * 10 + digits[i];
        if (baseNum <= 1001998) return true;
        var total = 0;
        for (var i = 0; i < 9; i++) total += digits[i] * (9 - i);
        var check = total % 101;
        if (check == 100) check = 0;
        return digits[9] * 10 + digits[10] == check;
    }

    // ---- Dutch BSN ----

    public static bool NlBsn11Test(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 9) return false;
        var total = 0;
        for (var i = 0; i < 8; i++) total += digits[i] * (9 - i);
        total -= digits[8];
        return total % 11 == 0 && total != 0;
    }

    // ---- Romanian CNP ----

    public static bool RoCnpChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 13) return false;
        if (digits[0] < 1 || digits[0] > 8) return false;
        var weights = new[] {2,7,9,1,4,6,3,5,8,2,7,9};
        var total = 0;
        for (var i = 0; i < 12; i++) total += digits[i] * weights[i];
        var check = total % 11; if (check == 10) check = 1;
        return digits[12] == check;
    }

    // ---- Romanian CUI ----

    public static bool RoCuiChecksum(string number)
    {
        var cleaned = number.Trim().ToUpperInvariant();
        if (cleaned.StartsWith("RO")) cleaned = cleaned.Substring(2);
        var digits = ExtractDigits(cleaned);
        if (digits.Length < 2 || digits.Length > 10) return false;
        var weights = new[] {7,5,3,2,1,7,5,3,2};
        var padded = new int[10];
        var offset = 10 - digits.Length;
        Array.Copy(digits, 0, padded, offset, digits.Length);
        var check = padded[9];
        var total = 0;
        for (var i = 0; i < 9; i++) total += padded[i] * weights[i];
        var expected = (total * 10) % 11;
        if (expected == 10) expected = 0;
        return check == expected;
    }

    // ---- Danish CPR ----

    public static bool DkCprValidDate(string number)
    {
        var digits = ExtractDigitString(number);
        if (digits.Length != 10) return false;
        var day = int.Parse(digits.Substring(0, 2));
        var month = int.Parse(digits.Substring(2, 2));
        return day >= 1 && day <= 31 && month >= 1 && month <= 12;
    }

    // ---- Danish CVR ----

    public static bool DkCvrChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 8) return false;
        var weights = new[] {2,7,6,5,4,3,2,1};
        var total = 0;
        for (var i = 0; i < 8; i++) total += digits[i] * weights[i];
        return total % 11 == 0;
    }

    // ---- Swedish Personnummer ----

    public static bool SePersonnummerLuhn(string number)
    {
        var digits = ExtractDigitString(number);
        if (digits.Length == 12) digits = digits.Substring(2);
        if (digits.Length != 10) return false;
        var month = int.Parse(digits.Substring(2, 2));
        var day = int.Parse(digits.Substring(4, 2));
        if (month < 1 || month > 12 || day < 1 || day > 31) return false;
        return LuhnChecksum(digits);
    }

    // ---- Swedish Organisationsnummer ----

    public static bool SeOrgnrChecksum(string number)
    {
        var digits = ExtractDigitString(number);
        if (digits.Length != 10) return false;
        if (digits[2] - '0' < 2) return false;
        return LuhnChecksum(digits);
    }

    // ---- Norwegian Birth Number ----

    public static bool NoBirthNumberChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 11) return false;
        var w1 = new[] {3,7,6,1,8,9,4,5,2};
        var t1 = 0;
        for (var i = 0; i < 9; i++) t1 += digits[i] * w1[i];
        var c1 = 11 - (t1 % 11); if (c1 == 11) c1 = 0;
        if (c1 == 10) return false;
        if (digits[9] != c1) return false;
        var w2 = new[] {5,4,3,2,7,6,5,4,3,2};
        var t2 = 0;
        for (var i = 0; i < 10; i++) t2 += digits[i] * w2[i];
        var c2 = 11 - (t2 % 11); if (c2 == 11) c2 = 0;
        if (c2 == 10) return false;
        return digits[10] == c2;
    }

    // ---- Norwegian Organisasjonsnummer ----

    public static bool NoOrgnrChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 9) return false;
        var weights = new[] {3,2,7,6,5,4,3,2};
        var total = 0;
        for (var i = 0; i < 8; i++) total += digits[i] * weights[i];
        var remainder = total % 11;
        if (remainder == 1) return false;
        var check = remainder != 0 ? 11 - remainder : 0;
        return digits[8] == check;
    }

    // ---- Belgian National Number ----

    public static bool BeNationalNumberChecksum(string number)
    {
        var digits = ExtractDigitString(number);
        if (digits.Length != 11) return false;
        var baseNum = long.Parse(digits.Substring(0, 9));
        var check = int.Parse(digits.Substring(9, 2));
        if (97 - (baseNum % 97) == check) return true;
        var base2000 = long.Parse("2" + digits.Substring(0, 9));
        return 97 - (base2000 % 97) == check;
    }

    // ---- Belgian Enterprise Number ----

    public static bool BeEnterpriseChecksum(string number)
    {
        var digits = ExtractDigitString(number);
        if (digits.Length != 10) return false;
        if (digits[0] != '0' && digits[0] != '1') return false;
        var baseNum = long.Parse(digits.Substring(0, 8));
        var check = int.Parse(digits.Substring(8, 2));
        return 97 - (baseNum % 97) == check;
    }

    // ---- Austrian SVNR ----

    public static bool AtSvnrChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 10) return false;
        var weights = new[] {3,7,9,0,5,8,4,2,1,6};
        var total = 0;
        for (var i = 0; i < 10; i++) total += digits[i] * weights[i];
        return total % 11 == digits[3];
    }

    // ---- Irish PPS ----

    public static bool IePpsChecksum(string number)
    {
        var cleaned = ExtractAlnum(number).ToUpperInvariant();
        if (cleaned.Length != 8 && cleaned.Length != 9) return false;
        var total = 0;
        for (var i = 0; i < 7; i++)
        {
            if (!char.IsDigit(cleaned[i])) return false;
            total += (cleaned[i] - '0') * (8 - i);
        }
        if (cleaned.Length == 9 && char.IsLetter(cleaned[8]))
            total += (cleaned[8] - 'A' + 1) * 9;
        var remainder = total % 23;
        var expected = remainder == 0 ? 'W' : (char)('A' + remainder - 1);
        return cleaned[7] == expected;
    }

    // ---- Finnish HETU ----

    public static bool FiHetuChecksum(string number)
    {
        var cleaned = number.Replace(" ", "").Replace("-", "");
        if (cleaned.Length != 11) cleaned = number.Trim();
        if (cleaned.Length != 11) return false;
        var datePart = cleaned.Substring(0, 6);
        if (!IsAllDigits(datePart)) return false;
        var sep = cleaned[6];
        if (!"-+ABCDEFYXWVUabcdefyxwvu".Contains(sep)) return false;
        var numPart = cleaned.Substring(7, 3);
        if (!IsAllDigits(numPart)) return false;
        var checkChars = "0123456789ABCDEFHJKLMNPRSTUVWXY";
        var combined = int.Parse(datePart + numPart);
        var expected = checkChars[combined % 31];
        return char.ToUpperInvariant(cleaned[10]) == expected;
    }

    // ---- Finnish Y-tunnus ----

    public static bool FiYtunnusChecksum(string number)
    {
        var digits = ExtractDigitString(number);
        if (digits.Length != 8) return false;
        var weights = new[] {7,9,10,5,8,4,2};
        var total = 0;
        for (var i = 0; i < 7; i++) total += (digits[i] - '0') * weights[i];
        var remainder = total % 11;
        if (remainder == 1) return false;
        var check = remainder != 0 ? 11 - remainder : 0;
        return (digits[7] - '0') == check;
    }

    // ---- Hungarian Tax ID ----

    public static bool HuTaxIdChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 10) return false;
        if (digits[0] != 8) return false;
        var total = 0;
        for (var i = 0; i < 9; i++) total += digits[i] * (i + 1);
        return digits[9] == total % 11;
    }

    // ---- Hungarian TAJ ----

    public static bool HuTajChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 9) return false;
        var total = 0;
        for (var i = 0; i < 8; i++)
            total += digits[i] * (i % 2 == 0 ? 3 : 7);
        return digits[8] == total % 10;
    }

    // ---- Bulgarian EGN ----

    public static bool BgEgnChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 10) return false;
        var raw = ExtractDigitString(number);
        var month = int.Parse(raw.Substring(2, 2));
        var baseMonth = month;
        if (baseMonth > 40) baseMonth -= 40;
        else if (baseMonth > 20) baseMonth -= 20;
        if (baseMonth < 1 || baseMonth > 12) return false;
        var weights = new[] {2,4,8,5,10,9,7,3,6};
        var total = 0;
        for (var i = 0; i < 9; i++) total += digits[i] * weights[i];
        var check = total % 11; if (check == 10) check = 0;
        return digits[9] == check;
    }

    // ---- Croatian OIB (ISO 7064 MOD 11,2) ----

    public static bool HrOibChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 11) return false;
        var remainder = 10;
        for (var i = 0; i < 10; i++)
        {
            remainder = (remainder + digits[i]) % 10;
            if (remainder == 0) remainder = 10;
            remainder = (remainder * 2) % 11;
        }
        var check = 11 - remainder; if (check == 10) check = 0;
        return digits[10] == check;
    }

    // ---- Slovenian EMSO ----

    public static bool SiEmsoChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 13) return false;
        var weights = new[] {7,6,5,4,3,2,7,6,5,4,3,2};
        var total = 0;
        for (var i = 0; i < 12; i++) total += digits[i] * weights[i];
        var remainder = total % 11;
        var check = remainder != 0 ? 11 - remainder : 0;
        if (check == 10) return false;
        return digits[12] == check;
    }

    // ---- Slovenian Tax Number ----

    public static bool SiTaxNumberChecksum(string number)
    {
        var cleaned = number.Trim().ToUpperInvariant();
        if (cleaned.StartsWith("SI")) cleaned = cleaned.Substring(2);
        var digits = ExtractDigits(cleaned);
        if (digits.Length != 8) return false;
        var weights = new[] {8,7,6,5,4,3,2};
        var total = 0;
        for (var i = 0; i < 7; i++) total += digits[i] * weights[i];
        var remainder = total % 11;
        if (remainder == 0 || remainder == 1) return digits[7] == 0;
        return digits[7] == 11 - remainder;
    }

    // ---- Lithuanian Personal Code ----

    public static bool LtPersonalCodeChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 11) return false;
        if (digits[0] < 1 || digits[0] > 6) return false;
        var w1 = new[] {1,2,3,4,5,6,7,8,9,1};
        var total = 0;
        for (var i = 0; i < 10; i++) total += digits[i] * w1[i];
        var check = total % 11;
        if (check == 10)
        {
            var w2 = new[] {3,4,5,6,7,8,9,1,2,3};
            total = 0;
            for (var i = 0; i < 10; i++) total += digits[i] * w2[i];
            check = total % 11;
            if (check == 10) check = 0;
        }
        return digits[10] == check;
    }

    // ---- Latvian Personal Code ----

    public static bool LvPersonalCodeChecksum(string number)
    {
        var digits = ExtractDigitString(number);
        if (digits.Length != 11) return false;
        var day = int.Parse(digits.Substring(0, 2));
        var month = int.Parse(digits.Substring(2, 2));
        if (digits[0] == '3' && digits[1] == '2') return true;
        if (day < 1 || day > 31 || month < 1 || month > 12) return false;
        var weights = new[] {1,6,3,7,9,10,5,8,4,2};
        var total = 0;
        for (var i = 0; i < 10; i++) total += (digits[i] - '0') * weights[i];
        var check = ((1101 - total) % 11) % 10;
        return (digits[10] - '0') == check;
    }

    // ---- Estonian Personal Code ----

    public static bool EePersonalCodeChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 11) return false;
        if (digits[0] < 1 || digits[0] > 6) return false;
        var w1 = new[] {1,2,3,4,5,6,7,8,9,1};
        var total = 0;
        for (var i = 0; i < 10; i++) total += digits[i] * w1[i];
        var check = total % 11;
        if (check == 10)
        {
            var w2 = new[] {3,4,5,6,7,8,9,1,2,3};
            total = 0;
            for (var i = 0; i < 10; i++) total += digits[i] * w2[i];
            check = total % 11;
            if (check == 10) check = 0;
        }
        return digits[10] == check;
    }

    // ---- Swiss AHV (EAN-13) ----

    public static bool ChAhvChecksum(string number)
    {
        var digits = ExtractDigitString(number);
        if (digits.Length != 13 || !digits.StartsWith("756")) return false;
        var total = 0;
        for (var i = 0; i < 12; i++)
        {
            var w = i % 2 != 0 ? 3 : 1;
            total += (digits[i] - '0') * w;
        }
        var check = (10 - (total % 10)) % 10;
        return (digits[12] - '0') == check;
    }

    // ---- Australian TFN ----

    public static bool AuTfnChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length == 8)
        {
            var w = new[] {10,7,8,4,6,3,5,1};
            var t = 0;
            for (var i = 0; i < 8; i++) t += digits[i] * w[i];
            return t % 11 == 0;
        }
        if (digits.Length == 9)
        {
            var w = new[] {1,4,3,7,5,8,6,9,10};
            var t = 0;
            for (var i = 0; i < 9; i++) t += digits[i] * w[i];
            return t % 11 == 0;
        }
        return false;
    }

    // ---- Australian Medicare ----

    public static bool AuMedicareChecksum(string number)
    {
        var digits = ExtractDigitString(number);
        if (digits.Length < 10 || digits.Length > 11) return false;
        var weights = new[] {1,3,7,9,1,3,7,9};
        var total = 0;
        for (var i = 0; i < 8; i++) total += (digits[i] - '0') * weights[i];
        return (digits[8] - '0') == total % 10;
    }

    // ---- New Zealand IRD ----

    public static bool NzIrdChecksum(string number)
    {
        var digits = ExtractDigitString(number);
        if (digits.Length != 8 && digits.Length != 9) return false;
        if (digits.Length == 8) digits = "0" + digits;
        var d = digits.Select(c => c - '0').ToArray();
        var w1 = new[] {3,2,7,6,5,4,3,2};
        var total = 0;
        for (var i = 0; i < 8; i++) total += d[i] * w1[i];
        var r = total % 11;
        if (r == 0) return d[8] == 0;
        if (11 - r != 10) return d[8] == 11 - r;
        var w2 = new[] {7,4,3,2,5,2,7,6};
        total = 0;
        for (var i = 0; i < 8; i++) total += d[i] * w2[i];
        var r2 = total % 11;
        if (r2 == 0) return d[8] == 0;
        return d[8] == 11 - r2;
    }

    // ---- Indian Aadhaar (Verhoeff) ----

    private static readonly int[,] VerhoeffD = {
        {0,1,2,3,4,5,6,7,8,9},{1,2,3,4,0,6,7,8,9,5},{2,3,4,0,1,7,8,9,5,6},{3,4,0,1,2,8,9,5,6,7},
        {4,0,1,2,3,9,5,6,7,8},{5,9,8,7,6,0,4,3,2,1},{6,5,9,8,7,1,0,4,3,2},{7,6,5,9,8,2,1,0,4,3},
        {8,7,6,5,9,3,2,1,0,4},{9,8,7,6,5,4,3,2,1,0}
    };
    private static readonly int[,] VerhoeffP = {
        {0,1,2,3,4,5,6,7,8,9},{1,5,7,6,2,8,3,0,9,4},{5,8,0,3,7,9,6,1,4,2},{8,9,1,6,0,4,3,5,2,7},
        {9,4,5,3,1,2,6,8,7,0},{4,2,8,6,5,7,3,9,0,1},{2,7,9,3,8,0,6,4,1,5},{7,0,4,6,9,1,3,2,5,8}
    };

    public static bool InAadhaarChecksum(string number)
    {
        var digits = ExtractDigitString(number);
        if (digits.Length != 12 || digits[0] == '0' || digits[0] == '1') return false;
        var c = 0;
        for (var i = digits.Length - 1; i >= 0; i--)
            c = VerhoeffD[c, VerhoeffP[(digits.Length - 1 - i) % 8, digits[i] - '0']];
        return c == 0;
    }

    // ---- Indian PAN ----

    private static readonly Regex InPanRe = new(@"^[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]$", RegexOptions.Compiled);

    public static bool InPanValid(string number)
    {
        var cleaned = number.Trim().ToUpperInvariant();
        return cleaned.Length == 10 && InPanRe.IsMatch(cleaned);
    }

    // ---- Japanese My Number ----

    public static bool JpMyNumberChecksum(string number)
    {
        var digits = ExtractDigitString(number);
        if (digits.Length != 12) return false;
        var total = 0;
        for (var i = 0; i < 11; i++)
        {
            var p = 11 - i;
            var q = p <= 6 ? p + 1 : p - 5;
            total += (digits[i] - '0') * q;
        }
        var remainder = total % 11;
        var check = remainder > 1 ? 11 - remainder : 0;
        return (digits[11] - '0') == check;
    }

    // ---- Korean RRN ----

    public static bool KrRrnChecksum(string number)
    {
        var digits = ExtractDigitString(number);
        if (digits.Length != 13) return false;
        var weights = new[] {2,3,4,5,6,7,8,9,2,3,4,5};
        var total = 0;
        for (var i = 0; i < 12; i++) total += (digits[i] - '0') * weights[i];
        var check = (11 - (total % 11)) % 10;
        return (digits[12] - '0') == check;
    }

    // ---- Turkish Kimlik ----

    public static bool TrKimlikChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 11 || digits[0] == 0) return false;
        var oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
        var evenSum = digits[1] + digits[3] + digits[5] + digits[7];
        var check1 = ((oddSum * 7) - evenSum) % 10;
        if (check1 < 0) check1 += 10;
        if (check1 != digits[9]) return false;
        var total = 0;
        for (var i = 0; i < 10; i++) total += digits[i];
        return total % 10 == digits[10];
    }

    // ---- Argentine CUIT ----

    public static bool ArCuitChecksum(string number)
    {
        var digits = ExtractDigitString(number);
        if (digits.Length != 11) return false;
        var weights = new[] {5,4,3,2,7,6,5,4,3,2};
        var total = 0;
        for (var i = 0; i < 10; i++) total += (digits[i] - '0') * weights[i];
        var remainder = total % 11;
        int check;
        if (remainder == 0) check = 0;
        else if (remainder == 1) check = 9;
        else check = 11 - remainder;
        return (digits[10] - '0') == check;
    }

    // ---- Chilean RUT ----

    public static bool ClRutChecksum(string number)
    {
        var cleaned = number.Replace(".", "").Replace(" ", "").ToUpperInvariant();
        if (cleaned.Contains('-'))
        {
            var parts = cleaned.Split('-');
            if (parts.Length != 2) return false;
            cleaned = parts[0] + parts[1];
        }
        if (cleaned.Length < 2) return false;
        var body = cleaned.Substring(0, cleaned.Length - 1);
        var checkChar = cleaned[cleaned.Length - 1];
        if (!IsAllDigits(body)) return false;
        var total = 0;
        var mul = 2;
        for (var i = body.Length - 1; i >= 0; i--)
        {
            total += (body[i] - '0') * mul;
            mul = mul == 7 ? 2 : mul + 1;
        }
        var remainder = 11 - (total % 11);
        char expected;
        if (remainder == 11) expected = '0';
        else if (remainder == 10) expected = 'K';
        else expected = (char)('0' + remainder);
        return checkChar == expected;
    }

    // ---- Colombian NIT ----

    public static bool CoNitChecksum(string number)
    {
        var digits = ExtractDigitString(number);
        if (digits.Length < 8 || digits.Length > 10) return false;
        var body = digits.Substring(0, digits.Length - 1);
        var check = digits[digits.Length - 1] - '0';
        var weights = new[] {3,7,13,17,19,23,29,37,41,43,47,53,59,67,71};
        var total = 0;
        for (var i = 0; i < body.Length; i++)
            total += (body[body.Length - 1 - i] - '0') * weights[i];
        var remainder = total % 11;
        int expected;
        if (remainder == 0) expected = 0;
        else if (remainder == 1) expected = 1;
        else expected = 11 - remainder;
        return check == expected;
    }

    // ---- Brazilian CPF ----

    public static bool BrCpfChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 11) return false;
        if (digits.Distinct().Count() == 1) return false;
        var t1 = 0;
        for (var i = 0; i < 9; i++) t1 += digits[i] * (10 - i);
        var c1 = (t1 * 10) % 11; if (c1 == 10) c1 = 0;
        if (digits[9] != c1) return false;
        var t2 = 0;
        for (var i = 0; i < 10; i++) t2 += digits[i] * (11 - i);
        var c2 = (t2 * 10) % 11; if (c2 == 10) c2 = 0;
        return digits[10] == c2;
    }

    // ---- Brazilian CNPJ ----

    public static bool BrCnpjChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 14) return false;
        var w1 = new[] {5,4,3,2,9,8,7,6,5,4,3,2};
        var t1 = 0;
        for (var i = 0; i < 12; i++) t1 += digits[i] * w1[i];
        var c1 = t1 % 11; c1 = c1 < 2 ? 0 : 11 - c1;
        if (digits[12] != c1) return false;
        var w2 = new[] {6,5,4,3,2,9,8,7,6,5,4,3,2};
        var t2 = 0;
        for (var i = 0; i < 13; i++) t2 += digits[i] * w2[i];
        var c2 = t2 % 11; c2 = c2 < 2 ? 0 : 11 - c2;
        return digits[13] == c2;
    }

    // ---- US ITIN ----

    public static bool UsItinValid(string number)
    {
        var digits = ExtractDigitString(number);
        if (digits.Length != 9 || digits[0] != '9') return false;
        return (digits[3] - '0') >= 7;
    }

    // ---- UK UTR ----

    public static bool UkUtrChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 10) return false;
        var weights = new[] {6,7,8,9,10,5,4,3,2};
        var total = 0;
        for (var i = 0; i < 9; i++) total += digits[i + 1] * weights[i];
        var remainder = total % 11;
        var check = 11 - remainder;
        if (check >= 10) check = 0;
        return digits[0] == check;
    }

    // ---- NHS ----

    public static bool NhsChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 10) return false;
        var weights = new[] {10,9,8,7,6,5,4,3,2};
        var total = 0;
        for (var i = 0; i < 9; i++) total += digits[i] * weights[i];
        var remainder = total % 11;
        var check = 11 - remainder;
        if (check == 11) check = 0;
        if (check == 10) return false;
        return digits[9] == check;
    }

    // ---- Spanish NSS ----

    public static bool EsNssChecksum(string number)
    {
        var digits = ExtractDigitString(number);
        if (digits.Length != 12) return false;
        var province = int.Parse(digits.Substring(0, 2));
        if (province < 1 || province > 53) return false;
        var baseNum = long.Parse(digits.Substring(0, 10));
        var check = int.Parse(digits.Substring(10, 2));
        return (int)(baseNum % 97) == check;
    }

    // ---- Spanish CIF ----

    public static bool EsCifChecksum(string number)
    {
        var cleaned = ExtractAlnum(number).ToUpperInvariant();
        if (cleaned.Length != 9) return false;
        var letter = cleaned[0];
        if (!"ABCDEFGHJNPQRSUVW".Contains(letter)) return false;
        int totalEven = 0, totalOdd = 0;
        for (var i = 1; i <= 7; i++)
        {
            if (!char.IsDigit(cleaned[i])) return false;
            var d = cleaned[i] - '0';
            if (i % 2 == 0) totalEven += d;
            else { var doubled = d * 2; totalOdd += doubled / 10 + doubled % 10; }
        }
        var total = totalEven + totalOdd;
        var checkDigit = (10 - (total % 10)) % 10;
        var control = cleaned[8];
        if ("KPQS".Contains(letter)) return control == (char)('A' + checkDigit);
        if ("ABEH".Contains(letter)) return control == (char)('0' + checkDigit);
        return control == (char)('0' + checkDigit) || control == (char)('A' + checkDigit);
    }

    // ---- Italian Partita IVA ----

    public static bool ItPartitaIvaChecksum(string number)
    {
        var digits = ExtractDigits(number);
        if (digits.Length != 11) return false;
        if (digits.All(d => d == 0)) return false;
        var total = 0;
        for (var i = 0; i < 10; i++)
        {
            if (i % 2 == 0) total += digits[i];
            else { var doubled = digits[i] * 2; if (doubled > 9) doubled -= 9; total += doubled; }
        }
        var check = (10 - (total % 10)) % 10;
        return digits[10] == check;
    }

    // ---- Phone length check ----

    private static readonly Regex PhoneDateRe = new(@"\d{1,2}[-./]\d{1,2}[-./]\d{2,4}", RegexOptions.Compiled);
    private static readonly Regex PhoneSsnRe = new(@"\d{3}[-\.]\d{2}[-\.]\d{4}", RegexOptions.Compiled);

    public static bool PhoneLengthCheck(string number)
    {
        var digits = ExtractDigitString(number);
        if (digits.Length < 7 || digits.Length > 15) return false;
        if (PhoneDateRe.IsMatch(number)) return false;
        if (PhoneSsnRe.IsMatch(number)) return false;
        return true;
    }

    // ---- URL TLD validation ----

    private static readonly HashSet<string> ValidTLDs = new(StringComparer.OrdinalIgnoreCase)
    {
        "com","org","net","edu","gov","mil","int","co","io","dev","app","ai","me","us",
        "uk","ca","au","de","fr","es","it","nl","be","at","ch","ru","cn","jp","kr","in",
        "br","mx","ar","za","nz","se","no","dk","fi","pl","cz","sk","hu","ro","bg","hr",
        "si","lt","lv","ee","ie","pt","il","tr","info","biz","name","museum","travel",
        "aero","coop","pro","jobs","tel","mobi","asia","cat","xxx","post","bike","clothing",
        "guru","holdings","plumbing","singles","ventures","voyage","expert","agency","company",
        "estate","gallery","graphics","lighting","management","menu","photography","solutions",
        "support","systems","technology","tips","today","training","directory","kitchen","land",
        "construction","contractors","diamonds","enterprises","equipment","recipes","shoes",
        "tattoo","uno","academy","cab","camera","camp","center","computer","education","email",
        "glass","institute","international","marketing","pub","repair","social","supply","wiki",
        "xyz","club","digital","link","lol","ltd","moe","ong","online","store","tech","site",
        "space","website","fun","host","press","live","cloud","page","tv","cc","ly","gg","to",
        "fm","ac","sh","ws"
    };

    public static bool UrlValidTld(string url)
    {
        var host = url;
        var idx = url.IndexOf("://");
        if (idx >= 0) host = url.Substring(idx + 3);
        var pathIdx = host.IndexOf('/');
        if (pathIdx >= 0) host = host.Substring(0, pathIdx);
        var portIdx = host.IndexOf(':');
        if (portIdx >= 0) host = host.Substring(0, portIdx);
        var lastDot = host.LastIndexOf('.');
        if (lastDot < 0) return false;
        var tld = host.Substring(lastDot + 1);
        return ValidTLDs.Contains(tld);
    }

    // ---- ZIP valid ----

    public static bool ZipValid(string zip)
    {
        var digits = ExtractDigitString(zip);
        return digits.Length >= 5 && !digits.StartsWith("000");
    }

    // ---- Date plausibility ----

    private static readonly string[] MonthNames =
    {
        "january","february","march","april","may","june","july","august","september",
        "october","november","december","jan","feb","mar","apr","jun","jul","aug","sep",
        "oct","nov","dec"
    };

    public static bool ValidDate(string text)
    {
        var lower = text.ToLowerInvariant();
        foreach (var m in MonthNames)
            if (lower.Contains(m)) return true;
        var digits = ExtractDigitString(text);
        return digits.Length >= 4;
    }

    // ---- South African ID ----

    public static bool ZaIdChecksum(string number)
    {
        return LuhnChecksum(number) && ExtractDigitString(number).Length == 13;
    }

    // ---- Israeli ID ----

    public static bool IlIdChecksum(string number)
    {
        var digits = ExtractDigitString(number);
        if (digits.Length < 7 || digits.Length > 9) return false;
        while (digits.Length < 9) digits = "0" + digits;
        var total = 0;
        for (var i = 0; i < 9; i++)
        {
            var d = (digits[i] - '0') * (i % 2 == 0 ? 1 : 2);
            if (d > 9) d -= 9;
            total += d;
        }
        return total % 10 == 0;
    }

    // ---- Canadian SIN ----

    public static bool CaSinChecksum(string number)
    {
        var digits = ExtractDigitString(number);
        return digits.Length == 9 && LuhnChecksum(digits);
    }
}
