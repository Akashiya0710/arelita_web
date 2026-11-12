$content = [System.IO.File]::ReadAllText("assets/data.js", [System.Text.Encoding]::UTF8)
$prefix = "window.ARELITA_DATA = "
$json = $content.Substring($prefix.Length).TrimEnd(";", "`r", "`n", " ")
$obj = $json | ConvertFrom-Json
$chars = $obj.characters

# Build map
$charMap = @{}
foreach ($c in $chars) {
    $charMap[$c.name] = $c
}

# Define known key relationships and lore bonds from the documents & story
# Let's inspect stories of major characters
$sample = $chars | Where-Object { $_.name -like "赤夜*" -or $_.name -like "*凱撒*" -or $_.name -like "*修羅*" -or $_.name -like "伊森塔爾*" -or $_.name -like "*撒旦*" }
Write-Output "Found $($sample.Count) core characters."
foreach ($s in $sample) {
    Write-Output "--- $($s.name) ($($s.realm)/$($s.faction)/$($s.subFaction)) ---"
    if ($s.profile.喜歡) { Write-Output "  喜歡: $($s.profile.喜歡)" }
    if ($s.profile.討厭) { Write-Output "  討厭: $($s.profile.討厭)" }
    $storyPreview = if ($s.story) { $s.story.Substring(0, [Math]::Min(120, $s.story.Length)).Replace("`n", " ") } else { "" }
    Write-Output "  故事摘要: $storyPreview"
}
