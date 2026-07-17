param([switch]$Pause)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'EduSync.Runtime.ps1')

$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop 'EduSync.lnk'
$startScript = Join-Path $PSScriptRoot 'start-edusync.ps1'
$iconPath = Join-Path $PSScriptRoot 'assets\EduSync.ico'
if (-not (Test-Path -LiteralPath $iconPath)) { throw "Lʼicône EduSync est introuvable : $iconPath" }

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = (Get-Command powershell.exe).Source
$shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$startScript`" -PauseOnError"
$shortcut.WorkingDirectory = $script:EduSyncProjectRoot
$shortcut.IconLocation = "$iconPath,0"
$shortcut.Description = 'Démarrer EduSync localement'
$shortcut.Save()

Write-EduSyncMessage "Raccourci créé sur le Bureau : $shortcutPath" 'OK'
if ($Pause) { Read-Host 'Appuyez sur Entrée pour fermer' | Out-Null }




