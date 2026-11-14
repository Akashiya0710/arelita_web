Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Create-StandardDocxZip($sourceDir, $destinationZipFile) {
    if (Test-Path $destinationZipFile) { Remove-Item $destinationZipFile -Force }
    $zip = [System.IO.Compression.ZipFile]::Open($destinationZipFile, [System.IO.Compression.ZipArchiveMode]::Create)
    $files = Get-ChildItem -Path $sourceDir -Recurse -File
    $sourceDirFull = (Get-Item $sourceDir).FullName.TrimEnd('\', '/') + '\'
    
    foreach ($f in $files) {
        $rel = $f.FullName.Substring($sourceDirFull.Length).Replace('\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $f.FullName, $rel, [System.IO.Compression.CompressionLevel]::Optimal)
    }
    $zip.Dispose()
}

# Test on backup file
$backup = "亞雷利塔全角色關係填寫手冊_備份_20261114_0345.docx"
$docxPath = "亞雷利塔全角色關係填寫手冊.docx"
$tempUnzip = "scratch\temp_docx_edit"
if (Test-Path $tempUnzip) { Remove-Item $tempUnzip -Recurse -Force }
[System.IO.Compression.ZipFile]::ExtractToDirectory($backup, $tempUnzip)

$docXmlPath = Join-Path $tempUnzip "word\document.xml"
$xml = [System.IO.File]::ReadAllText($docXmlPath, [System.Text.Encoding]::UTF8)

# Construct 清野 墨江 XML block
$qingyeBlock = @"
<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000"><w:pPr><w:spacing w:after="60" w:before="200" w:lineRule="auto"/><w:rPr/></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Gungsuh" w:cs="Gungsuh" w:eastAsia="Gungsuh" w:hAnsi="Gungsuh"/><w:b w:val="1"/><w:bCs w:val="1"/><w:color w:val="0f172a"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">【059. 清野 墨江】</w:t></w:r></w:p><w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000"><w:pPr><w:spacing w:after="100" w:before="0" w:lineRule="auto"/><w:rPr/></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Gungsuh" w:cs="Gungsuh" w:eastAsia="Gungsuh" w:hAnsi="Gungsuh"/><w:b w:val="1"/><w:bCs w:val="1"/><w:color w:val="0369a1"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">性別：</w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Gungsuh" w:cs="Gungsuh" w:eastAsia="Gungsuh" w:hAnsi="Gungsuh"/><w:color w:val="1e293b"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">女　　｜　　</w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Gungsuh" w:cs="Gungsuh" w:eastAsia="Gungsuh" w:hAnsi="Gungsuh"/><w:b w:val="1"/><w:bCs w:val="1"/><w:color w:val="0369a1"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">年齡：</w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Gungsuh" w:cs="Gungsuh" w:eastAsia="Gungsuh" w:hAnsi="Gungsuh"/><w:color w:val="1e293b"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">51「#12026年」　　｜　　</w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Gungsuh" w:cs="Gungsuh" w:eastAsia="Gungsuh" w:hAnsi="Gungsuh"/><w:b w:val="1"/><w:bCs w:val="1"/><w:color w:val="0369a1"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">陣營：</w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Gungsuh" w:cs="Gungsuh" w:eastAsia="Gungsuh" w:hAnsi="Gungsuh"/><w:color w:val="1e293b"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">現界 / 東方滅魔館</w:t></w:r></w:p><w:tbl><w:tblPr><w:tblStyle w:val="TableQingye"/><w:tblW w:w="8800.0" w:type="dxa"/><w:jc w:val="left"/><w:tblBorders><w:top w:color="cbd5e1" w:space="0" w:sz="6" w:val="single"/><w:left w:color="cbd5e1" w:space="0" w:sz="6" w:val="single"/><w:bottom w:color="cbd5e1" w:space="0" w:sz="6" w:val="single"/><w:right w:color="cbd5e1" w:space="0" w:sz="6" w:val="single"/><w:insideH w:color="e2e8f0" w:space="0" w:sz="4" w:val="single"/><w:insideV w:color="e2e8f0" w:space="0" w:sz="4" w:val="single"/></w:tblBorders><w:tblLayout w:type="fixed"/><w:tblLook w:val="0000"/></w:tblPr><w:tblGrid><w:gridCol w:w="2600"/><w:gridCol w:w="6200"/><w:tblGridChange w:id="0"><w:tblGrid><w:gridCol w:w="2600"/><w:gridCol w:w="6200"/></w:tblGrid></w:tblGridChange></w:tblGrid><w:tr><w:trPr><w:cantSplit w:val="0"/><w:tblHeader w:val="0"/></w:trPr><w:tc><w:tcPr><w:shd w:fill="f1f5f9" w:val="clear"/></w:tcPr><w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000"><w:pPr><w:spacing w:after="60" w:before="60" w:lineRule="auto"/><w:jc w:val="center"/><w:rPr/></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Gungsuh" w:cs="Gungsuh" w:eastAsia="Gungsuh" w:hAnsi="Gungsuh"/><w:b w:val="1"/><w:bCs w:val="1"/><w:color w:val="334155"/><w:sz w:val="19"/><w:szCs w:val="19"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">與其有關係之角色</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:shd w:fill="f1f5f9" w:val="clear"/></w:tcPr><w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000"><w:pPr><w:spacing w:after="60" w:before="60" w:lineRule="auto"/><w:jc w:val="left"/><w:rPr/></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Gungsuh" w:cs="Gungsuh" w:eastAsia="Gungsuh" w:hAnsi="Gungsuh"/><w:b w:val="1"/><w:bCs w:val="1"/><w:color w:val="334155"/><w:sz w:val="19"/><w:szCs w:val="19"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">關係說明（如：戀人、老戰友、徒弟、上司、宿敵、暗戀等）</w:t></w:r></w:p></w:tc></w:tr><w:tr><w:trPr><w:cantSplit w:val="0"/><w:trHeight w:val="380" w:hRule="atLeast"/><w:tblHeader w:val="0"/></w:trPr><w:tc><w:tcPr/><w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000"><w:pPr><w:spacing w:after="80" w:before="80" w:lineRule="auto"/><w:rPr><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr></w:r></w:p></w:tc><w:tc><w:tcPr/><w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000"><w:pPr><w:spacing w:after="80" w:before="80" w:lineRule="auto"/><w:rPr><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr></w:r></w:p></w:tc></w:tr><w:tr><w:trPr><w:cantSplit w:val="0"/><w:trHeight w:val="380" w:hRule="atLeast"/><w:tblHeader w:val="0"/></w:trPr><w:tc><w:tcPr/><w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000"><w:pPr><w:spacing w:after="80" w:before="80" w:lineRule="auto"/><w:rPr><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr></w:r></w:p></w:tc><w:tc><w:tcPr/><w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000"><w:pPr><w:spacing w:after="80" w:before="80" w:lineRule="auto"/><w:rPr><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr></w:r></w:p></w:tc></w:tr><w:tr><w:trPr><w:cantSplit w:val="0"/><w:trHeight w:val="380" w:hRule="atLeast"/><w:tblHeader w:val="0"/></w:trPr><w:tc><w:tcPr/><w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000"><w:pPr><w:spacing w:after="80" w:before="80" w:lineRule="auto"/><w:rPr><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr></w:r></w:p></w:tc><w:tc><w:tcPr/><w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000"><w:pPr><w:spacing w:after="80" w:before="80" w:lineRule="auto"/><w:rPr><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr></w:r></w:p></w:tc></w:tr><w:tr><w:trPr><w:cantSplit w:val="0"/><w:trHeight w:val="380" w:hRule="atLeast"/><w:tblHeader w:val="0"/></w:trPr><w:tc><w:tcPr/><w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000"><w:pPr><w:spacing w:after="80" w:before="80" w:lineRule="auto"/><w:rPr><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr></w:r></w:p></w:tc><w:tc><w:tcPr/><w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000"><w:pPr><w:spacing w:after="80" w:before="80" w:lineRule="auto"/><w:rPr><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr></w:r></w:p></w:tc></w:tr><w:tr><w:trPr><w:cantSplit w:val="0"/><w:trHeight w:val="380" w:hRule="atLeast"/><w:tblHeader w:val="0"/></w:trPr><w:tc><w:tcPr/><w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000"><w:pPr><w:spacing w:after="80" w:before="80" w:lineRule="auto"/><w:rPr><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr></w:r></w:p></w:tc><w:tc><w:tcPr/><w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000"><w:pPr><w:spacing w:after="80" w:before="80" w:lineRule="auto"/><w:rPr><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr></w:r></w:p></w:tc></w:tr></w:tbl><w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000"><w:pPr><w:spacing w:after="160" w:before="60" w:lineRule="auto"/><w:rPr/></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr></w:r></w:p>
"@

$targetSearch = '📁 陣營分類：現界 / 哈維德恩龍族帝國 / 領導者'
$idxTarget = $xml.IndexOf($targetSearch)
if ($idxTarget -lt 0) {
    Write-Error "Target marker not found!"
    exit 1
}

$pStart = $xml.LastIndexOf('<w:p ', $idxTarget)
$before = $xml.Substring(0, $pStart)
$after = $xml.Substring($pStart)
$newXml = $before + $qingyeBlock + $after

$evaluator = [System.Text.RegularExpressions.MatchEvaluator]{
    param($match)
    $num = [int]$match.Groups[1].Value
    $name = $match.Groups[2].Value
    if ($name -eq "清野 墨江") {
        return "【059. 清野 墨江】"
    }
    if ($num -ge 59) {
        $newNum = ($num + 1).ToString("D3")
        return "【$newNum. $name】"
    } else {
        return $match.Value
    }
}

$renumberedXml = [System.Text.RegularExpressions.Regex]::Replace($newXml, '【(\d+)\.\s*([^】]+)】', $evaluator)
[System.IO.File]::WriteAllText($docXmlPath, $renumberedXml, [System.Text.Encoding]::UTF8)

# Pack zip with forward slashes!
Create-StandardDocxZip $tempUnzip $docxPath
Remove-Item $tempUnzip -Recurse -Force

Write-Output "Repacked $docxPath with proper forward slashes."
