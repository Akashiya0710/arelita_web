$tmpDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "edge_chk_" + [System.Guid]::NewGuid().ToString());
$targetUrl = "file:///G:/%E6%88%91%E7%9A%84%E9%9B%B2%E7%AB%AF%E7%A1%AC%E7%A2%9F/%E4%BA%9E%E9%9B%B7%E5%88%A9%E5%A1%94%E7%9B%B8%E9%97%9C/summon.html";
$proc = Start-Process -FilePath "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList "--headless=new", "--remote-debugging-port=9239", "--allow-file-access-from-files", "--user-data-dir=`"$tmpDir`"", "--window-size=1280,820", $targetUrl -PassThru;
Start-Sleep -Seconds 3;

try {
    $tabs = Invoke-RestMethod http://127.0.0.1:9239/json;
    $targetTab = $tabs | Where-Object { $_.url -like "*summon.html*" } | Select-Object -First 1;
    $wsUri = [System.Uri]$targetTab.webSocketDebuggerUrl;
    $ws = New-Object System.Net.WebSockets.ClientWebSocket;
    $cts = New-Object System.Threading.CancellationTokenSource(15000);
    $ws.ConnectAsync($wsUri, $cts.Token).Wait();

    function Send-Cdp($method, $params) {
        $id = [System.Threading.Interlocked]::Increment([ref]$script:cmdId);
        $req = @{ id = $id; method = $method; params = $params } | ConvertTo-Json -Compress;
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

    # Test 1: Check getSpecialAnimVariant across all characters
    $eval1 = '(() => {
        const chars = window.ARELITA_DATA ? window.ARELITA_DATA.characters : [];
        const bzMatches = [];
        const asuraChars = [];
        for (const c of chars) {
            const nm = c.name || "";
            const variant = window.__ARELITA_SUMMON_GET_VARIANT ? window.__ARELITA_SUMMON_GET_VARIANT(c) : null;
            if (nm.includes("阿斯拉")) {
                asuraChars.push({ id: c.id, name: nm, power: c.power });
            }
        }
        return { totalChars: chars.length, asuraCount: asuraChars.length, asuraChars };
    })()';
    $r1 = Send-Cdp "Runtime.evaluate" @{ expression = $eval1; returnByValue = $true };
    Write-Output "=== Test 1 Result ===";
    $r1.result.result.value | ConvertTo-Json -Depth 4;

    # Test 1b: Query characters by evaluating with getSpecialAnimVariant directly
    $eval1b = '(() => {
        const btn = document.querySelector(".tgc-preview-btn.is-beelzebub-btn");
        const bzCharId = btn ? btn.getAttribute("data-preview-char-id") : "char-32";
        
        // Find all characters that trigger beelzebub
        // We can inspect the character pool in summon.js
        const results = [];
        // Check window.ARELITA_DATA characters
        for (const c of window.ARELITA_DATA.characters) {
            const nm = c.name || "";
            // Test our condition: c.id === "char-32" || /別西卜/.test(nm)
            const isBz = (c.id === "char-32" || /別西卜/.test(nm));
            if (isBz) {
                results.push({ id: c.id, name: nm, power: c.power });
            }
        }
        return { beelzebubMatches: results };
    })()';
    $r1b = Send-Cdp "Runtime.evaluate" @{ expression = $eval1b; returnByValue = $true };
    Write-Output "=== Test 1b Beelzebub Matches ===";
    $r1b.result.result.value | ConvertTo-Json -Depth 4;

    # Test 2: Trigger Summon, wait 1 second, click Skip, check audio & state
    $eval2 = '(() => {
        // Trigger single summon
        const btnSingle = document.getElementById("btnSummonSingle");
        if (btnSingle) btnSingle.click();
        return { clicked: !!btnSingle };
    })()';
    $r2 = Send-Cdp "Runtime.evaluate" @{ expression = $eval2; returnByValue = $true };
    Write-Output "=== Triggered Summon: $($r2.result.result.value.clicked) ===";

    Start-Sleep -Milliseconds 1200;

    # Check state during animation before skip
    $evalStateBefore = '(() => {
        const skipBtn = document.getElementById("btnSkipSummonAnim");
        const cine = document.getElementById("summonCinematicLayer");
        return {
            isSkipVisible: skipBtn && !skipBtn.classList.contains("hidden"),
            isCineVisible: cine && !cine.classList.contains("hidden")
        };
    })()';
    $rStateBefore = Send-Cdp "Runtime.evaluate" @{ expression = $evalStateBefore; returnByValue = $true };
    Write-Output "=== State Before Skip ===";
    $rStateBefore.result.result.value | ConvertTo-Json;

    # Click SKIP button
    $evalSkip = '(() => {
        const skipBtn = document.getElementById("btnSkipSummonAnim");
        if (skipBtn) {
            skipBtn.click();
            return { clickedSkip: true };
        }
        return { clickedSkip: false };
    })()';
    $rSkip = Send-Cdp "Runtime.evaluate" @{ expression = $evalSkip; returnByValue = $true };
    Write-Output "=== Clicked Skip: $($rSkip.result.result.value.clickedSkip) ===";

    Start-Sleep -Milliseconds 500;

    # Verify state after skip
    $evalStateAfter = '(() => {
        const skipBtn = document.getElementById("btnSkipSummonAnim");
        const cine = document.getElementById("summonCinematicLayer");
        const res = document.getElementById("summonResultContainer");
        const card = document.querySelector(".summon-reveal-card");
        const charName = card ? (card.querySelector(".summon-char-name")?.textContent || "") : "";
        return {
            isSkipHidden: skipBtn && skipBtn.classList.contains("hidden"),
            isCineHidden: cine && cine.classList.contains("hidden"),
            isResVisible: res && !res.classList.contains("hidden"),
            charName: charName.trim()
        };
    })()';
    $rStateAfter = Send-Cdp "Runtime.evaluate" @{ expression = $evalStateAfter; returnByValue = $true };
    Write-Output "=== State After Skip ===";
    $rStateAfter.result.result.value | ConvertTo-Json;

    # Capture screenshot of skipped result
    $ss = Send-Cdp "Page.captureScreenshot" @{ format = "png" };
    $bytes = [System.Convert]::FromBase64String($ss.result.data);
    $outPath = "C:\Users\theaf\.gemini\antigravity\brain\0a4dcf1a-61ab-4e64-bf95-ddeb217bc25c\skip_verified.png";
    [System.IO.File]::WriteAllBytes($outPath, $bytes);
    Write-Output "Screenshot saved to $outPath";

} finally {
    if ($ws -and $ws.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
        $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", [System.Threading.CancellationToken]::None).Wait();
    }
    if ($proc) { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue; }
    if (Test-Path $tmpDir) { Remove-Item -Path $tmpDir -Recurse -Force -ErrorAction SilentlyContinue; }
}
