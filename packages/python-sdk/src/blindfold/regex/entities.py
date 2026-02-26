"""Entity types and match objects for local PII detection"""

from dataclasses import dataclass
from enum import Enum
from typing import Dict


class EntityType(str, Enum):
    """PII entity types detected by the regex scanner.

    Names match the Blindfold API entity types for transparent switching.
    """

    # Universal (always active)
    EMAIL_ADDRESS = "Email Address"
    CREDIT_CARD = "Credit Card Number"
    PHONE_NUMBER = "Phone Number"
    IP_ADDRESS = "IP Address"
    URL = "URL"
    MAC_ADDRESS = "MAC Address"
    DATE_OF_BIRTH = "Date of Birth"
    CVV = "CVV"

    # US
    SSN = "Social Security Number"
    DRIVERS_LICENSE = "Driver's License"
    US_PASSPORT = "US Passport"
    TAX_ID = "Tax ID"
    ZIP_CODE = "ZIP Code"

    # EU
    IBAN = "IBAN"
    EU_POSTAL_CODE = "Postal Code"
    VAT_ID = "VAT ID"

    # UK
    NI_NUMBER = "NI Number"
    NHS_NUMBER = "NHS Number"
    UK_POSTCODE = "UK Postcode"
    UK_PASSPORT = "UK Passport"

    # Germany (DE)
    DE_PERSONAL_ID = "German Personal ID"
    DE_TAX_ID = "German Tax ID"

    # France (FR)
    FR_NATIONAL_ID = "French National ID"

    # Spain (ES)
    ES_DNI = "Spanish DNI"
    ES_NIE = "Spanish NIE"

    # Italy (IT)
    IT_CODICE_FISCALE = "Italian Codice Fiscale"

    # Portugal (PT)
    PT_NIF = "Portuguese NIF"

    # Poland (PL)
    PL_PESEL = "Polish PESEL"
    PL_NIP = "Polish NIP"

    # Czech Republic (CZ)
    CZ_BIRTH_NUMBER = "Czech Birth Number"
    CZ_ICO = "Czech ICO"
    CZ_DIC = "Czech DIC"
    CZ_BANK_ACCOUNT = "Czech Bank Account"

    # Russia (RU)
    RU_INN = "Russian INN"
    RU_SNILS = "Russian SNILS"

    # Netherlands (NL)
    NL_BSN = "Dutch BSN"

    # Romania (RO)
    RO_CNP = "Romanian CNP"

    # Slovakia (SK)
    SK_BIRTH_NUMBER = "Slovak Birth Number"

    # Denmark (DK)
    DK_CPR = "Danish CPR"

    # Sweden (SE)
    SE_PERSONNUMMER = "Swedish Personnummer"

    # Norway (NO)
    NO_BIRTH_NUMBER = "Norwegian Birth Number"

    # Brazil (BR)
    BR_CPF = "Brazilian CPF"
    BR_CNPJ = "Brazilian CNPJ"

    # US (additional)
    US_ITIN = "US ITIN"

    # UK (additional)
    UK_UTR = "UK UTR"

    # France (additional)
    FR_SIREN = "French SIREN"

    # Spain (additional)
    ES_NSS = "Spanish NSS"
    ES_CIF = "Spanish CIF"

    # Italy (additional)
    IT_PARTITA_IVA = "Italian Partita IVA"

    # Poland (additional)
    PL_REGON = "Polish REGON"

    # Slovakia (additional)
    SK_ICO = "Slovak ICO"
    SK_DIC = "Slovak DIC"

    # Romania (additional)
    RO_CUI = "Romanian CUI"

    # Denmark (additional)
    DK_CVR = "Danish CVR"

    # Sweden (additional)
    SE_ORGNR = "Swedish Organisationsnummer"

    # Norway (additional)
    NO_ORGNR = "Norwegian Organisasjonsnummer"

    # Belgium (BE)
    BE_NATIONAL_NUMBER = "Belgian National Number"
    BE_ENTERPRISE_NUMBER = "Belgian Enterprise Number"

    # Austria (AT)
    AT_SVNR = "Austrian SVNR"

    # Ireland (IE)
    IE_PPS = "Irish PPS Number"

    # Finland (FI)
    FI_HETU = "Finnish HETU"
    FI_YTUNNUS = "Finnish Y-tunnus"

    # Hungary (HU)
    HU_TAX_ID = "Hungarian Tax ID"
    HU_TAJ = "Hungarian TAJ"

    # Bulgaria (BG)
    BG_EGN = "Bulgarian EGN"

    # Croatia (HR)
    HR_OIB = "Croatian OIB"

    # Slovenia (SI)
    SI_EMSO = "Slovenian EMSO"
    SI_TAX_NUMBER = "Slovenian Tax Number"

    # Lithuania (LT)
    LT_PERSONAL_CODE = "Lithuanian Personal Code"

    # Latvia (LV)
    LV_PERSONAL_CODE = "Latvian Personal Code"

    # Estonia (EE)
    EE_PERSONAL_CODE = "Estonian Personal Code"

    # Canada (CA)
    CA_SIN = "Canadian SIN"

    # Switzerland (CH)
    CH_AHV = "Swiss AHV"

    # Australia (AU)
    AU_TFN = "Australian TFN"
    AU_MEDICARE = "Australian Medicare"

    # New Zealand (NZ)
    NZ_IRD = "New Zealand IRD"

    # India (IN)
    IN_AADHAAR = "Indian Aadhaar"
    IN_PAN = "Indian PAN"

    # Japan (JP)
    JP_MY_NUMBER = "Japanese My Number"

    # South Korea (KR)
    KR_RRN = "Korean RRN"

    # South Africa (ZA)
    ZA_ID = "South African ID"

    # Turkey (TR)
    TR_KIMLIK = "Turkish Kimlik"

    # Israel (IL)
    IL_ID = "Israeli ID"

    # Argentina (AR)
    AR_CUIT = "Argentine CUIT"

    # Chile (CL)
    CL_RUT = "Chilean RUT"

    # Colombia (CO)
    CO_NIT = "Colombian NIT"


