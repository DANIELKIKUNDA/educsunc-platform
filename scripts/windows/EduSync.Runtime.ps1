Set-StrictMode -Version Latest

$script:EduSyncProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$script:EduSyncRuntimeRoot = Join-Path $script:EduSyncProjectRoot '.runtime'
$script:EduSyncLogsRoot = Join-Path $script:EduSyncRuntimeRoot 'logs'
$script:EduSyncStatePath = Join-Path $script:EduSyncRuntimeRoot 'launcher-state.json'

function Initialize-EduSyncRuntime {
    New-Item -ItemType Directory -Path $script:EduSyncLogsRoot -Force | Out-Null
}

function Write-EduSyncMessage {
    param(
        [Parameter(Mandatory = $true)][string]$Message,
        [ValidateSet('INFO', 'OK', 'ATTENTION', 'ERREUR')][string]$Level = 'INFO'
    )

    Initialize-EduSyncRuntime
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $line = "[$timestamp] [$Level] $Message"
    $color = switch ($Level) {
        'OK' { 'Green' }
        'ATTENTION' { 'Yellow' }
        'ERREUR' { 'Red' }
        default { 'Cyan' }
    }
    Write-Host $line -ForegroundColor $color
    Add-Content -LiteralPath (Join-Path $script:EduSyncLogsRoot 'launcher.log') -Value $line -Encoding UTF8
}

function Get-EduSyncEnvValue {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$DefaultValue
    )

    if (-not (Test-Path -LiteralPath $Path)) { return $DefaultValue }
    $match = Get-Content -LiteralPath $Path | Where-Object { $_ -match "^$([regex]::Escape($Name))=" } | Select-Object -Last 1
    if (-not $match) { return $DefaultValue }
    $value = ($match -split '=', 2)[1].Trim()
    if ([string]::IsNullOrWhiteSpace($value)) { return $DefaultValue }
    return $value
}

function Test-EduSyncTcpPort {
    param(
        [Parameter(Mandatory = $true)][string]$HostName,
        [Parameter(Mandatory = $true)][int]$Port,
        [int]$TimeoutMilliseconds = 1500
    )

    $client = New-Object System.Net.Sockets.TcpClient
    try {
        $task = $client.ConnectAsync($HostName, $Port)
        return $task.Wait($TimeoutMilliseconds) -and $client.Connected
    } catch {
        return $false
    } finally {
        $client.Dispose()
    }
}

function Test-EduSyncHttp {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [int]$TimeoutSeconds = 3
    )

    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec $TimeoutSeconds
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 400
    } catch {
        return $false
    }
}

function Wait-EduSyncHttp {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [int]$TimeoutSeconds = 180
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-EduSyncHttp -Url $Url) { return $true }
        Start-Sleep -Seconds 1
    }
    return $false
}

function Get-EduSyncListeningProcessId {
    param([Parameter(Mandatory = $true)][int]$Port)

    try {
        $connection = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction Stop | Select-Object -First 1
        if ($connection) { return [int]$connection.OwningProcess }
    } catch {
        $line = netstat -ano | Select-String ":$Port\s+.*LISTENING" | Select-Object -First 1
        if ($line) { return [int](($line.ToString() -split '\s+')[-1]) }
    }
    return $null
}

function Get-EduSyncWslDistributions {
    $ErrorActionPreference = 'Continue'
    if (-not (Get-Command 'wsl.exe' -ErrorAction SilentlyContinue)) { return @() }
    $raw = & wsl.exe --list --quiet 2>$null
    if ($LASTEXITCODE -ne 0) { return @() }
    return @($raw | ForEach-Object { ($_ -replace [char]0, '').Trim() } | Where-Object { $_ -and $_ -notlike 'docker-*' })
}

function Get-EduSyncWslDistribution {
    $distributions = @(Get-EduSyncWslDistributions)
    if ($distributions.Count -eq 0) { return $null }
    $ubuntu = $distributions | Where-Object { $_ -like 'Ubuntu*' } | Select-Object -First 1
    if ($ubuntu) { return $ubuntu }
    return $distributions[0]
}

