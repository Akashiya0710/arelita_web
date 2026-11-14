Add-Type -AssemblyName System.IO.Compression.FileSystem

$jsPath = "G:\我的雲端硬碟\亞雷利塔相關\assets\relations_data.js"
$jsText = Get-Content $jsPath -Raw -Encoding UTF8
$jsonStart = $jsText.IndexOf("{")
$jsonStr = $jsText.Substring($jsonStart).TrimEnd()
if ($jsonStr.EndsWith(";")) { $jsonStr = $jsonStr.Substring(0, $jsonStr.Length - 1) }
$oldData = $jsonStr | ConvertFrom-Json

$oldNodeByName = @{}
foreach ($n in $oldData.nodes) {
    $cleanName = $n.name.Replace('"', '').Replace('~~', '').Trim()
    $oldNodeByName[$cleanName] = $n
    $oldNodeByName[($cleanName -replace '\s+', '')] = $n
}

$docxPath = "G:\我的雲端硬碟\亞雷利塔相關\亞雷利塔全角色關係填寫手冊.docx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($docxPath)
$entry = $zip.GetEntry("word/document.xml")
$sr = New-Object System.IO.StreamReader($entry.Open(), [System.Text.Encoding]::UTF8)
$xmlContent = $sr.ReadToEnd()
$sr.Close()
$zip.Dispose()

