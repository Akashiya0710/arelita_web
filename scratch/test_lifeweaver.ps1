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

    # Check 1: Ensure btnOpenDexFromStats is gone
    $checkBtnCode = @"
    (() => {
        const btn = document.getElementById('btnOpenDexFromStats');
        const headerBtn = document.getElementById('btnOpenDexModal');
        return {
            statsBtnExists: !!btn,
            headerBtnExists: !!headerBtn
        };
    })()
"@
    $btnRes = Send-CDPCommand "Runtime.evaluate" @{
        expression = $checkBtnCode
        returnByValue = $true
    }
    Write-Host "Button Check: $($btnRes.result.value | ConvertTo-Json)"

    # Take screenshot of stats area without the button
    $ssMain = Send-CDPCommand "Page.captureScreenshot" @{ format = "png" }
    if ($ssMain.result.data) {
        $bytes = [Convert]::FromBase64String($ssMain.result.data)
        $outPath = "C:\Users\theaf\.gemini\antigravity\brain\0a4dcf1a-61ab-4e64-bf95-ddeb217bc25c\stats_btn_removed.png"
        [System.IO.File]::WriteAllBytes($outPath, $bytes)
        Write-Host "Screenshot saved: $outPath"
    }

    # Trigger Lifeweaver animation preview
    $playCode = @"
    (() => {
        const c = window.ARELITA_DATA.characters.find(ch => ch.id === 'char-21');
        if (!c) return { error: 'char-21 not found' };
        
        // Find play function
        const btn = document.querySelector('[data-preview-char-id="char-21"]');
        if (btn) {
            btn.click();
            return { triggeredVia: 'tierGuideBtn', name: c.name };
        }
        
        // Or trigger via tier guide modal select
        const sel = document.querySelector('[data-tier-select="6"]');
        if (sel) {
            sel.value = 'char-21';
            const runBtn = document.querySelector('[data-run-tier-select="6"]');
            if (runBtn) {
                runBtn.click();
                return { triggeredVia: 'selectRun', name: c.name };
            }
        }

        return { error: 'could not trigger' };
    })()
"@
    $playRes = Send-CDPCommand "Runtime.evaluate" @{
        expression = $playCode
        returnByValue = $true
    }
    Write-Host "Play Trigger: $($playRes.result.value | ConvertTo-Json)"

    # Capture Beat 1/2: Vines and Spores
    Start-Sleep -Milliseconds 1200
    $ssBeat1 = Send-CDPCommand "Page.captureScreenshot" @{ format = "png" }
    if ($ssBeat1.result.data) {
        $bytes = [Convert]::FromBase64String($ssBeat1.result.data)
        $outPath = "C:\Users\theaf\.gemini\antigravity\brain\0a4dcf1a-61ab-4e64-bf95-ddeb217bc25c\lifeweaver_anim_beat1.png"
        [System.IO.File]::WriteAllBytes($outPath, $bytes)
        Write-Host "Screenshot saved: $outPath"
    }

    # Capture Climax Finale (萬物盛綻・生意盎然)
    Start-Sleep -Milliseconds 6800
    $ssClimax = Send-CDPCommand "Page.captureScreenshot" @{ format = "png" }
    if ($ssClimax.result.data) {
        $bytes = [Convert]::FromBase64String($ssClimax.result.data)
        $outPath = "C:\Users\theaf\.gemini\antigravity\brain\0a4dcf1a-61ab-4e64-bf95-ddeb217bc25c\lifeweaver_anim_climax.png"
        [System.IO.File]::WriteAllBytes($outPath, $bytes)
        Write-Host "Screenshot saved: $outPath"
    }

    # Capture Reveal Card
    Start-Sleep -Milliseconds 2400
    $ssReveal = Send-CDPCommand "Page.captureScreenshot" @{ format = "png" }
    if ($ssReveal.result.data) {
        $bytes = [Convert]::FromBase64String($ssReveal.result.data)
        $outPath = "C:\Users\theaf\.gemini\antigravity\brain\0a4dcf1a-61ab-4e64-bf95-ddeb217bc25c\lifeweaver_anim_reveal.png"
        [System.IO.File]::WriteAllBytes($outPath, $bytes)
        Write-Host "Screenshot saved: $outPath"
    }

    $ws.Dispose()
} finally {
    if ($edgeProcess -and -not $edgeProcess.HasExited) {
        Stop-Process -Id $edgeProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
