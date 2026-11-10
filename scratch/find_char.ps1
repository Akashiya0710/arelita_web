$content = [System.IO.File]::ReadAllText('assets/data.js', [System.Text.Encoding]::UTF8)
$idx = $content.IndexOf('萊夫維芙')
if ($idx -ge 0) {
    $start = [Math]::Max(0, $idx - 300)
    $len = [Math]::Min(800, $content.Length - $start)
    Write-Output $content.Substring($start, $len)
} else {
    Write-Output "Not found in assets/data.js"
}
