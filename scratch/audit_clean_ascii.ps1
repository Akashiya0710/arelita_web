$tmpDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "edge_chk_" + [System.Guid]::NewGuid().ToString());
$targetUrl = "file:///G:/%E6%88%91%E7%9A%84%E9%9B%B2%E7%AB%AF%E7%A1%AC%E7%A2%9F/%E4%BA%9E%E9%9B%B7%E5%88%A9%E5%A1%94%E7%9B%B8%E9%97%9C/summon.html";
$proc = Start-Process -FilePath "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList "--headless=new", "--remote-debugging-port=9251", "--allow-file-access-from-files", "--user-data-dir=`"$tmpDir`"", "--window-size=1280,820", $targetUrl -PassThru;
Start-Sleep -Seconds 3;

try {
    $tabs = Invoke-RestMethod http://127.0.0.1:9251/json;
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

    $inspectScript = '(() => {
        const chars = window.ARELITA_DATA.characters;

        // RegExps using unicode escapes
        const rxGjallar = new RegExp("\u52A0\u62C9\u723E"); // 加拉爾
        const rxIgnalion = new RegExp("\u4F0A\u683C\u90A3\u5229\u6602"); // 伊格那利昂
        const rxSeth = new RegExp("\u8CFD\u7279"); // 賽特
        const rxLycia = new RegExp("\u8389\u742A\u96C5|\u5229\u68CB\u96C5|\u795E\u96B1"); // 莉琪雅|利棋雅|神隱
        const rxDragon = new RegExp("\u7D42\u7109\u9F8D"); // 終焉龍
        const rxHecate = new RegExp("\u9ED1\u5361\u8482"); // 黑卡蒂
        const rxSkadi = new RegExp("\u65AF\u5361\u5947"); // 斯卡奇
        const rxWarrior = new RegExp("\u6C83\u5229\u723E"); // 沃利爾
        const rxDema = new RegExp("\u5FB7\u746A"); // 德瑪
        const rxBeelzebub = new RegExp("\u5225\u897F\u535C"); // 別西卜
        const rxNyx = new RegExp("\u502A\u514B\u65AF"); // 倪克斯
        const rxEunora = new RegExp("\u5C24\u8AFE\u62C9"); // 尤諾拉
        const rxHemera = new RegExp("\u8D6B\u58A8\u62C9"); // 赫墨拉
        const rxDiminora = new RegExp("\u8FEA\u7C73\u8AFE\u62C9"); // 迪米諾拉

        // Find all characters matching each keyword
        const matches = {
            gjallarOnly: chars.filter(c => rxGjallar.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            ignalionOnly: chars.filter(c => rxIgnalion.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            demaOnly: chars.filter(c => rxDema.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            warriorOnly: chars.filter(c => rxWarrior.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            skadiOnly: chars.filter(c => rxSkadi.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            nyxOnly: chars.filter(c => rxNyx.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            eunoraOnly: chars.filter(c => rxEunora.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            hemeraOnly: chars.filter(c => rxHemera.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            diminoraOnly: chars.filter(c => rxDiminora.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            hecateOnly: chars.filter(c => rxHecate.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            sethOnly: chars.filter(c => rxSeth.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            lyciaOnly: chars.filter(c => rxLycia.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
            dragonOnly: chars.filter(c => rxDragon.test(c.name || "")).map(c => ({ id: c.id, name: c.name, power: c.power })),
        };

        return matches;
    })()';

    $r = Send-Cdp "Runtime.evaluate" @{ expression = $inspectScript; returnByValue = $true };
    if ($r.result.exceptionDetails) {
        Write-Error ($r.result.exceptionDetails | ConvertTo-Json -Depth 5);
    } else {
        $json = $r.result.result.value | ConvertTo-Json -Depth 5;
        [System.IO.File]::WriteAllText("C:\Users\theaf\.gemini\antigravity\brain\0a4dcf1a-61ab-4e64-bf95-ddeb217bc25c\scratch\clean_matches.json", $json, [System.Text.Encoding]::UTF8);
        Write-Output "Clean matches saved.";
    }

} finally {
    if ($ws -and $ws.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
        $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", [System.Threading.CancellationToken]::None).Wait();
    }
    if ($proc) { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue; }
    if (Test-Path $tmpDir) { Remove-Item -Path $tmpDir -Recurse -Force -ErrorAction SilentlyContinue; }
}
