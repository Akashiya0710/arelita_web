$tmpDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "edge_chk_" + [System.Guid]::NewGuid().ToString());
$targetUrl = "file:///G:/%E6%88%91%E7%9A%84%E9%9B%B2%E7%AB%AF%E7%A1%AC%E7%A2%9F/%E4%BA%9E%E9%9B%B7%E5%88%A9%E5%A1%94%E7%9B%B8%E9%97%9C/summon.html";
$proc = Start-Process -FilePath "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList "--headless=new", "--remote-debugging-port=9249", "--allow-file-access-from-files", "--user-data-dir=`"$tmpDir`"", "--window-size=1280,820", $targetUrl -PassThru;
Start-Sleep -Seconds 3;

try {
    $tabs = Invoke-RestMethod http://127.0.0.1:9249/json;
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

    # Run complete inspection of character names and special anim variant triggers
    $inspectScript = '(() => {
        const chars = window.ARELITA_DATA.characters;
        
        // 1. Check all characters with "加拉爾"
        const gjallarChars = chars.filter(c => (c.name || "").includes("加拉爾"));
        
        // 2. Check each variant trigger condition against all characters
        const variantMatches = {
            "phenom-seth-evil": chars.filter(c => c.id === "char-2" || /賽特/.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            "phenom-the-abyss": chars.filter(c => c.id === "char-19" || /Abyss/i.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            "phenom-lycia-void": chars.filter(c => c.id === "char-15" || /莉琪雅|利棋雅|神隱/.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            "apocalypse-dragon": chars.filter(c => c.id === "char-37" || /終焉龍/.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            "hecate-death": chars.filter(c => c.id === "char-106" || /黑卡蒂/.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            "skadi-darkness": chars.filter(c => c.id === "char-10" || /斯卡奇/.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            "ignalion-holyfire": chars.filter(c => c.id === "char-7" || /伊格那利昂|加拉爾/.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            "warrior-arena": chars.filter(c => c.id === "char-25" || /沃利爾|德瑪/.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            "beelzebub-swarm": chars.filter(c => c.id === "char-32" || /別西卜/.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            "nyx-moon-stars": chars.filter(c => c.id === "char-12" || /尤諾拉|倪克斯/.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            "hemera-sun": chars.filter(c => c.id === "char-13" || /迪米諾拉|赫墨拉/.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
        };

        return {
            gjallarCount: gjallarChars.length,
            gjallarChars: gjallarChars.map(c => ({ id: c.id, name: c.name, power: c.power })),
            variantMatches
        };
    })()';

    $r = Send-Cdp "Runtime.evaluate" @{ expression = $inspectScript; returnByValue = $true };
    $val = $r.result.result.value;
    $json = $val | ConvertTo-Json -Depth 5;
    [System.IO.File]::WriteAllText("C:\Users\theaf\.gemini\antigravity\brain\0a4dcf1a-61ab-4e64-bf95-ddeb217bc25c\scratch\variants_audit.json", $json, [System.Text.Encoding]::UTF8);
    Write-Output "Variants audit written to variants_audit.json";

    # Now inspect Probability / Rates
    $rateScript = '(() => {
        // Collect tier rates from DOM and SUMMON_TIERS
        const breakdownEl = document.getElementById("poolTierBreakdown");
        const pills = breakdownEl ? Array.from(breakdownEl.querySelectorAll(".pool-tier-pill")).map(p => ({
            code: p.querySelector("b")?.textContent,
            pct: p.querySelector("em")?.textContent,
            title: p.getAttribute("title")
        })) : [];

        // Check tier counts
        const tierCounts = {};
        for (let i = 1; i <= 8; i++) tierCounts[i] = 0;
        
        // We can check how each character is classified in the pool
        const guideGrid = document.getElementById("tierGuideGrid");
        const guideRows = guideGrid ? Array.from(guideGrid.querySelectorAll(".tier-guide-card")).map(c => ({
            code: c.querySelector(".tgc-tier-code")?.textContent,
            rate: c.querySelector(".tgc-rate-tag")?.textContent,
            stars: c.querySelector(".tgc-stars")?.textContent,
            title: c.querySelector(".tgc-title")?.textContent
        })) : [];

        return {
            pills,
            guideRows
        };
    })()';
    $r2 = Send-Cdp "Runtime.evaluate" @{ expression = $rateScript; returnByValue = $true };
    $val2 = $r2.result.result.value;
    $json2 = $val2 | ConvertTo-Json -Depth 5;
    [System.IO.File]::WriteAllText("C:\Users\theaf\.gemini\antigravity\brain\0a4dcf1a-61ab-4e64-bf95-ddeb217bc25c\scratch\rates_audit.json", $json2, [System.Text.Encoding]::UTF8);
    Write-Output "Rates audit written to rates_audit.json";

} finally {
    if ($ws -and $ws.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
        $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", [System.Threading.CancellationToken]::None).Wait();
    }
    if ($proc) { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue; }
    if (Test-Path $tmpDir) { Remove-Item -Path $tmpDir -Recurse -Force -ErrorAction SilentlyContinue; }
}
