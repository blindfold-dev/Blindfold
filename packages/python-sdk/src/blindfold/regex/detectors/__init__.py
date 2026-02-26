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
from .de import personal_id, tax_id
from .fr import national_id
from .es import dni, nie
from .it import codice_fiscale
from .pt import nif
from .pl import pesel, nip
from .cz import birth_number as cz_birth_number
from .cz import ico as cz_ico
from .cz import dic as cz_dic
from .cz import bank_account as cz_bank_account
from .ru import inn, snils
from .nl import bsn
from .ro import cnp
from .sk import birth_number as sk_birth_number
from .dk import cpr
from .se import personnummer
from .no import birth_number as no_birth_number
from .br import cpf, cnpj
