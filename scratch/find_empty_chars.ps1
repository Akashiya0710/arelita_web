Add-Type -AssemblyName System.IO.Compression.FileSystem

$src = "亞雷利塔全角色關係填寫手冊.docx"
$backup = "亞雷利塔全角色關係填寫手冊_備份_20261115.docx"
Copy-Item $src $backup -Force
Write-Output "Backed up current docx to $backup"

$z = [System.IO.Compression.ZipFile]::OpenRead($src)
$e = $z.GetEntry('word/document.xml')
$sr = New-Object System.IO.StreamReader($e.Open())
$xml = $sr.ReadToEnd()
$sr.Close()
$z.Dispose()

$charMatches = [System.Text.RegularExpressions.Regex]::Matches($xml, '【(\d+)\.\s*([^】]+)】')
$emptyChars = @()
$filledChars = @()

for ($i = 0; $i -lt $charMatches.Count; $i++) {
    $cNum = $charMatches[$i].Groups[1].Value
    $cName = $charMatches[$i].Groups[2].Value
    $startIdx = $charMatches[$i].Index
    $endIdx = if ($i -lt $charMatches.Count - 1) { $charMatches[$i+1].Index } else { $xml.Length }
    
    $chunk = $xml.Substring($startIdx, $endIdx - $startIdx)
    
    # Extract faction from info line
    $pEnd = $chunk.IndexOf('<w:tbl>')
    $infoChunk = if ($pEnd -ge 0) { $chunk.Substring(0, $pEnd) } else { $chunk }
    $infoClean = [System.Text.RegularExpressions.Regex]::Replace($infoChunk, '<[^>]+>', ' ') -replace '\s+', ' '
    $faction = ""
    if ($infoClean -match '陣營：\s*(.+)$') {
        $faction = $matches[1].Trim()
    }

    $tblStart = $chunk.IndexOf('<w:tbl>')
    $filledRows = @()
    if ($tblStart -ge 0) {
        $tblEnd = $chunk.IndexOf('</w:tbl>', $tblStart)
        $tblXml = $chunk.Substring($tblStart, $tblEnd - $tblStart + 8)
        
        $rows = [System.Text.RegularExpressions.Regex]::Split($tblXml, '<w:tr[ >]')
        for ($r = 2; $r -lt $rows.Count; $r++) {
            $rowClean = [System.Text.RegularExpressions.Regex]::Replace($rows[$r], '<[^>]+>', ' ') -replace '\s+', ' '
            $rowClean = $rowClean.Trim()
            if (-not [string]::IsNullOrWhiteSpace($rowClean)) {
                $filledRows += $rowClean
            }
        }
    }
    
    if ($filledRows.Count -eq 0) {
        $emptyChars += [PSCustomObject]@{
            Num = $cNum
            Name = $cName
            Faction = $faction
        }
    } else {
        $filledChars += [PSCustomObject]@{
            Num = $cNum
            Name = $cName
            Faction = $faction
            Rows = $filledRows
        }
    }
}

Write-Output "Total characters: $($charMatches.Count)"
Write-Output "Filled characters: $($filledChars.Count)"
Write-Output "Empty characters: $($emptyChars.Count)"
Write-Output "=== EMPTY CHARACTERS ==="
foreach ($ec in $emptyChars) {
    Write-Output "$($ec.Num). $($ec.Name) [$($ec.Faction)]"
}
