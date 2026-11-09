$tmpDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "edge_chk_" + [System.Guid]::NewGuid().ToString());
$targetUrl = "file:///G:/%E6%88%91%E7%9A%84%E9%9B%B2%E7%AB%AF%E7%A1%AC%E7%A2%9F/%E4%BA%9E%E9%9B%B7%E5%88%A9%E5%A1%94%E7%9B%B8%E9%97%9C/summon.html";
$proc = Start-Process -FilePath "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList "--headless=new", "--remote-debugging-port=9247", "--allow-file-access-from-files", "--user-data-dir=`"$tmpDir`"", "--window-size=1280,820", $targetUrl -PassThru;
Start-Sleep -Seconds 3;

try {
    $tabs = Invoke-RestMethod http://127.0.0.1:9247/json;
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

    $evalTest = '(() => {
        const c103 = window.ARELITA_DATA.characters.find(c => c.id === "char-103");
        // Test if regex /別西卜/ matches c103
        const bzRegex = new RegExp("\u5225\u897F\u535C");
        const asuraRegex = new RegExp("\u963F\u65AF\u62C9");
        return {
            id: c103.id,
            name: c103.name,
            power: c103.power,
            hasAsura: asuraRegex.test(c103.name),
            hasBeelzebub: bzRegex.test(c103.name),
            isBzMatched: (c103.id === "char-32" || bzRegex.test(c103.name))
        };
    })()';
    $r = Send-Cdp "Runtime.evaluate" @{ expression = $evalTest; returnByValue = $true };
    Write-Output ("Character 103 evaluation: " + ($r.result.result.value | ConvertTo-Json -Compress));

} finally {
    if ($ws -and $ws.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
        $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", [System.Threading.CancellationToken]::None).Wait();
    }
    if ($proc) { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue; }
    if (Test-Path $tmpDir) { Remove-Item -Path $tmpDir -Recurse -Force -ErrorAction SilentlyContinue; }
}
