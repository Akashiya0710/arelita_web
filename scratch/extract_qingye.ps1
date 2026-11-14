Add-Type -AssemblyName System.IO.Compression.FileSystem

$docxPath = "人設資料\現界\東方滅魔館\清野 墨江.docx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($docxPath)
$entry = $zip.GetEntry("word/document.xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xml = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

$clean = [System.Text.RegularExpressions.Regex]::Replace($xml, '<[^>]+>', "`n")
$lines = $clean -split "`n" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
$lines -join "`n" | Out-File "scratch/qingye_mojiang_text.txt" -Encoding UTF8
Write-Output "Extracted $($lines.Count) lines to scratch/qingye_mojiang_text.txt"
