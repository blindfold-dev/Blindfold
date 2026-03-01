package dev.blindfold.sdk.regex.detectors.universal;

import dev.blindfold.sdk.regex.Detector;
import dev.blindfold.sdk.regex.DetectorRegistry;
import dev.blindfold.sdk.regex.EntityType;
import dev.blindfold.sdk.regex.PIIMatch;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class IpAddressDetector extends Detector {

    static {
        DetectorRegistry.registerUniversal(IpAddressDetector::new);
    }

    private static final Pattern IPV4 = Pattern.compile(
        "\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b"
    );

    private static final Pattern IPV6 = Pattern.compile(
        "\\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\\b" +
        "|\\b(?:[0-9a-fA-F]{1,4}:){1,7}:\\b" +
        "|\\b::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}\\b"
    );

    private static final Pattern VERSION_PREFIX = Pattern.compile(
        "(?:v|version\\s*)$", Pattern.CASE_INSENSITIVE
    );

    @Override
    public EntityType getEntityType() {
        return EntityType.IP_ADDRESS;
    }

    @Override
    public double getScore() {
        return 0.95;
    }

    @Override
    public boolean needsDigit() {
        return true;
    }

    @Override
    public List<PIIMatch> iterMatches(String text) {
        List<PIIMatch> results = new ArrayList<>();

        // IPv4 matches
        Matcher ipv4Matcher = IPV4.matcher(text);
        while (ipv4Matcher.find()) {
            String matchedText = ipv4Matcher.group();
            int start = ipv4Matcher.start();
            int end = ipv4Matcher.end();

            // Check for version number prefix (e.g., "v1.2.3.4" or "version 1.2.3.4")
            String before = text.substring(0, start);
            if (VERSION_PREFIX.matcher(before).find()) {
                continue;
            }

            results.add(new PIIMatch(
                getEntityType().getValue(),
                matchedText,
                start,
                end,
                getScore()
            ));
        }

        // IPv6 matches
        Matcher ipv6Matcher = IPV6.matcher(text);
        while (ipv6Matcher.find()) {
            String matchedText = ipv6Matcher.group();
            int start = ipv6Matcher.start();
            int end = ipv6Matcher.end();

            results.add(new PIIMatch(
                getEntityType().getValue(),
                matchedText,
                start,
                end,
                getScore()
            ));
        }

        return results;
    }
}
