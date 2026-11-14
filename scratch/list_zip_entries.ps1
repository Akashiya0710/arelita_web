Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [System.IO.Compression.ZipFile]::OpenRead('亞雷利塔全角色關係填寫手冊.docx')
foreach ($entry in $z.Entries) {
    Write-Output $entry.FullName
}
$z.Dispose()
