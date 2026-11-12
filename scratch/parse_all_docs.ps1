Add-Type -AssemblyName System.IO.Compression.FileSystem

$files = Get-ChildItem -Path "人設資料" -Recurse -Filter "*.docx"

function Parse-CharDoc($f) {
    try {
        $zip = [System.IO.Compression.ZipFile]::OpenRead($f.FullName)
        $entry = $zip.GetEntry("word/document.xml")
        if (-not $entry) { $zip.Dispose(); return $null }
        $stream = $entry.Open()
        $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
        $xml = $reader.ReadToEnd()
        $reader.Close(); $stream.Close(); $zip.Dispose()
        [xml]$x = $xml
        $ns = New-Object System.Xml.XmlNamespaceManager($x.NameTable)
        $ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
        $nodes = $x.SelectNodes("//w:p", $ns)
        $lines = @()
        foreach ($p in $nodes) {
            $pText = ($p.SelectNodes(".//w:t", $ns) | ForEach-Object { $_.InnerText }) -join ""
            if ($pText.Trim()) { $lines += $pText.Trim() }
        }
        $fullText = $lines -join "`n"
        
        $name = $lines[0]
        if ($name.Length -gt 30 -or $name -match "強度") { $name = $f.BaseName }

        $title = if ($fullText -match "稱號[:：]([^\n]+)") { $matches[1].Trim() } else { "" }
        $group = if ($fullText -match "群體[:：]([^\n]+)") { $matches[1].Trim() } else { "" }
        $race = if ($fullText -match "種族[:：]([^\n]+)") { $matches[1].Trim() } else { "" }
        $power = if ($fullText -match "強度[:：]([^\n]+)") { $matches[1].Trim() } else { "" }
        $likes = if ($fullText -match "喜歡[:：]([^\n]+)") { $matches[1].Trim() } else { "" }
        $dislikes = if ($fullText -match "討厭[:：]([^\n]+)") { $matches[1].Trim() } else { "" }
        $story = if ($fullText -match "(?:故事背景與相遇過程|故事背景|相遇過程)[:：]?\s*\n([\s\S]+)") { $matches[1].Trim() } else { "" }

        return [PSCustomObject]@{
            FileName = $f.BaseName
            FullName = $f.FullName
            RelativeDir = $f.DirectoryName.Replace("G:\我的雲端硬碟\亞雷利塔相關\人設資料\", "")
            Name = $name
            Title = $title
            Group = $group
            Race = $race
            Power = $power
            Likes = $likes
            Dislikes = $dislikes
            Story = $story
        }
    } catch {
        return $null
    }
}

$parsed = @()
foreach ($f in $files) {
    $c = Parse-CharDoc $f
    if ($c) { $parsed += $c }
}

Write-Output "Successfully parsed $($parsed.Count) files."
$parsed | Select-Object -First 5 | Format-Table Name, RelativeDir, Title, Power -AutoSize
