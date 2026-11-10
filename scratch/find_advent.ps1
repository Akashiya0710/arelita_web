$content = [System.IO.File]::ReadAllText('assets/data.js', [System.Text.Encoding]::UTF8)
$pattern = '(?<=降臨級)[^"]*'
$matches = [regex]::Matches($content, '\{[^{}]*"name":"[^"]+"[^{}]*"降臨級"[^{}]*\}')
Write-Host "Found $($matches.Count) matches directly"

# Let's search for "維芙" or "萊夫" or "萊"
$tokens = @("維芙", "萊夫", "維", "芙")
foreach ($t in $tokens) {
    $idx = $content.IndexOf($t)
    Write-Host "Token $t index: $idx"
}
