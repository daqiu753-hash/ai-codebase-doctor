export async function login() {
  return fetch('/api/login', { method: 'POST' })
}

