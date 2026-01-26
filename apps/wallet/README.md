# Wallet Ledger Service

A raw Node.js HTTP server implementing a ledger-based wallet service with PostgreSQL advisory locks for concurrency safety.

See the [root README](../../README.md) for comprehensive documentation including:
- Environment setup and running locally
- Database migrations
- API endpoint details
- Concurrency safety explanation
- Database index documentation
- Idempotency design notes

## Quick Start

```bash
# From repository root
pnpm env:seed              # Generate .env files
pnpm install
pnpm --filter @wallet-ledger/wallet test # execute all tests from root
pnpm --filter @wallet-ledger/db db:migrate
pnpm build:db && pnpm build:types && pnpm build:seed && pnpm build:wallet
pnpm run:wallet            # Start server on :3000
```

## Testing

```bash
pnpm test                  # Run all tests
pnpm test:validation       # Input validation (23 tests)
pnpm test:api              # API endpoints (requires running server)
pnpm test:concurrency      # Concurrent purchase stress tests
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start with hot reload (nodemon + tsx) |
| `pnpm build` | Build with tsdown |
| `pnpm start` | Run built output |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:generate` | Generate Prisma client |
