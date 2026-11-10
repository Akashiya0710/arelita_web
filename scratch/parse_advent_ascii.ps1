$bytes = [System.IO.File]::ReadAllBytes('assets/data.js')
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

$firstBrace = $content.IndexOf('{')
$lastBrace = $content.LastIndexOf('}')
$jsonStr = $content.Substring($firstBrace, $lastBrace - $firstBrace + 1)

$data = $jsonStr | ConvertFrom-Json
$adventKeyword = [char]0x964d + [char]0x81e8 + [char]0x7d1a
$outLines = [System.Collections.Generic.List[string]]::new()
foreach ($c in $data.characters) {
    if ($c.power -eq $adventKeyword) {
        $outLines.Add("$($c.id): $($c.name) | Power: $($c.power) | Image: $($c.image)")
    }
}
[System.IO.File]::WriteAllLines("scratch/advent_list.txt", $outLines, [System.Text.Encoding]::UTF8)
Write-Host "Done, wrote $($outLines.Count) advent characters"
