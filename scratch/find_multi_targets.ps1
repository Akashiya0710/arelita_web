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

$curChar = ""
$curFaction = ""
$outLines = @()
for ($i = 0; $i -lt $children.Count; $i++) {
    $node = $children[$i]
    if ($node.Name -eq "w:p") {
        $pText = $node.InnerText.Trim()
        if ($pText -match "^【(\d+)\.\s*(.+?)】$") {
            $curChar = "$($matches[1]). $($matches[2].Trim())"
        } elseif ($pText -match "陣營：(.*)$") {
            $curFaction = $matches[1].Trim()
        }
    } elseif ($node.Name -eq "w:tbl" -and $curChar -ne "") {
        $trs = $node.SelectNodes(".//w:tr", $ns)
        for ($r = 1; $r -lt $trs.Count; $r++) {
            $tcs = $trs[$r].SelectNodes(".//w:tc", $ns)
            if ($tcs.Count -ge 2) {
                $c1 = $tcs[0].InnerText.Trim()
                $c2 = $tcs[1].InnerText.Trim()
                if ($c1 -match '[、,，]|成員|所有人|其他|其餘|全員|小隊|部門|眾人|等人|七宗罪|十二|四皇|部下們|幹部') {
                    $outLines += "$curChar [$curFaction] -> TARGET: [$c1] | DESC: [$c2]"
                }
            }
        }
        $curChar = ""
    }
}
$outLines | Set-Content "G:\我的雲端硬碟\亞雷利塔相關\scratch\multi_target_rows.txt" -Encoding UTF8
Write-Output "Found $($outLines.Count) multi-target/group rows."
