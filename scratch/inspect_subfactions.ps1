$content = [System.IO.File]::ReadAllText("assets/data.js", [System.Text.Encoding]::UTF8)
$prefix = "window.ARELITA_DATA = "
$json = $content.Substring($prefix.Length).TrimEnd(";", "`r", "`n", " ")
$data = $json | ConvertFrom-Json
$chars = $data.characters

$groups = $chars | Group-Object { "$($_.faction) / $($_.subFaction)" }
foreach ($g in $groups) {
    $names = ($g.Group | ForEach-Object { $_.name }) -join ", "
    Write-Output "[$($g.Name)] ($($g.Count)): $names"
}
