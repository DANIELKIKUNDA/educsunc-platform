param([switch]$Pause)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'EduSync.Runtime.ps1')

$summary = Get-EduSyncRuntimeSummary
$rows = @(
    [pscustomobject]@{ Service = 'Redis (WSL)'; Etat = if ($summary.Redis.Ready) { 'Actif' } else { 'Inactif' }; Adresse = if ($summary.Redis.Host) { "$($summary.Redis.Host):6379" } else { 'Non disponible' }; PID = '-' }
    [pscustomobject]@{ Service = 'PostgreSQL'; Etat = if ($summary.PostgreSQL.Ready) { 'Actif' } else { 'Inactif' }; Adresse = "$($summary.PostgreSQL.Host):$($summary.PostgreSQL.Port)"; PID = (Get-EduSyncListeningProcessId -Port $summary.PostgreSQL.Port) }
    [pscustomobject]@{ Service = 'Backend'; Etat = if ($summary.BackendReady) { 'Actif' } else { 'Inactif' }; Adresse = "http://localhost:$($summary.BackendPort)/health"; PID = $summary.BackendPid }
    [pscustomobject]@{ Service = 'Frontend'; Etat = if ($summary.FrontendReady) { 'Actif' } else { 'Inactif' }; Adresse = "http://localhost:$($summary.FrontendPort)/"; PID = $summary.FrontendPid }
)

Write-Host ''
Write-Host 'État local EduSync' -ForegroundColor Cyan
$rows | Format-Table -AutoSize
Write-Host "Journaux : $script:EduSyncLogsRoot"
if ($Pause) { Read-Host 'Appuyez sur Entrée pour fermer' | Out-Null }




