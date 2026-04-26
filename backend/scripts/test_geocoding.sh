#!/bin/bash
#
# Test script for Mapbox Geocoding API using curl
#
# Usage:
#   cd backend
#   ./scripts/test_geocoding.sh
#
# Or make it executable first:
#   chmod +x scripts/test_geocoding.sh
#   ./scripts/test_geocoding.sh

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Mapbox Geocoding API Test"
echo "=========================================="

# Load .env file
ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
    echo -e "${GREEN}✓${NC} Loading .env file"
    # Export variables from .env
    export $(grep -v '^#' "$ENV_FILE" | xargs)
else
    echo -e "${RED}✗${NC} .env file not found"
    echo "  Please create .env from .env.example and add your MAPBOX_API_KEY"
    exit 1
fi

# Check if MAPBOX_API_KEY is set
if [ -z "$MAPBOX_API_KEY" ]; then
    echo -e "${RED}✗${NC} MAPBOX_API_KEY not found in .env"
    echo "  Please add: MAPBOX_API_KEY=sk.your_actual_token_here"
    exit 1
fi

# Show token info (safely)
TOKEN_PREFIX="${MAPBOX_API_KEY:0:10}"
if [[ "$MAPBOX_API_KEY" == sk.* ]]; then
    TOKEN_TYPE="Secret (sk.)"
elif [[ "$MAPBOX_API_KEY" == pk.* ]]; then
    TOKEN_TYPE="Public (pk.)"
else
    TOKEN_TYPE="Unknown"
fi

echo -e "${GREEN}✓${NC} MAPBOX_API_KEY found: ${TOKEN_PREFIX}..."
echo "  Token type: $TOKEN_TYPE"

# Test addresses
declare -a TEST_NAMES=("Golden Gate Bridge" "Times Square")
declare -a TEST_QUERIES=("Golden%20Gate%20Bridge%2C%20San%20Francisco%2C%20CA" "Times%20Square%2C%20New%20York%2C%20NY")

echo ""
echo "=========================================="
echo "Testing Geocoding API"
echo "=========================================="

BASE_URL="https://api.mapbox.com/geocoding/v5/mapbox.places"

for i in "${!TEST_NAMES[@]}"; do
    NAME="${TEST_NAMES[$i]}"
    QUERY="${TEST_QUERIES[$i]}"
    
    echo ""
    echo -e "📍 Testing: ${YELLOW}$NAME${NC}"
    echo "   Query: $QUERY"
    
    # Make API request
    HTTP_CODE=$(curl -s -o /tmp/mapbox_response.json -w "%{http_code}" \
        "${BASE_URL}/${QUERY}.json?access_token=${MAPBOX_API_KEY}&limit=1&types=address,poi,place" \
        --max-time 10)
    
    echo "   Status: $HTTP_CODE"
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        # Parse response - Mapbox returns [longitude, latitude]
        CENTER=$(cat /tmp/mapbox_response.json | grep -o '"center":\[[-0-9.]*,[-0-9.]*\]' | head -1)
        LNG=$(echo "$CENTER" | grep -o '\[[-0-9.]*' | tr -d '[')
        LAT=$(echo "$CENTER" | grep -o ',[-0-9.]*\]' | tr -d ',[]')
        PLACE_NAME=$(cat /tmp/mapbox_response.json | grep -o '"place_name":"[^"]*"' | head -1 | cut -d'"' -f4 | cut -c1-60)
        
        if [ -n "$LAT" ] && [ -n "$LNG" ]; then
            echo -e "   ${GREEN}✓ SUCCESS${NC}"
            echo "     Coordinates: $LAT, $LNG"
            echo "     Address: ${PLACE_NAME}..."
        else
            echo -e "   ${YELLOW}⚠ No results found${NC}"
        fi
    elif [ "$HTTP_CODE" -eq 401 ]; then
        echo -e "   ${RED}✗ AUTHENTICATION FAILED${NC}"
        echo "     Your token is invalid or expired"
        echo "     Create a new token at: https://account.mapbox.com/access-tokens/"
        exit 1
    elif [ "$HTTP_CODE" -eq 403 ]; then
        echo -e "   ${RED}✗ FORBIDDEN${NC}"
        echo "     Token may not have geocoding access or URL restriction mismatch"
        echo "     Check URL restrictions in Mapbox Studio"
        exit 1
    else
        echo -e "   ${RED}✗ ERROR${NC}"
        echo "   Response:"
        cat /tmp/mapbox_response.json | head -5
    fi
done

# Cleanup
rm -f /tmp/mapbox_response.json

echo ""
echo "=========================================="
echo -e "${GREEN}TEST COMPLETE${NC}"
echo "=========================================="