$xmlDoc = New-Object System.Xml.XmlDocument
$xmlDoc.PreserveWhitespace = $true
$xmlDoc.LoadXml($xmlContent)
$ns = New-Object System.Xml.XmlNamespaceManager($xmlDoc.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$body = $xmlDoc.SelectSingleNode("//w:body", $ns)
$children = $body.ChildNodes

$docxChars = @()
$curChar = $null

for ($i = 0; $i -lt $children.Count; $i++) {
    $node = $children[$i]
    if ($node.Name -eq "w:p") {
        $pText = $node.InnerText.Trim()
        if ($pText -match "^【(\d+)\.\s*(.+?)】$") {
            $numStr = $matches[1]
            $cName = $matches[2].Trim()
            $curChar = [PSCustomObject]@{
                num = $numStr
                numInt = [int]$numStr
                id = "char-" + [int]$numStr
                name = $cName
                gender = ""
                age = ""
                factionPath = ""
                tblNode = $null
                rawRows = @()
            }
            $docxChars += $curChar
        } elseif ($curChar -and $pText -match "性別：(.*?)｜\s*年齡：(.*?)｜\s*陣營：(.*)$") {
            $curChar.gender = $matches[1].Trim()
            $curChar.age = $matches[2].Trim()
            $curChar.factionPath = $matches[3].Trim()
        }
    } elseif ($node.Name -eq "w:tbl" -and $curChar) {
        $curChar.tblNode = $node
        $trs = $node.SelectNodes(".//w:tr", $ns)
        for ($r = 1; $r -lt $trs.Count; $r++) {
            $tcs = $trs[$r].SelectNodes(".//w:tc", $ns)
            if ($tcs.Count -ge 2) {
                $c1 = $tcs[0].InnerText.Trim()
                $c2 = $tcs[1].InnerText.Trim()
                if ($c1 -ne "" -or $c2 -ne "") {
                    $curChar.rawRows += [PSCustomObject]@{
                        target = $c1
                        desc = $c2
                    }
                }
            }
        }
        $curChar = $null
    }
}

$charByName = @{}
$charByNoSpace = @{}
$charByNum = @{}
foreach ($dc in $docxChars) {
    $charByName[$dc.name] = $dc
    $charByNoSpace[($dc.name -replace '\s+', '')] = $dc
    $charByNum[$dc.numInt] = $dc
}

$aliases = @{
    "米迦勒" = "米迦勒 克斯拉 戴因"
    "多拉格" = "多拉格"
    "奧伯龍" = "奧伯龍"
    "約阿希姆" = "約阿希姆 克羅斯"
    "瑟蕾絲緹雅" = "瑟蕾絲緹雅 阿爾比恩"
    "維奧萊塔" = "維奧萊塔 桑托斯特法諾"
    "黑卡蒂" = "黑卡蒂 拉普拉斯"
    "拉格提斯" = "拉格 提斯"
    "炎火" = "炎火 加拉爾"
    "憂娜" = "憂娜 加拉爾"
    "凱" = "凱 加拉爾"
    "希德恩" = "希德恩 阿斯拉 加拉爾"
    "白川咲" = "白川 咲"
    "賽特" = "賽特 伊斐爾"
    "尤諾拉" = "尤諾拉 倪克斯"
    "迪米諾拉" = "迪米諾拉 赫墨拉"
    "夜風" = "水無月 夜風"
    "伊萊" = "月影 伊萊"
    "雨宮紗莉奈" = "雨宮 紗莉奈"
    "凜子" = "凜子 歐斯拉 時空"
    "福玻斯" = "福玻斯 里拉 阿斯克勒"
    "阿斯克勒" = "福玻斯 里拉 阿斯克勒"
    "別西卜" = "別西卜 阿斯拉 撒旦"
    "路西法" = "路西法 阿斯拉 撒旦"
    "貝利爾" = "貝利爾 阿斯拉 撒旦"
    "雷風" = "雷風 克斯拉 修羅"
    "烈火" = "烈火 阿斯拉 修羅"
    "索亞德" = "索亞德 托斯卡 撒旦"
    "阿撒托斯" = "阿撒托斯 阿斯拉 凱撒"
    "蒂雅" = "蒂雅 歐斯拉 特蘿"
    "伊斯里" = "伊斯里 歐斯拉 特蘿"
    "克羅" = "克羅 歐斯拉 甘尼"
    "瑪德萊特" = "塞西莉雅 瑪德萊特"
    "蘿克莉絲" = "蘿克莉絲 菲爾德 慕夏"
    "清水若雨" = "不明（清水 若雨）"
    "清水 若雨" = "不明（清水 若雨）"
    "歐爾克" = "歐爾克 比斯特"
    "萊芙維夫" = "萊夫維芙"
    "亞卓欣德" = "亞卓欣德 依娜"
    "札維爾" = "札維爾 斯戴拉"
    "維璐緹雅" = "維璐緹雅"
    "雅希棋" = "雅希棋 艾比斯"
    "賽西斯" = "賽西斯 詹納瓦茲"
    "德菈" = "德菈 貝西卡"
    "奎札爾" = "奎札爾 阿斯拉 密涅瓦"
    "艾琳絲塔希" = "艾琳絲塔希 康多拉"
    "艾琳" = "艾琳絲塔希 康多拉"
    "戴斯奇" = "戴斯奇 歐金金"
    "剋雷希" = "剋雷希 傑克"
    "闇淤" = "闇淤 加美羽"
    "艾娜托斯" = "艾娜托斯 阿斯拉 凱撒"
    "沃爾" = "沃爾 普希多雷得"
    "沃爾 普希多雷德" = "沃爾 普希多雷得"
    "開勒" = "開勒 斯德里"
    "忻天" = "忻天 艾姆雷朵 薩恩"
    "雷格納" = "雷格納 尼達羅斯"
    "芬里斯" = "芬里斯 白以格西"
    "克蘭努克" = "克蘭努克 歐塔"
    "青黎" = "青 黎"
    "莎布西絲" = "莎布西絲 貝西卡"
    "格赫羅" = "格赫羅 阿斯拉 凱撒"
    "涅米蘿伊" = "涅米蘿伊 贊恩斯"
    "涅米" = "涅米蘿伊 贊恩斯"
    "姵莉絲" = "姵莉絲 阿斯拉 克里"
    "潘朵拉" = "潘朵拉 克斯拉 神創"
    "卡德 貝利索" = "卡德 貝利索"
    "蕾涅莉亞" = "蕾涅莉亞 妃葉斯"
    "阿爾希亞" = "阿爾希亞 斯諦 羅修斯"
    "倷德" = "倷德 歐斯拉 卡迦"
    "蘿雅絲" = "蘿雅絲 瑟 阿爾法"
    "伊絲波" = "伊絲波 伽德"
    "西格德" = "西格德 尼達羅斯"
    "納多流士" = "納多流士 格尼爾森"
    "蘿希加勒美" = "蘿希加勒美 尼達羅斯"
    "法夫納" = "法夫納"
}

function Resolve-SingleToken($token) {
    $t = $token.Trim()
    if ([string]::IsNullOrEmpty($t)) { return $null }
    $tNoSpace = $t -replace '\s+', ''
    if ($charByName.ContainsKey($t)) { return $charByName[$t] }
    if ($charByNoSpace.ContainsKey($tNoSpace)) { return $charByNoSpace[$tNoSpace] }
    if ($aliases.ContainsKey($t) -and $charByName.ContainsKey($aliases[$t])) { return $charByName[$aliases[$t]] }
    if ($aliases.ContainsKey($tNoSpace) -and $charByName.ContainsKey($aliases[$tNoSpace])) { return $charByName[$aliases[$tNoSpace]] }
    $tClean = ($t -replace '[\(（].*?[\)）]', '').Trim()
    $tCleanNoSpace = $tClean -replace '\s+', ''
    if ($tClean -ne "" -and $charByName.ContainsKey($tClean)) { return $charByName[$tClean] }
    if ($tCleanNoSpace -ne "" -and $charByNoSpace.ContainsKey($tCleanNoSpace)) { return $charByNoSpace[$tCleanNoSpace] }
    if ($tClean -ne "" -and $aliases.ContainsKey($tClean) -and $charByName.ContainsKey($aliases[$tClean])) { return $charByName[$aliases[$tClean]] }
    if ($tCleanNoSpace -ne "" -and $aliases.ContainsKey($tCleanNoSpace) -and $charByName.ContainsKey($aliases[$tCleanNoSpace])) { return $charByName[$aliases[$tCleanNoSpace]] }
    return $null
}

function Expand-RowTargets($ownerChar, $rawTarget, $desc) {
    $results = @()
    $t = $rawTarget.Trim()

    # Group 1: 其他原初龍神 (26..30)
    if ($t -eq "其他原初龍神") {
        foreach ($num in 26..30) {
            if ($num -ne $ownerChar.numInt) {
                $c = $charByNum[$num]
                $results += [PSCustomObject]@{ char = $c; name = $c.name; desc = $desc }
            }
        }
        return $results
    }

    # Group 2: 其他兩位原初魔神 (32, 33, 35)
    if ($t -eq "其他兩位原初魔神") {
        foreach ($num in @(32, 33, 35)) {
            if ($num -ne $ownerChar.numInt) {
                $c = $charByNum[$num]
                $results += [PSCustomObject]@{ char = $c; name = $c.name; desc = $desc }
            }
        }
        return $results
    }

    # Group 3: 其他具有凱撒姓氏的惡魔族 (104, 111, 122, 177)
    if ($t -eq "其他具有凱撒姓氏的惡魔族") {
        foreach ($num in @(104, 111, 122, 177)) {
            if ($num -ne $ownerChar.numInt) {
                $c = $charByNum[$num]
                $results += [PSCustomObject]@{ char = $c; name = $c.name; desc = $desc }
            }
        }
        return $results
    }

    # Group 4: 所有天災成員 (39..46)
    if ($t -eq "所有天災成員") {
        foreach ($num in 39..46) {
            if ($num -ne $ownerChar.numInt) {
                $c = $charByNum[$num]
                $results += [PSCustomObject]@{ char = $c; name = $c.name; desc = $desc }
            }
        }
        return $results
    }

    # Group 5: 極真圃其他成員 / 極真圃其他眾人 (67..72)
    if ($t -match "極真圃其他") {
        foreach ($num in 67..72) {
            if ($num -ne $ownerChar.numInt) {
                $c = $charByNum[$num]
                $results += [PSCustomObject]@{ char = $c; name = $c.name; desc = $desc }
            }
        }
        return $results
    }

    # Group 6: 新世生命教成員 (64..66)
    if ($t -eq "新世生命教成員") {
        foreach ($num in 64..66) {
            if ($num -ne $ownerChar.numInt) {
                $c = $charByNum[$num]
                $results += [PSCustomObject]@{ char = $c; name = $c.name; desc = $desc }
            }
        }
        return $results
    }

    # Group 7: 所有銀狼傭兵公會成員 (73..82)
    if ($t -eq "所有銀狼傭兵公會成員") {
        foreach ($num in 73..82) {
            if ($num -ne $ownerChar.numInt) {
                $c = $charByNum[$num]
                $results += [PSCustomObject]@{ char = $c; name = $c.name; desc = $desc }
            }
        }
        return $results
    }

    # Group 8: 冥府神傑 (101..109)
    if ($t -match "冥府神傑") {
        foreach ($num in 101..109) {
            if ($num -ne $ownerChar.numInt) {
                $c = $charByNum[$num]
                $results += [PSCustomObject]@{ char = $c; name = $c.name; desc = $desc }
            }
        }
        return $results
    }

    if ($t -eq "初代三魔神") {
        foreach ($num in @(32, 33, 35)) {
            $c = $charByNum[$num]
            $results += [PSCustomObject]@{ char = $c; name = $c.name; desc = $desc }
        }
        return $results
    }

    if ($t -eq "具有赤夜姓氏之人") {
        foreach ($num in @(110, 123)) {
            $c = $charByNum[$num]
            $results += [PSCustomObject]@{ char = $c; name = $c.name; desc = $desc }
        }
        return $results
    }

    if ($t -eq "雷格納 尼達羅斯尼達羅斯") {
        $c = $charByNum[175]
        $results += [PSCustomObject]@{ char = $c; name = $c.name; desc = $desc }
        return $results
    }

    if ($t -eq "索亞德 托斯卡 撒旦炎火、憂娜") {
        foreach ($num in @(112, 115, 119)) {
            $c = $charByNum[$num]
            $results += [PSCustomObject]@{ char = $c; name = $c.name; desc = $desc }
        }
        return $results
    }

    # Group 9: 其餘潔白協奏成員 (162..166)
    if ($t -eq "其餘潔白協奏成員") {
        foreach ($num in 162..166) {
            if ($num -ne $ownerChar.numInt) {
                $c = $charByNum[$num]
                $results += [PSCustomObject]@{ char = $c; name = $c.name; desc = $desc }
            }
        }
        return $results
    }

    # Group 10: 夜妖部隊成員 or "...等夜妖成員" / "...及夜妖成員" (130..141)
    if ($t -match "夜妖(部隊)?成員") {
        # First extract any explicit names before 等/及
        $prefix = ($t -replace '(等|及)?夜妖(部隊)?成員.*$', '').Trim()
        if ($prefix -ne "") {
            $subTokens = $prefix -split '[、,，]|及'
            foreach ($st in $subTokens) {
                $rc = Resolve-SingleToken $st
                if ($rc -and $rc.numInt -ne $ownerChar.numInt) {
                    $results += [PSCustomObject]@{ char = $rc; name = $rc.name; desc = $desc }
                }
            }
        }
        foreach ($num in 130..141) {
            if ($num -ne $ownerChar.numInt) {
                $c = $charByNum[$num]
                $results += [PSCustomObject]@{ char = $c; name = $c.name; desc = $desc }
            }
        }
        return $results
    }

    # Special case: 戴斯奇 歐金金、新世生命教 -> expand 新世生命教 into 64, 65, 66
    if ($t -eq "戴斯奇 歐金金、新世生命教") {
        foreach ($num in @(66, 64, 65)) {
            $c = $charByNum[$num]
            $results += [PSCustomObject]@{ char = $c; name = $c.name; desc = $desc }
        }
        return $results
    }

    # Special case: 沃爾 普希多雷得、銀狼傭兵公會 -> expand into 沃爾 普希多雷得 + 開勒 斯德里
    if ($t -eq "沃爾 普希多雷得、銀狼傭兵公會") {
        foreach ($num in @(81, 82)) {
            $c = $charByNum[$num]
            $results += [PSCustomObject]@{ char = $c; name = $c.name; desc = $desc }
        }
        return $results
    }

    # Standard comma / dunhao separated list
    if ($t -match '[、,，]') {
        $tokens = $t -split '[、,，]'
        foreach ($tok in $tokens) {
            $cleanTok = $tok.Trim()
            if ($cleanTok -eq "") { continue }
            $rc = Resolve-SingleToken $cleanTok
            if ($rc) {
                $results += [PSCustomObject]@{ char = $rc; name = $rc.name; desc = $desc }
            } else {
                $results += [PSCustomObject]@{ char = $null; name = $cleanTok; desc = $desc }
            }
        }
        return $results
    }

    # Single target
    $singleRc = Resolve-SingleToken $t
    if ($singleRc) {
        $results += [PSCustomObject]@{ char = $singleRc; name = $singleRc.name; desc = $desc }
    } else {
        $results += [PSCustomObject]@{ char = $null; name = $t; desc = $desc }
    }
    return $results
}

function Set-CellText($tc, $text) {
    $p = $tc.SelectSingleNode(".//w:p", $ns)
    if (-not $p) { return }
    $runs = $p.SelectNodes(".//w:r", $ns)
    if ($runs.Count -gt 0) {
        $firstRun = $runs[0]
        for ($k = $runs.Count - 1; $k -ge 1; $k--) {
            [void]$runs[$k].ParentNode.RemoveChild($runs[$k])
        }
        $rPr = $firstRun.SelectSingleNode("w:rPr", $ns)
        if ($rPr) {
            $colorNode = $rPr.SelectSingleNode("w:color", $ns)
            if ($colorNode) { [void]$rPr.RemoveChild($colorNode) }
        }
        $tNode = $firstRun.SelectSingleNode("w:t", $ns)
        if (-not $tNode) {
            $tNode = $xmlDoc.CreateElement("w", "t", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
            [void]$firstRun.AppendChild($tNode)
        }
        $tNode.InnerText = $text
    } else {
        $rNode = $xmlDoc.CreateElement("w", "r", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
        $tNode = $xmlDoc.CreateElement("w", "t", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
        $tNode.InnerText = $text
        [void]$rNode.AppendChild($tNode)
        [void]$p.AppendChild($rNode)
    }
}

function Classify-RelType($desc, $targetText) {
    $d = $desc + " " + $targetText
    if ($d -match "戀人|夫妻|伴侶|喜歡|暗戀|單戀|摯愛|曖昧|結婚|情敵|深愛") { return "romance" }
    if ($d -match "哥哥|弟弟|姐姐|妹妹|雙胞胎|父親|母親|雙親|父母|養父|養母|養女|女兒|兒子|後代|祖先|先祖|始祖|親戚|堂哥|堂弟|堂妹|堂兄|姪女|太爺爺|嫂子|義兄|義妹|義姐|創造者|創造主|造物|轉世|親生") { return "family" }
    if ($d -match "仇|死敵|宿敵|敵人|對手|擊殺|殺死|殺害|戰敗|手下敗將|被.*擊敗|討厭|不對盤|不太喜歡|欺騙|實驗體|彼此對立|背叛") { return "rival" }
    if ($d -match "師父|師傅|徒弟|恩師|導師|學生|傳授|授業|神言|賜予|賦予|救命恩人|大恩人|恩人|挖掘|引薦|推薦|伯樂|神格傳承|庇佑") { return "master" }
    if ($d -match "上司|下屬|部下|主公|主人|忠臣|君主|總司令|最高統帥|大將軍|將軍|副將軍|隊長|老大|秘書|管家|眷屬|效忠|追隨") { return "superior" }
    if ($d -match "摯友|好友|朋友|盟友|同盟|合作|酒友|棋友|飯友|知己|同行者|媒婆") { return "ally" }
    if ($d -match "同事|同僚|戰友|搭檔|夥伴|同袍|同學|同期|前輩|後輩") { return "comrade" }
    return "ally"
}

$typeLabels = @{
    "romance"  = "戀愛羈絆"
    "family"   = "血緣親族"
    "rival"    = "宿敵對立"
    "master"   = "師恩傳承"
    "superior" = "主從統御"
    "ally"     = "摯友同盟"
    "comrade"  = "同袍戰友"
}

$finalNodes = @()

foreach ($dc in $docxChars) {
    $expandedList = @()
    $seenTargets = @{}

    foreach ($r in $dc.rawRows) {
        $items = Expand-RowTargets $dc $r.target $r.desc
        foreach ($item in $items) {
            $dedupKey = if ($item.char) { $item.char.id } else { $item.name }
            if (-not $seenTargets.ContainsKey($dedupKey)) {
                $seenTargets[$dedupKey] = $item
                $expandedList += $item
            } else {
                # Merge description if different
                $existing = $seenTargets[$dedupKey]
                if ($item.desc -and -not $existing.desc.Contains($item.desc)) {
                    $existing.desc = $existing.desc + "；" + $item.desc
                }
            }
        }
    }

    # Update Word table rows for this character
    $tbl = $dc.tblNode
    if ($tbl) {
        $trs = $tbl.SelectNodes(".//w:tr", $ns)
        $templateTr = $trs[$trs.Count - 1]
        $neededDataRows = [Math]::Max(15, $expandedList.Count)
        $currentDataRows = $trs.Count - 1

        while ($currentDataRows -lt $neededDataRows) {
            $clonedTr = $templateTr.CloneNode($true)
            [void]$tbl.AppendChild($clonedTr)
            $currentDataRows++
        }

        $allTrs = $tbl.SelectNodes(".//w:tr", $ns)
        for ($rIdx = 1; $rIdx -lt $allTrs.Count; $rIdx++) {
            $tcs = $allTrs[$rIdx].SelectNodes(".//w:tc", $ns)
            if ($tcs.Count -ge 2) {
                $itemIdx = $rIdx - 1
                if ($itemIdx -lt $expandedList.Count) {
                    Set-CellText $tcs[0] $expandedList[$itemIdx].name
                    Set-CellText $tcs[1] $expandedList[$itemIdx].desc
                } else {
                    Set-CellText $tcs[0] ""
                    Set-CellText $tcs[1] ""
                }
            }
        }
    }

    # Build node for relations_data.js
    $old = $oldNodeByName[$dc.name]
    if (-not $old) { $old = $oldNodeByName[($dc.name -replace '\s+', '')] }

    $parts = $dc.factionPath -split '\s*/\s*'
    $realm = if ($parts.Count -ge 1) { $parts[0] } else { "現界" }
    $faction = if ($parts.Count -ge 2) { $parts[1] } else { $realm }
    $subFaction = if ($parts.Count -ge 3) { ($parts[2..($parts.Count - 1)] -join " / ") } else { "" }

    $title = if ($old -and $old.title) { $old.title } else { "" }
    $power = if ($old -and $old.power) { $old.power } else { "未知" }
    $race = if ($old -and $old.race) { $old.race } else { "未知" }
    $alignment = if ($old -and $old.alignment) { $old.alignment } else { "中立" }
    $story = if ($old -and $old.story) { $old.story } else { "" }
    $likes = if ($old -and $old.likes) { $old.likes } else { "" }
    $dislikes = if ($old -and $old.dislikes) { $old.dislikes } else { "" }
    $image = if ($old -and $old.image) { $old.image } else { $null }

    $relObjects = @()
    foreach ($item in $expandedList) {
        $rType = Classify-RelType $item.desc $item.name
        $rLabel = $typeLabels[$rType]
        $relObjects += [PSCustomObject]@{
            targetId = if ($item.char) { $item.char.id } else { $null }
            targetName = $item.name
            rawTarget = $item.name
            type = $rType
            label = $rLabel
            desc = $item.desc
            isNpc = ($null -eq $item.char)
            subTargets = @()
        }
    }

    $finalNodes += [PSCustomObject]@{
        id = $dc.id
        num = $dc.num
        name = $dc.name
        realm = $realm
        faction = $faction
        subFaction = $subFaction
        factionPath = $dc.factionPath
        title = $title
        power = $power
        race = $race
        gender = $dc.gender
        age = $dc.age
        alignment = $alignment
        image = $image
        story = $story
        likes = $likes
        dislikes = $dislikes
        relations = $relObjects
    }
}

# Save updated XML back into 亞雷利塔全角色關係填寫手冊.docx
$zipWrite = [System.IO.Compression.ZipFile]::Open($docxPath, [System.IO.Compression.ZipArchiveMode]::Update)
$oldEntry = $zipWrite.GetEntry("word/document.xml")
$oldEntry.Delete()
$newEntry = $zipWrite.CreateEntry("word/document.xml")
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$sw = New-Object System.IO.StreamWriter($newEntry.Open(), $utf8NoBom)
$xmlDoc.Save($sw)
$sw.Flush()
$sw.Close()
$zipWrite.Dispose()
Write-Output "Updated Word file: $docxPath"

# Build global links and write assets/relations_data.js
$globalLinks = @()
$seenLinkKeys = @{}
foreach ($fn in $finalNodes) {
    foreach ($rel in $fn.relations) {
        if ($rel.targetId) {
            $key = "$($fn.id)->$($rel.targetId):$($rel.desc)"
            if (-not $seenLinkKeys.ContainsKey($key)) {
                $seenLinkKeys[$key] = $true
                $globalLinks += [PSCustomObject]@{
                    source = $fn.id
                    sourceName = $fn.name
                    target = $rel.targetId
                    targetName = $rel.targetName
                    type = $rel.type
                    label = $rel.label
                    desc = $rel.desc
                }
            }
        }
    }
}

$outputObj = [ordered]@{
    generatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    totalCharacters = $finalNodes.Count
    totalRelationships = $globalLinks.Count
    nodes = $finalNodes
    links = $globalLinks
}

$jsonOut = $outputObj | ConvertTo-Json -Depth 8
$jsContent = "window.ARELITA_RELATIONS = window.ARELITA_RELATIONS_DATA = " + $jsonOut + ";`n"
[System.IO.File]::WriteAllText($jsPath, $jsContent, $utf8NoBom)
Write-Output "Updated JS file: $jsPath (Total links: $($globalLinks.Count))"
