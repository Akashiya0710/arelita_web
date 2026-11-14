Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [System.IO.Compression.ZipFile]::OpenRead('亞雷利塔全角色關係填寫手冊.docx')
$e = $z.GetEntry('word/document.xml')
$sr = New-Object System.IO.StreamReader($e.Open())
$xml = $sr.ReadToEnd()
$sr.Close()
$z.Dispose()

$idx = $xml.IndexOf('【059. 清野 墨江】')
$sub = $xml.Substring($idx, 4000)
$clean = [System.Text.RegularExpressions.Regex]::Replace($sub, '<[^>]+>', ' ') -replace '\s+', ' '
Write-Output "Clean text of 清野 墨江 block:"
Write-Output $clean
