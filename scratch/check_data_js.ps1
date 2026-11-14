$c = [System.IO.File]::ReadAllText("assets/data.js", [System.Text.Encoding]::UTF8)
Write-Output ("assets/data.js contains 清野 墨江: " + $c.Contains("清野 墨江"))
