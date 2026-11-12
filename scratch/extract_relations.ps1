$content = [System.IO.File]::ReadAllText("assets/data.js", [System.Text.Encoding]::UTF8)
$prefix = "window.ARELITA_DATA = "
$json = $content.Substring($prefix.Length).TrimEnd(";", "`r", "`n", " ")
$obj = $json | ConvertFrom-Json

$chars = $obj.characters
Write-Output "Total characters: $($chars.Count)"

# Let's collect all character names
$names = @($chars | ForEach-Object { $_.name })

# Find cross references in story or likes or dislikes
$relations = @()

foreach ($c in $chars) {
    $cName = $c.name
    $shortName = ($cName -split ' ')[0]
    
    # Text to search
    $text = "$($c.story) $($c.profile.喜歡) $($c.profile.討厭) $($c.profile.外表) $($c.profile.個性)"
    if ($c.abilities) {
        $text += " " + ($c.abilities | ForEach-Object { $_.content } | Out-String)
    }

    foreach ($other in $chars) {
        if ($other.id -eq $c.id) { continue }
        $oName = $other.name
        $oShort = ($oName -split ' ')[0]
        
        # Check full name or short name (if shortName length >= 2)
        $matched = $false
        if ($text.Contains($oName)) {
            $matched = $true
        } elseif ($oShort.Length -ge 2 -and $text.Contains($oShort)) {
            $matched = $true
        }
        
        if ($matched) {
            $relations += [PSCustomObject]@{
                From = $cName
                FromFaction = "$($c.realm)/$($c.faction)"
                To = $oName
                ToFaction = "$($other.realm)/$($other.faction)"
            }
        }
    }
}

Write-Output "Found raw text cross-references: $($relations.Count)"
$topConnected = $relations | Group-Object From | Sort-Object Count -Descending | Select-Object -First 15
Write-Output "Top 15 characters mentioning others:"
foreach ($t in $topConnected) {
    Write-Output "  $($t.Name): $($t.Count) mentions"
}
