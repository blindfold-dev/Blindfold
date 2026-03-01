using System.Text;

namespace Blindfold.Sdk.Local;

internal static class Synthesizers
{
    private const string Digits = "0123456789";
    private const string Upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private const string Lower = "abcdefghijklmnopqrstuvwxyz";
    private const string HexChars = "0123456789abcdef";

    private static readonly Random Rng = new();

    public static string SynthesizeValue(string entityType, string originalText)
    {
        return entityType switch
        {
            EntityTypes.EmailAddress => SynthesizeEmail(),
            EntityTypes.URL => SynthesizeUrl(),
            EntityTypes.IPAddress => SynthesizeIp(),
            EntityTypes.CreditCard => SynthesizeCreditCard(originalText),
            EntityTypes.IBAN => SynthesizeIban(originalText),
            _ => FormatPreserving(originalText)
        };
    }

    private static string FormatPreserving(string original)
    {
        var result = new char[original.Length];
        for (var i = 0; i < original.Length; i++)
        {
            var ch = original[i];
            if (char.IsDigit(ch))
                result[i] = Digits[Rng.Next(10)];
            else if (char.IsUpper(ch))
                result[i] = Upper[Rng.Next(26)];
            else if (char.IsLower(ch))
                result[i] = Lower[Rng.Next(26)];
            else
                result[i] = ch;
        }
        var output = new string(result);
        return output == original ? FormatPreserving(original) : output;
    }

    private static string SynthesizeEmail() => "user" + RandHex(8) + "@example.com";

    private static string SynthesizeUrl() => "https://example.com/" + RandHex(10);

    private static string SynthesizeIp()
    {
        var a = Rng.Next(254) + 1;
        var b = Rng.Next(256);
        var c = Rng.Next(256);
        var d = Rng.Next(254) + 1;
        return $"{a}.{b}.{c}.{d}";
    }

    private static string SynthesizeCreditCard(string original)
    {
        var digitCount = original.Count(char.IsDigit);
        if (digitCount < 2) return FormatPreserving(original);

        var payload = new int[digitCount];
        for (var i = 0; i < digitCount - 1; i++)
            payload[i] = Rng.Next(10);

        // Luhn check digit
        var total = 0;
        for (var i = digitCount - 2; i >= 0; i--)
        {
            var d = payload[i];
            if ((digitCount - 2 - i) % 2 == 0) { d *= 2; if (d > 9) d -= 9; }
            total += d;
        }
        payload[digitCount - 1] = (10 - (total % 10)) % 10;

        var sb = new StringBuilder();
        var idx = 0;
        foreach (var ch in original)
        {
            if (char.IsDigit(ch)) { sb.Append(payload[idx++]); }
            else sb.Append(ch);
        }
        return sb.ToString();
    }

    private static string SynthesizeIban(string original)
    {
        var stripped = original.Replace(" ", "");
        var length = stripped.Length;
        if (length < 5) return FormatPreserving(original);

        var bbanLen = length - 4;
        var bban = new StringBuilder();
        for (var i = 0; i < bbanLen; i++)
            bban.Append(Rng.Next(10));

        var numericStr = bban.ToString() + "333300";
        long remainder = 0;
        foreach (var ch in numericStr)
            remainder = (remainder * 10 + (ch - '0')) % 97;
        var checkDigits = (98 - remainder).ToString("D2");
        var iban = "XX" + checkDigits + bban;

        if (original.Contains(' '))
        {
            var sb = new StringBuilder();
            var ibanIdx = 0;
            foreach (var ch in original)
            {
                if (ch == ' ') sb.Append(' ');
                else if (ibanIdx < iban.Length) sb.Append(iban[ibanIdx++]);
                else sb.Append('0');
            }
            return sb.ToString();
        }
        return iban.ToString();
    }

    private static string RandHex(int length)
    {
        var sb = new StringBuilder(length);
        for (var i = 0; i < length; i++)
            sb.Append(HexChars[Rng.Next(16)]);
        return sb.ToString();
    }
}
