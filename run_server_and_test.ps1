# Start the server
Write-Host "Starting Node.js server..."
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "server.js"
Start-Sleep -Seconds 2

function Handle-Error($route, $response) {
    Write-Host "❌ Error at route: $route"
    Write-Host "Message: $response"
    Read-Host "Press Enter to exit..."
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    exit 1
}

function Check-Endpoint($route, $expectedMessage) {
    $response = Invoke-WebRequest -Uri "http://localhost:3001$route" -UseBasicParsing -ErrorAction SilentlyContinue
    if ($null -eq $response -or $response.Content -notlike "*$expectedMessage*") {
        Handle-Error $route $response.Content
    } else {
        Write-Host "✅ $route passed"
    }
}

# Check if server is running
$response = Invoke-WebRequest -Uri "http://localhost:3001/" -UseBasicParsing -ErrorAction SilentlyContinue
if ($null -eq $response -or $response.Content -notlike "*API is running*") {
    Write-Host "❌ Server not running or unexpected response"
    Read-Host "Press Enter to exit..."
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    exit 1
} else {
    Write-Host "✅ Server is running"
}

# Run checks
Check-Endpoint "/stock-valuation" "Data extracted and added successfully"
Check-Endpoint "/qty-analysis" "Data extracted and added successfully for qty analysis"
Check-Endpoint "/purchase" "Data extracted and added successfully for purchase"
Check-Endpoint "/inventory-details" "Data extracted and added successfully for inventory details"
Check-Endpoint "/direct-expenses" "Expenses data extracted and added successfully"
Check-Endpoint "/indirect-expenses" "Expenses data extracted and added successfully"

Write-Host "🎉 All API calls succeeded."
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
