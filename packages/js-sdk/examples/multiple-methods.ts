/**
 * Multiple Anonymization Methods Example
 *
 * This example demonstrates different anonymization methods:
 * - Tokenize (reversible)
 * - Detect (scan without modifying)
 * - Mask (partial visibility)
 * - Redact (permanent removal)
 * - Hash (deterministic)
 * - Synthesize (fake data)
 * - Encrypt (AES encryption)
 */

import { Blindfold } from '../src/index'

async function main() {
  const client = new Blindfold({
    apiKey: process.env.BLINDFOLD_API_KEY || 'your-api-key-here',
  })

  const originalText = 'Contact John Doe at john.doe@example.com or call +1-555-0123'
  console.log('Original:', originalText)
  console.log('='.repeat(60))
  console.log()

  // 1. Tokenize (reversible)
  console.log('1. TOKENIZE (Reversible)')
  const tokenized = await client.tokenize(originalText)
  console.log('   Result:', tokenized.text)
  console.log('   Can be reversed:', 'Yes')
  console.log()

  // 2. Detect (scan without modifying)
  console.log('2. DETECT (Scan only)')
  const detected = await client.detect(originalText)
  console.log(`   Found ${detected.entities_count} entities:`)
  for (const entity of detected.detected_entities) {
    console.log(`   - ${entity.entity_type}: "${entity.text}"`)
  }
  console.log()

  // 3. Mask (partial visibility)
  console.log('3. MASK (Partial hiding)')
  const masked = await client.mask(originalText, {
    chars_to_show: 3,
    from_end: true,
  })
  console.log('   Result:', masked.text)
  console.log('   Can be reversed:', 'No')
  console.log()

  // 3. Redact (permanent removal)
  console.log('4. REDACT (Permanent removal)')
  const redacted = await client.redact(originalText)
  console.log('   Result:', redacted.text)
  console.log('   Can be reversed:', 'No')
  console.log()

  // 4. Hash (deterministic)
  console.log('5. HASH (Deterministic)')
  const hashed = await client.hash(originalText, {
    hash_type: 'sha256',
    hash_length: 8,
  })
  console.log('   Result:', hashed.text)
  console.log('   Can be reversed:', 'No (but same input = same hash)')
  console.log()

  // 5. Synthesize (fake data)
  console.log('6. SYNTHESIZE (Fake data)')
  const synthesized = await client.synthesize(originalText, {
    language: 'en',
  })
  console.log('   Result:', synthesized.text)
  console.log('   Can be reversed:', 'No')
  console.log()

  // 7. Encrypt (AES encryption)
  console.log('7. ENCRYPT (AES encryption)')
  const encrypted = await client.encrypt(originalText)
  console.log('   Result:', encrypted.text)
  console.log('   Can be reversed:', 'Yes (with the same key)')
  console.log()

  // Summary
  console.log('='.repeat(60))
  console.log('SUMMARY:')
  console.log(`- Tokenized: ${tokenized.entities_count} entities`)
  console.log(`- Detected: ${detected.entities_count} entities`)
  console.log(`- Masked: ${masked.entities_count} entities`)
  console.log(`- Redacted: ${redacted.entities_count} entities`)
  console.log(`- Hashed: ${hashed.entities_count} entities`)
  console.log(`- Synthesized: ${synthesized.entities_count} entities`)
  console.log(`- Encrypted: ${encrypted.entities_count} entities`)
}

main().catch(console.error)
