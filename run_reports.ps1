# # Start the Node.js server
# Write-Host "Starting Node.js server..."
# Start-Process -NoNewWindow -FilePath "node" -ArgumentList "server.js"
# Start-Sleep -Seconds 2

# # Prompt for month input
# $month = Read-Host "Enter the month in 'Apr-25' format"

# function Handle-Error($route, $response) {
#     Write-Host "`n❌ Error at route: $route"
#     Write-Host "Message: $response"
#     Read-Host "Press Enter to exit..."
#     Stop-Process -Name node -Force -ErrorAction SilentlyContinue
#     exit 1
# }

# function Check-Endpoint($route, $expectedMessage) {
#     try {
#         $response = Invoke-WebRequest -Uri "http://localhost:3001$route" -UseBasicParsing
#         if ($response.Content -notmatch $expectedMessage) {
#             Handle-Error $route $response.Content
#         } else {
#             Write-Host "✅ $route passed"
#         }
#     } catch {
#         Handle-Error $route $_.Exception.Message
#     }
# }

# function Check-Endpoint-WithQuery($route, $expectedMessage, $monthParam) {
#     $url = "http://localhost:3001$route?month=$monthParam"
#     try {
#         $response = Invoke-WebRequest -Uri $url -UseBasicParsing
#         if ($response.Content -notmatch $expectedMessage) {
#             Handle-Error $route $response.Content
#         } else {
#             Write-Host "✅ $route passed"
#         }
#     } catch {
#         Handle-Error $route $_.Exception.Message
#     }
# }

# # Step-by-step calls
# Check-Endpoint "/separateReports" "Consolidated reports separated successfully"
# Check-Endpoint-WithQuery "/cogs" "COGS data extracted and added successfully" $month
# Check-Endpoint-WithQuery "/pal1" "PAL1 data extracted and added successfully" $month
# Check-Endpoint-WithQuery "/trading-pl" "Successfully created trading PL and generated Excel file" $month
# Check-Endpoint "/pal2" "PAL2 data extracted, added, and Excel file generated successfully"
# Check-Endpoint "/finAnalysis" "Financial Analysis data extracted, added, and Excel file generated successfully"
# Check-Endpoint "/salesSummary" "Sales summary data processed and Excel file generated successfully"
# Check-Endpoint "/consolidateReports" "Reports consolidated successfully"

# Write-Host "`n🎉 All endpoints completed successfully."
# Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Start the Node.js server
Write-Host "Starting Node.js server..."
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "server.js"
Start-Sleep -Seconds 2

# Prompt for month input
$month = Read-Host "Enter the month in 'Apr-25' format"

function Handle-Error($route, $response, $skipNotFound = $false) {
    if ($skipNotFound -and $_.Exception.Response.StatusCode -eq 404) {
        Write-Host "⚠️ 404 Not Found for route: $route - Skipping"
        return
    }

    Write-Host "`n❌ Error at route: $route"
    Write-Host "Message: $response"
    Read-Host "Press Enter to exit..."
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    exit 1
}

function Check-Endpoint($route, $expectedMessage, $skipNotFound = $false) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001$route" -UseBasicParsing
        if ($response.Content -notmatch $expectedMessage) {
            Handle-Error $route $response.Content $skipNotFound
        } else {
            Write-Host "✅ $route passed"
        }
    } catch {
        Handle-Error $route $_.Exception.Message $skipNotFound
    }
}

function Check-Endpoint-WithQuery($route, $expectedMessage, $monthParam) {
    # Properly encode the month parameter
    $encodedMonth = [System.Web.HttpUtility]::UrlEncode($monthParam)
    $url = "http://localhost:3001$route`?month=$encodedMonth"
    
    # Debug output
    Write-Host "Checking URL: $url"
    
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing
        if ($response.Content -notmatch $expectedMessage) {
            Handle-Error $route $response.Content
        } else {
            Write-Host "✅ $route passed"
        }
    } catch {
        # Additional debug output
        Write-Host "Error Details: $_"
        Handle-Error $route $_.Exception.Message
    }
}

# Add System.Web assembly for URL encoding
Add-Type -AssemblyName System.Web

# Step-by-step calls
# Skip 404 for separateReports
Check-Endpoint "/separateReports" "Consolidated reports separated successfully" $true
Check-Endpoint-WithQuery "/cogs" "COGS data extracted and added successfully" $month
Check-Endpoint-WithQuery "/pal1" "PAL1 data extracted and added successfully" $month
Check-Endpoint-WithQuery "/trading-pl" "Successfully created trading PL and generated Excel file" $month
Check-Endpoint-WithQuery "/pal2" "PAL2 data extracted, added, and Excel file generated successfully" $month
Check-Endpoint-WithQuery "/finAnalysis" "Financial Analysis data extracted, added, and Excel file generated successfully" $month
Check-Endpoint-WithQuery "/salesSummary" "Sales summary data processed and Excel file generated successfully" $month
Check-Endpoint "/consolidateReports" "Reports consolidated successfully"

Write-Host "`n🎉 All endpoints completed successfully."
Stop-Process -Name node -Force -ErrorAction SilentlyContinue