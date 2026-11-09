$json = Get-Content 'assets/data.json' -Raw -Encoding UTF8 | ConvertFrom-Json
$b = [System.Text.Encoding]::UTF8.GetBytes([char]0x5225 + [char]0x897F + [char]0x535C) # 別西卜
$beelzebub = [System.Text.Encoding]::UTF8.GetString($b)
$asura = [System.Text.Encoding]::UTF8.GetString([System.Text.Encoding]::UTF8.GetBytes([char]0x963F + [char]0x65AF + [char]0x62C9)) # 阿斯拉
$satan = [System.Text.Encoding]::UTF8.GetString([System.Text.Encoding]::UTF8.GetBytes([char]0x6495 + [char]0x65E6)) # 撒旦

Write-Output "Searching for: $beelzebub, $asura, $satan"
foreach ($c in $json.characters) {
    if ($c.name.Contains($beelzebub) -or $c.name.Contains($asura) -or $c.name.Contains($satan)) {
        Write-Output "$($c.id) | $($c.name) | $($c.power)"
    }
}
