# Audit initial de la pipeline EduSync

## Resume executif

L audit a ete realise avant l installation des nouveaux outils. Le depot possedait
deja un socle solide de compilation, de tests PostgreSQL et de certification
navigateur, mais aucune commande qualite unique a la racine et aucun scan statique
officiel versionne.

## Inventaire initial

| Capacite | Etat initial | Commande existante | CI | Observation |
| --- | --- | --- | --- | --- |
| TypeScript backend | Actif, strict | `npm --prefix backend run typecheck:strict` | Oui | TypeScript 6 |
| TypeScript frontend | Actif | inclus dans `build` et `test` | Oui | Vue TypeScript |
| ESLint | Absent | aucune | Non | Dette bloquante de politique |
| Build backend | Actif | `npm --prefix backend run build` | Oui | Bloquant |
| Build frontend | Actif | `npm --prefix frontend run build` | Oui | Bloquant |
| Tests backend | Actifs | `test:global`, `test:security`, `test:audit`, `test:ci` | Partiel | Environ 510 fichiers de tests, selectionnes par plusieurs lanceurs |
| Tests frontend | Actifs | `npm --prefix frontend test` | Oui | Tests TypeScript et scripts de contrats |
| PostgreSQL | Actif | migrations et certifications dediees | Oui | PostgreSQL 16 en service CI |
| E2E navigateur | Actif | `certification:security` | Oui | 37 scenarios, base et ports isoles |
| npm audit | Disponible | commande npm standard | Non | Aucun blocage automatise |
| Semgrep | Absent | aucune | Non | Ancien rapport de 29 alertes non conserve dans le depot |
| Gitleaks | Absent | aucune | Non | Aucun scan historique |
| Trivy | Absent | aucune | Non | Aucun Dockerfile de production a scanner |
| k6 | Absent | aucune | Non | Micro-mesures internes seulement |
| Dependabot | Partiel | `.github/dependabot.yml` | Oui | npm backend et frontend |
| Docker | Local uniquement | compose Redis | Non | Aucune image de production |

## Architecture et portabilite

- Le depot ne possedait pas de `package.json` racine.
- Windows utilisait Node 20, la CI Node 24 et les types backend Node 25.
- Les commandes longues sont sensiblement plus lentes sur le volume monte Windows.
- Le harnais E2E existant est industrialise : schema dedie, ports `3107` et
  `4277`, donnees deterministes, redemarrage et nettoyage.
- Les actions GitHub utilisaient des tags. Elles devaient etre epinglees sur les
  SHA officiels verifies.
- Les trois jobs CI initiaux etaient backend, frontend et certification Securite.

## Mesures de reference disponibles

| Controle | Duree observee |
| --- | --- |
| CI frontend | environ 1 minute |
| CI backend | environ 3 minutes |
| CI certification Securite | environ 2 minutes |
| E2E local Windows complet | environ 5 minutes 39 secondes |
| Phase navigateur locale | environ 3 minutes 36 secondes |
| Build frontend WSL | environ 40 secondes |
| Build frontend Windows | environ 111 a 131 secondes |

Ces valeurs sont des reperes, pas des engagements. Chaque commande officielle
produit maintenant sa propre duree dans `artifacts/quality`.

## Ecarts de securite constates

- Cinq pools PostgreSQL desactivaient la verification du certificat TLS.
- CORS reflete une origine seulement apres controle de la liste autorisee ; cette
  alerte doit etre classee contextuelle et couverte par tests.
- Deux routes fusionnent des donnees HTTP avec `Object.assign` ; la validation et
  la liste des champs doivent etre prouvees avant correction.
- Des impressions frontend utilisent `document.write` avec contenu dynamique.
- Une expression reguliere frontend est construite dynamiquement.
- Le rapport historique des 29 alertes Semgrep n etait pas versionne ; sa
  reconstitution ne doit pas etre inventee.

## Decision

Une pipeline racine unique est necessaire. Elle reutilise les lanceurs existants,
ne cree pas une seconde architecture E2E et separe les controles rapides des
campagnes lourdes.
