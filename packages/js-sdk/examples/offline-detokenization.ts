/**
 * Offline Operations Example
 *
 * This example demonstrates client-side operations which:
 * - Work without an API key
 * - Work offline (no network required)
 * - Are fast (no API latency)
 * - Are secure (data never leaves your machine)
 *
 * Includes: detokenization and synthesis (format-preserving fake data).
 */

import { Blindfold } from '../src/index'

function main() {
  console.log('='.repeat(60))
  console.log('CLIENT-SIDE DETOKENIZATION DEMO')
  console.log('(No API key required - runs completely offline)')
  console.log('='.repeat(60))
  console.log()

  // Create a client (API key not needed for detokenization)
  const client = new Blindfold({ apiKey: 'not-needed-for-detokenize' })

  // Example 1: Simple detokenization
  console.log('Example 1: Simple Detokenization')
  console.log('-'.repeat(60))
  const tokenizedText1 = '<Person_1> called <Person_2> yesterday'
  const mapping1 = {
    '<Person_1>': 'Alice Johnson',
    '<Person_2>': 'Bob Smith',
  }

  console.log('Tokenized:', tokenizedText1)
  console.log('Mapping:', mapping1)

  const result1 = client.detokenize(tokenizedText1, mapping1)
  console.log('Detokenized:', result1.text)
  console.log('Replacements made:', result1.replacements_made)
  console.log()

  // Example 2: Email and PII
  console.log('Example 2: Email and PII')
  console.log('-'.repeat(60))
  const tokenizedText2 =
    'Contact <Person_1> at <Email Address_1> or call <Phone Number_1>'
  const mapping2 = {
    '<Person_1>': 'Sarah Williams',
    '<Email Address_1>': 'sarah.williams@company.com',
    '<Phone Number_1>': '+1-555-0123',
  }

  console.log('Tokenized:', tokenizedText2)
  const result2 = client.detokenize(tokenizedText2, mapping2)
  console.log('Detokenized:', result2.text)
  console.log('Replacements made:', result2.replacements_made)
  console.log()

  // Example 3: Repeated tokens
  console.log('Example 3: Repeated Tokens')
  console.log('-'.repeat(60))
  const tokenizedText3 =
    '<Person_1> met <Person_2> and <Person_1> introduced <Person_2> to <Person_3>'
  const mapping3 = {
    '<Person_1>': 'Charlie',
    '<Person_2>': 'Diana',
    '<Person_3>': 'Eve',
  }

  console.log('Tokenized:', tokenizedText3)
  const result3 = client.detokenize(tokenizedText3, mapping3)
  console.log('Detokenized:', result3.text)
  console.log('Replacements made:', result3.replacements_made)
  console.log()

  // Example 4: LLM Response Simulation
  console.log('Example 4: Simulated LLM Response')
  console.log('-'.repeat(60))
  console.log('Scenario: User asks AI about their account')

  const userQuery = 'My email is <Email Address_1> and phone is <Phone Number_1>'
  const llmResponse = `I found your account for <Email Address_1>. I'll send a verification code to <Phone Number_1>. Please check your phone.`

  const mapping4 = {
    '<Email Address_1>': 'user@example.com',
    '<Phone Number_1>': '+1-555-9876',
  }

  console.log('User (tokenized):', userQuery)
  console.log('LLM Response (tokenized):', llmResponse)
  console.log()

  const detokenized = client.detokenize(llmResponse, mapping4)
  console.log('LLM Response (to user):', detokenized.text)
  console.log('Replacements made:', detokenized.replacements_made)
  console.log()

  // Example 5: Offline Synthesis (format-preserving fake data)
  console.log('Example 5: Offline Synthesis')
  console.log('-'.repeat(60))
  console.log('Replace PII with realistic fake data - no API key needed!')
  console.log()

  const textToSynthesize = 'Contact support@acme.com, SSN 123-45-6789, IP 192.168.1.100'
  console.log('Original:', textToSynthesize)

  const synth1 = await client.synthesize(textToSynthesize)
  console.log('Synth #1:', synth1.text)
  console.log(`Entities found: ${synth1.entities_count}`)

  const synth2 = await client.synthesize(textToSynthesize)
  console.log('Synth #2:', synth2.text)
  console.log('(Each call produces different fake data)')
  console.log()

  // Performance demo
  console.log('='.repeat(60))
  console.log('PERFORMANCE DEMO')
  console.log('='.repeat(60))

  const largeMapping: Record<string, string> = {}
  for (let i = 1; i <= 100; i++) {
    largeMapping[`<Person_${i}>`] = `Person ${i}`
  }

  const largeText = Object.keys(largeMapping).join(' ')

  console.log(`Processing ${Object.keys(largeMapping).length} tokens...`)
  const startTime = Date.now()
  const largeResult = client.detokenize(largeText, largeMapping)
  const endTime = Date.now()

  console.log(`Replacements made: ${largeResult.replacements_made}`)
  console.log(`Time taken: ${endTime - startTime}ms`)
  console.log()

  console.log('='.repeat(60))
  console.log('✅ All examples completed successfully!')
  console.log('💡 Remember: Detokenization is client-side, secure, and fast!')
  console.log('='.repeat(60))
}

main()
