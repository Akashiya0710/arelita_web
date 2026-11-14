Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [System.IO.Compression.ZipFile]::OpenRead('亞雷利塔全角色關係填寫手冊.docx')
$e = $z.GetEntry('word/document.xml')
$sr = New-Object System.IO.StreamReader($e.Open())
$xml = $sr.ReadToEnd()
$sr.Close()
$z.Dispose()

$idx = $xml.IndexOf('忠情')
if ($idx -ge 0) {
    # Find start of table or paragraph before this
    $start = [Math]::Max(0, $idx - 500)
    $len = [Math]::Min(3500, $xml.Length - $start)
    $sub = $xml.Substring($start, $len)
    Write-Output $sub
}
