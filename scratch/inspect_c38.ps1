$bytes = [System.IO.File]::ReadAllBytes('assets/data.js')
$content = [System.Text.Encoding]::UTF8.GetString($bytes)
$firstBrace = $content.IndexOf('{')
$lastBrace = $content.LastIndexOf('}')
$jsonStr = $content.Substring($firstBrace, $lastBrace - $firstBrace + 1)
$data = $jsonStr | ConvertFrom-Json

$c38 = $data.characters | Where-Object { $_.id -eq "char-38" }
$json38 = $c38 | ConvertTo-Json -Depth 6
[System.IO.File]::WriteAllText("scratch/char38.json", $json38, [System.Text.Encoding]::UTF8)
Write-Host "Saved char38.json"
