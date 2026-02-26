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

  // Summary
  console.log('='.repeat(65))
  console.log('All 8 methods ran offline — zero network calls, zero API keys.')
}

main().catch(console.error)
