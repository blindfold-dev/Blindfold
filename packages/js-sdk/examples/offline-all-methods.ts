/**
 * Offline All Methods Example
 *
 * Every Blindfold method works offline — no API key, no network.
 * This example demonstrates all 8 operations running locally:
 *
 * 1. Detect     — find PII without modifying text
 * 2. Redact     — replace PII with entity-name placeholders
 * 3. Tokenize   — replace PII with numbered tokens (reversible)
 * 4. Detokenize — restore original values from tokens
 * 5. Mask       — partially hide PII (show first/last N chars)
 * 6. Hash       — replace PII with deterministic hashes
 * 7. Synthesize — replace PII with realistic fake data
 * 8. Encrypt    — replace PII with AES-encrypted values
 */

import { Blindfold } from '../src/index'

async function main() {
  // No API key — everything runs locally
  const client = new Blindfold()

  const text = 'Email support@acme.com, SSN 123-45-6789, card 4532015112830366'
  console.log('OFFLINE MODE — All Methods (no API key)')
  console.log('='.repeat(65))
  console.log('Input:', text)
  console.log()

  // 1. Detect
  console.log('1. DETECT')
  const detected = await client.detect(text)
  console.log(`   Found ${detected.entities_count} entities:`)
  for (const e of detected.detected_entities) {
    console.log(`   - ${e.type}: "${e.text}" [${e.start}:${e.end}] score=${e.score}`)
  }
  console.log()

  // 2. Redact
  console.log('2. REDACT')
  const redacted = await client.redact(text)
  console.log(`   ${redacted.text}`)
  console.log()

  // 3. Tokenize
  console.log('3. TOKENIZE')
  const tokenized = await client.tokenize(text)
  console.log(`   ${tokenized.text}`)
  console.log('   Mapping:', JSON.stringify(tokenized.mapping, null, 2).replace(/\n/g, '\n   '))
  console.log()

  // 4. Detokenize
  console.log('4. DETOKENIZE')
  const restored = client.detokenize(tokenized.text, tokenized.mapping)
  console.log(`   ${restored.text}`)
  console.log(`   Replacements: ${restored.replacements_made}`)
  console.log()

  // 5. Mask
  console.log('5. MASK (last 4 chars visible)')
  const masked = await client.mask(text, { chars_to_show: 4, from_end: true })
  console.log(`   ${masked.text}`)
  console.log()

  // 6. Hash
  console.log('6. HASH (deterministic)')
  const hashed = await client.hash(text, { hash_length: 8 })
  console.log(`   ${hashed.text}`)
  const hashed2 = await client.hash(text, { hash_length: 8 })
  console.log(`   Same input = same hash: ${hashed.text === hashed2.text}`)
  console.log()

  // 7. Synthesize
  console.log('7. SYNTHESIZE (format-preserving fake data)')
  const synth1 = await client.synthesize(text)
  console.log(`   Call 1: ${synth1.text}`)
  const synth2 = await client.synthesize(text)
  console.log(`   Call 2: ${synth2.text}`)
  console.log('   (Each call produces different results)')
  console.log()

  // 8. Encrypt
  console.log('8. ENCRYPT (AES-256-CBC)')
  const encrypted = await client.encrypt(text, {
    encryption_key: 'my-secret-key-at-least-16-chars',
  })
  console.log(`   ${encrypted.text}`)
  console.log()

  // ─── MULTI-LOCALE DETECTION ────────────────────────────────────
  console.log('MULTI-LOCALE DETECTION')
  console.log('='.repeat(65))
  console.log()

  // EU locale — IBAN detection
  console.log('9. EU LOCALE — IBAN')
  const euClient = new Blindfold({ locales: ['eu'] })
  const euText = 'Wire to IBAN DE89370400440532013000 please'
  const euResult = await euClient.detect(euText)
  console.log(`   Input: ${euText}`)
  console.log(`   Found ${euResult.entities_count} entities:`)
  for (const e of euResult.detected_entities) {
    console.log(`   - ${e.type}: "${e.text}"`)
  }
  console.log()

  // UK locale — NI number
  console.log('10. UK LOCALE — National Insurance Number')
  const ukClient = new Blindfold({ locales: ['uk'] })
  const ukText = 'NI number: AB 12 34 56 A'
  const ukResult = await ukClient.detect(ukText)
  console.log(`   Input: ${ukText}`)
  console.log(`   Found ${ukResult.entities_count} entities:`)
  for (const e of ukResult.detected_entities) {
    console.log(`   - ${e.type}: "${e.text}"`)
  }
  console.log()

  // CZ locale — Czech Birth Number
  console.log('11. CZ LOCALE — Czech Birth Number')
  const czClient = new Blindfold({ locales: ['cz'] })
  const czText = 'Rodne cislo: 710319/2745'
  const czResult = await czClient.detect(czText)
  console.log(`   Input: ${czText}`)
  console.log(`   Found ${czResult.entities_count} entities:`)
  for (const e of czResult.detected_entities) {
    console.log(`   - ${e.type}: "${e.text}"`)
  }
  console.log()

  // Entity filtering — only Email Address, SSN ignored
  console.log('12. ENTITY FILTER — only Email Address')
  const filterText = 'Email support@acme.com, SSN 123-45-6789'
  const filterResult = await client.detect(filterText, { entities: ['Email Address'] })
  console.log(`   Input: ${filterText}`)
  console.log(`   Found ${filterResult.entities_count} entities (SSN ignored):`)
  for (const e of filterResult.detected_entities) {
    console.log(`   - ${e.type}: "${e.text}"`)
  }
  console.log()

  // Combined — locales + entities
  console.log('13. COMBINED — locales: [cz] + entities: [Czech Birth Number]')
  const combined = new Blindfold({ locales: ['cz'] })
  const combinedText = 'Rodne cislo: 710319/2745, email test@example.com'
  const combinedResult = await combined.detect(combinedText, { entities: ['Czech Birth Number'] })
  console.log(`   Input: ${combinedText}`)
  console.log(`   Found ${combinedResult.entities_count} entities (email ignored):`)
  for (const e of combinedResult.detected_entities) {
    console.log(`   - ${e.type}: "${e.text}"`)
  }
  console.log()

  // Policy-based detection
  console.log('14. POLICY — gdpr_eu')
  const policyResult = await client.detect(text, { policy: 'gdpr_eu' })
  console.log(`   Input: ${text}`)
  console.log(`   Found ${policyResult.entities_count} entities (GDPR scope):`)
  for (const e of policyResult.detected_entities) {
    console.log(`   - ${e.type}: "${e.text}"`)
  }
  console.log()

  // Summary
  console.log('='.repeat(65))
  console.log('All 8 methods ran offline — zero network calls, zero API keys.')
  console.log('Multi-locale detection supports EU, UK, CZ, and more.')
  console.log('Policy and per-call entity filtering work in local mode.')
}

main().catch(console.error)
