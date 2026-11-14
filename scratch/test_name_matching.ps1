$lines = Get-Content "G:\我的雲端硬碟\亞雷利塔相關\scratch\all_current_docx_relations.txt" -Encoding UTF8

# First collect all 177 character full names
$charNames = @()
foreach ($l in $lines) {
    if ($l -match "^【(\d+)\.\s*(.+?)】") {
        $charNames += $matches[2].Trim()
    }
}
Write-Output "Total characters in docx: $($charNames.Count)"
