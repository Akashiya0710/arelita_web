$lines = Get-Content "G:\我的雲端硬碟\亞雷利塔相關\scratch\all_current_docx_relations.txt" -Encoding UTF8
$docxNames = @()
foreach ($l in $lines) {
    if ($l -match "^【(\d+)\.\s*(.+?)】") {
        $docxNames += $matches[2].Trim()
    }
}

$jsText = Get-Content "G:\我的雲端硬碟\亞雷利塔相關\assets\relations_data.js" -Raw -Encoding UTF8
$jsonPart = $jsText.Substring($jsText.IndexOf("{"))
if ($jsonPart.EndsWith(";")) { $jsonPart = $jsonPart.Substring(0, $jsonPart.Length - 1) }
$data = $jsonPart | ConvertFrom-Json
$jsNames = $data.nodes | ForEach-Object { $_.name }

Write-Output "Docx count: $($docxNames.Count), JS count: $($jsNames.Count)"
foreach ($dn in $docxNames) {
    if ($jsNames -notcontains $dn) {
        Write-Output "In DOCX but not JS: $dn"
    }
}
foreach ($jn in $jsNames) {
    if ($docxNames -notcontains $jn) {
        Write-Output "In JS but not DOCX: $jn"
    }
}
