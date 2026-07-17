param([switch]$PauseOnError)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'EduSync.Runtime.ps1')

function Start-EduSyncNodeService {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$WorkingDirectory,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [Parameter(Mandatory = $true)][int]$Port,
        [Parameter(Mandatory = $true)][string]$HealthUrl,
        [Parameter(Mandatory = $true)][int]$TimeoutSeconds
    )

    if (Test-EduSyncHttp -Url $HealthUrl) {
        Write-EduSyncMessage "$Name est déjà disponible sur le port $Port." 'OK'
        return [pscustomobject]@{ component = $Name; startedByLauncher = $false; listenerPid = (Get-EduSyncListeningProcessId -Port $Port) }
    }
    if (Test-EduSyncTcpPort -HostName 'localhost' -Port $Port) {
        throw "Le port $Port est utilisé par une autre application et $Name ne répond pas correctement."
    }
    if (-not (Test-Path -LiteralPath (Join-Path $WorkingDirectory 'node_modules'))) {
        throw "Les dépendances npm de $Name sont absentes. Exécutez npm install dans $WorkingDirectory."
    }

    $stdout = Join-Path $script:EduSyncLogsRoot "$($Name.ToLower()).stdout.log"
    $stderr = Join-Path $script:EduSyncLogsRoot "$($Name.ToLower()).stderr.log"
    Rotate-EduSyncLog -Path $stdout
    Rotate-EduSyncLog -Path $stderr
    $process = Start-Process -FilePath 'npm.cmd' -ArgumentList $Arguments -WorkingDirectory $WorkingDirectory `
        -RedirectStandardOutput $stdout -RedirectStandardError $stderr -WindowStyle Minimized -PassThru
    Write-EduSyncMessage "Démarrage de $Name en cours (PID $($process.Id))..."
    if (-not (Wait-EduSyncHttp -Url $HealthUrl -TimeoutSeconds $TimeoutSeconds)) {
        Stop-EduSyncProcessTree -RootPid $process.Id
        throw "$Name nʼa pas répondu dans le délai prévu. Consultez $stderr."
    }
    $listenerPid = Get-EduSyncListeningProcessId -Port $Port
    Write-EduSyncMessage "$Name est prêt sur $HealthUrl." 'OK'
    return New-EduSyncProcessState -Process $process -ListenerPid $listenerPid -Component $Name
}

try {
    Initialize-EduSyncRuntime
    Write-EduSyncMessage 'Démarrage local dʼEduSync.'
    if (-not (Test-Path -LiteralPath $script:EduSyncProjectRoot)) { throw "Le projet est introuvable : $script:EduSyncProjectRoot" }

    $redis = Get-EduSyncRedisStatus
    if (-not $redis.Ready) {
        Write-EduSyncMessage 'Redis est arrêté ou inaccessible. Démarrage dans Ubuntu WSL...'
        $redis = Start-EduSyncRedis
    }
    Write-EduSyncMessage "Redis est prêt dans $($redis.Distribution) sur $($redis.Host):$($redis.Port)." 'OK'

    $postgres = Start-EduSyncPostgres
    $serviceLabel = if ($postgres.Service) { $postgres.Service.Name } else { 'processus PostgreSQL détecté' }
    Write-EduSyncMessage "PostgreSQL est prêt sur $($postgres.Host):$($postgres.Port) ($serviceLabel)." 'OK'

    $oldRedisHost = $env:REDIS_HOST
    $oldRedisPort = $env:REDIS_PORT
    $env:REDIS_HOST = $redis.Host
    $env:REDIS_PORT = [string]$redis.Port
    try {
        $backendPort = [int](Get-EduSyncEnvValue -Path (Join-Path $script:EduSyncProjectRoot 'backend\.env') -Name 'PORT' -DefaultValue '3000')
        $backend = Start-EduSyncNodeService -Name 'Backend' -WorkingDirectory (Join-Path $script:EduSyncProjectRoot 'backend') `
            -Arguments @('run', 'dev') -Port $backendPort -HealthUrl "http://localhost:$backendPort/health" -TimeoutSeconds 480
    } finally {
        $env:REDIS_HOST = $oldRedisHost
        $env:REDIS_PORT = $oldRedisPort
    }

    $oldState = Get-EduSyncState
    if (-not $backend.startedByLauncher -and $oldState -and (Test-EduSyncOwnedProcess $oldState.backend)) { $backend = $oldState.backend }
    $knownFrontend = $null
    if ($oldState -and (Test-EduSyncOwnedProcess $oldState.frontend)) { $knownFrontend = $oldState.frontend }
    Save-EduSyncState ([pscustomobject]@{
        version = 1
        redis = [pscustomobject]@{ distribution = $redis.Distribution; host = $redis.Host; port = $redis.Port }
        backend = $backend
        frontend = $knownFrontend
        updatedAtUtc = (Get-Date).ToUniversalTime().ToString('o')
    })

    $frontendPort = 4174
    $frontend = Start-EduSyncNodeService -Name 'Frontend' -WorkingDirectory (Join-Path $script:EduSyncProjectRoot 'frontend') `
        -Arguments @('run', 'dev:actors', '--', '--host', '127.0.0.1', '--port', [string]$frontendPort) `
        -Port $frontendPort -HealthUrl "http://localhost:$frontendPort/" -TimeoutSeconds 120

    if (-not $frontend.startedByLauncher -and $oldState -and (Test-EduSyncOwnedProcess $oldState.frontend)) { $frontend = $oldState.frontend }
    Save-EduSyncState ([pscustomobject]@{
        version = 1
        redis = [pscustomobject]@{ distribution = $redis.Distribution; host = $redis.Host; port = $redis.Port }
        backend = $backend
        frontend = $frontend
        updatedAtUtc = (Get-Date).ToUniversalTime().ToString('o')
    })

    $url = "http://localhost:$frontendPort/"
    $browserOpen = @(Get-CimInstance Win32_Process -Filter "Name='chrome.exe' OR Name='msedge.exe'" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*$url*" }).Count -gt 0
    if (-not $browserOpen) { Start-Process $url | Out-Null }
    Write-EduSyncMessage "EduSync est disponible : $url" 'OK'
} catch {
    Write-EduSyncMessage $_.Exception.Message 'ERREUR'
    Write-EduSyncMessage "Consultez les journaux dans $script:EduSyncLogsRoot." 'ATTENTION'
    if ($PauseOnError) { Read-Host 'Appuyez sur Entrée pour fermer' | Out-Null }
    exit 1
}




