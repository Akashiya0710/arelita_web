Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead("G:\我的雲端硬碟\亞雷利塔相關\亞雷利塔全角色關係填寫手冊.docx")
$entry = $zip.GetEntry("word/document.xml")
$sr = New-Object System.IO.StreamReader($entry.Open(), [System.Text.Encoding]::UTF8)
$xmlContent = $sr.ReadToEnd()
$sr.Close()
$zip.Dispose()

# Verify valid XML parsing
$xmlDoc = New-Object System.Xml.XmlDocument
$xmlDoc.LoadXml($xmlContent)
Write-Output "XML is well-formed! Total w:tbl elements: $($xmlDoc.GetElementsByTagName('w:tbl').Count)"
Write-Output "Occurrences of 點此輸入: $([regex]::Matches($xmlContent, '點此輸入').Count)"
