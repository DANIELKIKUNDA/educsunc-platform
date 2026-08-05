# D1.8 - Performance du chargement frontend

## Objectif

Rendre le demarrage d'EduSync plus rapide et previsible, notamment sur les reseaux mobiles instables, sans modifier les workflows, les permissions ni les ecrans metier.

## Cause racine

Le registre de cycle de vie chargeait immediatement tous les stores de tous les domaines avec `import.meta.glob(..., { eager: true })`. Cette protection contre les donnees residuelles faisait entrer 53 stores, leurs services et leurs mappers dans le premier chargement, meme lorsque l'utilisateur n'ouvrait qu'un seul domaine.

Quelques centres transversaux et les vues d'authentification etaient egalement importes avant d'etre affiches.

## Correction industrielle

- Les stores sont enregistres par domaine au moment ou une route autorisee de ce domaine est ouverte.
- Le garde de navigation attend cet enregistrement avant d'afficher la page : la purge des donnees entre contextes reste garantie.
- Les vues publiques, les shells desktop/mobile et les centres transversaux sont charges a la demande.
- Le survol, le focus clavier ou l'appui sur une destination prepare uniquement son composant de route.
- Le prechargement est desactive hors ligne, en economie de donnees et sur les connexions 2G ou slow-2G.
- Une barre de progression n'apparait qu'apres 160 ms afin d'indiquer les navigations vraiment lentes sans provoquer de clignotement.

## Budgets obligatoires

Le build echoue desormais si un artefact depasse :

| Artefact | Budget non compresse |
|---|---:|
| Entree JavaScript | 350 KiB |
| Chunk JavaScript charge a la demande | 180 KiB |
| Fichier CSS | 120 KiB |

Ces budgets sont des controles bloquants. La limite d'avertissement Vite n'a pas ete augmentee pour masquer le probleme.

## Mesures

| Mesure | Avant D1.8 | Apres D1.8 | Evolution |
|---|---:|---:|---:|
| Entree JavaScript | 729,85 kB | 283,64 kB | -61,1 % |
| Entree JavaScript gzip | 190,01 kB | 81,32 kB | -57,2 % |
| CSS principal | 108,28 kB | 77,38 kB | -28,5 % |
| Avertissement Vite > 500 kB | Present | Absent | Ferme |

La faible variation par rapport au premier build optimise (`276,77 kB`) correspond au prechargement intentionnel et au retour visuel de navigation.

## Non-regression

Le test `npm run test:performance` verifie :

- l'absence de chargement global `eager` des stores ;
- le chargement a la demande des routes de demarrage ;
- la presence des budgets bloquants ;
- l'absence de contournement par `chunkSizeWarningLimit` ;
- le respect des connexions limitees ;
- l'accessibilite du retour visuel de navigation.

## Commandes de certification

```powershell
cd frontend
npm run test:performance
npx vue-tsc --noEmit
npx vite build
npm test
npm run test:e2e:offline
```

## Decision

Le decoupage est pilote par les usages et les domaines, pas par des chunks artificiels lies aux noms de fichiers. Les modules metier restent independants, les donnees de contexte restent purgeables et le premier chargement ne paie plus le cout des domaines non consultes.

## Certification du 5 aout 2026

| Controle | Resultat |
|---|---:|
| Typecheck Vue/TypeScript | OK |
| Lint frontend sans avertissement | OK |
| Build Vite avec budgets | OK |
| Tests frontend | 99/99 OK |
| Scenarios Playwright offline | 2/2 OK |
| Avertissement de chunk Vite | Aucun |

Verdict : **D1.8 - VALIDE**.
