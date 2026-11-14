Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [System.IO.Compression.ZipFile]::OpenRead('亞雷利塔全角色關係填寫手冊.docx')
$e = $z.GetEntry('word/document.xml')
$sr = New-Object System.IO.StreamReader($e.Open())
$xml = $sr.ReadToEnd()
$sr.Close()
$z.Dispose()

foreach ($idx in @(711346, 723642)) {
    $start = [Math]::Max(0, $idx - 500)
    $len = [Math]::Min(1200, $xml.Length - $start)
    $sub = $xml.Substring($start, $len)
    $clean = [System.Text.RegularExpressions.Regex]::Replace($sub, '<[^>]+>', ' ') -replace '\s+', ' '
    Write-Output "=== Context around $idx ==="
    Write-Output $clean
}
