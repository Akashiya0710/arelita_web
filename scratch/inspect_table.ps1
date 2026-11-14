Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [System.IO.Compression.ZipFile]::OpenRead('亞雷利塔全角色關係填寫手冊.docx')
$e = $z.GetEntry('word/document.xml')
$sr = New-Object System.IO.StreamReader($e.Open())
$xml = $sr.ReadToEnd()
$sr.Close()
$z.Dispose()

$idx = $xml.IndexOf('【058. 忠情】')
if ($idx -ge 0) {
    $tableStart = $xml.IndexOf('<w:tbl>', $idx)
    $tableEnd = $xml.IndexOf('</w:tbl>', $tableStart) + 8
    $tblXml = $xml.Substring($tableStart, $tableEnd - $tableStart)
    Write-Output "Table length: $($tblXml.Length)"
    Write-Output $tblXml
}
