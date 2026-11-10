$bytes = [System.IO.File]::ReadAllBytes('assets/data.js')
$content = [System.Text.Encoding]::UTF8.GetString($bytes)
$firstBrace = $content.IndexOf('{')
$lastBrace = $content.LastIndexOf('}')
$jsonStr = $content.Substring($firstBrace, $lastBrace - $firstBrace + 1)
$data = $jsonStr | ConvertFrom-Json

$c21 = $data.characters | Where-Object { $_.id -eq "char-21" }
$json21 = $c21 | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText("scratch/char21.json", $json21, [System.Text.Encoding]::UTF8)
Write-Host "Saved char21.json"
