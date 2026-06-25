# Backfill Informations Institutionnelles des Ecoles

## Objet

Ce dossier permet de completer proprement les informations institutionnelles des ecoles deja creees dans EduSync, sans modifier le code ni faire des appels manuels non traces.

## Fichiers

- `exemple-informations-institutionnelles-ecoles.json`
  - exemple concret
- `lot-informations-institutionnelles-ecoles.template.json`
  - modele multi-ecoles a remplir

## Champs attendus

Chaque ligne du lot doit contenir :

- `idEcole`
- au moins une des informations suivantes :
  - `sigle`
  - `adresse`
  - `telephone`
  - `email`
  - `provinceEducationnelle`
  - `ville`
  - `communeOuTerritoire`

## Procedure recommandee

1. Copier `lot-informations-institutionnelles-ecoles.template.json`
2. Remplacer les `idEcole` fictifs par les vrais identifiants backend
3. Remplir les vraies donnees institutionnelles
4. Lancer d'abord le script en `dry-run`
5. Verifier visuellement le JSON de sortie
6. Lancer ensuite le script avec `--apply`

## Commandes

### Dry-run

```powershell
cd backend
npm run ecoles:backfill:informations-institutionnelles -- --file ..\docs\assets\administration-ecole\lot-informations-institutionnelles-ecoles.template.json
```

### Application reelle

```powershell
cd backend
$env:EDUSYNC_API_BASE_URL="http://localhost:3000"
$env:EDUSYNC_BEARER_TOKEN="remplacer-par-votre-token"
npm run ecoles:backfill:informations-institutionnelles -- --file ..\docs\assets\administration-ecole\lot-informations-institutionnelles-ecoles.template.json --apply
```

## Regle de prudence

- sans `--apply`, aucune mutation reelle n'est envoyee
- le script est donc sans danger en lecture preparatoire
- ne lancer `--apply` qu'apres verification du lot et des identifiants
