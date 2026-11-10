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
    
    Send-CDPCommand "Page.navigate" @{ url = $fileUri } | Out-Null
    Start-Sleep -Seconds 3

    # Open Tier Guide Modal, click char-38 preview button
    $triggerPreviewCode = @"
    (() => {
        const btn = document.getElementById('btnOpenTierGuide');
        if (btn) btn.click();
        const accordions = document.querySelectorAll('.tgc-preview-accordion');
        if (accordions.length > 1) accordions[1].open = true;

        const btnRagtis = document.querySelector('button[data-preview-char-id="char-38"]');
        if (btnRagtis) {
            btnRagtis.click();
            return { triggeredBy: 'btnRagtis' };
        }
        return { triggeredBy: 'none' };
    })()
"@
    $trigRes = Send-CDPCommand "Runtime.evaluate" @{
        expression = $triggerPreviewCode
        returnByValue = $true
    }
    Write-Host "Trigger preview: $($trigRes.result.value | ConvertTo-Json)"

    # Capture Beat 1/2 (~2.2s in): Soaring Nano Banana Western Dragons & Greatswords
    Start-Sleep -Milliseconds 2200
    $ssBeat1 = Send-CDPCommand "Page.captureScreenshot" @{ format = "png" }
    if ($ssBeat1.result.data) {
        $bytes = [Convert]::FromBase64String($ssBeat1.result.data)
        [System.IO.File]::WriteAllBytes("C:\Users\theaf\.gemini\antigravity\brain\0a4dcf1a-61ab-4e64-bf95-ddeb217bc25c\ragtis_v2_beat1.png", $bytes)
        Write-Host "Saved ragtis_v2_beat1.png"
    }

    # Wait for Climax Finale (~9.3s total from trigger, so wait ~7.1s more)
    Start-Sleep -Milliseconds 7100
    $ssClimax = Send-CDPCommand "Page.captureScreenshot" @{ format = "png" }
    if ($ssClimax.result.data) {
        $bytes = [Convert]::FromBase64String($ssClimax.result.data)
        [System.IO.File]::WriteAllBytes("C:\Users\theaf\.gemini\antigravity\brain\0a4dcf1a-61ab-4e64-bf95-ddeb217bc25c\ragtis_v2_climax.png", $bytes)
        Write-Host "Saved ragtis_v2_climax.png"
    }

    # Wait for Final Reveal (~11.8s total from start, so wait ~2.5s more)
    Start-Sleep -Milliseconds 2500
    $ssReveal = Send-CDPCommand "Page.captureScreenshot" @{ format = "png" }
    if ($ssReveal.result.data) {
        $bytes = [Convert]::FromBase64String($ssReveal.result.data)
        [System.IO.File]::WriteAllBytes("C:\Users\theaf\.gemini\antigravity\brain\0a4dcf1a-61ab-4e64-bf95-ddeb217bc25c\ragtis_v2_reveal.png", $bytes)
        Write-Host "Saved ragtis_v2_reveal.png"
    }

} finally {
    if ($ws -and $ws.State -eq 'Open') {
        $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", [System.Threading.CancellationToken]::None).Wait()
    }
    if ($edgeProcess -and -not $edgeProcess.HasExited) {
        Stop-Process -Id $edgeProcess.Id -Force
    }
}
