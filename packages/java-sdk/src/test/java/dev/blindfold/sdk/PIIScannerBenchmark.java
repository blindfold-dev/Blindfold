package dev.blindfold.sdk;

import dev.blindfold.sdk.regex.PIIMatch;
import dev.blindfold.sdk.regex.PIIScanner;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.*;

/**
 * Throughput benchmark for PIIScanner operations on realistic log lines.
 * Run with: mvn test -Dtest=PIIScannerBenchmark
 */
class PIIScannerBenchmark {

    private static final int WARMUP_ITERATIONS = 500;
    private static final int BENCHMARK_ITERATIONS = 5000;

    private static PIIScanner scannerFull;
    private static PIIScanner scannerMinimal;
    private static List<String> logLines;
    private static long totalBytes;

    // Realistic log lines — mix of clean and PII-containing entries
    private static final String[] SAMPLE_LOGS = {
        // ~30% of log lines contain PII (realistic for app logs)
        "2026-03-01 10:15:23.456 INFO  [http-nio-8080-exec-1] c.a.s.UserService - User login successful, session=abc123def",
        "2026-03-01 10:15:23.789 DEBUG [http-nio-8080-exec-2] c.a.s.OrderService - Processing order #98712 for user_id=4521",
        "2026-03-01 10:15:24.012 INFO  [http-nio-8080-exec-3] c.a.s.PaymentService - Payment received, card=4111-1111-1111-1111, amount=$129.99",
        "2026-03-01 10:15:24.345 WARN  [http-nio-8080-exec-1] c.a.s.AuthService - Failed login attempt from IP 192.168.1.105",
        "2026-03-01 10:15:24.567 ERROR [http-nio-8080-exec-4] c.a.s.EmailService - Failed to send email to john.doe@example.com: SMTP timeout",
        "2026-03-01 10:15:25.001 INFO  [scheduler-1] c.a.s.ReportService - Daily report generation started",
        "2026-03-01 10:15:25.234 DEBUG [http-nio-8080-exec-5] c.a.s.UserService - Updating profile for SSN 123-45-6789",
        "2026-03-01 10:15:25.567 INFO  [http-nio-8080-exec-2] c.a.s.ApiGateway - Request completed in 45ms, status=200",
        "2026-03-01 10:15:26.012 DEBUG [http-nio-8080-exec-6] c.a.s.CacheService - Cache hit ratio: 87.3%, evictions: 12",
        "2026-03-01 10:15:26.345 INFO  [http-nio-8080-exec-3] c.a.s.NotificationService - SMS sent to (555) 234-5678",
        "2026-03-01 10:15:26.789 WARN  [http-nio-8080-exec-7] c.a.s.RateLimiter - Rate limit approaching for client_id=web-app-prod",
        "2026-03-01 10:15:27.012 ERROR [http-nio-8080-exec-1] c.a.s.DatabaseService - Connection pool exhausted, active=50, waiting=12",
        "2026-03-01 10:15:27.345 INFO  [http-nio-8080-exec-8] c.a.s.WebhookService - Webhook delivered to https://api.partner.com/hooks/events",
        "2026-03-01 10:15:27.567 DEBUG [http-nio-8080-exec-2] c.a.s.ValidationService - Input validation passed for form submission",
        "2026-03-01 10:15:28.001 INFO  [http-nio-8080-exec-9] c.a.s.AuditService - User john@acme.com performed action=DELETE on resource=/api/v1/records/789",
        "2026-03-01 10:15:28.234 DEBUG [http-nio-8080-exec-3] c.a.s.HealthCheck - All services healthy, uptime=48h 23m",
        "2026-03-01 10:15:28.567 INFO  [http-nio-8080-exec-10] c.a.s.FileService - File uploaded: report_q1.pdf, size=2.4MB",
        "2026-03-01 10:15:29.001 WARN  [http-nio-8080-exec-4] c.a.s.SecurityService - Suspicious request from 10.0.0.42, user-agent=curl/7.68",
        "2026-03-01 10:15:29.234 INFO  [http-nio-8080-exec-5] c.a.s.BillingService - Invoice #INV-2026-0342 generated for customer, IBAN DE89 3704 0044 0532 0130 00",
        "2026-03-01 10:15:29.567 DEBUG [http-nio-8080-exec-6] c.a.s.QueueService - Message published to queue=order-events, partition=3",
    };

