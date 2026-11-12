$content = [System.IO.File]::ReadAllText("assets/data.js", [System.Text.Encoding]::UTF8)
$prefix = "window.ARELITA_DATA = "
$json = $content.Substring($prefix.Length).TrimEnd(";", "`r", "`n", " ")
$obj = $json | ConvertFrom-Json
$chars = $obj.characters

$factions = $chars | Group-Object faction | Sort-Object Count -Descending

foreach ($f in $factions) {
    Write-Output "======================== $($f.Name) ($($f.Count)) ========================"
    $subGroups = $f.Group | Group-Object subFaction
    foreach ($sg in $subGroups) {
        $subName = if ($sg.Name) { $sg.Name } else { "未分類/本部" }
        Write-Output "  --- [$subName] ($($sg.Count)) ---"
        foreach ($c in $sg.Group) {
            Write-Output "    * $($c.name) | 稱號: $($c.profile.稱號) | 種族: $($c.profile.種族) | 強度: $($c.power)"
        }
    }
}
