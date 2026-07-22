# Developpement EduSync sous Ubuntu WSL

## Decision

Le developpement local principal d'EduSync s'effectue dans `Ubuntu-22.04` sous WSL 2, depuis le clone Linux natif :

```text
/home/daniel/projects/EducSyn
```

Le depot ne doit pas etre execute depuis `/mnt/c`. Les dependances `node_modules`, les builds et les tests restent sur le disque Linux afin d'eviter les lenteurs et les incompatibilites de binaires natifs.

Le clone Windows `C:\Users\MON PC\Documents\EducSyn` reste une copie de transition. Une seule copie doit etre modifiee a la fois. Apres synchronisation finale, les nouveaux developpements et commits partent du clone Ubuntu.

## Socle local certifie

- Ubuntu 22.04 sous WSL 2 ;
- Node.js 24 et npm 11 ;
- PostgreSQL 14 pour le developpement local, PostgreSQL 16 restant la reference de certification de production ;
- Redis gere par `systemd` ;
- PostgreSQL gere par `systemd` ;
- VS Code avec l'extension officielle WSL ;
- Docker non requis pour Redis ou PostgreSQL.

Redis et PostgreSQL sont actives au demarrage d'Ubuntu. Leur etat se controle avec :

```bash
systemctl is-active redis-server postgresql
redis-cli ping
pg_isready -h 127.0.0.1 -p 5432
```

Le resultat attendu est `active`, `PONG` et `accepting connections`.

## Ouvrir le bon depot

Depuis PowerShell :

```powershell
wsl -d Ubuntu-22.04
```

Puis dans Ubuntu :

```bash
cd /home/daniel/projects/EducSyn
code .
```

La fenetre VS Code doit afficher `WSL: Ubuntu-22.04`. Les terminaux integres doivent retourner un chemin commencant par `/home/daniel/`, jamais par `/mnt/c/`.

## Demarrage quotidien

Avant de lancer la version Ubuntu, arreter l'ancien lanceur Windows pour liberer les ports `3000` et `4174` :

```powershell
powershell -ExecutionPolicy Bypass -File scripts/windows/stop-edusync.ps1
```

Terminal backend :

```bash
cd /home/daniel/projects/EducSyn/backend
npm run dev
```

Terminal frontend :

```bash
cd /home/daniel/projects/EducSyn/frontend
npm run dev:actors -- --host 0.0.0.0 --port 4174
```

Les URL restent accessibles depuis Windows :

- backend : `http://localhost:3000/health` ;
- frontend : `http://localhost:4174/`.

## Installation et validations

Ne jamais copier `node_modules` entre Windows et Ubuntu. Apres un changement de dependances :

```bash
cd /home/daniel/projects/EducSyn/backend
npm ci
npm run typecheck
npm run test:global

cd /home/daniel/projects/EducSyn/frontend
npm ci
npm run build
npm test
```

Les fichiers `.env` restent locaux et exclus de Git. Les variables fournies par la CI restent prioritaires sur le fichier `.env` local.

## Donnees PostgreSQL

La base Windows a ete migree vers PostgreSQL Ubuntu avec controle exact des volumes :

- 69 tables ;
- 31 tables non vides ;
- 16 428 lignes au moment de la migration ;
- volumes des principales tables identiques avant et apres restauration.

La base Ubuntu precedente est conservee comme retour arriere local sous le nom :

```text
educsyn_before_wsl_migration_20260722
```

Elle ne doit pas etre supprimee avant une periode d'utilisation normale du nouvel environnement et une sauvegarde externe confirmee.

## Certification de migration

- Redis : actif, reponse `PONG` ;
- PostgreSQL : actif, base complete relue ;
- backend : typecheck Linux reussi ;
- backend : 50 tests globaux Linux reussis ;
- frontend : 30 tests Linux reussis ;
- frontend : build Linux reussi, 2 299 modules transformes ;
- frontend : build Windows de non-regression reussi ;
- runtime backend Ubuntu : `/health` retourne `ok` avec la base migree.

## Regles de securite

- ne jamais versionner les fichiers `.env` ou les sauvegardes PostgreSQL ;
- ne jamais executer simultanement les backends Windows et Ubuntu sur le meme port ;
- ne jamais partager un dossier `node_modules` entre les deux systemes ;
- ne jamais travailler en parallele dans les deux clones sans branches et worktrees explicites ;
- conserver la base de retour arriere jusqu'a validation quotidienne du clone Ubuntu.

## Verdict

**UBUNTU WSL EST L'ENVIRONNEMENT LOCAL PRINCIPAL CERTIFIE POUR EDUSYNC.**
