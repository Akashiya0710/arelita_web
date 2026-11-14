$jsText = Get-Content "G:\我的雲端硬碟\亞雷利塔相關\assets\relations_data.js" -Raw -Encoding UTF8
$jsonStart = $jsText.IndexOf("{")
$jsonStr = $jsText.Substring($jsonStart).TrimEnd()
if ($jsonStr.EndsWith(";")) { $jsonStr = $jsonStr.Substring(0, $jsonStr.Length - 1) }
$parsed = $jsonStr | ConvertFrom-Json
Write-Output "Valid JSON! Characters: $($parsed.totalCharacters), Links: $($parsed.totalRelationships)"