function Get-EduSyncRedisStatus {
    $ErrorActionPreference = 'Continue'
    $distribution = Get-EduSyncWslDistribution
    if (-not $distribution) {
        return [pscustomobject]@{ Ready = $false; Distribution = $null; Host = $null; Port = 6379; Message = 'Aucune distribution WSL disponible.' }
    }

    $ipOutput = & wsl.exe -d $distribution -u root -- hostname -I 2>$null
    $ip = ((($ipOutput -join ' ') -replace [char]0, '').Trim() -split '\s+')[0]
    $ping = (& wsl.exe -d $distribution -u root -- redis-cli -h 127.0.0.1 -p 6379 ping 2>$null | Select-Object -Last 1)
    $pong = $ping -and (($ping -replace [char]0, '').Trim() -eq 'PONG')
    $reachable = $ip -and (Test-EduSyncTcpPort -HostName $ip -Port 6379)
    $message = if ($pong -and $reachable) { 'Redis répond depuis Windows et Ubuntu.' } elseif ($pong) { 'Redis répond dans Ubuntu mais pas encore depuis Windows.' } else { 'Redis ne répond pas.' }
    return [pscustomobject]@{ Ready = [bool]($pong -and $reachable); Distribution = $distribution; Host = $ip; Port = 6379; Message = $message }
}

function Start-EduSyncRedis {
    $ErrorActionPreference = 'Continue'
    $distribution = Get-EduSyncWslDistribution
    if (-not $distribution) {
        throw 'WSL est indisponible ou aucune distribution Ubuntu nʼest enregistrée.'
    }

    $hasRedis = & wsl.exe -d $distribution -u root -- bash -lc 'command -v redis-server >/dev/null && command -v redis-cli >/dev/null' 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Redis nʼest pas installé dans $distribution. Installez redis-server puis relancez EduSync."
    }

    $ipOutput = & wsl.exe -d $distribution -u root -- hostname -I 2>$null
    $ip = ((($ipOutput -join ' ') -replace [char]0, '').Trim() -split '\s+')[0]
    if ($ip -notmatch '^\d{1,3}(\.\d{1,3}){3}$') {
        throw "Lʼadresse réseau de $distribution est introuvable."
    }

    $command = "systemctl stop redis-server.service >/dev/null 2>&1 || service redis-server stop >/dev/null 2>&1 || true; " +
        "sleep 1; pkill -x redis-server >/dev/null 2>&1 || true; sleep 1; " +
        "install -d -o redis -g redis /run/redis /var/log/redis /var/lib/redis; " +
        "redis-server --bind 127.0.0.1 $ip --protected-mode no --port 6379 --daemonize yes --supervised no " +
        "--pidfile /run/redis/edusync-redis.pid --logfile /var/log/redis/edusync-redis.log --dir /var/lib/redis; " +
        "sleep 1; redis-cli -h 127.0.0.1 -p 6379 ping"
    $result = & wsl.exe -d $distribution -u root -- bash -lc $command 2>$null
    if ($LASTEXITCODE -ne 0 -or (($result -join ' ') -notmatch 'PONG')) {
        throw "Redis nʼa pas pu démarrer dans $distribution. Consultez /var/log/redis/edusync-redis.log."
    }

    $deadline = (Get-Date).AddSeconds(30)
    while ((Get-Date) -lt $deadline) {
        if (Test-EduSyncTcpPort -HostName $ip -Port 6379) {
            return [pscustomobject]@{ Ready = $true; Distribution = $distribution; Host = $ip; Port = 6379; Message = 'Redis est prêt.' }
        }
        Start-Sleep -Seconds 1
    }
    throw "Redis répond dans $distribution, mais Windows ne peut pas joindre $ip`:6379."
}

function Get-EduSyncPostgresStatus {
    $envPath = Join-Path $script:EduSyncProjectRoot 'backend\.env'
    $hostName = Get-EduSyncEnvValue -Path $envPath -Name 'DB_HOST' -DefaultValue 'localhost'
    $port = [int](Get-EduSyncEnvValue -Path $envPath -Name 'DB_PORT' -DefaultValue '5432')
    $database = Get-EduSyncEnvValue -Path $envPath -Name 'DB_NAME' -DefaultValue 'educsyn'
    $pgIsReady = Get-Command pg_isready.exe -ErrorAction SilentlyContinue
    if (-not $pgIsReady) {
        $candidate = 'C:\Program Files\PostgreSQL\16\bin\pg_isready.exe'
        if (Test-Path -LiteralPath $candidate) { $pgIsReady = [pscustomobject]@{ Source = $candidate } }
    }
    $ready = $false
    if ($pgIsReady) {
        & $pgIsReady.Source -h $hostName -p $port -d $database *> $null
        $ready = $LASTEXITCODE -eq 0
    } else {
        $ready = Test-EduSyncTcpPort -HostName $hostName -Port $port
    }
    $services = @(Get-Service -Name 'postgresql*' -ErrorAction SilentlyContinue)
    return [pscustomobject]@{
        Ready = $ready
        Host = $hostName
        Port = $port
        Database = $database
        Service = ($services | Select-Object -First 1)
        Message = if ($ready) { 'PostgreSQL accepte les connexions.' } else { 'PostgreSQL ne répond pas.' }
    }
}

