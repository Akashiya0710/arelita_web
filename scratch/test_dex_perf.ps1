$ErrorActionPreference = 'Stop'

Write-Host "Launching Edge headless on about:blank..."
$edgeProcess = Start-Process "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList @(
    "--remote-debugging-port=9222",
    "--headless=new",
    "--disable-gpu",
    "--allow-file-access-from-files",
    "--hide-scrollbars",
    "--window-size=1600,1000",
    "about:blank"
) -PassThru

Start-Sleep -Seconds 2

try {
    $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:9222/json"
    $pageTab = $tabs | Where-Object { $_.type -eq "page" } | Select-Object -First 1
    $wsUrl = $pageTab.webSocketDebuggerUrl
    Write-Host "Connected to Edge WS: $wsUrl"

    $ws = [System.Net.WebSockets.ClientWebSocket]::new()
    $cts = [System.Threading.CancellationTokenSource]::new()
    $ws.ConnectAsync([Uri]$wsUrl, $cts.Token).Wait()

    function Send-CDPCommand($method, $params = @{}) {
        $id = [System.Threading.Interlocked]::Increment([ref]$script:cmdId)
        $msg = @{
            id = $id
            method = $method
            params = $params
        } | ConvertTo-Json -Compress -Depth 10
        
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
        $segment = [ArraySegment[byte]]::new($bytes)
        $ws.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).Wait()
        
        $buffer = [byte[]]::new(65536 * 16)
        $ms = [System.IO.MemoryStream]::new()
        do {
            $seg = [ArraySegment[byte]]::new($buffer)
            $res = $ws.ReceiveAsync($seg, $cts.Token).Result
            $ms.Write($buffer, 0, $res.Count)
        } while (-not $res.EndOfMessage)
        
        $respStr = [System.Text.Encoding]::UTF8.GetString($ms.ToArray())
        return $respStr | ConvertFrom-Json
    }

    $script:cmdId = 0

    $currDir = (Get-Location).Path
    $filePath = [System.IO.Path]::Combine($currDir, "summon.html")
    $fileUri = [System.Uri]::new($filePath).AbsoluteUri
    Write-Host "Navigating to: $fileUri"
    
    $navRes = Send-CDPCommand "Page.navigate" @{ url = $fileUri }
    Start-Sleep -Seconds 3

    # Open modal
    $evalCode = @"
    (() => {
        const btn = document.getElementById('btnOpenDexModal');
        if (btn) btn.click();
        
        const modal = document.getElementById('summonDexModal');
        const cards = document.querySelectorAll('.dex-card');
        const container = document.querySelector('.dex-grid-container');

        return {
            cardCount: cards.length,
            modalOpen: modal && !modal.classList.contains('hidden'),
            containerHeight: container ? container.clientHeight : 0,
            scrollHeight: container ? container.scrollHeight : 0
        };
    })()
"@

    $result = Send-CDPCommand "Runtime.evaluate" @{
        expression = $evalCode
        returnByValue = $true
    }

    Write-Host "Eval Result: $($result.result.value.value | ConvertTo-Json)"

    # Screenshot
    Start-Sleep -Milliseconds 1000
    $ssResult = Send-CDPCommand "Page.captureScreenshot" @{
        format = "png"
    }

    if ($ssResult.result.data) {
        $bytes = [Convert]::FromBase64String($ssResult.result.data)
        $outPath = "C:\Users\theaf\.gemini\antigravity\brain\0a4dcf1a-61ab-4e64-bf95-ddeb217bc25c\dex_modal_optimized_smooth.png"
        [System.IO.File]::WriteAllBytes($outPath, $bytes)
        Write-Host "Screenshot saved: $outPath ($($bytes.Length) bytes)"
    }

    $ws.Dispose()
} finally {
    if ($edgeProcess -and -not $edgeProcess.HasExited) {
        Stop-Process -Id $edgeProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
