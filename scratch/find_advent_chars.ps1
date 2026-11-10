$bytes = [System.IO.File]::ReadAllBytes('assets/data.js')
$content = [System.Text.Encoding]::UTF8.GetString($bytes)
$idx = $content.IndexOf('"characters"')
Write-Host "Index of characters: $idx"
if ($idx -ge 0) {
    Write-Host $content.Substring($idx, 300)
}
