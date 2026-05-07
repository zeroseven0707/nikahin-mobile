#!/bin/bash

# Script untuk update API URL dengan mudah

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Update API URL${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Read current URL
CURRENT_API=$(grep "API_BASE_URL = " src/config/api.js | cut -d"'" -f2)
CURRENT_WEB=$(grep "WEB_BASE_URL = " src/config/api.js | cut -d"'" -f2)

echo -e "${YELLOW}Current URLs:${NC}"
echo "API: $CURRENT_API"
echo "WEB: $CURRENT_WEB"
echo ""

# Ask for new URL
echo -e "${BLUE}Enter new production URL (without /api):${NC}"
echo "Example: https://nikahin.com or http://123.45.67.89:8000"
read -p "URL: " NEW_URL

# Remove trailing slash if exists
NEW_URL=${NEW_URL%/}

# Update API URL
NEW_API_URL="${NEW_URL}/api"
NEW_WEB_URL="${NEW_URL}"

# Backup original file
cp src/config/api.js src/config/api.js.backup

# Update file
sed -i "s|export const API_BASE_URL = '.*';|export const API_BASE_URL = '${NEW_API_URL}';|" src/config/api.js
sed -i "s|export const WEB_BASE_URL = '.*';|export const WEB_BASE_URL = '${NEW_WEB_URL}';|" src/config/api.js

echo ""
echo -e "${GREEN}✓ URLs updated!${NC}"
echo ""
echo -e "${YELLOW}New URLs:${NC}"
echo "API: $NEW_API_URL"
echo "WEB: $NEW_WEB_URL"
echo ""
echo -e "${BLUE}Backup saved to: src/config/api.js.backup${NC}"
echo ""

# Show updated file
echo -e "${YELLOW}Updated api.js:${NC}"
cat src/config/api.js | grep -E "API_BASE_URL|WEB_BASE_URL"
echo ""

echo -e "${GREEN}Done! You can now build the app.${NC}"
