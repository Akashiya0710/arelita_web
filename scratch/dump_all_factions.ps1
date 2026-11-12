$content = [System.IO.File]::ReadAllText("assets/data.js", [System.Text.Encoding]::UTF8)
$prefix = "window.ARELITA_DATA = "
$json = $content.Substring($prefix.Length).TrimEnd(";", "`r", "`n", " ")
$obj = $json | ConvertFrom-Json
$chars = $obj.characters

Write-Output "Examining all $($chars.Count) characters for specific relations..."

$charInfo = @{}
foreach ($c in $chars) {
    $charInfo[$c.name] = @{
        id = $c.id
        name = $c.name
        realm = $c.realm
        faction = $c.faction
        subFaction = $c.subFaction
        title = $c.profile.稱號
        group = $c.profile.群體
        likes = $c.profile.喜歡
        dislikes = $c.profile.討厭
        story = $c.story
        identities = $c.identities
        power = $c.power
        image = $c.image
        race = $c.profile.種族
        gender = $c.profile.性別
        alignment = $c.profile.善惡
    }
}

# Output count of characters per faction
$summary = $chars | Group-Object faction | Sort-Object Count -Descending
foreach ($s in $summary) {
    Write-Output "$($s.Name): $($s.Count)"
}
