/**
 * Basic Tokenization Example
 *
 * This example demonstrates how to:
 * 1. Tokenize sensitive data
 * 2. Send tokenized data to an LLM
 * 3. Detokenize the response
 */

import { Blindfold } from '../src/index'

async function main() {
  // Initialize the client
  const client = new Blindfold({
    apiKey: process.env.BLINDFOLD_API_KEY || 'your-api-key-here',
    userId: 'user_123', // Optional: for audit logs
  })

  // Original text with sensitive data
  const sensitiveText = 'My name is John Doe and my email is john.doe@example.com'
  console.log('Original text:', sensitiveText)
  console.log()

  // Step 1: Tokenize the sensitive data
  console.log('Step 1: Tokenizing...')
  const tokenized = await client.tokenize(sensitiveText, {
    policy: 'basic', // Use a predefined policy
    score_threshold: 0.4, // Confidence threshold
  })

  console.log('Tokenized text:', tokenized.text)
  console.log('Mapping:', tokenized.mapping)
  console.log('Entities found:', tokenized.entities_count)
  console.log()

  // Step 2: Send tokenized text to your LLM (simulated)
  console.log('Step 2: Sending to LLM...')
  const llmResponse = simulateLLMCall(tokenized.text)
  console.log('LLM Response:', llmResponse)
  console.log()

  // Step 3: Detokenize the response (client-side, no API call)
  console.log('Step 3: Detokenizing...')
  const detokenized = client.detokenize(llmResponse, tokenized.mapping)
  console.log('Final response:', detokenized.text)
  console.log('Replacements made:', detokenized.replacements_made)
}

function simulateLLMCall(tokenizedText: string): string {
  // Simulate an LLM response that includes the tokens
  // Extract tokens using regex to handle tokens with spaces like <Email Address_1>
  const tokens = tokenizedText.match(/<[^>]+>/g) || []
  const personToken = tokens[0] || '<Person_1>'
  const emailToken = tokens[1] || '<Email Address_1>'

  return `Hello! I can help ${personToken} with their request. I'll send the information to ${emailToken}`
}

main().catch(console.error)
