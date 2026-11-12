$content = [System.IO.File]::ReadAllText("assets/data.js", [System.Text.Encoding]::UTF8)
$prefix = "window.ARELITA_DATA = "
$json = $content.Substring($prefix.Length).TrimEnd(";", "`r", "`n", " ")
$data = $json | ConvertFrom-Json
$chars = $data.characters

Write-Output "Loaded $($chars.Count) characters."

# Verify clan / family assignment rules
$clans = @{
    "赤夜家族" = @("赤夜 風竹", "赤夜 花幽", "赤夜 終焉龍", "赤夜 千夜")
    "凱撒家族" = @("阿撒托斯 阿斯拉 凱撒", "艾娜托斯 阿斯拉 凱撒", "格赫羅 阿斯拉 凱撒", "安丁夏坦 阿斯拉 凱撒", "姵莉絲 阿斯拉 克里", "卡洛伊 阿斯拉 凱撒")
    "修羅一族" = @("雷風 克斯拉 修羅", "烈火 艾克斯 修羅", "烈心 艾克斯 修羅", "烈魂", "烈陽")
    "加拉爾王族" = @("炎火 加拉爾", "憂娜 加拉爾", "伊格那利昂 加拉爾")
    "撒旦魔神族" = @("別西卜 阿斯拉 撒旦", "路西法 阿斯拉 撒旦", "貝利爾 阿斯拉 撒旦", "索亞德 托斯卡 撒旦", "黑帝斯 阿斯拉 洛斯提亞")
    "尼達羅斯龍神族" = @("雷格納 尼達羅斯", "蘿希加勒美 尼達羅斯", "諾亞 尼達羅斯")
    "星野家族" = @("星野 蒼空", "星野 晴奈")
    "凌音家族" = @("凌音 凜", "凌音 澪")
    "白雪家族" = @("白雪 奏", "白雪 零", "白雪 悠", "白雪 千夏")
    "克斯拉神族" = @("米迦勒 克斯拉 戴因", "潘朵拉 克斯拉 神創", "雷風 克斯拉 修羅")
    "極真圃羈絆" = @("伊森塔爾", "約阿希姆 克羅斯", "艾維麗娜", "柔 芸", "瑪德萊特 贊恩斯", "夜川 海月", "蘿克莉絲 菲爾德 慕夏", "趙 望月")
    "銀狼七銀" = @("白川 咲", "傑瑞 吳 阿爾法", "卡德 貝利索")
    "寂靜之音三大福音" = @("賽西斯 詹納瓦茲", "雅希棋 艾比斯", "維璐緹雅")
    "世界賢者館魔女" = @("亞卓欣德 依娜", "安媞 娜德亞", "克勞蒂亞 法馮 莰蒂絲")
}

foreach ($cName in $clans.Keys) {
    Write-Output "Clan $cName has $($clans[$cName].Count) members defined"
}
