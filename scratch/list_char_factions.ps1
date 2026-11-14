Add-Type -AssemblyName System.IO.Compression.FileSystem
$docxPath = "G:\我的雲端硬碟\亞雷利塔相關\亞雷利塔全角色關係填寫手冊.docx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($docxPath)
$entry = $zip.GetEntry("word/document.xml")
$sr = New-Object System.IO.StreamReader($entry.Open(), [System.Text.Encoding]::UTF8)
$xmlContent = $sr.ReadToEnd()
$sr.Close()
$zip.Dispose()

$xmlDoc = New-Object System.Xml.XmlDocument
$xmlDoc.LoadXml($xmlContent)
$ns = New-Object System.Xml.XmlNamespaceManager($xmlDoc.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$body = $xmlDoc.SelectSingleNode("//w:body", $ns)
$children = $body.ChildNodes

$chars = @()
$cur = $null
for ($i = 0; $i -lt $children.Count; $i++) {
    $node = $children[$i]
    if ($node.Name -eq "w:p") {
        $pText = $node.InnerText.Trim()
        if ($pText -match "^【(\d+)\.\s*(.+?)】$") {
            $cur = [PSCustomObject]@{
                num = $matches[1]
                name = $matches[2].Trim()
                factionPath = ""
            }
            $chars += $cur
        } elseif ($cur -and $pText -match "陣營：(.*)$") {
            $cur.factionPath = $matches[1].Trim()
        }
    }
}
$chars | ForEach-Object { "$($_.num) | $($_.name) | $($_.factionPath)" } | Set-Content "G:\我的雲端硬碟\亞雷利塔相關\scratch\char_factions.txt" -Encoding UTF8
Write-Output "Listed $($chars.Count) characters."
