package dev.blindfold.sdk;

import dev.blindfold.sdk.regex.Validators;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ValidatorsTest {
    // Luhn
    @Test void luhnValid() { assertTrue(Validators.luhnChecksum("4111111111111111")); }
    @Test void luhnInvalid() { assertFalse(Validators.luhnChecksum("4111111111111112")); }
    @Test void luhnAmex() { assertTrue(Validators.luhnChecksum("378282246310005")); }

    // IBAN
    @Test void ibanValid() { assertTrue(Validators.ibanMod97("DE89 3704 0044 0532 0130 00")); }
    @Test void ibanInvalid() { assertFalse(Validators.ibanMod97("DE00 3704 0044 0532 0130 00")); }
    @Test void ibanGB() { assertTrue(Validators.ibanMod97("GB29 NWBK 6016 1331 9268 19")); }

    // SSN
    @Test void ssnValid() { assertTrue(Validators.ssnValidFormat("123-45-6789")); }
    @Test void ssnInvalidArea() { assertFalse(Validators.ssnValidFormat("000-45-6789")); }
    @Test void ssnInvalidGroup() { assertFalse(Validators.ssnValidFormat("123-00-6789")); }
    @Test void ssnInvalid666() { assertFalse(Validators.ssnValidFormat("666-45-6789")); }
    @Test void ssnInvalid9xx() { assertFalse(Validators.ssnValidFormat("900-45-6789")); }

    // German Tax ID
    @Test void deTaxValid() { assertTrue(Validators.deTaxIdChecksum("65929970489")); }

    // Spanish DNI
    @Test void esDniValid() { assertTrue(Validators.esDniLetter("12345678Z")); }
    @Test void esDniInvalid() { assertFalse(Validators.esDniLetter("12345678A")); }

    // Italian Codice Fiscale
    @Test void itCfValid() { assertTrue(Validators.itCodiceFiscaleCheck("BNZVCN32S10E573Z")); }

    // Portuguese NIF
    @Test void ptNifValid() { assertTrue(Validators.ptNifChecksum("123456789")); }

    // Polish PESEL
    @Test void plPeselValid() { assertTrue(Validators.plPeselChecksum("44051401359")); }
    @Test void plPeselInvalid() { assertFalse(Validators.plPeselChecksum("44051401350")); }

    // Czech Birth Number
    @Test void czBirthValid() { assertTrue(Validators.czBirthNumberValid("7103192745")); }

    // Brazilian CPF
    @Test void brCpfValid() { assertTrue(Validators.brCpfChecksum("529.982.247-25")); }
    @Test void brCpfAllSame() { assertFalse(Validators.brCpfChecksum("111.111.111-11")); }

    // Brazilian CNPJ
    @Test void brCnpjValid() { assertTrue(Validators.brCnpjChecksum("11.222.333/0001-81")); }

    // Dutch BSN
    @Test void nlBsnValid() { assertTrue(Validators.nlBsn11Test("111222333")); }

    // Croatian OIB
    @Test void hrOibFormat() {
        // Test the algorithm works on a known valid OIB
        assertTrue(Validators.hrOibChecksum("94577403194"));
    }

    // Phone
    @Test void phoneValid() { assertTrue(Validators.phoneLengthCheck("(555) 123-4567")); }
    @Test void phoneTooShort() { assertFalse(Validators.phoneLengthCheck("123")); }

    // URL TLD
    @Test void urlTldValid() { assertTrue(Validators.urlValidTld("https://example.com/page")); }
    @Test void urlTldInvalid() { assertFalse(Validators.urlValidTld("https://example.zzzzz/page")); }

    // ZIP
    @Test void zipValid() { assertTrue(Validators.zipValid("10001")); }
    @Test void zipInvalid() { assertFalse(Validators.zipValid("00012")); }

    // NHS
    @Test void nhsValid() { assertTrue(Validators.nhsChecksum("9434765919")); }

    // UK UTR
    @Test void ukUtrFormat() {
        // UTR validation
        assertTrue(Validators.ukUtrChecksum("1123456789"));
    }

    // Chilean RUT
    @Test void clRutValid() { assertTrue(Validators.clRutChecksum("12.345.678-5")); }

    // Swiss AHV
    @Test void chAhvValid() { assertTrue(Validators.chAhvChecksum("756.1234.5678.97")); }
}
