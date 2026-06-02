import { summarizeCustomers } from '../lib/ai'
import { databaseUrl } from '../lib/db'

export default function Page() {
  fetch('/api/customers')
  return `${databaseUrl}:${summarizeCustomers(['synthetic customer'])}`
}

