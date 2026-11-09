$tmpDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "edge_chk_" + [System.Guid]::NewGuid().ToString());
$targetUrl = "file:///G:/%E6%88%91%E7%9A%84%E9%9B%B2%E7%AB%AF%E7%A1%AC%E7%A2%9F/%E4%BA%9E%E9%9B%B7%E5%88%A9%E5%A1%94%E7%9B%B8%E9%97%9C/summon.html";
$proc = Start-Process -FilePath "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList "--headless=new", "--remote-debugging-port=9259", "--allow-file-access-from-files", "--user-data-dir=`"$tmpDir`"", "--window-size=1280,820", $targetUrl -PassThru;
Start-Sleep -Seconds 3;

try {
    $tabs = Invoke-RestMethod http://127.0.0.1:9259/json;
    $targetTab = $tabs | Where-Object { $_.url -like "*summon.html*" } | Select-Object -First 1;
    $wsUri = [System.Uri]$targetTab.webSocketDebuggerUrl;
    $ws = New-Object System.Net.WebSockets.ClientWebSocket;
    $cts = New-Object System.Threading.CancellationTokenSource(15000);
    $ws.ConnectAsync($wsUri, $cts.Token).Wait();

    function Send-Cdp($method, $params) {
        $id = [System.Threading.Interlocked]::Increment([ref]$script:cmdId);
        $req = @{ id = $id; method = $method; params = $params } | ConvertTo-Json -Compress -Depth 10;
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($req);
        $segment = New-Object System.ArraySegment[byte] -ArgumentList @(,$bytes);
        $ws.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [System.Threading.CancellationToken]::None).Wait();

        $buffer = New-Object byte[] 65536;
        $ms = New-Object System.IO.MemoryStream;
        do {
            $seg = New-Object System.ArraySegment[byte] -ArgumentList @(,$buffer);
            $res = $ws.ReceiveAsync($seg, [System.Threading.CancellationToken]::None).Result;
            $ms.Write($buffer, 0, $res.Count);
        } while (-not $res.EndOfMessage);

        $jsonStr = [System.Text.Encoding]::UTF8.GetString($ms.ToArray());
        return ($jsonStr | ConvertFrom-Json);
    }
    $script:cmdId = 0;

    # 1. Trigger single summon
    $evalStart = '(() => {
        const btn = document.getElementById("btnSummonSingle");
        if (btn) btn.click();
        return true;
    })()';
    $null = Send-Cdp "Runtime.evaluate" @{ expression = $evalStart; returnByValue = $true };
    Start-Sleep -Milliseconds 1200;

    # Check state while animation is playing
    $evalDuring = '(() => {
        const cine = document.getElementById("summonCinematicLayer");
        const skip = document.getElementById("btnSkipSummonAnim");
        return {
            isCineVisible: cine && !cine.classList.contains("hidden"),
            isSkipVisible: skip && !skip.classList.contains("hidden"),
            skipText: skip ? skip.textContent.trim() : ""
        };
    })()';
    $rDuring = Send-Cdp "Runtime.evaluate" @{ expression = $evalDuring; returnByValue = $true };
    Write-Output ("During Summon Animation: " + ($rDuring.result.result.value | ConvertTo-Json -Compress));

    # 2. Dispatch SPACEBAR key event via CDP
    $null = Send-Cdp "Input.dispatchKeyEvent" @{
        type = "rawKeyDown";
        windowsVirtualKeyCode = 32;
        code = "Space";
        key = " ";
        text = " ";
        unmodifiedText = " "
    };
    $null = Send-Cdp "Input.dispatchKeyEvent" @{
        type = "keyUp";
        windowsVirtualKeyCode = 32;
        code = "Space";
        key = " "
    };

    Start-Sleep -Milliseconds 400;

    # 3. Check state after Spacebar press
    $evalAfter = '(() => {
        const cine = document.getElementById("summonCinematicLayer");
        const res = document.getElementById("summonResultContainer");
        const skip = document.getElementById("btnSkipSummonAnim");
        const card = document.querySelector(".summon-reveal-card");
        const charName = card ? (card.querySelector(".summon-char-name")?.textContent || "") : "";
        return {
            isCineHidden: cine && cine.classList.contains("hidden"),
            isSkipHidden: skip && skip.classList.contains("hidden"),
            isResVisible: res && !res.classList.contains("hidden"),
            charName: charName.trim()
        };
    })()';
    $rAfter = Send-Cdp "Runtime.evaluate" @{ expression = $evalAfter; returnByValue = $true };
    Write-Output ("After Spacebar Press: " + ($rAfter.result.result.value | ConvertTo-Json -Compress));

    # Capture screenshot
    $ss = Send-Cdp "Page.captureScreenshot" @{ format = "png" };
    $bytes = [System.Convert]::FromBase64String($ss.result.data);
    $outPath = "C:\Users\theaf\.gemini\antigravity\brain\0a4dcf1a-61ab-4e64-bf95-ddeb217bc25c\spacebar_skip_verified.png";
    [System.IO.File]::WriteAllBytes($outPath, $bytes);
    Write-Output "Screenshot saved to spacebar_skip_verified.png";

} finally {
    if ($ws -and $ws.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
        $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", [System.Threading.CancellationToken]::None).Wait();
    }
    if ($proc) { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue; }
    if (Test-Path $tmpDir) { Remove-Item -Path $tmpDir -Recurse -Force -ErrorAction SilentlyContinue; }
}
