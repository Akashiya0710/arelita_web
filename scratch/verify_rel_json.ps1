$txt = [System.IO.File]::ReadAllText("assets/relations_data.js", [System.Text.Encoding]::UTF8)
Write-Output "File size: $($txt.Length) bytes"
$prefix = "window.ARELITA_RELATIONS = "
if ($txt.StartsWith($prefix)) {
    $json = $txt.Substring($prefix.Length).TrimEnd(";", "`r", "`n", " ")
    $data = $json | ConvertFrom-Json
    Write-Output "Successfully parsed JSON! Nodes: $($data.nodes.Count), Links: $($data.links.Count)"
} else {
    Write-Output "Prefix mismatch!"
}
