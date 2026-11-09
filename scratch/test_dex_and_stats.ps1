$tmpDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "edge_chk_" + [System.Guid]::NewGuid().ToString());
$targetUrl = "file:///G:/%E6%88%91%E7%9A%84%E9%9B%B2%E7%AB%AF%E7%A1%AC%E7%A2%9F/%E4%BA%9E%E9%9B%B7%E5%88%A9%E5%A1%94%E7%9B%B8%E9%97%9C/summon.html";
$proc = Start-Process -FilePath "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList "--headless=new", "--remote-debugging-port=9257", "--allow-file-access-from-files", "--user-data-dir=`"$tmpDir`"", "--window-size=1280,820", $targetUrl -PassThru;
Start-Sleep -Seconds 3;

try {
    $tabs = Invoke-RestMethod http://127.0.0.1:9257/json;
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

    # 1. Verify stats card label & initial values
    $evalStats = '(() => {
        const statsCard = document.querySelector(".summon-stats-card");
        const labels = Array.from(statsCard.querySelectorAll(".s-stat-label")).map(el => el.textContent.trim());
        const vals = Array.from(statsCard.querySelectorAll(".s-stat-val")).map(el => el.textContent.trim());
        const btnDex = document.getElementById("btnOpenDexFromStats");
        const btnNavDex = document.getElementById("btnOpenDexModal");
        return {
            labels,
            vals,
            hasBtnDex: !!btnDex,
            hasBtnNavDex: !!btnNavDex
        };
    })()';
    $rStats = Send-Cdp "Runtime.evaluate" @{ expression = $evalStats; returnByValue = $true };
    Write-Output ("Stats Card Inspection: " + ($rStats.result.result.value | ConvertTo-Json -Compress));

    # 2. Click button to open Dex Modal
    $evalOpen = '(() => {
        const btn = document.getElementById("btnOpenDexFromStats");
        if (btn) btn.click();
        const modal = document.getElementById("summonDexModal");
        return { modalOpened: modal && !modal.classList.contains("hidden") };
    })()';
    $rOpen = Send-Cdp "Runtime.evaluate" @{ expression = $evalOpen; returnByValue = $true };
    Write-Output ("Open Dex Modal: " + ($rOpen.result.result.value | ConvertTo-Json -Compress));

    Start-Sleep -Milliseconds 400;

    # Inspect Dex Modal state
    $evalDexState = '(() => {
        const title = document.getElementById("dexModalTitle")?.textContent;
        const unl = document.getElementById("dexSummaryUnlocked")?.textContent;
        const mis = document.getElementById("dexSummaryMissing")?.textContent;
        const pct = document.getElementById("dexSummaryPct")?.textContent;
        const cardsCount = document.querySelectorAll("#dexCardsGrid .dex-card").length;
        const lockedCount = document.querySelectorAll("#dexCardsGrid .dex-card.is-locked").length;
        return { title, unl, mis, pct, cardsCount, lockedCount };
    })()';
    $rDex = Send-Cdp "Runtime.evaluate" @{ expression = $evalDexState; returnByValue = $true };
    Write-Output ("Dex Modal State: " + ($rDex.result.result.value | ConvertTo-Json -Compress));

    # Capture Screenshot 1: Dex Modal with Missing Characters
    $ss = Send-Cdp "Page.captureScreenshot" @{ format = "png" };
    $bytes = [System.Convert]::FromBase64String($ss.result.data);
    $outPath = "C:\Users\theaf\.gemini\antigravity\brain\0a4dcf1a-61ab-4e64-bf95-ddeb217bc25c\dex_modal_missing.png";
    [System.IO.File]::WriteAllBytes($outPath, $bytes);
    Write-Output "Screenshot saved to dex_modal_missing.png";

    # Close modal
    $evalClose = '(() => {
        const btn = document.getElementById("btnCloseDexModal");
        if (btn) btn.click();
        return true;
    })()';
    $null = Send-Cdp "Runtime.evaluate" @{ expression = $evalClose; returnByValue = $true };
    Start-Sleep -Milliseconds 300;

    # 3. Perform 10-pull and skip animation to unlock characters
    $evalPull = '(() => {
        const btnMulti = document.getElementById("btnSummonMulti");
        if (btnMulti) btnMulti.click();
        return true;
    })()';
    $null = Send-Cdp "Runtime.evaluate" @{ expression = $evalPull; returnByValue = $true };
    Start-Sleep -Milliseconds 800;

    # Skip animation
    $evalSkip = '(() => {
        const skip = document.getElementById("btnSkipSummonAnim");
        if (skip) skip.click();
        return true;
    })()';
    $null = Send-Cdp "Runtime.evaluate" @{ expression = $evalSkip; returnByValue = $true };
    Start-Sleep -Milliseconds 500;

    # Re-open Dex modal to inspect updated collection state
    $evalOpenAgain = '(() => {
        const btn = document.getElementById("btnOpenDexModal");
        if (btn) btn.click();
        // Switch to "all" tab
        const tabAll = document.querySelector(".dex-status-tab[data-dex-status=\"all\"]");
        if (tabAll) tabAll.click();
        return true;
    })()';
    $null = Send-Cdp "Runtime.evaluate" @{ expression = $evalOpenAgain; returnByValue = $true };
    Start-Sleep -Milliseconds 400;

    $evalDexAfter = '(() => {
        const unl = document.getElementById("dexSummaryUnlocked")?.textContent;
        const mis = document.getElementById("dexSummaryMissing")?.textContent;
        const pct = document.getElementById("dexSummaryPct")?.textContent;
        const unlockedCards = document.querySelectorAll("#dexCardsGrid .dex-card.is-unlocked").length;
        const lockedCards = document.querySelectorAll("#dexCardsGrid .dex-card.is-locked").length;
        return { unl, mis, pct, unlockedCards, lockedCards };
    })()';
    $rDexAfter = Send-Cdp "Runtime.evaluate" @{ expression = $evalDexAfter; returnByValue = $true };
    Write-Output ("Dex Modal After 10-Pull: " + ($rDexAfter.result.result.value | ConvertTo-Json -Compress));

    # Capture Screenshot 2: Dex Modal after pull showing both unlocked and locked cards
    $ss2 = Send-Cdp "Page.captureScreenshot" @{ format = "png" };
    $bytes2 = [System.Convert]::FromBase64String($ss2.result.data);
    $outPath2 = "C:\Users\theaf\.gemini\antigravity\brain\0a4dcf1a-61ab-4e64-bf95-ddeb217bc25c\dex_modal_unlocked_and_locked.png";
    [System.IO.File]::WriteAllBytes($outPath2, $bytes2);
    Write-Output "Screenshot saved to dex_modal_unlocked_and_locked.png";

} finally {
    if ($ws -and $ws.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
        $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", [System.Threading.CancellationToken]::None).Wait();
    }
    if ($proc) { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue; }
    if (Test-Path $tmpDir) { Remove-Item -Path $tmpDir -Recurse -Force -ErrorAction SilentlyContinue; }
}
