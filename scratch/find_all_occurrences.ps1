Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [System.IO.Compression.ZipFile]::OpenRead('亞雷利塔全角色關係填寫手冊.docx')
$e = $z.GetEntry('word/document.xml')
$sr = New-Object System.IO.StreamReader($e.Open())
$xml = $sr.ReadToEnd()
$sr.Close()
$z.Dispose()

# Find all occurrences of "清野 墨江"
$matches = [System.Text.RegularExpressions.Regex]::Matches($xml, "清野 墨江")
Write-Output "Occurrences of '清野 墨江': $($matches.Count)"
foreach ($m in $matches) {
    $idx = $m.Index
    $start = [Math]::Max(0, $idx - 150)
    $len = [Math]::Min(300, $xml.Length - $start)
    $sub = $xml.Substring($start, $len)
    $clean = [System.Text.RegularExpressions.Regex]::Replace($sub, '<[^>]+>', ' ') -replace '\s+', ' '
    Write-Output "At $idx : $clean"
}