    @BeforeAll
    static void setup() {
        scannerFull = new PIIScanner(Arrays.asList("us", "eu", "uk"));
        scannerMinimal = new PIIScanner(Arrays.asList("us"));

        // Build log lines by repeating the sample set
        logLines = new ArrayList<>(BENCHMARK_ITERATIONS);
        for (int i = 0; i < BENCHMARK_ITERATIONS; i++) {
            logLines.add(SAMPLE_LOGS[i % SAMPLE_LOGS.length]);
        }
        totalBytes = 0;
        for (String line : logLines) {
            totalBytes += line.length();
        }
    }

    @Test
    void benchmarkDetect() {
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            scannerFull.detect(SAMPLE_LOGS[i % SAMPLE_LOGS.length]);
        }

        long start = System.nanoTime();
        int totalMatches = 0;
        for (String line : logLines) {
            List<PIIMatch> matches = scannerFull.detect(line);
            totalMatches += matches.size();
        }
        long elapsed = System.nanoTime() - start;

        printResults("detect (us+eu+uk)", elapsed, totalMatches);
    }

    @Test
    void benchmarkDetectMinimalLocale() {
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            scannerMinimal.detect(SAMPLE_LOGS[i % SAMPLE_LOGS.length]);
        }

        long start = System.nanoTime();
        int totalMatches = 0;
        for (String line : logLines) {
            List<PIIMatch> matches = scannerMinimal.detect(line);
            totalMatches += matches.size();
        }
        long elapsed = System.nanoTime() - start;

        printResults("detect (us only)", elapsed, totalMatches);
    }

    @Test
    void benchmarkDetectWithEntityFilter() {
        List<String> entities = Arrays.asList("Email Address", "Credit Card Number", "Social Security Number");

        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            scannerFull.detect(SAMPLE_LOGS[i % SAMPLE_LOGS.length], entities);
        }

        long start = System.nanoTime();
        int totalMatches = 0;
        for (String line : logLines) {
            List<PIIMatch> matches = scannerFull.detect(line, entities);
            totalMatches += matches.size();
        }
        long elapsed = System.nanoTime() - start;

        printResults("detect (3 entities)", elapsed, totalMatches);
    }

    @Test
    void benchmarkMask() {
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            scannerFull.mask(SAMPLE_LOGS[i % SAMPLE_LOGS.length], 4, true, "*", null);
        }

        long start = System.nanoTime();
        for (String line : logLines) {
            scannerFull.mask(line, 4, true, "*", null);
        }
        long elapsed = System.nanoTime() - start;

        printResults("mask (us+eu+uk)", elapsed, -1);
    }

    @Test
    void benchmarkRedact() {
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            scannerFull.redact(SAMPLE_LOGS[i % SAMPLE_LOGS.length]);
        }

        long start = System.nanoTime();
        for (String line : logLines) {
            scannerFull.redact(line);
        }
        long elapsed = System.nanoTime() - start;

        printResults("redact (us+eu+uk)", elapsed, -1);
    }

    private void printResults(String operation, long elapsedNanos, int totalMatches) {
        double elapsedMs = elapsedNanos / 1_000_000.0;
        double elapsedSec = elapsedNanos / 1_000_000_000.0;
        double linesPerSec = BENCHMARK_ITERATIONS / elapsedSec;
        double mbPerSec = (totalBytes / (1024.0 * 1024.0)) / elapsedSec;
        double usPerLine = (elapsedNanos / 1000.0) / BENCHMARK_ITERATIONS;

        System.out.println();
        System.out.println("=== " + operation + " ===");
        System.out.printf("  Lines:       %,d%n", BENCHMARK_ITERATIONS);
        System.out.printf("  Total time:  %.1f ms%n", elapsedMs);
        System.out.printf("  Per line:    %.1f µs%n", usPerLine);
        System.out.printf("  Throughput:  %,.0f lines/sec%n", linesPerSec);
        System.out.printf("  Throughput:  %.2f MB/sec%n", mbPerSec);
        if (totalMatches >= 0) {
            System.out.printf("  PII found:   %,d matches%n", totalMatches);
        }
    }
}
