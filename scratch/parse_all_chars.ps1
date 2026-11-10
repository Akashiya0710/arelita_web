$bytes = [System.IO.File]::ReadAllBytes('assets/data.js')
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

# Strip "window.ARELITA_DATA = " and trailing semicolon
$jsonStr = $content.Trim()
if ($jsonStr.StartsWith("window.ARELITA_DATA =")) {
    $jsonStr = $jsonStr.Substring("window.ARELITA_DATA =".Length).Trim()
}
if ($jsonStr.EndsWith(";")) {
    $jsonStr = $jsonStr.Substring(0, $jsonStr.Length - 1).Trim()
}

$data = $jsonStr | ConvertFrom-Json
Write-Host "Total characters: $($data.characters.Count)"

# Output characters that have "降臨級" or names matching user request
foreach ($c in $data.characters) {
    if ($c.power -eq "降臨級" -or $c.name -like "*維芙*" -or $c.name -like "*萊*" -or $c.name -like "*芙*") {
        Write-Host "$($c.id): $($c.name) | Power: $($c.power) | Epithet: $($c.profile.'稱號')"
    }
}
