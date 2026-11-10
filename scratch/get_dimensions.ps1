Add-Type -AssemblyName System.Drawing
Get-ChildItem assets\dragons\*.jpg | ForEach-Object {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    [PSCustomObject]@{
        Name = $_.Name
        Width = $img.Width
        Height = $img.Height
    }
    $img.Dispose()
}
