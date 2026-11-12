$content = [System.IO.File]::ReadAllText("assets/data.js", [System.Text.Encoding]::UTF8)
$prefix = "window.ARELITA_DATA = "
$json = $content.Substring($prefix.Length).TrimEnd(";", "`r", "`n", " ")
$obj = $json | ConvertFrom-Json
$chars = $obj.characters

# Build dictionary by clean name and short name
$charMap = @{}
foreach ($c in $chars) {
    $charMap[$c.name] = $c
}

# Collect all relations
$edges = @()

foreach ($c in $chars) {
    $sourceName = $c.name
    $text = "$($c.story) $($c.profile.喜歡) $($c.profile.討厭) $($c.profile.個性)"
    
    foreach ($target in $chars) {
        if ($target.name -eq $sourceName) { continue }
        $tName = $target.name
        $tShort = ($tName -split ' ')[0]
        
        $found = $false
        $context = ""
        
        # Check full name
        if ($text.Contains($tName)) {
            $found = $true
            $context = "full_name"
        } elseif ($tShort.Length -ge 2 -and $text.Contains($tShort)) {
            # Ensure not a false positive on common words like "白", "赤", "天"
            $skipWords = @("白", "赤", "天", "神", "夜", "影", "風", "冰", "雷", "火", "光", "暗", "水", "金", "青", "千", "一", "二", "三")
            if (-not ($skipWords -contains $tShort)) {
                $found = $true
                $context = "short_name"
            }
        }
        
        if ($found) {
            # Determine relationship type
            $relType = "關聯"
            $details = ""
            
            # Check Likes
            if ($c.profile.喜歡 -and ($c.profile.喜歡.Contains($tName) -or ($tShort.Length -ge 2 -and $c.profile.喜歡.Contains($tShort)))) {
                $relType = "友好/喜愛"
                $details = "在喜歡列表中提及"
            }
            # Check Dislikes
            if ($c.profile.討厭 -and ($c.profile.討厭.Contains($tName) -or ($tShort.Length -ge 2 -and $c.profile.討厭.Contains($tShort)))) {
                $relType = "敵對/反感"
                $details = "在討厭列表中提及"
            }
            # Check Family / Bloodline
            $sFirst = ($sourceName -split ' ')[0]
            $tFirst = ($tName -split ' ')[0]
            if ($sFirst -eq $tFirst -and $sFirst.Length -ge 2) {
                $relType = "家族/同族"
            }
            
            # Check Story text
            if ($c.story) {
                # Look for sentence containing target
                $sentences = $c.story -split "[。\n\r]"
                foreach ($s in $sentences) {
                    if ($s.Contains($tName) -or ($tShort.Length -ge 2 -and $s.Contains($tShort))) {
                        $details = $s.Trim()
                        if ($s -match "兄|弟|姊|妹|父|母|女|兒|收養|家") {
                            $relType = "親屬/家族"
                        } elseif ($s -match "摯友|朋友|夥伴|結盟|盟友|協助|認識|愛|戀") {
                            if ($relType -ne "親屬/家族") { $relType = "摯友/盟友" }
                        } elseif ($s -match "敵|殺|仇|對立|背叛|擊敗|戰") {
                            if ($relType -ne "親屬/家族") { $relType = "敵對/宿敵" }
                        } elseif ($s -match "部下|隊長|總司令|將軍|服從|直屬|長官") {
                            if ($relType -ne "親屬/家族") { $relType = "上下級/統領" }
                        }
                        break
                    }
                }
            }

            $edges += [PSCustomObject]@{
                Source = $sourceName
                SourceRealm = $c.realm
                SourceFaction = $c.faction
                SourceSub = $c.subFaction
                Target = $tName
                TargetRealm = $target.realm
                TargetFaction = $target.faction
                TargetSub = $target.subFaction
                RelationType = $relType
                Details = $details
            }
        }
    }
}

Write-Output "Extracted edges count: $($edges.Count)"
$edges | Select-Object -First 25 | Format-Table Source, Target, RelationType, Details -AutoSize
