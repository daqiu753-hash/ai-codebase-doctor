import { openai } from '@ai-sdk/openai'

export function getClient() {
  return openai(process.env.RAG_API_KEY)
}
