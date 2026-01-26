#!/usr/bin/env bash
set -euo pipefail

USER_ID="$(uuidgen)"
curl -s -X POST "http://localhost:3000/api/credits" \
  -H "x-user-id: $USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"amount": 11099997}'  # 3 x 3699999


for i in {1..5}; do
  curl -s -w "$i: %{http_code}\n" -o /dev/null -X POST "http://localhost:3000/api/purchases" \
    -H "x-user-id: $USER_ID" \
    -H "Content-Type: application/json" \
    -d '{"itemId": "8707996f-82f6-417e-b134-50e8e578b539"}' &
done; wait

curl -s "http://localhost:3000/api/balance" -H "x-user-id: $USER_ID"

