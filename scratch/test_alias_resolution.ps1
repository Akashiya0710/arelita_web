$lines = Get-Content "G:\我的雲端硬碟\亞雷利塔相關\scratch\all_current_docx_relations.txt" -Encoding UTF8

# Build list of 177 characters
$chars = @()
foreach ($l in $lines) {
    if ($l -match "^【(\d+)\.\s*(.+?)】") {
        $chars += [PSCustomObject]@{
            Num = $matches[1]
            Name = $matches[2].Trim()
            NoSpace = ($matches[2].Trim() -replace '\s+', '')
        }
    }
}

function Resolve-Char($token) {
    $t = $token.Trim()
    # Remove parenthetical notes like (德叔) or （淵蝕皇后）
    $tClean = ($t -replace '[\(（].*?[\)）]', '').Trim()
    $tNoSpace = $tClean -replace '\s+', ''
    if ([string]::IsNullOrEmpty($tNoSpace)) { return $null }

    # Exact match
    foreach ($c in $chars) {
        if ($c.Name -eq $tClean -or $c.NoSpace -eq $tNoSpace) { return $c }
    }
    # Alias / given-name / surname match
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
    }
    if ($aliases.ContainsKey($tClean)) {
        $mapped = $aliases[$tClean]
        foreach ($c in $chars) { if ($c.Name -eq $mapped) { return $c } }
    }
    if ($aliases.ContainsKey($tNoSpace)) {
        $mapped = $aliases[$tNoSpace]
        foreach ($c in $chars) { if ($c.Name -eq $mapped) { return $c } }
    }
    return $null
}

$cur = ""
$unmatched = @()
foreach ($l in $lines) {
    if ($l -match "^【(\d+)\.\s*(.+?)】") {
        $cur = $matches[2].Trim()
    } elseif ($l -match "^\s*\[(.+?)\]\s*=>\s*\[(.+?)\]") {
        $tRaw = $matches[1]
        $parts = $tRaw -split '[、,，]'
        foreach ($p in $parts) {
            $pClean = ($p -replace '等.*$', '').Trim()
            $m = Resolve-Char $pClean
            if (-not $m) {
                $unmatched += "$cur -> [$p] (from $tRaw)"
            }
        }
    }
}
Write-Output "Unmatched tokens (NPCs / Groups): $($unmatched.Count)"
$unmatched | Select-Object -Unique | ForEach-Object { Write-Output "  $_" }
