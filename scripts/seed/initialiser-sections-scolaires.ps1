param(
  [string] $UrlBackend = "http://localhost:3000",
  [string] $CheminJson = "docs/donnees-reference/referentiel-academique/sections/sections-scolaires.v1.json"
)

$ErrorActionPreference = "Stop"

# Ce script envoie les sections scolaires de reference vers l'endpoint d'import existant.
$racineProjet = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$cheminCompletJson = Join-Path $racineProjet $CheminJson

if (-not (Test-Path $cheminCompletJson)) {
  throw "Le fichier JSON de reference est introuvable : $cheminCompletJson"
}

$corpsJson = Get-Content -Path $cheminCompletJson -Raw -Encoding UTF8
$cleIdempotence = "seed-sections-scolaires-v1"
$urlImport = "$UrlBackend/api/referentiels/import-sections"

Write-Host "Import des sections scolaires de reference vers $urlImport"

$reponse = Invoke-RestMethod `
  -Method Post `
  -Uri $urlImport `
  -ContentType "application/json" `
  -Headers @{ "Idempotency-Key" = $cleIdempotence } `
  -Body $corpsJson

$reponse | ConvertTo-Json -Depth 10
