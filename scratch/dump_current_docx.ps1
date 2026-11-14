Add-Type -AssemblyName System.IO.Compression.FileSystem

$src = "亞雷利塔全角色關係填寫手冊.docx"
$z = [System.IO.Compression.ZipFile]::OpenRead($src)
$e = $z.GetEntry('word/document.xml')
$sr = New-Object System.IO.StreamReader($e.Open())
$xml = $sr.ReadToEnd()
$sr.Close()
$z.Dispose()

$charMatches = [System.Text.RegularExpressions.Regex]::Matches($xml, '【(\d+)\.\s*([^】]+)】')
$outLines = @()

for ($i = 0; $i -lt $charMatches.Count; $i++) {
    $cNum = $charMatches[$i].Groups[1].Value
    $cName = $charMatches[$i].Groups[2].Value
    $startIdx = $charMatches[$i].Index
    $endIdx = if ($i -lt $charMatches.Count - 1) { $charMatches[$i+1].Index } else { $xml.Length }
    $chunk = $xml.Substring($startIdx, $endIdx - $startIdx)

    $tblStart = $chunk.IndexOf('<w:tbl>')
    $filledRows = @()
    if ($tblStart -ge 0) {
        $tblEnd = $chunk.IndexOf('</w:tbl>', $tblStart)
        $tblXml = $chunk.Substring($tblStart, $tblEnd - $tblStart + 8)
        
        $rows = [System.Text.RegularExpressions.Regex]::Split($tblXml, '<w:tr[ >]')
        for ($r = 2; $r -lt $rows.Count; $r++) {
            # Extract cells
            $cells = [System.Text.RegularExpressions.Regex]::Matches($rows[$r], '<w:tc[ >][\s\S]*?</w:tc>')
            if ($cells.Count -ge 2) {
                $c1 = ([System.Text.RegularExpressions.Regex]::Replace($cells[0].Value, '<[^>]+>', '') -replace '\s+', ' ').Trim()
                $c2 = ([System.Text.RegularExpressions.Regex]::Replace($cells[1].Value, '<[^>]+>', '') -replace '\s+', ' ').Trim()
                if (-not [string]::IsNullOrWhiteSpace($c1) -or -not [string]::IsNullOrWhiteSpace($c2)) {
                    $filledRows += "    [$c1] => [$c2]"
                }
            }
        }
    }
    if ($filledRows.Count -gt 0) {
        $outLines += "【$cNum. $cName】"
        $outLines += $filledRows
    } else {
        $outLines += "【$cNum. $cName】 (EMPTY)"
    }
}

$outLines -join "`r`n" | Out-File "scratch/all_current_docx_relations.txt" -Encoding UTF8
Write-Output "Saved to scratch/all_current_docx_relations.txt ($($outLines.Count) lines)"
