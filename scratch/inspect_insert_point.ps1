Add-Type -AssemblyName System.IO.Compression.FileSystem

# 1. Backup first!
$src = "亞雷利塔全角色關係填寫手冊.docx"
$backup = "亞雷利塔全角色關係填寫手冊_備份_20261114_0345.docx"
Copy-Item $src $backup -Force
Write-Output "Backed up to $backup"

# 2. Inspect 忠情 and subsequent character in document.xml
$zip = [System.IO.Compression.ZipFile]::OpenRead($src)
$entry = $zip.GetEntry("word/document.xml")
$reader = New-Object System.IO.StreamReader($entry.Open())
$xml = $reader.ReadToEnd()
$reader.Close()
$zip.Dispose()

$idxZhong = $xml.IndexOf('【058. 忠情】')
$idxNext = $xml.IndexOf('【059.', $idxZhong)
Write-Output "忠情 at: $idxZhong, Next at: $idxNext"

$sub = $xml.Substring($idxZhong, $idxNext - $idxZhong)
Write-Output "忠情 section length: $($sub.Length)"
$sub | Out-File "scratch/zhongqing_block.xml" -Encoding UTF8
Write-Output "Saved 忠情 block to scratch/zhongqing_block.xml"
