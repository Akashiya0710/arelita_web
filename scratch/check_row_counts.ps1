$lines = Get-Content "G:\我的雲端硬碟\亞雷利塔相關\scratch\all_current_docx_relations.txt" -Encoding UTF8
$charCounts = @{}
$cur = ""
foreach ($l in $lines) {
    if ($l -match "^【(\d+)\.\s*(.+?)】") {
        $cur = $matches[2]
        $charCounts[$cur] = 0
    } elseif ($l -match "^\s*\[(.+?)\]\s*=>\s*\[(.+?)\]") {
        $charCounts[$cur]++
    }
}
$charCounts.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 15 | ForEach-Object {
    Write-Output "$($_.Key): $($_.Value) rows"
}
