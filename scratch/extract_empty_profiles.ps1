Add-Type -AssemblyName System.IO.Compression.FileSystem

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

$allDocx = Get-ChildItem -Path "人設資料" -Recurse -Filter "*.docx"
$docMap = @{}
foreach ($f in $allDocx) {
    $docMap[$f.BaseName.Trim()] = $f.FullName
}

$batch1 = New-Object System.Text.StringBuilder
$batch2 = New-Object System.Text.StringBuilder
$batch3 = New-Object System.Text.StringBuilder

for ($i = 0; $i -lt $emptyNames.Count; $i++) {
    $name = $emptyNames[$i]
    $path = $docMap[$name]
    if (-not $path) {
        # Try fuzzy match
        foreach ($k in $docMap.Keys) {
            if ($k -replace '\s+','' -eq $name -replace '\s+','') {
                $path = $docMap[$k]
                break
            }
        }
    }
    
    $text = "FILE NOT FOUND"
    if ($path -and (Test-Path $path)) {
        $z = [System.IO.Compression.ZipFile]::OpenRead($path)
        $e = $z.GetEntry("word/document.xml")
        $sr = New-Object System.IO.StreamReader($e.Open())
        $xml = $sr.ReadToEnd()
        $sr.Close()
        $z.Dispose()
        $clean = [System.Text.RegularExpressions.Regex]::Replace($xml, '<[^>]+>', "`n")
        $lines = $clean -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
        $text = $lines -join "`n"
    }
    
    $entryStr = "========================================`r`n### [$($i+1)] $name ($path)`r`n========================================`r`n$text`r`n`r`n"
    if ($i -lt 24) {
        [void]$batch1.Append($entryStr)
    } elseif ($i -lt 48) {
        [void]$batch2.Append($entryStr)
    } else {
        [void]$batch3.Append($entryStr)
    }
}

$batch1.ToString() | Out-File "scratch/empty_profiles_batch1.txt" -Encoding UTF8
$batch2.ToString() | Out-File "scratch/empty_profiles_batch2.txt" -Encoding UTF8
$batch3.ToString() | Out-File "scratch/empty_profiles_batch3.txt" -Encoding UTF8
Write-Output "Extracted all 71 profiles into batch1, batch2, batch3."
