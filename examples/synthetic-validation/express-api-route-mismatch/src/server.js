import express from 'express'

const app = express()

app.post('/auth/login', (_req, res) => {
  res.json({ ok: true })
})

app.listen(3000)

