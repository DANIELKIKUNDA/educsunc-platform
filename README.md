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
- port : `5433`
- utilisateur : `postgres`
- mot de passe : `postgres`
- base : `educsyn`

Pour relancer uniquement les migrations du BC Referentiel Academique :

```powershell
cd backend
npm run db:migrate:referentiel
```

Dans PgAdmin, ajouter un serveur avec `localhost` et le port `5433`, puis se connecter avec `postgres/postgres`.

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
