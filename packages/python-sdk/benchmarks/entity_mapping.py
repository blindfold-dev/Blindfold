"""Shared entity-type mappings between Blindfold, Presidio, and AI4Privacy."""

# ---------------------------------------------------------------------------
# Presidio -> Blindfold
# ---------------------------------------------------------------------------
# Maps Presidio entity names to Blindfold EntityType string values.
# Entries with None are NER-only (PERSON, LOCATION, ORGANIZATION) and
# cannot be detected by regex — they are skipped during evaluation.

PRESIDIO_TO_BLINDFOLD: dict[str, str | None] = {
    "EMAIL_ADDRESS": "Email Address",
    "CREDIT_CARD": "Credit Card Number",
    "PHONE_NUMBER": "Phone Number",
    "IP_ADDRESS": "IP Address",
    "URL": "URL",
    "US_SSN": "Social Security Number",
    "US_ITIN": "US ITIN",
    "IBAN_CODE": "IBAN",
    "DATE_TIME": "Date of Birth",
    # NER-only — skip
    "PERSON": None,
    "LOCATION": None,
    "NRP": None,
    "ORGANIZATION": None,
}

# Reverse: Blindfold -> Presidio (only regex-detectable types)
BLINDFOLD_TO_PRESIDIO: dict[str, str] = {
    v: k for k, v in PRESIDIO_TO_BLINDFOLD.items() if v is not None
}

# ---------------------------------------------------------------------------
# AI4Privacy -> Blindfold
# ---------------------------------------------------------------------------
# Maps AI4Privacy dataset labels to Blindfold EntityType string values.

AI4PRIVACY_TO_BLINDFOLD: dict[str, str | None] = {
    "EMAIL": "Email Address",
    "CREDITCARDNUMBER": "Credit Card Number",
    "TELEPHONENUM": "Phone Number",
    "ZIPCODE": "ZIP Code",
    "SOCIALNUM": "Social Security Number",
    "DRIVERLICENSENUM": "Driver's License",
    "DATEOFBIRTH": "Date of Birth",
    "IPV4": "IP Address",
    "IPV6": "IP Address",
    "URL": "URL",
    "IBAN": "IBAN",
    # NER-only — expected 0% recall from regex scanner
    "GIVENNAME": None,
    "SURNAME": None,
    "USERNAME": None,
    "PASSWORD": None,
    "STREET": None,
    "CITY": None,
    "BUILDINGNUM": None,
    "COUNTRY": None,
    "STATE": None,
    "PREFIX": None,
    "TITLE": None,
    "SEX": None,
    "ACCOUNTNUM": None,
    "IDCARDNUM": None,
    "COMPANYNAME": None,
    "JOBTYPE": None,
    "JOBTITLE": None,
    "JOBAREA": None,
    "VEHICLEVRM": None,
    "VEHICLEVIN": None,
    "CURRENCYNAME": None,
    "CURRENCYCODE": None,
    "CURRENCYSYMBOL": None,
    "AMOUNT": None,
    "BITCOINADDRESS": None,
    "ETHEREUMADDRESS": None,
    "LITECOINADDRESS": None,
    "MASKEDNUMBER": None,
    "NEARBYGPSCOORDINATE": None,
    "ORDINALDIRECTION": None,
    "SECONDARYADDRESS": None,
    "TIME": None,
    "USERAGENT": None,
    "MAC": "MAC Address",
    "PHONENUMBER": "Phone Number",
}

# Reverse: Blindfold -> AI4Privacy (first match wins)
BLINDFOLD_TO_AI4PRIVACY: dict[str, list[str]] = {}
for _k, _v in AI4PRIVACY_TO_BLINDFOLD.items():
    if _v is not None:
        BLINDFOLD_TO_AI4PRIVACY.setdefault(_v, []).append(_k)

# ---------------------------------------------------------------------------
# AI4Privacy -> Presidio
# ---------------------------------------------------------------------------

AI4PRIVACY_TO_PRESIDIO: dict[str, str | None] = {
    "EMAIL": "EMAIL_ADDRESS",
    "CREDITCARDNUMBER": "CREDIT_CARD",
    "TELEPHONENUM": "PHONE_NUMBER",
    "PHONENUMBER": "PHONE_NUMBER",
    "ZIPCODE": None,
    "SOCIALNUM": "US_SSN",
    "DRIVERLICENSENUM": None,
    "DATEOFBIRTH": "DATE_TIME",
    "IPV4": "IP_ADDRESS",
    "IPV6": "IP_ADDRESS",
    "URL": "URL",
    "IBAN": "IBAN_CODE",
    "MAC": None,
    # NER types Presidio can detect
    "GIVENNAME": "PERSON",
    "SURNAME": "PERSON",
    "COUNTRY": "LOCATION",
    "CITY": "LOCATION",
    "STATE": "LOCATION",
    "STREET": "LOCATION",
    "COMPANYNAME": "ORGANIZATION",
    # No Presidio equivalent
    "USERNAME": None,
    "PASSWORD": None,
    "BUILDINGNUM": None,
    "PREFIX": None,
    "TITLE": None,
    "SEX": None,
    "ACCOUNTNUM": None,
    "IDCARDNUM": None,
    "JOBTYPE": None,
    "JOBTITLE": None,
    "JOBAREA": None,
    "VEHICLEVRM": None,
    "VEHICLEVIN": None,
    "CURRENCYNAME": None,
    "CURRENCYCODE": None,
    "CURRENCYSYMBOL": None,
    "AMOUNT": None,
    "BITCOINADDRESS": None,
    "ETHEREUMADDRESS": None,
    "LITECOINADDRESS": None,
    "MASKEDNUMBER": None,
    "NEARBYGPSCOORDINATE": None,
    "ORDINALDIRECTION": None,
    "SECONDARYADDRESS": None,
    "TIME": None,
    "USERAGENT": None,
}

# Regex-detectable entity types for filtering evaluation
REGEX_DETECTABLE_PRESIDIO = {k for k, v in PRESIDIO_TO_BLINDFOLD.items() if v is not None}
REGEX_DETECTABLE_AI4PRIVACY = {k for k, v in AI4PRIVACY_TO_BLINDFOLD.items() if v is not None}
