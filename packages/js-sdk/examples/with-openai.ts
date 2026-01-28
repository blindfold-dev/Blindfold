/**
 * OpenAI Integration Example
 *
 * This example shows how to use Blindfold with OpenAI to:
 * 1. Tokenize sensitive data before sending to OpenAI
 * 2. Get the response from OpenAI
 * 3. Detokenize the response to restore original data
 */

import { Blindfold } from '../src/index'
// Uncomment if you have OpenAI installed:
// import OpenAI from 'openai'

async function main() {
  // Initialize clients
  const blindfold = new Blindfold({
    apiKey: process.env.BLINDFOLD_API_KEY || 'your-blindfold-key',
  })

  // Uncomment if using OpenAI:
  // const openai = new OpenAI({
  //   apiKey: process.env.OPENAI_API_KEY,
  // })

  // User message with sensitive data
  const userMessage = `
    I need help with my account. My name is Sarah Johnson,
    my email is sarah.johnson@company.com, and my phone is +1-555-0199.
    I was born on 05/15/1990.
  `

  console.log('Original message:', userMessage)
  console.log()

  // Step 1: Tokenize sensitive data
  console.log('Step 1: Tokenizing sensitive data...')
  const tokenized = await blindfold.tokenize(userMessage, {
    policy: 'gdpr_eu', // Use GDPR policy
  })

  console.log('Tokenized message:', tokenized.text)
  console.log('Detected entities:')
  tokenized.detected_entities.forEach((entity) => {
    console.log(`  - ${entity.entity_type}: ${entity.text} (score: ${entity.score})`)
  })
  console.log()

  // Step 2: Send to OpenAI (simulated)
  console.log('Step 2: Sending to OpenAI...')

  // Uncomment to use real OpenAI:
  // const completion = await openai.chat.completions.create({
  //   model: 'gpt-4',
  //   messages: [
  //     {
  //       role: 'system',
  //       content: 'You are a helpful customer service assistant.',
  //     },
  //     {
  //       role: 'user',
  //       content: tokenized.text,
  //     },
  //   ],
  // })
  // const aiResponse = completion.choices[0].message.content || ''

  // Simulated response for demo
  const aiResponse = `Hello ${tokenized.text.match(/<Person_\d+>/)?.[0]}! I'd be happy to help you with your account. I'll send a verification email to ${tokenized.text.match(/<Email Address_\d+>/)?.[0]} and a text to ${tokenized.text.match(/<Phone Number_\d+>/)?.[0]}. For security, I'll also verify your date of birth ${tokenized.text.match(/<Date Of Birth_\d+>/)?.[0]}.`

  console.log('AI Response (tokenized):', aiResponse)
  console.log()

  // Step 3: Detokenize the response (client-side)
  console.log('Step 3: Detokenizing response...')
  const detokenized = blindfold.detokenize(aiResponse, tokenized.mapping)

  console.log('Final response:', detokenized.text)
  console.log()

  console.log('✅ Sensitive data was protected throughout the entire interaction!')
}

main().catch(console.error)
