$c = [System.IO.File]::ReadAllText("assets/data.js", [System.Text.Encoding]::UTF8)
$prefix = "window.ARELITA_DATA = "
$json = $c.Substring($prefix.Length).TrimEnd(";", "`r", "`n", " ")
$data = $json | ConvertFrom-Json
$chars = $data.characters
Write-Output "Total characters in data.js: $($chars.Count)"
for ($i=0; $i -lt $chars.Count; $i++) {
    if ($chars[$i].name -like "*清野*") {
        Write-Output "Found at index $i (id: $($chars[$i].id)): $($chars[$i].name)"
        Write-Output ($chars[$i] | ConvertTo-Json -Depth 3)
    }
}
