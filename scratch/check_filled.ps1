Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [System.IO.Compression.ZipFile]::OpenRead('亞雷利塔全角色關係填寫手冊.docx')
$e = $z.GetEntry('word/document.xml')
$sr = New-Object System.IO.StreamReader($e.Open())
$xml = $sr.ReadToEnd()
$sr.Close()
$z.Dispose()

$charMatches = [System.Text.RegularExpressions.Regex]::Matches($xml, '【(\d+)\.\s*([^】]+)】')
for ($i = 0; $i -lt $charMatches.Count; $i++) {
    $cNum = $charMatches[$i].Groups[1].Value
    $cName = $charMatches[$i].Groups[2].Value
    $startIdx = $charMatches[$i].Index
    $endIdx = if ($i -lt $charMatches.Count - 1) { $charMatches[$i+1].Index } else { $xml.Length }
    
    $chunk = $xml.Substring($startIdx, $endIdx - $startIdx)
    # Check if there is table row content beyond header
    $tblStart = $chunk.IndexOf('<w:tbl>')
    if ($tblStart -ge 0) {
        $tblEnd = $chunk.IndexOf('</w:tbl>', $tblStart)
        $tblXml = $chunk.Substring($tblStart, $tblEnd - $tblStart + 8)
        
        # split by <w:tr>
        $rows = [System.Text.RegularExpressions.Regex]::Split($tblXml, '<w:tr[ >]')
        # row 0 is before first tr, row 1 is header
        $filledRows = @()
        for ($r = 2; $r -lt $rows.Count; $r++) {
            $rowClean = [System.Text.RegularExpressions.Regex]::Replace($rows[$r], '<[^>]+>', ' ') -replace '\s+', ' '
            $rowClean = $rowClean.Trim()
            if (-not [string]::IsNullOrWhiteSpace($rowClean)) {
                $filledRows += $rowClean
            }
        }
        if ($filledRows.Count -gt 0) {
            Write-Output ("Character " + $cNum + " " + $cName + " has " + $filledRows.Count + " filled rows:")
            foreach ($fr in $filledRows) {
                Write-Output ("  - " + $fr)
            }
        }
    }
}
