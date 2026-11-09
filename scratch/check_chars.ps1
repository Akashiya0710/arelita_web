$content = [System.IO.File]::ReadAllText("$PSScriptRoot\..\assets\data.js", [System.Text.Encoding]::UTF8)
$jsonStr = $content.Substring($content.IndexOf('{'))
$data = ConvertFrom-Json $jsonStr
$beelzebubChar = [char]0x5225 + [char]0x897F + [char]0x535C # 別西卜
$asuraChar = [char]0x963F + [char]0x65AF + [char]0x62C9 # 阿斯拉
$satanChar = [char]0x6495 + [char]0x65E6 # 撒旦

Write-Output "=== Matching Characters ==="
foreach ($c in $data.characters) {
    $hasB = $c.name.IndexOf($beelzebubChar) -ge 0
    $hasA = $c.name.IndexOf($asuraChar) -ge 0
    $hasS = $c.name.IndexOf($satanChar) -ge 0
    if ($hasB -or $hasA -or $hasS) {
        Write-Output "$($c.id) | $($c.name) | $($c.power) | $($c.realm)"
    }
}
