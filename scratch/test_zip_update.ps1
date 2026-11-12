Add-Type -AssemblyName System.IO.Compression.FileSystem

# Test template zip
$templatePath = "亞雷利塔設定文本\主要設定\亞雷利塔-世界級組織.docx"
$tempZipPath = "scratch\template_copy.zip"
Copy-Item $templatePath $tempZipPath -Force

$zip = [System.IO.Compression.ZipFile]::Open($tempZipPath, [System.IO.Compression.ZipArchiveMode]::Update)
$docEntry = $zip.GetEntry("word/document.xml")
Write-Output "Found document.xml in template: $($docEntry -ne $null)"
$zip.Dispose()
Remove-Item $tempZipPath -Force
