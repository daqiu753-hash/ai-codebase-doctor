# AI Generated CRM SaaS

A production-ready AI CRM SaaS built with Next.js, Prisma, Stripe, and OpenAI.

## Getting started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Environment variables

Create `.env.local`:

```bash
OPENAI_API_KEY=your_key
STRIPE_SECRET_KEY=your_key
```

## API

- `POST /api/login`
- `GET /api/customers`

## Database

Run:

```bash
pnpm prisma migrate dev
```
