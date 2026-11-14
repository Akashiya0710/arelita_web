$c = [System.IO.File]::ReadAllText("assets/data.js", [System.Text.Encoding]::UTF8)
$prefix = "window.ARELITA_DATA = "
$json = $c.Substring($prefix.Length).TrimEnd(";", "`r", "`n", " ")
$data = $json | ConvertFrom-Json

$emptyNames = @(
    "札克", "The Abyss", "阿姆狄亞茲 雷歐根", "黑帝斯 阿斯拉 洛斯提亞",
    "周燁", "安媞 娜德亞", "克勞蒂亞 法馮 莰蒂絲", "亞卓欣德 依娜", "德貢 阿茲拉格",
    "阿撒托斯 阿斯拉 凱撒", "索亞德 托斯卡 撒旦", "銀 塵夜",
    "有栖 櫻雪", "炎火 加拉爾", "姵莉絲 阿斯拉 克里", "哲也 和人", "納克 狄姆", "憂娜 加拉爾",
    "月夜", "寺山 夜明", "艾娜托斯 阿斯拉 凱撒", "赤夜 花幽", "傑瑞 吳 阿爾法",
    "千 維斯特利亞", "血羽 佛拉德", "凌音 凜", "凌音 澪", "蕾涅莉亞 妃葉斯",
    "月影 伊萊", "水無月 夜風", "白雪 悠", "旭翼", "百夜 奈", "祈奈 魁", "修莉雅", "鬼龍院 赫羿", "斯卡特 提拉", "黑羽 曉夜", "闇淤 加美羽", "櫻上 尹二",
    "不明（清水 若雨）", "村宮 早乙女", "烈火 阿斯拉 修羅", "趙 清夏", "織田 野寺", "櫻上 千夏",
    "星野 晴奈", "星野 蒼空", "冥藏 七翔",
    "田也 嵐心", "沈 憾", "阿爾希亞 斯諦 羅修斯", "蒂雅 歐斯拉 特蘿", "雷風 克斯拉 修羅", "羅 彌生",
    "天桐 艾", "天霞 克斯拉 寒光", "伏黑 夜", "倷德 歐斯拉 卡迦", "影之",
    "白川 咲", "蘿雅絲 瑟 阿爾法",
    "伊絲波 伽德", "西格德 尼達羅斯", "忻天 艾姆雷朵 薩恩", "李 榮", "芬里斯 白以格西", "雨宮 紗莉奈", "納多流士 格尼爾森",
    "芙拉達 莎德琺", "安丁夏坦 阿斯拉 凱撒"
)

$charMap = @{}
foreach ($ch in $data.characters) {
    $charMap[$ch.name.Trim()] = $ch
    $charMap[($ch.name -replace '\s+','')] = $ch
}

for ($b = 0; $b -lt 4; $b++) {
    $sb = New-Object System.Text.StringBuilder
    $start = $b * 18
    $end = [Math]::Min($start + 18, $emptyNames.Count)
    for ($i = $start; $i -lt $end; $i++) {
        $n = $emptyNames[$i]
        $ch = $charMap[$n]
        if (-not $ch) { $ch = $charMap[($n -replace '\s+','')] }
        [void]$sb.AppendLine("========================================")
        [void]$sb.AppendLine("### [$($i+1)] $n")
        if ($ch) {
            [void]$sb.AppendLine("Faction: $($ch.realm) / $($ch.faction) / $($ch.subFaction)")
            [void]$sb.AppendLine("Power: $($ch.power)")
            [void]$sb.AppendLine("Profile: $($ch.profile | ConvertTo-Json -Compress)")
            [void]$sb.AppendLine("Story:")
            [void]$sb.AppendLine($ch.story)
        } else {
            [void]$sb.AppendLine("NOT FOUND IN DATA.JS")
        }
        [void]$sb.AppendLine("")
    }
    $sb.ToString() | Out-File "scratch/fast_batch_$($b+1).txt" -Encoding UTF8
}
Write-Output "Done fast extraction into 4 batches!"
