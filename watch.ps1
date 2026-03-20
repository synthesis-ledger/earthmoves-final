$folder = "C:\earthmovesfinal"
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $folder
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

$action = {
    $path = $Event.SourceEventArgs.FullPath
    if ($path -match '\\\.next\\' -or $path -match '\\node_modules\\') { return }
    Start-Sleep -Seconds 2
    Set-Location $folder
    git add .
    git commit -m "Auto-save: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git push
}

Register-ObjectEvent $watcher "Changed" -Action $action
Register-ObjectEvent $watcher "Created" -Action $action
Register-ObjectEvent $watcher "Deleted" -Action $action

Write-Host "Watching C:\earthmovesfinal — auto-pushing on save. Press Ctrl+C to stop."
while ($true) { Start-Sleep -Seconds 1 }
