export default async function Page() {
  await fetch('/api/customers')
  return <main>{process.env.NEXT_PUBLIC_APP_URL}</main>
}
