$srcDir = "C:\Users\theaf\.gemini\antigravity\brain\0a4dcf1a-61ab-4e64-bf95-ddeb217bc25c"
$dstDir = "assets\dragons"
if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Path $dstDir -Force | Out-Null }

Copy-Item "$srcDir\western_dragon_summon_01_1794312324727.jpg" "$dstDir\dragon_flying_soar.jpg" -Force
Copy-Item "$srcDir\western_dragon_summon_02_breath_1794312348507.jpg" "$dstDir\dragon_breath_dive.jpg" -Force
Copy-Item "$srcDir\colossal_dragon_frontal_roar_1794312351616.jpg" "$dstDir\dragon_colossal_maw.jpg" -Force
Copy-Item "$srcDir\colossal_dragon_roar_1794312331141.jpg" "$dstDir\dragon_profile_roar.jpg" -Force

Get-ChildItem $dstDir | Select-Object Name, Length