@dataclass
class PIIMatch:
    """A single PII match found by a detector."""

    entity_type: str
    text: str
    start: int
    end: int
    score: float


# Short labels used for redaction placeholders, e.g. [EMAIL_ADDRESS]
REDACTION_LABELS: Dict[str, str] = {
    EntityType.EMAIL_ADDRESS.value: "EMAIL_ADDRESS",
    EntityType.CREDIT_CARD.value: "CREDIT_CARD",
    EntityType.PHONE_NUMBER.value: "PHONE_NUMBER",
    EntityType.IP_ADDRESS.value: "IP_ADDRESS",
    EntityType.URL.value: "URL",
    EntityType.MAC_ADDRESS.value: "MAC_ADDRESS",
    EntityType.DATE_OF_BIRTH.value: "DATE_OF_BIRTH",
    EntityType.CVV.value: "CVV",
    EntityType.SSN.value: "SSN",
    EntityType.DRIVERS_LICENSE.value: "DRIVERS_LICENSE",
    EntityType.US_PASSPORT.value: "US_PASSPORT",
    EntityType.TAX_ID.value: "TAX_ID",
    EntityType.ZIP_CODE.value: "ZIP_CODE",
    EntityType.IBAN.value: "IBAN",
    EntityType.EU_POSTAL_CODE.value: "POSTAL_CODE",
    EntityType.VAT_ID.value: "VAT_ID",
    EntityType.NI_NUMBER.value: "NI_NUMBER",
    EntityType.NHS_NUMBER.value: "NHS_NUMBER",
    EntityType.UK_POSTCODE.value: "UK_POSTCODE",
    EntityType.UK_PASSPORT.value: "UK_PASSPORT",
    EntityType.DE_PERSONAL_ID.value: "DE_PERSONAL_ID",
    EntityType.DE_TAX_ID.value: "DE_TAX_ID",
    EntityType.FR_NATIONAL_ID.value: "FR_NATIONAL_ID",
    EntityType.ES_DNI.value: "ES_DNI",
    EntityType.ES_NIE.value: "ES_NIE",
    EntityType.IT_CODICE_FISCALE.value: "IT_CODICE_FISCALE",
    EntityType.PT_NIF.value: "PT_NIF",
    EntityType.PL_PESEL.value: "PL_PESEL",
    EntityType.PL_NIP.value: "PL_NIP",
    EntityType.CZ_BIRTH_NUMBER.value: "CZ_BIRTH_NUMBER",
    EntityType.CZ_ICO.value: "CZ_ICO",
    EntityType.CZ_DIC.value: "CZ_DIC",
    EntityType.CZ_BANK_ACCOUNT.value: "CZ_BANK_ACCOUNT",
    EntityType.RU_INN.value: "RU_INN",
    EntityType.RU_SNILS.value: "RU_SNILS",
    EntityType.NL_BSN.value: "NL_BSN",
    EntityType.RO_CNP.value: "RO_CNP",
    EntityType.SK_BIRTH_NUMBER.value: "SK_BIRTH_NUMBER",
    EntityType.DK_CPR.value: "DK_CPR",
    EntityType.SE_PERSONNUMMER.value: "SE_PERSONNUMMER",
    EntityType.NO_BIRTH_NUMBER.value: "NO_BIRTH_NUMBER",
    EntityType.BR_CPF.value: "BR_CPF",
    EntityType.BR_CNPJ.value: "BR_CNPJ",
    EntityType.US_ITIN.value: "US_ITIN",
    EntityType.UK_UTR.value: "UK_UTR",
    EntityType.FR_SIREN.value: "FR_SIREN",
    EntityType.ES_NSS.value: "ES_NSS",
    EntityType.ES_CIF.value: "ES_CIF",
    EntityType.IT_PARTITA_IVA.value: "IT_PARTITA_IVA",
    EntityType.PL_REGON.value: "PL_REGON",
    EntityType.SK_ICO.value: "SK_ICO",
    EntityType.SK_DIC.value: "SK_DIC",
    EntityType.RO_CUI.value: "RO_CUI",
    EntityType.DK_CVR.value: "DK_CVR",
    EntityType.SE_ORGNR.value: "SE_ORGNR",
    EntityType.NO_ORGNR.value: "NO_ORGNR",
    EntityType.BE_NATIONAL_NUMBER.value: "BE_NATIONAL_NUMBER",
    EntityType.BE_ENTERPRISE_NUMBER.value: "BE_ENTERPRISE_NUMBER",
    EntityType.AT_SVNR.value: "AT_SVNR",
    EntityType.IE_PPS.value: "IE_PPS",
    EntityType.FI_HETU.value: "FI_HETU",
    EntityType.FI_YTUNNUS.value: "FI_YTUNNUS",
    EntityType.HU_TAX_ID.value: "HU_TAX_ID",
    EntityType.HU_TAJ.value: "HU_TAJ",
    EntityType.BG_EGN.value: "BG_EGN",
    EntityType.HR_OIB.value: "HR_OIB",
    EntityType.SI_EMSO.value: "SI_EMSO",
    EntityType.SI_TAX_NUMBER.value: "SI_TAX_NUMBER",
    EntityType.LT_PERSONAL_CODE.value: "LT_PERSONAL_CODE",
    EntityType.LV_PERSONAL_CODE.value: "LV_PERSONAL_CODE",
    EntityType.EE_PERSONAL_CODE.value: "EE_PERSONAL_CODE",
    EntityType.CA_SIN.value: "CA_SIN",
    EntityType.CH_AHV.value: "CH_AHV",
    EntityType.AU_TFN.value: "AU_TFN",
    EntityType.AU_MEDICARE.value: "AU_MEDICARE",
    EntityType.NZ_IRD.value: "NZ_IRD",
    EntityType.IN_AADHAAR.value: "IN_AADHAAR",
    EntityType.IN_PAN.value: "IN_PAN",
    EntityType.JP_MY_NUMBER.value: "JP_MY_NUMBER",
    EntityType.KR_RRN.value: "KR_RRN",
    EntityType.ZA_ID.value: "ZA_ID",
    EntityType.TR_KIMLIK.value: "TR_KIMLIK",
    EntityType.IL_ID.value: "IL_ID",
    EntityType.AR_CUIT.value: "AR_CUIT",
    EntityType.CL_RUT.value: "CL_RUT",
    EntityType.CO_NIT.value: "CO_NIT",
}
