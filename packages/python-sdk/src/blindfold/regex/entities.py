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
}
