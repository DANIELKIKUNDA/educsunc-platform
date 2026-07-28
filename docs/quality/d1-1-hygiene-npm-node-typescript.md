# D1.1 - Hygiene npm, Node et TypeScript

## Versions officielles

- Node officiel : `24`
- npm officiel : `10.8.2`
- TypeScript officiel : `5.9.3`
- `@types/node` officiel backend : `24.13.3`

## Politique des manifests

- Le depot conserve trois manifests independants :
  - [package.json](/C:/Users/MON%20PC/Documents/EducSyn/package.json)
  - [backend/package.json](/C:/Users/MON%20PC/Documents/EducSyn/backend/package.json)
  - [frontend/package.json](/C:/Users/MON%20PC/Documents/EducSyn/frontend/package.json)
- Les npm workspaces restent reportes.
- La raison du report est simple :
  - la CI est deja structuree autour de trois installations separees ;
  - aucun package interne partage n impose encore un hoisting ou une mutualisation ;
  - D1.1 vise l hygiene minimale, pas une migration structurelle.

## Classement des dependances

- Les dependances de build frontend restent en `devDependencies`.
- Les dependances runtime frontend restent dans `dependencies`.
- Cote frontend, `vite`, `typescript` et `@vitejs/plugin-vue` sont donc classes en developpement uniquement.

## Rollup Linux

- `@rollup/rollup-linux-x64-gnu` reste conserve en `optionalDependencies` cote frontend.
- La dependance est aussi declaree transitivement par `rollup`, mais sa presence explicite stabilise les builds Linux de CI et de Codespaces.
- Elle ne doit pas etre retiree sans preuve technique recueillie sur un build Linux reel vert sans cette ligne.

## Commandes d installation

- Racine : `npm ci`
- Backend : `npm --prefix backend ci`
- Frontend : `npm --prefix frontend ci`

## Commandes de validation

- Lint racine : `npm run lint`
- Typecheck backend strict : `npm --prefix backend run typecheck:strict`
- Tests backend : `npm --prefix backend run test:global`, `npm --prefix backend run test:security`, `npm --prefix backend run test:audit`, `npm --prefix backend run test:ci`
- Build backend : `npm --prefix backend run build`
- Tests frontend : `npm --prefix frontend test`
- Build frontend : `npm --prefix frontend run build`
