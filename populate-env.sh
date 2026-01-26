#!/bin/bash

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if env-scaffold.json exists
if [ ! -f "env-scaffold.json" ]; then
    echo -e "${RED}Error: env-scaffold.json not found in the current directory${NC}"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is not installed. Please install jq first.${NC}"
    echo "Install with: brew install jq (macOS) or apt-get install jq (Linux)"
    exit 1
fi

echo -e "${BLUE}🔧 Starting environment setup for wallet-ledger-demo...${NC}\n"

# Function to write env file
write_env_file() {
    local dir=$1
    shift
    local keys=("$@")

    # Create directory if it doesn't exist
    mkdir -p "$dir"

    local env_file="$dir/.env"

    # Clear or create the .env file
    > "$env_file"

    echo -e "${BLUE}📝 Writing $env_file${NC}"

    # Write each key-value pair
    for key in "${keys[@]}"; do
        value=$(jq -r ".env.${key}" env-scaffold.json)

        # Handle boolean values (convert to lowercase)
        if [ "$value" = "true" ] || [ "$value" = "false" ]; then
            value=$(echo "$value" | tr '[:upper:]' '[:lower:]')
        fi

        echo "${key}=${value}" >> "$env_file"
    done

    echo -e "${GREEN}✓ Created $env_file${NC}\n"
}

# apps/wallet - the main API server
write_env_file "apps/wallet" \
    "DATABASE_URL" \
    "DIRECT_URL" \
    "PORT" \
    "LOG_LEVEL"

# packages/db - Prisma client
write_env_file "packages/db" \
    "DATABASE_URL" \
    "DIRECT_URL"

# packages/seed - data seeder
write_env_file "packages/seed" \
    "DATABASE_URL" \
    "DIRECT_URL"

# Root directory
write_env_file "." \
    "DATABASE_URL" \
    "DIRECT_URL" \
    "PORT" \
    "LOG_LEVEL"

echo -e "${GREEN}✅ All .env files created successfully!${NC}\n"

# Ask if user wants to delete the scaffold file
read -p "Delete env-scaffold.json? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm env-scaffold.json
    echo -e "${GREEN}🗑️  env-scaffold.json deleted${NC}"
else
    echo -e "${BLUE}📋 env-scaffold.json preserved${NC}"
fi

echo -e "\n${GREEN}🎉 Environment setup complete!${NC}"
