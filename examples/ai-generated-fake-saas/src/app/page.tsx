export default async function Page() {
  await fetch('/api/login', { method: 'POST' })
  await fetch('/api/customers')
  return <main>CRM</main>
}
