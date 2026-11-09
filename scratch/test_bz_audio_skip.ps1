$tmpDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "edge_chk_" + [System.Guid]::NewGuid().ToString());
$targetUrl = "file:///G:/%E6%88%91%E7%9A%84%E9%9B%B2%E7%AB%AF%E7%A1%AC%E7%A2%9F/%E4%BA%9E%E9%9B%B7%E5%88%A9%E5%A1%94%E7%9B%B8%E9%97%9C/summon.html";
$proc = Start-Process -FilePath "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList "--headless=new", "--remote-debugging-port=9241", "--allow-file-access-from-files", "--user-data-dir=`"$tmpDir`"", "--window-size=1280,820", $targetUrl -PassThru;
Start-Sleep -Seconds 3;

try {
    $tabs = Invoke-RestMethod http://127.0.0.1:9241/json;
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

    # 1. Test Characters with "阿斯拉"
    $evalAsura = '(() => {
        const allChars = window.ARELITA_DATA.characters;
        const asuraList = allChars.filter(c => (c.name || "").includes("阿斯拉"));
        
        // Find Beelzebub
        const bz = allChars.find(c => c.id === "char-32" || (c.name || "").includes("別西卜"));
        
        return {
            beelzebub: bz ? { id: bz.id, name: bz.name, power: bz.power } : null,
            asuraCount: asuraList.length,
            asuraList: asuraList.map(c => ({ id: c.id, name: c.name, power: c.power }))
        };
    })()';
    $rAsura = Send-Cdp "Runtime.evaluate" @{ expression = $evalAsura; returnByValue = $true };
    $asuraInfo = $rAsura.result.result.value;
    Write-Output ("Beelzebub: " + $asuraInfo.beelzebub.id + " | " + $asuraInfo.beelzebub.name);
    Write-Output ("Total Characters with Asura: " + $asuraInfo.asuraCount);
    foreach ($item in $asuraInfo.asuraList) {
        Write-Output (" - " + $item.id + ": " + $item.name + " (" + $item.power + ")");
    }

    # 2. Test Audio Bus before and after Skip
    # Trigger Beelzebub Preview from Tier Guide Modal
    $evalOpenModal = '(() => {
        const btn = document.getElementById("btnOpenTierGuide");
        if (btn) btn.click();
        return true;
    })()';
    $null = Send-Cdp "Runtime.evaluate" @{ expression = $evalOpenModal; returnByValue = $true };
    Start-Sleep -Milliseconds 400;

    # Click Beelzebub preview button
    $evalClickBzPreview = '(() => {
        const btn = document.querySelector(".tgc-preview-btn.is-beelzebub-btn");
        if (btn) {
            btn.click();
            return true;
        }
        return false;
    })()';
    $rClickBz = Send-Cdp "Runtime.evaluate" @{ expression = $evalClickBzPreview; returnByValue = $true };
    Write-Output ("Beelzebub Preview Clicked: " + $rClickBz.result.result.value);

    Start-Sleep -Milliseconds 1000;

    # Inspect Audio Bus while playing
    $evalAudioDuring = '(() => {
        const viewport = document.getElementById("summonStageViewport");
        const isSwarm = viewport ? viewport.classList.contains("is-beelzebub-swarm") : false;
        const skipBtn = document.getElementById("btnSkipSummonAnim");
        return {
            isSwarmViewport: isSwarm,
            isSkipVisible: skipBtn && !skipBtn.classList.contains("hidden")
        };
    })()';
    $rAudioDuring = Send-Cdp "Runtime.evaluate" @{ expression = $evalAudioDuring; returnByValue = $true };
    Write-Output ("During Beelzebub Animation: isSwarm=" + $rAudioDuring.result.result.value.isSwarmViewport + ", isSkipVisible=" + $rAudioDuring.result.result.value.isSkipVisible);

    # Click Skip button
    $evalClickSkip = '(() => {
        const skipBtn = document.getElementById("btnSkipSummonAnim");
        if (skipBtn) {
            skipBtn.click();
            return true;
        }
        return false;
    })()';
    $rClickSkip = Send-Cdp "Runtime.evaluate" @{ expression = $evalClickSkip; returnByValue = $true };
    Write-Output ("Skip Clicked: " + $rClickSkip.result.result.value);

    Start-Sleep -Milliseconds 300;

    # Check state after skip
    $evalAfterSkip = '(() => {
        const skipBtn = document.getElementById("btnSkipSummonAnim");
        const resEl = document.getElementById("summonResultContainer");
        const card = document.querySelector(".summon-reveal-card");
        const charName = card ? (card.querySelector(".summon-char-name")?.textContent || "") : "";
        return {
            isSkipHidden: skipBtn && skipBtn.classList.contains("hidden"),
            isResVisible: resEl && !resEl.classList.contains("hidden"),
            charName: charName.trim()
        };
    })()';
    $rAfterSkip = Send-Cdp "Runtime.evaluate" @{ expression = $evalAfterSkip; returnByValue = $true };
    Write-Output ("After Skip: isSkipHidden=" + $rAfterSkip.result.result.value.isSkipHidden + ", isResVisible=" + $rAfterSkip.result.result.value.isResVisible + ", char=" + $rAfterSkip.result.result.value.charName);

    # Screenshot
    $ss = Send-Cdp "Page.captureScreenshot" @{ format = "png" };
    $bytes = [System.Convert]::FromBase64String($ss.result.data);
    $outPath = "C:\Users\theaf\.gemini\antigravity\brain\0a4dcf1a-61ab-4e64-bf95-ddeb217bc25c\skip_beelzebub_verified.png";
    [System.IO.File]::WriteAllBytes($outPath, $bytes);
    Write-Output "Screenshot saved to $outPath";

} finally {
    if ($ws -and $ws.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
        $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", [System.Threading.CancellationToken]::None).Wait();
    }
    if ($proc) { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue; }
    if (Test-Path $tmpDir) { Remove-Item -Path $tmpDir -Recurse -Force -ErrorAction SilentlyContinue; }
}
