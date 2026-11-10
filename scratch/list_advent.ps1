$bytes = [System.IO.File]::ReadAllBytes('assets/data.js')
$content = [System.Text.Encoding]::UTF8.GetString($bytes)
$first500 = $content.Substring(0, [Math]::Min(1000, $content.Length))
Write-Host $first500

$keys = [regex]::Matches($content, '"([a-zA-Z0-9_]+)":\[')
foreach ($k in $keys) {
    Write-Host "Top array key: $($k.Groups[1].Value)"
}
