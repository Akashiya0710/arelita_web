Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("assets\dragons\deicide_greatsword.jpg")
Write-Host "Width: $($img.Width) Height: $($img.Height)"
$img.Dispose()
