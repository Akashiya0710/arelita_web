Add-Type -AssemblyName System.IO.Compression.FileSystem

# Output path
$outDocx = "G:\我的雲端硬碟\亞雷利塔相關\亞雷利塔全角色關係條列手冊.docx"
$templateDocx = "亞雷利塔設定文本\主要設定\亞雷利塔-世界級組織.docx"
$tempDir = "scratch\build_docx_temp"

if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
[System.IO.Compression.ZipFile]::ExtractToDirectory($templateDocx, $tempDir)

Write-Output "Template extracted to $tempDir"
