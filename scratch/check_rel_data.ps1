$c = [System.IO.File]::ReadAllText("assets/relations_data.js", [System.Text.Encoding]::UTF8)
Write-Output ("relations_data.js contains 清野 墨江: " + $c.Contains("清野 墨江"))
