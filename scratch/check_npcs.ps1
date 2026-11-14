$jsPath = "G:\我的雲端硬碟\亞雷利塔相關\assets\relations_data.js"
$jsText = Get-Content $jsPath -Raw -Encoding UTF8
$jsonStart = $jsText.IndexOf("{")
$jsonStr = $jsText.Substring($jsonStart).TrimEnd()
if ($jsonStr.EndsWith(";")) { $jsonStr = $jsonStr.Substring(0, $jsonStr.Length - 1) }
$data = $jsonStr | ConvertFrom-Json

foreach ($n in $data.nodes) {
    foreach ($r in $n.relations) {
        if (-not $r.targetId) {
            Write-Output "$($n.num) $($n.name) -> NPC: [$($r.targetName)] | $($r.desc)"
        }
    }
}
