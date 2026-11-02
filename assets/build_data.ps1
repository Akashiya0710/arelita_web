[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.IO.Compression.FileSystem

$rootPath = (Get-Location).Path

# 1. Map character images in 亞雷利塔角色形象
$imageFiles = Get-ChildItem -Path "亞雷利塔角色形象" -File | Where-Object { $_.Name -ne "IMG_0604.JPG" }

$explicitImageMap = @{
    "雅希棋 艾比斯" = "亞雷利塔角色形象/亞希棋_艾比斯.png"
    "德菈 貝西卡" = "亞雷利塔角色形象/德菈_貝希卡.png"
    "阿撒托斯 阿斯拉 凱撒(2)" = "亞雷利塔角色形象/阿撒托斯.png"
    "阿撒托斯 阿斯拉 凱撒" = "亞雷利塔角色形象/阿撒托斯.png"
    "蒂雅 歐斯拉 特蘿" = "亞雷利塔角色形象/蒂雅.png"
    "雷風 克斯拉 修羅" = "亞雷利塔角色形象/雷風.png"
    "烈火 阿斯拉 修羅" = "亞雷利塔角色形象/烈火.png"
    "忻天 艾姆雷朵 薩恩" = "亞雷利塔角色形象/忻天.png"
    "蘿克莉絲 菲爾德 慕夏" = "亞雷利塔角色形象/蘿克莉絲_菲爾德.png"
    "塞西莉雅 瑪德萊特" = "亞雷利塔角色形象/塞西莉亞_瑪德萊特.png"
    "不明（清水 若雨）" = "亞雷利塔角色形象/清水_若雨.png"
}

function Find-CharacterImage($baseName, $charName) {
    if ($explicitImageMap.ContainsKey($baseName)) {
        return $explicitImageMap[$baseName]
    }
    if ($explicitImageMap.ContainsKey($charName)) {
        return $explicitImageMap[$charName]
    }
    $normBase = ($baseName -replace '[\s_・•]', '')
    $normChar = ($charName -replace '[\s_・•]', '')
    foreach ($img in $imageFiles) {
        $imgStem = [System.IO.Path]::GetFileNameWithoutExtension($img.Name)
        $normImg = ($imgStem -replace '[\s_・•]', '')
        if ($normImg -eq $normBase -or $normImg -eq $normChar) {
            return "亞雷利塔角色形象/$($img.Name)"
        }
    }
    return $null
}

function Get-DocxBlocks($path) {
    $blocks = New-Object System.Collections.Generic.List[object]
    $zip = [System.IO.Compression.ZipFile]::OpenRead($path)
    $entry = $zip.GetEntry("word/document.xml")
    if ($entry) {
        $reader = New-Object System.IO.StreamReader($entry.Open(), [System.Text.Encoding]::UTF8)
        $xml = [xml]$reader.ReadToEnd()
        $reader.Close()
        $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
        $ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
        $body = $xml.SelectSingleNode("//w:body", $ns)
        if ($body) {
            foreach ($node in $body.ChildNodes) {
                if ($node.LocalName -eq "p") {
                    $hasDrawing = $node.SelectSingleNode(".//w:drawing", $ns)
                    $childRuns = $node.SelectNodes(".//w:r", $ns)
                    $txt = ""
                    if ($childRuns -and $childRuns.Count -gt 0) {
                        $pSb = New-Object System.Text.StringBuilder
                        foreach ($cr in $childRuns) {
                            $isStrike = ($cr.SelectSingleNode(".//w:strike", $ns) -ne $null) -or ($cr.SelectSingleNode(".//w:dstrike", $ns) -ne $null)
                            $rTextNodes = $cr.SelectNodes(".//w:t | .//w:br", $ns)
                            $rText = ""
                            foreach ($tn in $rTextNodes) {
                                if ($tn.LocalName -eq "br") { $rText += "`n" } else { $rText += $tn.InnerText }
                            }
                            if ($isStrike -and $rText.Trim() -ne "") {
                                [void]$pSb.Append("~~" + $rText + "~~")
                            } else {
                                [void]$pSb.Append($rText)
                            }
                        }
                        $txt = (($pSb.ToString()) -replace '[\uFEFF\u200B]', '').Trim()
                    } else {
                        $parts = $node.SelectNodes(".//w:t | .//w:br", $ns) | ForEach-Object {
                            if ($_.LocalName -eq "br") { "`n" } else { $_.InnerText }
                        }
                        $txt = (($parts -join "") -replace '[\uFEFF\u200B]', '').Trim()
                    }
                    if ($txt -ne "") {
                        $blocks.Add(@{ type = "p"; text = $txt })
                    }
                    if ($hasDrawing) {
                        $blocks.Add(@{
                            type = "image"
                            src = "assets/image1.png"
                            alt = "力的剋制關係（圓形版）"
                        })
                    }
                } elseif ($node.LocalName -eq "tbl") {
                    $rows = New-Object System.Collections.Generic.List[object]
                    $trNodes = $node.SelectNodes("./w:tr", $ns)
                    foreach ($tr in $trNodes) {
                        $cells = New-Object System.Collections.Generic.List[string]
                        $tcNodes = $tr.SelectNodes("./w:tc", $ns)
                        foreach ($tc in $tcNodes) {
                            $pNodes = $tc.SelectNodes(".//w:p", $ns)
                            $pTexts = foreach ($p in $pNodes) {
                                $parts = $p.SelectNodes(".//w:t | .//w:br", $ns) | ForEach-Object {
                                    if ($_.LocalName -eq "br") { "`n" } else { $_.InnerText }
                                }
                                (($parts -join "") -replace '[\uFEFF\u200B]', '').Trim()
                            }
                            $cellText = (($pTexts | Where-Object { $_ -ne "" }) -join "`n")
                            $cells.Add($cellText)
                        }
                        $rows.Add($cells)
                    }
                    if ($rows.Count -gt 0) {
                        $blocks.Add(@{ type = "table"; rows = $rows })
                    }
                }
            }
        }
    }
    $zip.Dispose()
    return $blocks
}

function Get-DocxLines($path) {
    $blocks = Get-DocxBlocks $path
    $lines = New-Object System.Collections.Generic.List[string]
    foreach ($b in $blocks) {
        if ($b.type -eq "p") {
            foreach ($sub in ($b.text -split "`n")) {
                $clean = ($sub -replace '[\uFEFF\u200B]', '').Trim()
                if ($clean -ne "") {
                    $lines.Add($clean)
                }
            }
        }
    }
    return $lines
}

# 2. Parse Character Files
$abilityKeys = @("亡靈病", "加護", "詛咒", "神言", "神器", "神權", "虛能", "古言靈術", "古言靈術式", "世界共鳴", "共鳴", "亞雷利塔光環", "最高等術式", "最高等術士", "異能", "魔法", "幻能", "九紋龍印", "貫星的九紋龍印", "魔眼", "眷屬權能", "改造", "深淵能力", "能力", "獨有術式", "#額外能力")
$profileKeys = @("武器", "群體", "稱號", "性別", "種族", "屬性", "善惡", "生日", "年齡", "身高", "體重", "個性", "外表", "喜歡", "討厭")
$storyKeys = @("故事背景與相遇過程", "故事背景", "背景故事")

$allKnownKeys = @("強度") + $abilityKeys + $profileKeys + $storyKeys
$keyRegex = '^(' + (($allKnownKeys | ForEach-Object { [regex]::Escape($_) }) -join '|') + ')\s*[:：]\s*(.*)$'

function Parse-CharacterFile($fileItem, $charId) {
    $relPath = $fileItem.FullName.Substring($rootPath.Length + 1) -replace '\\', '/'
    $parts = $relPath -split '/'
    $realm = if ($parts.Count -ge 2) { $parts[1] } else { "其他" }
    $faction = if ($parts.Count -ge 4) {
        $parts[2]
    } elseif ($parts.Count -eq 3) {
        $parts[1]
    } else { "未分類" }
    $subFaction = if ($parts.Count -ge 5) {
        ($parts[3..($parts.Count - 2)] -join " / ")
    } else {
        ""
    }

    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($fileItem.Name)

    if ($fileItem.Extension -eq ".gdoc") {
        $imgPath = Find-CharacterImage $baseName $baseName
        return @{
            id = $charId
            name = "清水 若雨"
            fileName = $baseName
            filePath = $relPath
            realm = $realm
            faction = $faction
            subFaction = $subFaction
            image = $imgPath
            identities = @("紅蓮組將軍候補／成員", "Google 雲端文件檔案")
            power = "待補充（雲端文件）"
            profile = @{
                "群體" = "魔風聯邦 - 魔風軍團 - 紅蓮組"
                "稱號" = "不明（清水 若雨）"
            }
            abilities = @()
            story = "此角色設定檔目前為 Google Docs 雲端捷徑檔（不明（清水 若雨）.gdoc），已關聯角色形象立繪「清水_若雨.png」。"
        }
    }

    $lines = Get-DocxLines $fileItem.FullName

    $expandedLines = New-Object System.Collections.Generic.List[string]
    foreach ($line in $lines) {
        if ($line -match '^(身高\s*[:：]\s*[0-9.]+)\s*(體重\s*[:：]\s*.+)$') {
            $expandedLines.Add($matches[1])
            $expandedLines.Add($matches[2])
        } else {
            $expandedLines.Add($line)
        }
    }

    $charName = if ($expandedLines.Count -gt 0) { $expandedLines[0] } else { $baseName }
    $imgPath = Find-CharacterImage $baseName $charName

    $identities = New-Object System.Collections.Generic.List[string]
    $power = ""
    $profile = @{}
    $abilities = New-Object System.Collections.Generic.List[object]
    $storyLines = New-Object System.Collections.Generic.List[string]

    $state = "HEADER"
    $script:currentAbilityType = $null
    $script:currentAbilityLines = New-Object System.Collections.Generic.List[string]
    $currentProfileKey = $null

    function Flush-Ability {
        if ($script:currentAbilityType -ne $null) {
            $txt = ($script:currentAbilityLines -join "`n").Trim()
            if ($txt -ne "") {
                $abilities.Add(@{
                    type = $script:currentAbilityType
                    content = $txt
                })
            }
            $script:currentAbilityType = $null
            $script:currentAbilityLines.Clear()
        }
    }

    for ($i = 1; $i -lt $expandedLines.Count; $i++) {
        $line = $expandedLines[$i]

        if ($state -eq "STORY") {
            $storyLines.Add($line)
            continue
        }

        if ($line -match $keyRegex) {
            $k = $matches[1]
            $v = $matches[2].Trim()

            if ($k -eq "古言靈術式") { $k = "古言靈術" }
            if ($k -eq "最高等術士") { $k = "最高等術式" }
            if ($k -eq "貫星的九紋龍印") { $k = "九紋龍印"; $v = "貫星的九紋龍印 " + $v }
            if ($k -eq "#額外能力") { $k = "額外能力" }

            if ($storyKeys -contains $k) {
                Flush-Ability
                $currentProfileKey = $null
                $state = "STORY"
                if ($v -ne "") { $storyLines.Add($v) }
                continue
            }

            if ($k -eq "強度") {
                Flush-Ability
                $currentProfileKey = $null
                $state = "BODY"
                $power = $v
                continue
            }

            if ($abilityKeys -contains $matches[1]) {
                Flush-Ability
                $currentProfileKey = $null
                $state = "ABILITY"
                $script:currentAbilityType = $k
                if ($v -ne "") {
                    $script:currentAbilityLines.Add($v)
                }
                continue
            }

            if ($profileKeys -contains $k) {
                Flush-Ability
                $state = "PROFILE"
                $currentProfileKey = $k
                $profile[$k] = $v
                continue
            }
        }

        if ($state -eq "HEADER") {
            if ($line -ne "原創角色") {
                $identities.Add($line)
            }
        } elseif ($state -eq "ABILITY" -and $script:currentAbilityType -ne $null) {
            $script:currentAbilityLines.Add($line)
        } elseif ($state -eq "PROFILE" -and $currentProfileKey -ne $null) {
            if ($profile[$currentProfileKey] -eq "") {
                $profile[$currentProfileKey] = $line
            } else {
                $profile[$currentProfileKey] = $profile[$currentProfileKey] + "`n" + $line
            }
        } else {
            $identities.Add($line)
        }
    }
    Flush-Ability

    return @{
        id = $charId
        name = $charName
        fileName = $baseName
        filePath = $relPath
        realm = $realm
        faction = $faction
        subFaction = $subFaction
        image = $imgPath
        identities = $identities
        power = $power
        profile = $profile
        abilities = $abilities
        story = ($storyLines -join "`n").Trim()
    }
}

$characters = New-Object System.Collections.Generic.List[object]
$charIndex = 0

Get-ChildItem -Path "人設資料" -Recurse -File | Where-Object { $_.Name -notmatch "的副本" } | Sort-Object FullName | ForEach-Object {
    $charIndex++
    $cObj = Parse-CharacterFile $_ "char-$charIndex"
    $characters.Add($cObj)
}

# 3. Parse World Lore & Settings Files (Grouped with orgName for 組織 國家設定)
$loreDocs = New-Object System.Collections.Generic.List[object]
$loreOrder = @(
    @{ path = "亞雷利塔設定文本\主要設定\亞雷利塔基本設定.docx"; category = "主要設定"; orgName = ""; title = "亞雷利塔基本設定"; subtitle = "世界架構・五界・善惡值・重置編年・種族・九大力・特殊能力・強度分級・神明・25國總覽"; icon = "🏛️" },
    @{ path = "亞雷利塔設定文本\主要設定\亞雷利塔-世界級組織.docx"; category = "主要設定"; orgName = ""; title = "亞雷利塔—世界級組織"; subtitle = "魔風軍團・魔法協會・月星之霞・聖櫃十字軍・影風之巔・寂靜之音・世界賢者館・東方滅魔館・極真圃等 11 大組織"; icon = "🌐" },
    @{ path = "亞雷利塔設定文本\主要設定\亞雷利塔全屬性分類與個別介紹手冊.docx"; category = "主要設定"; orgName = ""; title = "亞雷利塔全屬性分類與個別介紹手冊"; subtitle = "16 大屬性分類精修版・基礎元素、高階質變、跨系複合、天體星空、深淵淵蝕、時空與特殊法則完整圖鑑"; icon = "✨" },
    @{ path = "亞雷利塔設定文本\組織 國家設定\魔風聯邦\魔風聯邦設定集.docx"; category = "組織與國家設定"; orgName = "魔風聯邦"; title = "魔風聯邦設定集"; subtitle = "最高層・冥府神傑・獨立特級・軍團八部隊・四大機關・八大直轄市人口與風貌"; icon = "🦅" },
    @{ path = "亞雷利塔設定文本\組織 國家設定\魔風聯邦\魔風聯邦建國歷史.docx"; category = "組織與國家設定"; orgName = "魔風聯邦"; title = "魔風聯邦建國歷史"; subtitle = "#12010～#12026 赤夜風竹創立魔風至建國與冥府神傑成立編年史"; icon = "📜" },
    @{ path = "亞雷利塔設定文本\組織 國家設定\哈維德恩龍族帝國\哈維德恩龍族帝國 軍隊編制.docx"; category = "組織與國家設定"; orgName = "哈維德恩龍族帝國"; title = "哈維德恩龍族帝國 軍隊編制"; subtitle = "龍皇島軍隊編制・寂滅龍皇・龍皇四柱・親衛隊・四大軍團・龍神"; icon = "🐉" },
    @{ path = "亞雷利塔設定文本\組織 國家設定\極真圃\極真圃時間線.docx"; category = "組織與國家設定"; orgName = "極真圃"; title = "極真圃時間線"; subtitle = "#11595～#12026 伊森塔爾與「識真六花」尋求世界重置真相之軌跡"; icon = "🏵️" },
    @{ path = "亞雷利塔設定文本\其他設定\虛斬相關.docx"; category = "其他設定"; orgName = ""; title = "虛斬相關設定"; subtitle = "由武神寺山夜明所開發之超越時空獨立劍術「虛斬」與「斷術」機制"; icon = "⚔️" }
)

$loreIdx = 0
$processedLore = @{}
$processedLore[(Join-Path $rootPath "亞雷利塔設定文本\其他設定\「亞雷利塔最強者」.docx")] = $true
foreach ($item in $loreOrder) {
    $full = Join-Path $rootPath $item.path
    if (Test-Path $full) {
        $loreIdx++
        $processedLore[$full] = $true
        $blocks = Get-DocxBlocks $full
        $loreDocs.Add(@{
            id = "lore-$loreIdx"
            category = $item.category
            orgName = $item.orgName
            title = $item.title
            subtitle = $item.subtitle
            icon = $item.icon
            filePath = ($item.path -replace '\\', '/')
            blocks = $blocks
        })
    }
}

# Scan any additional docx files in 亞雷利塔設定文本
Get-ChildItem -Path "亞雷利塔設定文本" -Recurse -Filter "*.docx" | ForEach-Object {
    if (-not $processedLore.ContainsKey($_.FullName)) {
        $loreIdx++
        $rel = $_.FullName.Substring($rootPath.Length + 1) -replace '\\', '/'
        $pts = $rel -split '/'
        $cat = if ($pts[1] -match "組織") { "組織與國家設定" } elseif ($pts[1] -match "主要") { "主要設定" } else { "其他設定" }
        $org = if ($cat -eq "組織與國家設定" -and $pts.Count -ge 4) { $pts[2] } else { "" }
        $blocks = Get-DocxBlocks $_.FullName
        $loreDocs.Add(@{
            id = "lore-$loreIdx"
            category = $cat
            orgName = $org
            title = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
            subtitle = "$cat — $org"
            icon = "📄"
            filePath = $rel
            blocks = $blocks
        })
    }
}

# 4. Parse Story Files
$storyOrder = @(
    "劇情\魔風傳記-銀狼復仇篇\『序章—魔風』.docx",
    "劇情\魔風傳記-銀狼復仇篇\『第一章—我的起點』.docx",
    "劇情\魔風傳記-銀狼復仇篇\『第二章—燈下黑』.docx",
    "劇情\魔風傳記-銀狼復仇篇\『第三章—高端的獵人，總是……』.docx",
    "劇情\魔風傳記-銀狼復仇篇\『第四章—不願改變之事』.docx",
    "劇情\魔風傳記-銀狼復仇篇\『第五章—可能性』.docx",
    "劇情\魔風傳記-銀狼復仇篇\『第六章—試煉的序幕』.docx"
)

$stories = New-Object System.Collections.Generic.List[object]
$storyIdx = 0
$processedPaths = @{}

foreach ($sPath in $storyOrder) {
    $full = Join-Path $rootPath $sPath
    if (Test-Path $full) {
        $storyIdx++
        $processedPaths[$full] = $true
        $lines = Get-DocxLines $full
        $title = if ($lines.Count -gt 0) { $lines[0] } else { [System.IO.Path]::GetFileNameWithoutExtension($sPath) }
        $bodyLines = if ($lines.Count -gt 1) { $lines[1..($lines.Count - 1)] } else { @() }
        $stories.Add(@{
            id = "story-$storyIdx"
            series = "魔風傳記—銀狼復仇篇"
            title = $title
            filePath = ($sPath -replace '\\', '/')
            isGdoc = $false
            paragraphs = $bodyLines
        })
    }
}

Get-ChildItem -Path "劇情" -Recurse -File | Where-Object { $_.Name -notmatch "的副本" } | Sort-Object FullName | ForEach-Object {
    if (-not $processedPaths.ContainsKey($_.FullName)) {
        $relPath = $_.FullName.Substring($rootPath.Length + 1) -replace '\\', '/'
        $parts = $relPath -split '/'
        $seriesName = if ($parts.Count -ge 3) { $parts[1] } else { "外傳與其他篇章" }
        $baseTitle = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)

        if ($_.Extension -eq ".docx") {
            $lines = Get-DocxLines $_.FullName
            # Check if this docx contains multiple chapters like 〈序章 ...〉, 《第三章 ...》
            $chapterIndices = @()
            for ($i = 0; $i -lt $lines.Count; $i++) {
                if ($lines[$i] -match '^[〈《](序章|第[一二三四五六七八九十百]+章).*?[〉》]$') {
                    $chapterIndices += $i
                }
            }
            if ($chapterIndices.Count -gt 1) {
                for ($c = 0; $c -lt $chapterIndices.Count; $c++) {
                    $storyIdx++
                    $startIdx = $chapterIndices[$c]
                    $endIdx = if ($c -lt $chapterIndices.Count - 1) { $chapterIndices[$c + 1] - 1 } else { $lines.Count - 1 }
                    $chTitle = $lines[$startIdx]
                    $chParas = if ($endIdx -gt $startIdx) { $lines[($startIdx + 1)..$endIdx] } else { @() }
                    $stories.Add(@{
                        id = "story-$storyIdx"
                        series = $seriesName
                        title = $chTitle
                        filePath = $relPath
                        isGdoc = $false
                        paragraphs = $chParas
                    })
                }
            } else {
                $storyIdx++
                $title = if ($lines.Count -gt 0) { $lines[0] } else { $baseTitle }
                $bodyLines = if ($lines.Count -gt 1) { $lines[1..($lines.Count - 1)] } else { @() }
                $stories.Add(@{
                    id = "story-$storyIdx"
                    series = $seriesName
                    title = $title
                    filePath = $relPath
                    isGdoc = $false
                    paragraphs = $bodyLines
                })
            }
        }
    }
}

