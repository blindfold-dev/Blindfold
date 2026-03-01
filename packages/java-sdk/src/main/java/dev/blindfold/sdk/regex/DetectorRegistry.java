package dev.blindfold.sdk.regex;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

public class DetectorRegistry {
    private static final List<Supplier<Detector>> UNIVERSAL = new ArrayList<>();
    private static final Map<String, List<Supplier<Detector>>> REGIONAL = new HashMap<>();

    static {
        REGIONAL.put("us", new ArrayList<>());
        REGIONAL.put("eu", new ArrayList<>());
        REGIONAL.put("uk", new ArrayList<>());
    }

    public static void registerUniversal(Supplier<Detector> supplier) {
        UNIVERSAL.add(supplier);
    }

    public static void registerRegion(String locale, Supplier<Detector> supplier) {
        REGIONAL.computeIfAbsent(locale.toLowerCase(), k -> new ArrayList<>()).add(supplier);
    }

    private final List<Detector> detectors;

    public DetectorRegistry(List<String> locales) {
        DetectorLoader.ensureLoaded();
        List<String> effectiveLocales = locales != null ? locales : List.of("us");
        this.detectors = new ArrayList<>();

        for (Supplier<Detector> supplier : UNIVERSAL) {
            detectors.add(supplier.get());
        }

        for (String locale : effectiveLocales) {
            String loc = locale.toLowerCase();
            List<Supplier<Detector>> regionSuppliers = REGIONAL.get(loc);
            if (regionSuppliers != null) {
                for (Supplier<Detector> supplier : regionSuppliers) {
                    detectors.add(supplier.get());
                }
            }
        }
    }

    public List<Detector> getDetectors() {
        return detectors;
    }
}
