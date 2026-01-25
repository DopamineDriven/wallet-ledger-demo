# Wallet Ledger Service

A raw Node.js HTTP server implementing a ledger-based wallet service with PostgreSQL advisory locks for concurrency safety.

## Running Locally

### Prerequisites

- Node.js 20+
- PostgreSQL database
- pnpm

### Setup

1. Ensure the database is migrated:

```bash
pnpm db:migrate
```

2. Set environment variables:

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/wallet_ledger"
export PORT=3000  # optional, defaults to 3000
```

3. Start the server:

```bash
# Development (with hot reload)
pnpm dev

# Production
pnpm build && pnpm start
```

## API Endpoints

All endpoints require the `x-user-id` header with a valid UUID.

### GET /api/items

Returns the catalog of available items.

```bash
curl http://localhost:3000/api/items -H "x-user-id: 550e8400-e29b-41d4-a716-446655440000"
```

Response:
```json
[
  {"id": "33456444-29af-4484-b5d1-af61d06ef889", "name": "iPhone 13 Pro", "price": 109999},
  {"id": "b8c887ee-d5c6-4815-98fe-7dd102b80d73", "name": "iPhone X", "price": 89999},
  {"id": "f71bc01c-b3c2-464c-a54c-a857100ef171", "name": "Apple AirPods Max Silver", "price": 54999},
  {"id": "372d8cd7-2c2b-4d7f-b366-5af2d63509f8", "name": "Apple Watch Series 4 Gold", "price": 34999}
]
```

### GET /api/balance

Returns the user's current balance (sum of all completed ledger entries).

```bash
curl http://localhost:3000/api/balance -H "x-user-id: 550e8400-e29b-41d4-a716-446655440000"
```

Response:
```json
{"balance": 0}
```

### POST /api/credits

Adds credits to the user's wallet.

```bash
curl -X POST http://localhost:3000/api/credits \
  -H "x-user-id: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{"amount": 200000}'
```

Response:
```json
{"balance": 200000}
```

### POST /api/purchases

Purchases an item, deducting from the user's balance.

```bash
curl -X POST http://localhost:3000/api/purchases \
  -H "x-user-id: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{"itemId": "33456444-29af-4484-b5d1-af61d06ef889"}'
```

Response: `204 No Content`

## Concurrency Safety

The purchase endpoint uses PostgreSQL advisory locks to ensure atomic balance checks and debits. When concurrent purchase requests arrive for the same user, the first request acquires a transaction-scoped advisory lock keyed to the user's UUID. Subsequent requests for that user block until the first transaction commits or rolls back. Each request recalculates the balance within its transaction after acquiring the lock, guaranteeing the balance cannot go negative even under high concurrency. Different users can purchase concurrently without blocking each other.

The lock key is derived by XORing the high and low 64-bit halves of the user's UUID, producing a unique 64-bit integer for `pg_advisory_xact_lock`. This approach works for new users without existing rows and automatically releases on transaction completion.

## Idempotency Design Note

For production deployment, idempotency would be implemented using the existing `IdempotencyRecord` model in the database schema. Clients would include an `x-idempotency-key` header with mutating requests (credits and purchases). Before processing, the server would check for an existing record matching the (key, userId) pair. If found with a completed status, the cached response would replay immediately without re-executing the operation. If not found, a new record would be created with "PENDING" status, then updated with the final response (status code and body) upon completion. For purchases, the record would link to the created `LedgerEntry` via `ledgerEntryId`. Records would expire after 24 hours based on the `expiresAt` field, allowing cleanup of stale entries while maintaining protection against duplicate submissions.

## Error Responses

| Status | Condition |
|--------|-----------|
| 400 | Missing or invalid `x-user-id` header |
| 400 | Invalid JSON body |
| 400 | `amount` not a positive integer |
| 400 | `itemId` not a valid UUID |
| 404 | Item not found in catalog |
| 409 | Insufficient balance for purchase |
| 500 | Internal server error |
