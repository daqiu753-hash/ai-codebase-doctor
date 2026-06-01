import { openai } from '@ai-sdk/openai'
import { createClient } from 'super-fast-rag'

export function getModel() {
  return openai('gpt-4.1')
}

export function getRagClient() {
  return createClient({ apiKey: process.env.RAG_API_KEY })
}
