$json = Get-Content 'assets/data.js' -Raw -Encoding UTF8
$json = $json -replace '^window\.ARELITA_DATA\s*=\s*', '' -replace ';\s*$', ''
$data = $json | ConvertFrom-Json
$res = $data.characters | Group-Object power | Select-Object Name, Count | Sort-Object Count -Descending
$out = $res | ForEach-Object { "$($_.Name): $($_.Count)" }
[System.IO.File]::WriteAllLines("scratch/powers_utf8.txt", $out, [System.Text.Encoding]::UTF8)
