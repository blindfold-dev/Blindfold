"""Auto-import all detector modules so they register with the registry."""

import importlib

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
from .us import itin as us_itin
from .uk import utr as uk_utr
from .fr import siren as fr_siren
from .es import nss as es_nss
from .es import cif as es_cif
from .it import partita_iva as it_partita_iva
from .pl import regon as pl_regon
from .sk import ico as sk_ico
from .sk import dic as sk_dic
from .ro import cui as ro_cui
from .dk import cvr as dk_cvr
from .se import orgnr as se_orgnr
from .no import orgnr as no_orgnr
from .be import national_number as be_national_number
from .be import enterprise_number as be_enterprise_number
from .at import svnr as at_svnr
from .ie import pps as ie_pps
from .fi import hetu as fi_hetu
from .fi import ytunnus as fi_ytunnus
from .hu import tax_id as hu_tax_id
from .hu import taj as hu_taj
from .bg import egn as bg_egn
from .hr import oib as hr_oib
from .si import emso as si_emso
from .si import tax_number as si_tax_number
from .lt import personal_code as lt_personal_code
from .lv import personal_code as lv_personal_code
from .ee import personal_code as ee_personal_code
from .ca import sin as ca_sin
from .ch import ahv as ch_ahv
from .au import tfn as au_tfn
from .au import medicare as au_medicare
from .nz import ird as nz_ird
# "in" is a Python keyword, so use importlib for the India detectors
in_aadhaar = importlib.import_module(".in.aadhaar", __package__)
in_pan = importlib.import_module(".in.pan", __package__)
from .jp import my_number as jp_my_number
from .kr import rrn as kr_rrn
from .za import id as za_id
from .tr import kimlik as tr_kimlik
from .il import id as il_id
from .ar import cuit as ar_cuit
from .cl import rut as cl_rut
from .co import nit as co_nit
