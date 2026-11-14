Add-Type -AssemblyName System.IO.Compression.FileSystem

$docxPath = "亞雷利塔全角色關係填寫手冊.docx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($docxPath)
$entry = $zip.GetEntry("word/document.xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xml = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

Write-Output ("Length: " + $xml.Length)
Write-Output ("Contains 清野 墨江: " + $xml.Contains("清野 墨江"))
Write-Output ("Contains 點此輸入: " + $xml.Contains("點此輸入"))

# Check a sample character entry
$idx = $xml.IndexOf("清野 墨江")
if ($idx -ge 0) {
    Write-Output "Found 清野 墨江 at $idx"
    $start = [Math]::Max(0, $idx - 200)
    $len = [Math]::Min(800, $xml.Length - $start)
    Write-Output $xml.Substring($start, $len)
} else {
    Write-Output "清野 墨江 not in docx."
    # show first 1000 chars of body
    $bodyIdx = $xml.IndexOf("<w:body>")
    if ($bodyIdx -ge 0) {
        Write-Output $xml.Substring($bodyIdx, 1500)
    }
}
