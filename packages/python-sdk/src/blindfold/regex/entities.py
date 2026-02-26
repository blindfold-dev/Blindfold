"""Entity types and match objects for local PII detection"""

from dataclasses import dataclass
from enum import Enum


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


