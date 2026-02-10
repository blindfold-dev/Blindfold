/**
 * Detect PII Example
 *
 * This example demonstrates PII detection without modifying the text.
 * Useful for scanning, auditing, and understanding what sensitive data
 * exists in your content before deciding how to handle it.
 */

import { Blindfold } from '../src/index'

async function main() {
  const client = new Blindfold({
    apiKey: process.env.BLINDFOLD_API_KEY || 'your-api-key-here',
  })

  // 1. Basic detection
  console.log('1. BASIC DETECTION')
  const text = 'Contact John Doe at john.doe@example.com or call +1-555-0123'
  console.log('   Text:', text)

  const result = await client.detect(text)
  console.log(`   Found ${result.entities_count} entities:`)
  for (const entity of result.detected_entities) {
    console.log(`   - ${entity.type}: "${entity.text}" (confidence: ${entity.score.toFixed(2)})`)
  }
  console.log()

  // 2. Detection with specific entities
  console.log('2. DETECT SPECIFIC ENTITY TYPES')
  const text2 = 'Patient Sarah Johnson, SSN 123-45-6789, diagnosed on 2024-03-15'
  console.log('   Text:', text2)

  const result2 = await client.detect(text2, {
    entities: ['person', 'social security number'],
  })
  console.log(`   Found ${result2.entities_count} entities (filtered):`)
  for (const entity of result2.detected_entities) {
    console.log(`   - ${entity.type}: "${entity.text}" (confidence: ${entity.score.toFixed(2)})`)
  }
  console.log()

  // 3. Detection with policy
  console.log('3. DETECT WITH POLICY')
  const text3 = 'Card 4532-7562-9102-3456 was charged $500 on account 987654321'
  console.log('   Text:', text3)

  const result3 = await client.detect(text3, {
    policy: 'pci_dss',
  })
  console.log(`   Found ${result3.entities_count} entities (PCI-DSS policy):`)
  for (const entity of result3.detected_entities) {
    console.log(`   - ${entity.type}: "${entity.text}" (confidence: ${entity.score.toFixed(2)})`)
  }
  console.log()

  // 4. Detection with confidence threshold
  console.log('4. DETECT WITH CONFIDENCE THRESHOLD')
  const text4 = 'Meeting with Dr. Smith at 123 Main St, New York about project Alpha'
  console.log('   Text:', text4)

  const result4 = await client.detect(text4, {
    score_threshold: 0.8,
  })
  console.log(`   Found ${result4.entities_count} entities (>80% confidence):`)
  for (const entity of result4.detected_entities) {
    console.log(`   - ${entity.type}: "${entity.text}" (confidence: ${entity.score.toFixed(2)})`)
  }
}

main().catch(console.error)
