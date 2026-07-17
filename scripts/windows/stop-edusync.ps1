param([switch]$StopRedis, [switch]$Pause)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'EduSync.Runtime.ps1')

try {
    Initialize-EduSyncRuntime
    $state = Get-EduSyncState
    if (-not $state) {
        Write-EduSyncMessage 'Aucun processus lancé par le lanceur EduSync nʼest enregistré.' 'ATTENTION'
    } else {
        foreach ($name in @('frontend', 'backend')) {
            $component = $state.$name
            if ($component -and (Test-EduSyncOwnedProcess $component)) {
                Stop-EduSyncProcessTree -RootPid ([int]$component.rootPid)
                Write-EduSyncMessage "$($component.component) a été arrêté proprement." 'OK'
            } elseif ($component -and $component.startedByLauncher) {
                Write-EduSyncMessage "$name était déjà arrêté ; son PID obsolète est nettoyé." 'ATTENTION'
            } else {
                Write-EduSyncMessage "$name nʼa pas été lancé par EduSync et reste intact." 'INFO'
            }
        }
        Remove-Item -LiteralPath $script:EduSyncStatePath -Force -ErrorAction SilentlyContinue
    }

    if ($StopRedis) {
        $distribution = Get-EduSyncWslDistribution
        if ($distribution) {
            $stopCommand = 'systemctl stop redis-server.service >/dev/null 2>&1 || service redis-server stop >/dev/null 2>&1 || true; pkill -x redis-server >/dev/null 2>&1 || true'
            & wsl.exe -d $distribution -u root -- bash -lc $stopCommand 2>$null
            Write-EduSyncMessage 'Redis EduSync a été arrêté dans Ubuntu WSL.' 'OK'
        }
    } else {
        Write-EduSyncMessage 'PostgreSQL et Redis restent actifs.' 'INFO'
    }
} catch {
    Write-EduSyncMessage $_.Exception.Message 'ERREUR'
    exit 1
} finally {
    if ($Pause) { Read-Host 'Appuyez sur Entrée pour fermer' | Out-Null }
}




