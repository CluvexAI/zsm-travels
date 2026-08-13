$filePath = 'c:\zsm-travel\src\pages\NewBooking.jsx'
$lines = Get-Content $filePath -Encoding UTF8
$before = $lines[0..711]
$after = $lines[1005..($lines.Length-1)]
$result = $before + $after
[System.IO.File]::WriteAllLines($filePath, $result, [System.Text.Encoding]::UTF8)
Write-Host "Done. Total lines: $($result.Length)"
