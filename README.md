# EducSyn

Base de projet Clean Architecture + DDD pour un systeme scolaire hybride.
La structure prepare le backend stateless, le frontend offline-first et la synchronisation bidirectionnelle.

## Prerequis

- Node.js 24
- npm
- PostgreSQL 16 pour les validations d'infrastructure du backend

## Installation locale

```powershell
cd backend
npm ci
npm run typecheck:strict
npm run build
npm run test:verification
```

```powershell
cd frontend
npm ci
npm run build
npm test
```

## Variables d'environnement

Les fichiers `.env` locaux ne doivent pas etre versionnes.
Utiliser les fichiers `.env.exemple` comme base de configuration.

## Base PostgreSQL locale

Le backend lit automatiquement `backend/.env` au demarrage.
Pour le poste local courant, la base de developpement utilise :

- host : `localhost`
- port : `5432`
- utilisateur : `educsyn`
- mot de passe : `educsyn`
- base : `educsyn`

Pour relancer uniquement les migrations du BC Referentiel Academique :

```powershell
cd backend
npm run db:migrate:referentiel
```

Pour initialiser les sections scolaires dans PostgreSQL :

```powershell
cd backend
npm run seed:sections-scolaires
```

Pour initialiser les options d'etudes EXETAT dans PostgreSQL :

```powershell
cd backend
npm run seed:options-etudes
```

Pour initialiser les classes academiques officielles dans PostgreSQL :

```powershell
cd backend
npm run seed:classes-academiques
```

Pour initialiser les cours officiels extraits des bulletins MINEDUC :

```powershell
cd backend
npm run seed:cours-officiels
```

Pour initialiser les programmes academiques officiels par classe :

```powershell
cd backend
npm run seed:programmes-academiques
```

Pour lancer le seed principal du referentiel academique :

```powershell
cd backend
npm run seed:referentiel-academique
```

Pour afficher le programme complet d'une classe depuis PostgreSQL :

```powershell
cd backend
npm run verifier:programme-classe -- 1PR
```

Pour cibler explicitement une version de referentiel :

```powershell
cd backend
npm run verifier:programme-classe -- 4ELEC --version=MINEDUC-2024-2025-V2
```

Dans PgAdmin, utiliser le serveur PostgreSQL local `localhost:5432`, puis ouvrir la base `educsyn`.

## GitHub Actions

Le workflow CI se trouve dans `.github/workflows/ci.yml`.
Il execute :

- installation propre avec `npm ci`
- verification TypeScript stricte du backend
- build backend
- tests backend
- build frontend
- tests frontend

## Mise en ligne GitHub

```powershell
git init -b main
git add .
git commit -m "chore: initialisation du projet EducSyn"
git remote add origin https://github.com/<organisation-ou-utilisateur>/<repo>.git
git push -u origin main
```
