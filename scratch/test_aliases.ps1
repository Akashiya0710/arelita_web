$content = [System.IO.File]::ReadAllText("assets/data.js", [System.Text.Encoding]::UTF8)
$prefix = "window.ARELITA_DATA = "
$json = $content.Substring($prefix.Length).TrimEnd(";", "`r", "`n", " ")
$obj = $json | ConvertFrom-Json
$chars = $obj.characters

# Build an alias mapping for characters
# e.g. "赤夜 風竹" -> ["赤夜風竹", "赤夜 風竹", "風竹"]
# "雷風 克斯拉 修羅" -> ["雷風 克斯拉 修羅", "雷風", "神雷將軍"]
# "烈火 艾克斯 修羅" -> ["烈火 艾克斯 修羅", "烈火", "不破將軍"]
# "阿撒托斯 阿斯拉 凱撒" -> ["阿撒托斯 阿斯拉 凱撒", "阿撒托斯"]

$charList = @()
foreach ($c in $chars) {
    $aliases = [System.Collections.Generic.List[string]]::new()
    $aliases.Add($c.name)
    $cleanName = $c.name.Replace(" ", "")
    if (-not $aliases.Contains($cleanName)) { $aliases.Add($cleanName) }
    
    # Split tokens
    $tokens = $c.name -split ' '
    if ($tokens.Count -gt 1) {
        $firstToken = $tokens[0]
        # Only add first token if length >= 2 and not too generic
        if ($firstToken.Length -ge 2 -and @("白雪", "赤夜", "星野", "水無月") -notcontains $firstToken) {
            if (-not $aliases.Contains($firstToken)) { $aliases.Add($firstToken) }
        }
        # If it's something like "赤夜 風竹", "風竹" is unique
        if ($tokens.Count -eq 2 -and $tokens[0].Length -ge 2 -and $tokens[1].Length -ge 2) {
            $secondToken = $tokens[1]
            if (-not $aliases.Contains($secondToken)) { $aliases.Add($secondToken) }
        }
    }
    
    $charList += [PSCustomObject]@{
        Id = $c.id
        Name = $c.name
        CleanName = $cleanName
        Realm = $c.realm
        Faction = $c.faction
        SubFaction = $c.subFaction
        Power = $c.power
        Aliases = $aliases
        Data = $c
    }
}

Write-Output "Parsed $($charList.Count) characters."
