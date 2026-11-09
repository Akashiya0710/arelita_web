[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$json = Get-Content 'assets/data.json' -Raw -Encoding UTF8 | ConvertFrom-Json
foreach ($c in $json.characters) {
    if ($c.name -match '別西卜|撒旦|阿斯拉') {
        Write-Output "$($c.id) | $($c.name) | $($c.power) | $($c.race)"
    }
}
