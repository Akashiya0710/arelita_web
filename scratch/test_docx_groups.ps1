$content = [System.IO.File]::ReadAllText("assets/data.js", [System.Text.Encoding]::UTF8)
$prefix = "window.ARELITA_DATA = "
$json = $content.Substring($prefix.Length).TrimEnd(";", "`r", "`n", " ")
$data = $json | ConvertFrom-Json
$chars = $data.characters

Write-Output "Found $($chars.Count) characters in ARELITA_DATA."

# Group characters by Faction and Subfaction
$groups = $chars | Group-Object { "$($_.realm) / $($_.faction)" }
Write-Output "Total main groups: $($groups.Count)"
foreach ($g in $groups) {
    Write-Output "  - $($g.Name) ($($g.Count) chars)"
}