# 5. Parse Structured Attribute Handbook (亞雷利塔全屬性分類與個別介紹手冊.docx)
$attributeCategories = New-Object System.Collections.Generic.List[object]
$attrDocPath = Join-Path $rootPath "亞雷利塔設定文本\主要設定\亞雷利塔全屬性分類與個別介紹手冊.docx"
if (Test-Path $attrDocPath) {
    $attrBlocks = Get-DocxBlocks $attrDocPath
    $catIdx = 0
    $currentCatTitle = ""
    $currentCatDesc = ""
    foreach ($b in $attrBlocks) {
        if ($b.type -eq "p") {
            $t = $b.text.Trim()
            if ($t -match '^[一二三四五六七八九十]+、') {
                $currentCatTitle = $t
                $currentCatDesc = ""
            } elseif ($currentCatTitle -ne "" -and $currentCatDesc -eq "") {
                $currentCatDesc = $t
            }
        } elseif ($b.type -eq "table" -and $currentCatTitle -ne "") {
            $catIdx++
            $catId = "attr-cat-$catIdx"
            $items = New-Object System.Collections.Generic.List[object]
            for ($r = 1; $r -lt $b.rows.Count; $r++) {
                $row = $b.rows[$r]
                if ($row.Count -ge 2) {
                    $num = $row[0].Trim()
                    $aName = $row[1].Trim()
                    $aForm = ""
                    $aComp = ""
                    $aDesc = ""
                    if ($row.Count -eq 3) {
                        # 3 columns: 序號, 屬性名稱, 個別介紹 (手冊已無形態類型、構成要素)
                        $aDesc = $row[2].Trim()
                    } elseif ($row.Count -ge 4) {
                        # Fallback for legacy tables: 最後一欄為個別介紹
                        $aDesc = $row[$row.Count - 1].Trim()
                    }
                    if ($aName -ne "") {
                        $items.Add(@{
                            num = $num
                            name = $aName
                            formType = $aForm
                            components = $aComp
                            description = $aDesc
                            categoryId = $catId
                            categoryTitle = $currentCatTitle
                        })
                    }
                }
            }
            $attributeCategories.Add(@{
                id = $catId
                index = $catIdx
                title = $currentCatTitle
                description = $currentCatDesc
                items = $items
            })
            $currentCatTitle = ""
            $currentCatDesc = ""
        }
    }
}

$payload = @{
    generatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    characters = $characters
    lore = $loreDocs
    stories = $stories
    attributeCategories = $attributeCategories
}

$json = $payload | ConvertTo-Json -Depth 12 -Compress
$jsContent = "window.ARELITA_DATA = $json;"
[System.IO.File]::WriteAllText((Join-Path $rootPath "assets\data.js"), $jsContent, [System.Text.Encoding]::UTF8)

$withImg = ($characters | Where-Object { $_.image -ne $null }).Count
Write-Output "Successfully generated assets/data.js! Characters: $($characters.Count) (With Image: $withImg), Lore Docs: $($loreDocs.Count), Stories: $($stories.Count)"
