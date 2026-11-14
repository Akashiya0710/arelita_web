Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [System.IO.Compression.ZipFile]::OpenRead('亞雷利塔全角色關係填寫手冊.docx')
$e = $z.GetEntry('word/document.xml')
$sr = New-Object System.IO.StreamReader($e.Open())
$xml = $sr.ReadToEnd()
$sr.Close()
$z.Dispose()

$matches = [System.Text.RegularExpressions.Regex]::Matches($xml, '【(\d+)\.\s*([^】]+)】')
Write-Output "Total character titles found: $($matches.Count)"
foreach ($m in $matches) {
    Write-Output ($m.Groups[1].Value + ": " + $m.Groups[2].Value)
}
