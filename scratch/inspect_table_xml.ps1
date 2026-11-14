Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead("G:\我的雲端硬碟\亞雷利塔相關\亞雷利塔全角色關係填寫手冊.docx")
$entry = $zip.GetEntry("word/document.xml")
$sr = New-Object System.IO.StreamReader($entry.Open(), [System.Text.Encoding]::UTF8)
$xml = $sr.ReadToEnd()
$sr.Close()
$zip.Dispose()

$idx1 = $xml.IndexOf("【017. 賽恩悉 佛拉德】")
$idx2 = $xml.IndexOf("【020. 索特塔克夫】")
$sample = $xml.Substring($idx1, $idx2 - $idx1)
[System.IO.File]::WriteAllText("G:\我的雲端硬碟\亞雷利塔相關\scratch\sample_table_xml.txt", $sample, [System.Text.Encoding]::UTF8)
Write-Output "Saved sample XML of length $($sample.Length)"
