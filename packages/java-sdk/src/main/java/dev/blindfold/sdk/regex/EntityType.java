package dev.blindfold.sdk.regex;

public enum EntityType {
    // Universal
    EMAIL_ADDRESS("Email Address"),
    CREDIT_CARD("Credit Card Number"),
    PHONE_NUMBER("Phone Number"),
    IP_ADDRESS("IP Address"),
    URL("URL"),
    MAC_ADDRESS("MAC Address"),
    DATE_OF_BIRTH("Date of Birth"),
    CVV("CVV"),

    // US
    SSN("Social Security Number"),
    DRIVERS_LICENSE("Driver's License"),
    US_PASSPORT("US Passport"),
    TAX_ID("Tax ID"),
    ZIP_CODE("ZIP Code"),
    US_ITIN("US ITIN"),

    // EU
    IBAN("IBAN"),
    EU_POSTAL_CODE("Postal Code"),
    VAT_ID("VAT ID"),

    // UK
    NI_NUMBER("NI Number"),
    NHS_NUMBER("NHS Number"),
    UK_POSTCODE("UK Postcode"),
    UK_PASSPORT("UK Passport"),
    UK_UTR("UK UTR"),

    // Germany
    DE_PERSONAL_ID("German Personal ID"),
    DE_TAX_ID("German Tax ID"),

    // France
    FR_NATIONAL_ID("French National ID"),
    FR_SIREN("French SIREN"),

    // Spain
    ES_DNI("Spanish DNI"),
    ES_NIE("Spanish NIE"),
    ES_NSS("Spanish NSS"),
    ES_CIF("Spanish CIF"),

    // Italy
    IT_CODICE_FISCALE("Italian Codice Fiscale"),
    IT_PARTITA_IVA("Italian Partita IVA"),

    // Portugal
    PT_NIF("Portuguese NIF"),

    // Poland
    PL_PESEL("Polish PESEL"),
    PL_NIP("Polish NIP"),
    PL_REGON("Polish REGON"),

    // Czech Republic
    CZ_BIRTH_NUMBER("Czech Birth Number"),
    CZ_ICO("Czech ICO"),
    CZ_DIC("Czech DIC"),
    CZ_BANK_ACCOUNT("Czech Bank Account"),

    // Russia
    RU_INN("Russian INN"),
    RU_SNILS("Russian SNILS"),

    // Netherlands
    NL_BSN("Dutch BSN"),

    // Romania
    RO_CNP("Romanian CNP"),
    RO_CUI("Romanian CUI"),

    // Slovakia
    SK_BIRTH_NUMBER("Slovak Birth Number"),
    SK_ICO("Slovak ICO"),
    SK_DIC("Slovak DIC"),

    // Denmark
    DK_CPR("Danish CPR"),
    DK_CVR("Danish CVR"),

    // Sweden
    SE_PERSONNUMMER("Swedish Personnummer"),
    SE_ORGNR("Swedish Organisationsnummer"),

    // Norway
    NO_BIRTH_NUMBER("Norwegian Birth Number"),
    NO_ORGNR("Norwegian Organisasjonsnummer"),

    // Belgium
    BE_NATIONAL_NUMBER("Belgian National Number"),
    BE_ENTERPRISE_NUMBER("Belgian Enterprise Number"),

    // Austria
    AT_SVNR("Austrian SVNR"),

    // Ireland
    IE_PPS("Irish PPS Number"),

    // Finland
    FI_HETU("Finnish HETU"),
    FI_YTUNNUS("Finnish Y-tunnus"),

    // Hungary
    HU_TAX_ID("Hungarian Tax ID"),
    HU_TAJ("Hungarian TAJ"),

    // Bulgaria
    BG_EGN("Bulgarian EGN"),

    // Croatia
    HR_OIB("Croatian OIB"),

    // Slovenia
    SI_EMSO("Slovenian EMSO"),
    SI_TAX_NUMBER("Slovenian Tax Number"),

    // Lithuania
    LT_PERSONAL_CODE("Lithuanian Personal Code"),

    // Latvia
    LV_PERSONAL_CODE("Latvian Personal Code"),

    // Estonia
    EE_PERSONAL_CODE("Estonian Personal Code"),

    // Canada
    CA_SIN("Canadian SIN"),

    // Switzerland
    CH_AHV("Swiss AHV"),

    // Australia
    AU_TFN("Australian TFN"),
    AU_MEDICARE("Australian Medicare"),

    // New Zealand
    NZ_IRD("New Zealand IRD"),

    // India
    IN_AADHAAR("Indian Aadhaar"),
    IN_PAN("Indian PAN"),

    // Japan
    JP_MY_NUMBER("Japanese My Number"),

    // South Korea
    KR_RRN("Korean RRN"),

    // South Africa
    ZA_ID("South African ID"),

    // Turkey
    TR_KIMLIK("Turkish Kimlik"),

    // Israel
    IL_ID("Israeli ID"),

    // Argentina
    AR_CUIT("Argentine CUIT"),

    // Chile
    CL_RUT("Chilean RUT"),

    // Colombia
    CO_NIT("Colombian NIT"),

    // Brazil
    BR_CPF("Brazilian CPF"),
    BR_CNPJ("Brazilian CNPJ");

    private final String value;

    EntityType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static EntityType fromValue(String value) {
        for (EntityType type : values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        return null;
    }
}
