package dev.blindfold.sdk.regex;

import dev.blindfold.sdk.regex.detectors.universal.*;
import dev.blindfold.sdk.regex.detectors.us.*;
import dev.blindfold.sdk.regex.detectors.uk.*;
import dev.blindfold.sdk.regex.detectors.eu.*;
import dev.blindfold.sdk.regex.detectors.de.*;
import dev.blindfold.sdk.regex.detectors.fr.*;
import dev.blindfold.sdk.regex.detectors.es.*;
import dev.blindfold.sdk.regex.detectors.it.*;
import dev.blindfold.sdk.regex.detectors.pt.*;
import dev.blindfold.sdk.regex.detectors.pl.*;
import dev.blindfold.sdk.regex.detectors.cz.*;
import dev.blindfold.sdk.regex.detectors.ru.*;
import dev.blindfold.sdk.regex.detectors.nl.*;
import dev.blindfold.sdk.regex.detectors.ro.*;
import dev.blindfold.sdk.regex.detectors.sk.*;
import dev.blindfold.sdk.regex.detectors.dk.*;
import dev.blindfold.sdk.regex.detectors.se.*;
import dev.blindfold.sdk.regex.detectors.no.*;
import dev.blindfold.sdk.regex.detectors.be.*;
import dev.blindfold.sdk.regex.detectors.at.*;
import dev.blindfold.sdk.regex.detectors.ie.*;
import dev.blindfold.sdk.regex.detectors.fi.*;
import dev.blindfold.sdk.regex.detectors.hu.*;
import dev.blindfold.sdk.regex.detectors.bg.*;
import dev.blindfold.sdk.regex.detectors.hr.*;
import dev.blindfold.sdk.regex.detectors.si.*;
import dev.blindfold.sdk.regex.detectors.lt.*;
import dev.blindfold.sdk.regex.detectors.lv.*;
import dev.blindfold.sdk.regex.detectors.ee.*;
import dev.blindfold.sdk.regex.detectors.ca.*;
import dev.blindfold.sdk.regex.detectors.ch.*;
import dev.blindfold.sdk.regex.detectors.au.*;
import dev.blindfold.sdk.regex.detectors.nz.*;
import dev.blindfold.sdk.regex.detectors.in.*;
import dev.blindfold.sdk.regex.detectors.jp.*;
import dev.blindfold.sdk.regex.detectors.kr.*;
import dev.blindfold.sdk.regex.detectors.za.*;
import dev.blindfold.sdk.regex.detectors.tr.*;
import dev.blindfold.sdk.regex.detectors.il.*;
import dev.blindfold.sdk.regex.detectors.ar.*;
import dev.blindfold.sdk.regex.detectors.cl.*;
import dev.blindfold.sdk.regex.detectors.co.*;
import dev.blindfold.sdk.regex.detectors.br.*;

/**
 * Forces class loading of all detector packages so they register with DetectorRegistry.
 */
public final class DetectorLoader {
    private static volatile boolean loaded = false;

    public static void ensureLoaded() {
        if (loaded) return;
        synchronized (DetectorLoader.class) {
            if (loaded) return;
            // Universal
            load(EmailDetector.class);
            load(CreditCardDetector.class);
            load(PhoneDetector.class);
            load(UrlDetector.class);
            load(CvvDetector.class);
            load(DateOfBirthDetector.class);
            load(IpAddressDetector.class);
            load(MacAddressDetector.class);
            // US
            load(SsnDetector.class);
            load(DriversLicenseDetector.class);
            load(UsPassportDetector.class);
            load(UsTaxIdDetector.class);
            load(ZipCodeDetector.class);
            load(ItinDetector.class);
            // UK
            load(NiNumberDetector.class);
            load(NhsNumberDetector.class);
            load(UkPostcodeDetector.class);
            load(UkPassportDetector.class);
            load(UtrDetector.class);
            // EU
            load(IbanDetector.class);
            load(EuPostalCodeDetector.class);
            load(VatIdDetector.class);
            // DE
            load(DePersonalIdDetector.class);
            load(DeTaxIdDetector.class);
            // FR
            load(FrNationalIdDetector.class);
            load(FrSirenDetector.class);
            // ES
            load(EsDniDetector.class);
            load(EsNieDetector.class);
            load(EsNssDetector.class);
            load(EsCifDetector.class);
            // IT
            load(ItCodiceFiscaleDetector.class);
            load(ItPartitaIvaDetector.class);
            // PT
            load(PtNifDetector.class);
            // PL
            load(PlPeselDetector.class);
            load(PlNipDetector.class);
            load(PlRegonDetector.class);
            // CZ
            load(CzBirthNumberDetector.class);
            load(CzIcoDetector.class);
            load(CzDicDetector.class);
            load(CzBankAccountDetector.class);
            // RU
            load(RuInnDetector.class);
            load(RuSnilsDetector.class);
            // NL
            load(NlBsnDetector.class);
            // RO
            load(RoCnpDetector.class);
            load(RoCuiDetector.class);
            // SK
            load(SkBirthNumberDetector.class);
            load(SkIcoDetector.class);
            load(SkDicDetector.class);
            // DK
            load(DkCprDetector.class);
            load(DkCvrDetector.class);
            // SE
            load(SePersonnummerDetector.class);
            load(SeOrgnrDetector.class);
            // NO
            load(NoBirthNumberDetector.class);
            load(NoOrgnrDetector.class);
            // BE
            load(BeNationalNumberDetector.class);
            load(BeEnterpriseNumberDetector.class);
            // AT
            load(AtSvnrDetector.class);
            // IE
            load(IePpsDetector.class);
            // FI
            load(FiHetuDetector.class);
            load(FiYtunnusDetector.class);
            // HU
            load(HuTaxIdDetector.class);
            load(HuTajDetector.class);
            // BG
            load(BgEgnDetector.class);
            // HR
            load(HrOibDetector.class);
            // SI
            load(SiEmsoDetector.class);
            load(SiTaxNumberDetector.class);
            // LT
            load(LtPersonalCodeDetector.class);
            // LV
            load(LvPersonalCodeDetector.class);
            // EE
            load(EePersonalCodeDetector.class);
            // CA
            load(CaSinDetector.class);
            // CH
            load(ChAhvDetector.class);
            // AU
            load(AuTfnDetector.class);
            load(AuMedicareDetector.class);
            // NZ
            load(NzIrdDetector.class);
            // IN
            load(InAadhaarDetector.class);
            load(InPanDetector.class);
            // JP
            load(JpMyNumberDetector.class);
            // KR
            load(KrRrnDetector.class);
            // ZA
            load(ZaIdDetector.class);
            // TR
            load(TrKimlikDetector.class);
            // IL
            load(IlIdDetector.class);
            // AR
            load(ArCuitDetector.class);
            // CL
            load(ClRutDetector.class);
            // CO
            load(CoNitDetector.class);
            // BR
            load(BrCpfDetector.class);
            load(BrCnpjDetector.class);

            loaded = true;
        }
    }

    private static void load(Class<?> cls) {
        try {
            Class.forName(cls.getName(), true, cls.getClassLoader());
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("Failed to load detector: " + cls.getName(), e);
        }
    }
}
