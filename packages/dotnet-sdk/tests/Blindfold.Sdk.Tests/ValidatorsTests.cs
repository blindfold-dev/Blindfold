using Xunit;
using Blindfold.Sdk.Local;

namespace Blindfold.Sdk.Tests;

public class ValidatorsTests
{
    // ---- Luhn ----
    [Theory]
    [InlineData("4111111111111111", true)]
    [InlineData("4111111111111112", false)]
    [InlineData("79927398713", true)]
    [InlineData("79927398710", false)]
    public void LuhnChecksum(string number, bool expected)
    {
        Assert.Equal(expected, Validators.LuhnChecksum(number));
    }

    // ---- IBAN ----
    [Theory]
    [InlineData("GB29 NWBK 6016 1331 9268 19", true)]
    [InlineData("DE89 3704 0044 0532 0130 00", true)]
    [InlineData("GB29 NWBK 6016 1331 9268 18", false)]
    public void IbanMod97(string iban, bool expected)
    {
        Assert.Equal(expected, Validators.IbanMod97(iban));
    }

    // ---- SSN ----
    [Theory]
    [InlineData("123-45-6789", true)]
    [InlineData("000-45-6789", false)]
    [InlineData("666-45-6789", false)]
    [InlineData("123-00-6789", false)]
    [InlineData("123-45-0000", false)]
    public void SsnValidFormat(string ssn, bool expected)
    {
        Assert.Equal(expected, Validators.SsnValidFormat(ssn));
    }

    // ---- German Tax ID ----
    [Theory]
    [InlineData("65929970489", true)]
    public void DeTaxIdChecksum(string taxId, bool expected)
    {
        Assert.Equal(expected, Validators.DeTaxIdChecksum(taxId));
    }

    // ---- Spanish DNI ----
    [Theory]
    [InlineData("12345678Z", true)]
    [InlineData("12345678A", false)]
    public void EsDniLetter(string dni, bool expected)
    {
        Assert.Equal(expected, Validators.EsDniLetter(dni));
    }

    // ---- Italian Codice Fiscale ----
    [Theory]
    [InlineData("RSSMRA85M01H501Z", true)]
    public void ItCodiceFiscaleCheck(string cf, bool expected)
    {
        Assert.Equal(expected, Validators.ItCodiceFiscaleCheck(cf));
    }

    // ---- Brazilian CPF ----
    [Theory]
    [InlineData("529.982.247-25", true)]
    [InlineData("111.111.111-11", false)]
    public void BrCpfChecksum(string cpf, bool expected)
    {
        Assert.Equal(expected, Validators.BrCpfChecksum(cpf));
    }

    // ---- Brazilian CNPJ ----
    [Theory]
    [InlineData("11.222.333/0001-81", true)]
    public void BrCnpjChecksum(string cnpj, bool expected)
    {
        Assert.Equal(expected, Validators.BrCnpjChecksum(cnpj));
    }

    // ---- Phone length ----
    [Theory]
    [InlineData("555-123-4567", true)]
    [InlineData("12", false)]
    public void PhoneLengthCheck(string phone, bool expected)
    {
        Assert.Equal(expected, Validators.PhoneLengthCheck(phone));
    }

    // ---- ZIP code ----
    [Theory]
    [InlineData("10001", true)]
    [InlineData("00000", false)]
    [InlineData("99999", true)]
    public void ZipValid(string zip, bool expected)
    {
        Assert.Equal(expected, Validators.ZipValid(zip));
    }
}