function Start-EduSyncPostgres {
    $status = Get-EduSyncPostgresStatus
    if ($status.Ready) { return $status }
    if (-not $status.Service) { throw 'Aucun service PostgreSQL Windows nʼa été trouvé.' }
    try {
        if ($status.Service.Status -ne 'Running') { Start-Service -Name $status.Service.Name -ErrorAction Stop }
    } catch {
        throw "PostgreSQL est arrêté et Windows refuse son démarrage. Lancez le raccourci EduSync comme administrateur une fois, puis réessayez."
    }
    $deadline = (Get-Date).AddSeconds(60)
    while ((Get-Date) -lt $deadline) {
        $status = Get-EduSyncPostgresStatus
        if ($status.Ready) { return $status }
        Start-Sleep -Seconds 1
    }
    throw "Le service $($status.Service.Name) a démarré, mais PostgreSQL ne répond pas sur $($status.Host):$($status.Port)."
}

function Rotate-EduSyncLog {
    param([Parameter(Mandatory = $true)][string]$Path)
    $previous = "$Path.previous"
    if (Test-Path -LiteralPath $previous) { Remove-Item -LiteralPath $previous -Force }
    if (Test-Path -LiteralPath $Path) { Move-Item -LiteralPath $Path -Destination $previous -Force }
}

function Get-EduSyncState {
    if (-not (Test-Path -LiteralPath $script:EduSyncStatePath)) { return $null }
    try { return Get-Content -LiteralPath $script:EduSyncStatePath -Raw | ConvertFrom-Json } catch { return $null }
}

function Save-EduSyncState {
    param([Parameter(Mandatory = $true)]$State)
    Initialize-EduSyncRuntime
    $State | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $script:EduSyncStatePath -Encoding UTF8
}

function New-EduSyncProcessState {
    param(
        [Parameter(Mandatory = $true)][System.Diagnostics.Process]$Process,
        [Parameter(Mandatory = $true)][int]$ListenerPid,
        [Parameter(Mandatory = $true)][string]$Component
    )
    return [pscustomobject]@{
        component = $Component
        startedByLauncher = $true
        rootPid = $Process.Id
        listenerPid = $ListenerPid
        rootStartedAtUtc = $Process.StartTime.ToUniversalTime().ToString('o')
        startedAtUtc = (Get-Date).ToUniversalTime().ToString('o')
    }
}

function Test-EduSyncOwnedProcess {
    param($ComponentState)
    if (-not $ComponentState -or -not $ComponentState.startedByLauncher) { return $false }
    try {
        $process = Get-Process -Id ([int]$ComponentState.rootPid) -ErrorAction Stop
        $recorded = [datetime]::Parse([string]$ComponentState.rootStartedAtUtc).ToUniversalTime()
        return [math]::Abs(($process.StartTime.ToUniversalTime() - $recorded).TotalSeconds) -lt 3
    } catch {
        return $false
    }
}

function Stop-EduSyncProcessTree {
    param([Parameter(Mandatory = $true)][int]$RootPid)
    $all = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue)
    $children = @($all | Where-Object { [int]$_.ParentProcessId -eq $RootPid })
    foreach ($child in $children) { Stop-EduSyncProcessTree -RootPid ([int]$child.ProcessId) }
    Stop-Process -Id $RootPid -Force -ErrorAction SilentlyContinue
}

function Get-EduSyncRuntimeSummary {
    $redis = Get-EduSyncRedisStatus
    $postgres = Get-EduSyncPostgresStatus
    $backendPort = [int](Get-EduSyncEnvValue -Path (Join-Path $script:EduSyncProjectRoot 'backend\.env') -Name 'PORT' -DefaultValue '3000')
    $frontendPort = 4174
    return [pscustomobject]@{
        Redis = $redis
        PostgreSQL = $postgres
        BackendPort = $backendPort
        BackendPid = Get-EduSyncListeningProcessId -Port $backendPort
        BackendReady = Test-EduSyncHttp -Url "http://localhost:$backendPort/health"
        FrontendPort = $frontendPort
        FrontendPid = Get-EduSyncListeningProcessId -Port $frontendPort
        FrontendReady = Test-EduSyncHttp -Url "http://localhost:$frontendPort/"
    }
}



