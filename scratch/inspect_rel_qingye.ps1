$c = [System.IO.File]::ReadAllText("assets/relations_data.js", [System.Text.Encoding]::UTF8)
$prefix = "window.ARELITA_RELATIONS_DATA = "
$json = $c.Substring($prefix.Length).TrimEnd(";", "`r", "`n", " ")
$data = $json | ConvertFrom-Json
Write-Output "Total nodes: $($data.nodes.Count)"
Write-Output "Total links: $($data.links.Count)"

$node = $data.nodes | Where-Object { $_.name -eq "清野 墨江" }
if ($node) {
    Write-Output "Node found: $($node.name), id: $($node.id)"
    $links = $data.links | Where-Object { $_.source -eq $node.id -or $_.target -eq $node.id }
    Write-Output "Links for 清野 墨江: $($links.Count)"
    foreach ($l in $links) {
        Write-Output ($l | ConvertTo-Json -Compress)
    }
} else {
    Write-Output "清野 墨江 NOT found in relations_data.js nodes!"
}
