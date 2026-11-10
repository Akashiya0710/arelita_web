$json = Get-Content 'assets/data.js' -Raw -Encoding UTF8
$json = $json -replace '^window\.ARELITA_DATA\s*=\s*', '' -replace ';\s*$', ''
$data = $json | ConvertFrom-Json
$powers = $data.characters | Group-Object power | Select-Object Name, Count | Sort-Object Count -Descending
$powers | Format-Table -AutoSize
