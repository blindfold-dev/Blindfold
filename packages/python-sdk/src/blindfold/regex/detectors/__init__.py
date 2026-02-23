"""Auto-import all detector modules so they register with the registry."""

from . import (
    credit_card,
    cvv,
    date_of_birth,
    email,
    ip_address,
    mac_address,
    phone,
    url,
)
from .us import ssn, drivers_license, passport, tax_id, zip_code
from .eu import iban, postal_code, vat_id
from .uk import ni_number, nhs_number, postcode
from .uk import passport as uk_passport
