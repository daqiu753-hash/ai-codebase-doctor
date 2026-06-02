import { createOpenAI } from '@ai-sdk/openai'

export function summarizeCustomers(customers: string[]) {
  const client = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return customers.join(', ') + String(client)
}

