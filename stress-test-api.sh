#!/usr/bin/env bash
set -euo pipefail

USER_ID="550e8400-e29b-41d4-a716-446655440000"
BASE_URL="http://localhost:3000"

echo "=== Fetching catalog to get valid item ID ==="
CATALOG=$(curl -s "$BASE_URL/api/items" -H "x-user-id: $USER_ID")

# Extract first item's id and price using grep/sed (no jq dependency)
ITEM_ID=$(echo "$CATALOG" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"//')
ITEM_PRICE=$(echo "$CATALOG" | grep -o '"price":[0-9]*' | head -1 | sed 's/"price"://')
ITEM_NAME=$(echo "$CATALOG" | grep -o '"name":"[^"]*"' | head -1 | sed 's/"name":"//;s/"//')

if [ -z "$ITEM_ID" ]; then
  echo "ERROR: Could not fetch items from API. Is the server running?"
  exit 1
fi

PRICE_DOLLARS=$(echo "scale=2; $ITEM_PRICE / 100" | bc)
echo "Using: $ITEM_NAME (ID: $ITEM_ID) @ \$$PRICE_DOLLARS"
echo

echo "=== Initial balance ==="
curl -s "$BASE_URL/api/balance" -H "x-user-id: $USER_ID"
echo
echo

echo "=== Adding 50M credits (\$500,000.00) ==="
curl -s -X POST "$BASE_URL/api/credits" \
  -H "x-user-id: $USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000000}'
echo
echo

EXPECTED_PURCHASES=$(echo "50000000 / $ITEM_PRICE" | bc)
echo "=== Firing 15 concurrent purchases (expect ~$EXPECTED_PURCHASES to succeed) ==="
for i in {1..15}; do
  curl -s -w "Request $i: %{http_code}\n" -o /dev/null -X POST "$BASE_URL/api/purchases" \
    -H "x-user-id: $USER_ID" \
    -H "Content-Type: application/json" \
    -d "{\"itemId\": \"$ITEM_ID\"}" &
done
wait
echo

echo "=== Final balance ==="
curl -s "$BASE_URL/api/balance" -H "x-user-id: $USER_ID"
echo
