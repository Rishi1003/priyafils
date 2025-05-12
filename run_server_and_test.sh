#!/bin/bash

# Start the server in the background
echo "Starting server..."
node server.js &
SERVER_PID=$!
sleep 2  # Wait for server to start

# Function to handle errors
handle_error() {
    echo "❌ Error at route: $1"
    echo "Message: $2"
    echo "Press Enter to exit..."
    read
    kill $SERVER_PID 2>/dev/null
    exit 1
}

# Function to make a GET request and check for expected message
check_endpoint() {
    ROUTE=$1
    EXPECTED_MESSAGE=$2
    RESPONSE=$(curl -s http://localhost:3001$ROUTE)
    if [[ "$RESPONSE" != *"$EXPECTED_MESSAGE"* ]]; then
        handle_error "$ROUTE" "$RESPONSE"
    else
        echo "✅ $ROUTE passed"
    fi
}

# Check if server is running
HOME_RESPONSE=$(curl -s http://localhost:3001/)
if [[ "$HOME_RESPONSE" != *"API is running"* ]]; then
    echo "❌ Server not running or unexpected response"
    echo "Press Enter to exit..."
    read
    kill $SERVER_PID 2>/dev/null
    exit 1
else
    echo "✅ Server is running"
fi

# Now run through the API checks
check_endpoint "/stock-valuation" "Data extracted and added successfully"
check_endpoint "/qty-analysis" "Data extracted and added successfully for qty analysis"
check_endpoint "/purchase" "Data extracted and added successfully for purchase"
check_endpoint "/inventory-details" "Data extracted and added successfully for inventory details"
check_endpoint "/direct-expenses" "Expenses data extracted and added successfully"
check_endpoint "/indirect-expenses" "Expenses data extracted and added successfully"

echo "🎉 All API calls succeeded."
kill $SERVER_PID 2>/dev/null
