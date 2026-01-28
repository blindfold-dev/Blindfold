/**
 * Encrypt PII Example
 *
 * This example demonstrates encrypting sensitive data in text using AES encryption.
 * Encrypted values can be decrypted later with the same key — useful for secure
 * storage and transmission where you need to recover the original data.
 */

import { Blindfold } from '../src/index'

async function main() {
  const client = new Blindfold({
    apiKey: process.env.BLINDFOLD_API_KEY || 'your-api-key-here',
  })

  const text = 'Contact John Doe at john.doe@example.com or call +1-555-0123'
  console.log('Original:', text)
  console.log('='.repeat(60))
  console.log()

  // 1. Encrypt with server-managed key (tenant key)
  console.log('1. ENCRYPT (Server-managed key)')
  const result = await client.encrypt(text)
  console.log('   Result:', result.text)
  console.log('   Entities encrypted:', result.entities_count)
  console.log()

  // 2. Encrypt with custom password
  console.log('2. ENCRYPT (Custom password)')
  const result2 = await client.encrypt(text, {
    encryption_key: 'my-secret-password',
  })
  console.log('   Result:', result2.text)
  console.log('   Entities encrypted:', result2.entities_count)
  console.log()

  // 3. Encrypt with policy
  console.log('3. ENCRYPT WITH POLICY')
  const medical = 'Patient Sarah Johnson, SSN 123-45-6789, email sarah@example.com'
  console.log('   Text:', medical)
  const result3 = await client.encrypt(medical, {
    policy: 'hipaa_us',
  })
  console.log('   Result:', result3.text)
  console.log('   Entities encrypted:', result3.entities_count)
}

main().catch(console.error)
