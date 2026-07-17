Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptsRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$runtimeScript = Join-Path $scriptsRoot 'EduSync.Runtime.ps1'

function Assert-EduSync {
    param(
        [Parameter(Mandatory = $true)][bool]$Condition,
        [Parameter(Mandatory = $true)][string]$Message
    )

    if (-not $Condition) { throw $Message }
}

$scripts = @(Get-ChildItem -LiteralPath $scriptsRoot -Filter '*.ps1' -File)
foreach ($script in $scripts) {
    $tokens = $null
    $errors = $null
    [void][System.Management.Automation.Language.Parser]::ParseFile($script.FullName, [ref]$tokens, [ref]$errors)
    Assert-EduSync -Condition ($errors.Count -eq 0) -Message "Erreur de syntaxe dans $($script.Name)."
}

& {
    . $runtimeScript
    function Get-EduSyncWslDistribution { return $null }

    $message = $null
    try { Start-EduSyncRedis | Out-Null } catch { $message = $_.Exception.Message }
    Assert-EduSync -Condition ($message -like '*aucune distribution Ubuntu*') `
        -Message 'Le scénario WSL indisponible ne produit pas le message utilisateur attendu.'
}

& {
    . $runtimeScript
    function Get-EduSyncPostgresStatus {
        return [pscustomobject]@{
            Ready = $false
            Host = 'localhost'
            Port = 5432
            Database = 'educsyn'
            Service = $null
            Message = 'PostgreSQL ne répond pas.'
        }
    }

    $message = $null
    try { Start-EduSyncPostgres | Out-Null } catch { $message = $_.Exception.Message }
    Assert-EduSync -Condition ($message -like '*Aucun service PostgreSQL Windows*') `
        -Message 'Le scénario PostgreSQL indisponible ne produit pas le message utilisateur attendu.'
}

Write-Host 'Certification statique et scénarios de panne contrôlés : OK' -ForegroundColor Green

