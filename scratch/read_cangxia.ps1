Add-Type -AssemblyName System.IO.Compression.FileSystem
$file = Get-ChildItem -Path "G:\我的雲端硬碟\亞雷利塔相關\人設資料" -Recurse -Filter "*蒼霞*.docx" | Select-Object -First 1
if ($file) {
    $zip = [System.IO.Compression.ZipFile]::OpenRead($file.FullName)
    $entry = $zip.GetEntry("word/document.xml")
    $sr = New-Object System.IO.StreamReader($entry.Open(), [System.Text.Encoding]::UTF8)
    $xml = $sr.ReadToEnd()
    $sr.Close()
    $zip.Dispose()
    $text = $xml -replace '<w:p[^>]*>', "`n" -replace '<[^>]+>', ''
    Write-Output "File: $($file.FullName)"
    Write-Output $text
}
