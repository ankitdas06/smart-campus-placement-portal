param(
    [int]$Port = 8000,
    [switch]$NoBrowser
)

$ErrorActionPreference = 'SilentlyContinue'

$RootDir = $PSScriptRoot
if (-not $RootDir) {
    $RootDir = (Get-Location).Path
}

# Determine IP binding with DualMode (IPv6 + IPv4 fallback)
$listener = $null
for ($attempt = 0; $attempt -lt 20; $attempt++) {
    try {
        $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::IPv6Any, $Port)
        $listener.Server.DualMode = $true
        $listener.Start()
        break
    } catch {
        try {
            $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $Port)
            $listener.Start()
            break
        } catch {
            Write-Host "Port $Port is in use. Trying port $( $Port + 1 )..." -ForegroundColor Yellow
            $Port++
        }
    }
}

if (-not $listener -or -not $listener.Server.IsBound) {
    Write-Host "Error: Could not bind to an open port." -ForegroundColor Red
    exit 1
}

$url = "http://localhost:$Port/index.html"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   SMART CAMPUS PLACEMENT PREPARATION PORTAL - LOCALHOST SERVER       " -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " Server Status : ONLINE & LISTENING" -ForegroundColor Green
Write-Host " Localhost URL : http://localhost:$Port/" -ForegroundColor Green
Write-Host " Alternative   : http://127.0.0.1:$Port/" -ForegroundColor Green
Write-Host " Root Folder   : $RootDir" -ForegroundColor Gray
Write-Host " Press Ctrl+C in this window at any time to stop the server." -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Automatically launch the web page in default browser
if (-not $NoBrowser) {
    try {
        Start-Process $url -ErrorAction SilentlyContinue
    } catch {}
}

try {
    while ($true) {
        $client = $null
        try {
            $client = $listener.AcceptTcpClient()
            $client.ReceiveTimeout = 2500
            $client.SendTimeout = 4000
            $client.NoDelay = $true

            $stream = $client.GetStream()
            $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)

            $requestLine = $reader.ReadLine()
            if ($requestLine) {
                $tokens = $requestLine -split ' '
                if ($tokens.Count -ge 2) {
                    $method = $tokens[0].ToUpper()
                    $rawUrl = $tokens[1]

                    # Consume remaining HTTP request headers
                    while (($line = $reader.ReadLine()) -and $line.Trim().Length -gt 0) {}

                    # Strip proxy host if absolute URL was provided
                    if ($rawUrl -match '^[a-zA-Z]+://[^/]+(/.*)?$') {
                        $rawUrl = $matches[1]
                        if (-not $rawUrl) { $rawUrl = "/" }
                    }

                    # Extract clean path without query params or hash fragments
                    $cleanPath = $rawUrl.Split('?')[0].Split('#')[0].TrimStart('/')
                    if ($cleanPath -eq "" -or $cleanPath -eq "/") {
                        $cleanPath = "index.html"
                    }

                    # URL decode path
                    $cleanPath = [System.Uri]::UnescapeDataString($cleanPath)

                    # Normalize path separators for Windows
                    $cleanPath = $cleanPath -replace '[/\\]+', [System.IO.Path]::DirectorySeparatorChar

                    # Resolve safe full path preventing directory traversal
                    $filePath = [System.IO.Path]::GetFullPath((Join-Path $RootDir $cleanPath))

                    if ($filePath.StartsWith($RootDir, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path $filePath -PathType Leaf)) {
                        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                        $mime = switch ($ext) {
                            ".html" { "text/html; charset=utf-8" }
                            ".htm"  { "text/html; charset=utf-8" }
                            ".css"  { "text/css; charset=utf-8" }
                            ".js"   { "application/javascript; charset=utf-8" }
                            ".mjs"  { "application/javascript; charset=utf-8" }
                            ".json" { "application/json; charset=utf-8" }
                            ".png"  { "image/png" }
                            ".jpg"  { "image/jpeg" }
                            ".jpeg" { "image/jpeg" }
                            ".gif"  { "image/gif" }
                            ".svg"  { "image/svg+xml" }
                            ".ico"  { "image/x-icon" }
                            ".woff" { "font/woff" }
                            ".woff2"{ "font/woff2" }
                            ".ttf"  { "font/ttf" }
                            ".otf"  { "font/otf" }
                            ".txt"  { "text/plain; charset=utf-8" }
                            Default { "application/octet-stream" }
                        }

                        $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
                        $header = "HTTP/1.1 200 OK`r`n" +
                                  "Content-Type: $mime`r`n" +
                                  "Content-Length: $($fileBytes.Length)`r`n" +
                                  "Access-Control-Allow-Origin: *`r`n" +
                                  "Cache-Control: no-cache, no-store, must-revalidate`r`n" +
                                  "Connection: close`r`n`r`n"
                        $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)

                        $stream.Write($headerBytes, 0, $headerBytes.Length)
                        if ($method -ne "HEAD") {
                            $stream.Write($fileBytes, 0, $fileBytes.Length)
                        }
                        $stream.Flush()
                        Write-Host "[200 OK] $method $cleanPath" -ForegroundColor Green
                    } else {
                        $notHtml = "<!DOCTYPE html><html><head><title>404 Not Found</title></head><body style='font-family:sans-serif;padding:2rem;'><h1>404 Not Found</h1><p>The requested file '$cleanPath' was not found.</p><p><a href='/index.html'>&larr; Return to Smart Campus Portal Home</a></p></body></html>"
                        $notBytes = [System.Text.Encoding]::UTF8.GetBytes($notHtml)
                        $header = "HTTP/1.1 404 Not Found`r`n" +
                                  "Content-Type: text/html; charset=utf-8`r`n" +
                                  "Content-Length: $($notBytes.Length)`r`n" +
                                  "Connection: close`r`n`r`n"
                        $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)

                        $stream.Write($headerBytes, 0, $headerBytes.Length)
                        if ($method -ne "HEAD") {
                            $stream.Write($notBytes, 0, $notBytes.Length)
                        }
                        $stream.Flush()
                        Write-Host "[404 Not Found] $method $cleanPath" -ForegroundColor Red
                    }
                }
            }
        } catch {
            # Catch timeouts or aborted client requests safely
        } finally {
            if ($client) {
                try {
                    $client.Client.Shutdown([System.Net.Sockets.SocketShutdown]::Both)
                } catch {}
                $client.Close()
            }
        }
    }
} finally {
    if ($listener) {
        $listener.Stop()
    }
}
