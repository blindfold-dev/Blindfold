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
}
