# Phase 14 - Cartographie Finale Des Workflows

## Statut

Ce document cloture l'etape de cartographie des workflows reels EduSync.

Il fixe en un seul point :

- l'index officiel des workflows figes
- la matrice officielle acteurs + perimetres
- la verification executable minimale de cloture

Le backend reste la source de verite ultime.

## Objectif

Apres la fermeture successive des workflows academiques, pedagogiques, scolaires, financiers, d'administration, d'organisation, de plateforme et transverses, il manquait une vue unique pour :

- retrouver rapidement un workflow fige
- savoir a quel niveau il s'exerce
- savoir quel acteur agit dans quel perimetre
- executer un filet de verification final sans repartir document par document

Ce document devient cette vue unifiee.

## Index Officiel Des Workflows Figes

| Famille | Workflows figes | Total | Source |
| --- | --- | ---: | --- |
| Academique | `ACA-03`, `ACA-04`, `ACA-05`, `ACA-06`, `ACA-07`, `ACA-08`, `ACA-09` | 7 | [06-workflows-academiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/06-workflows-academiques.md) |
| Pedagogique | `PED-01`, `PED-02`, `PED-03`, `PED-04`, `PED-05`, `PED-06`, `PED-07`, `PED-08` | 8 | [07-workflows-pedagogiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/07-workflows-pedagogiques.md) |
| Scolaire | `SCO-01`, `SCO-02`, `SCO-03`, `SCO-04`, `SCO-05`, `SCO-06` | 6 | [08-workflows-scolaires.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/08-workflows-scolaires.md) |
| Financier | `PF-01` a `PF-19` | 19 | [09-workflows-financiers.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/09-workflows-financiers.md) |
| Administration ecole | `ADM-01` | 1 | [10-workflows-administration-ecole.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/10-workflows-administration-ecole.md) |
| Organisation | `ORG-01` | 1 | [11-workflows-organisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/11-workflows-organisation.md) |
| Plateforme | `PLT-01`, `PLT-02`, `PLT-03`, `PLT-04`, `PLT-05` | 5 | [12-workflows-plateforme.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/12-workflows-plateforme.md) |
| Transverse auth et audit | `SHD-AUTH-01`, `SHD-AUD-01`, `AUD-01`, `AUD-02`, `AUD-03`, `AUD-04` | 6 | [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md) |
| Transverse monitoring | `MON-01` a `MON-17` | 17 | [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md) |
| Transverse configuration | `CFG-03`, `CFG-04`, `CFG-05`, `CFG-PLAT-01`, `CFG-ORG-01`, `CFG-ECOLE-SYS-01`, `CFG-ECOLE-METIER-01`, `CFG-ECOLE-METIER-02`, `CFG-USER-01` | 9 | [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md) |
| Transverse notifications | `NOTIF-01`, `NOTIF-02` | 2 | [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md) |
| Transverse security | `SEC-01`, `SEC-02`, `SEC-03`, `SEC-04` | 4 | [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md) |

Total officiel actuellement fige : `85 workflows`.

## Correspondances Et Clotures Officielles

Les points suivants sont clos et ne doivent plus etre rouverts comme faux nouveaux workflows backend :

- `AUD-05` n'ouvre pas un workflow backend distinct dans l'etat actuel ; la partie disciplinaire prouvee est absorbee par `AUD-04`
- `AUD-06` est deja couvert par `SHD-AUD-01`
- `PED-05` est fige et ne doit plus etre rouvert sans preuve backend nouvelle
- la doctrine `permission + perimetre` est la grille de lecture transverse obligatoire des workflows metier

## Matrice Officielle Acteurs + Perimetres

La lecture officielle n'est jamais `permission seule`.

La lecture obligatoire est toujours :

`permission + perimetre reel`

| Acteur | Niveau reel | Perimetre reel | Familles de workflows principalement concernees |
| --- | --- | --- | --- |
| `MANAGER_SYSTEME` | Plateforme | plateforme complete | `PLT-*`, `MON-*`, `CFG-PLAT-*`, `SEC-*`, `SHD-*`, `AUD-06` via `SHD-AUD-01` |
| `OPERATEUR_SYSTEME` | Plateforme | plateforme complete, seulement sur delegations explicites documentees | `PLT-*` delegables, `MON-*`, certains workflows `CFG-PLAT-*` |
| `SUPPORT_SYSTEME` | Plateforme | plateforme complete, en lecture ou action support explicite | `MON-*`, audit et configuration en lecture support, jamais gouvernance implicite |
| `PROMOTEUR_ORGANISATION` | Organisation | organisation courante et ses ecoles | `ORG-*`, `AUD-01`, `CFG-ORG-*`, certains `PF-*` de supervision |
| `ADMIN_SYSTEME_ORGANISATION` | Organisation | organisation courante et ses ecoles, cote administration systeme | `ORG-*`, `CFG-ORG-*`, supervision technique organisationnelle |
| `GESTIONNAIRE_ORGANISATION` | Organisation | organisation courante et ses ecoles, cote gouvernance et pilotage | `ORG-*`, `AUD-01`, consultation transverse metier autorisee |
| `ADMIN_SYSTEME_ECOLE` | Ecole | ecole courante | `ADM-*`, `CFG-ECOLE-SYS-*`, `AUD-03`, certains `NOTIF-*` et `SEC-*` locaux |
| `ADMINISTRATEUR_ECOLE` | Ecole | ecole courante | gouvernance ecole non technique, finance et pilotage local ; `AUD-02`, `CFG-ECOLE-METIER-*`, certains `PF-*` |
| `CAISSIER` | Ecole | ecole courante | inscription, eleves, familles, caisse, recus, dette, historique paiements, workflows `PF-*`, une partie de `SCO-*` |
| `PREFET_ETUDES` | Section secondaire d'une ecole | meme ecole + meme section secondaire + annee scolaire ou classe selon workflow | `PED-*`, une partie de `SCO-*`, notifications ecole autorisees, supervision paiement selon politique |
| `DIRECTEUR_ETUDES` | Section secondaire d'une ecole | meme ecole + meme section secondaire + annee scolaire ou classe selon workflow | `PED-*`, une partie de `SCO-*`, notifications ecole autorisees |
| `DIRECTEUR_DISCIPLINE` | Section secondaire d'une ecole | meme ecole + meme section secondaire | conduite, discipline, lecture disciplinaire absorbee dans `AUD-04`, certaines actions scolaires autorisees |
| `DIRECTEUR_PRIMAIRE` | Section primaire d'une ecole | meme ecole + meme section primaire | workflows scolaires et pedagogiques de sa section, notifications et actions ecole autorisees |
| `DIRECTEUR_MATERNELLE` | Section maternelle d'une ecole | meme ecole + meme section maternelle | workflows scolaires et pedagogiques de sa section, notifications et actions ecole autorisees |
| `TITULAIRE` | Classe | classe titulaire + annee scolaire courante | conduite de classe, consultations pedagogiques, analyses de resultats, certaines lectures financieres si la politique de l'ecole l'autorise |
| `ENSEIGNANT` | Cours et classes affectes | ses cours et ses classes uniquement | cotation, saisies et lectures pedagogiques liees a ses enseignements, jamais extension implicite a toute l'ecole |
| `PARENT` | Enfants autorises | enfants rattaches et autorises uniquement | dette, historique paiements, resultat ou bulletin selon exposition autorisee |

Important pour `shared/security` :

- `TITULAIRE` est une capacite metier portee par un acteur `ENSEIGNANT` titulaire d'une classe
- la lecture de securite reelle reste donc : role enseignant + permission requise + affectation de titulariat + perimetre de classe et d'annee scolaire

## Doctrine De Lecture Rapide

Pour eviter les reouvertures inutiles, la verification rapide d'un workflow doit toujours suivre cet ordre :

1. identifier le BC ou module proprietaire
2. relire l'acteur principal reel
3. relire la permission reelle
4. relire le perimetre reel
5. relire la route ou le use case prouve
6. verifier le test qui ferme le comportement

Si l'un des points 2 a 6 manque, le workflow n'est pas considere fige.

## Verification Executable Finale

La verification finale minimale de la cartographie repose maintenant sur trois paliers complementaires.

### Palier 1 - Typage global

Commande :

```powershell
npm run typecheck
```

But :

- verifier le socle TypeScript complet du backend

Source :

- [package.json](/C:/Users/MON%20PC/Documents/EducSyn/backend/package.json)

### Palier 2 - Socle global transverse

Commande :

```powershell
npm run test:global
```

But :

- verifier sequentiellement les tests `src/tests`
- controler les routes globales, l'activation modulaire, les integrations transverses et le pipeline HTTP partage

Sources :

- [package.json](/C:/Users/MON%20PC/Documents/EducSyn/backend/package.json)
- [run-shared-global-tests.cjs](/C:/Users/MON%20PC/Documents/EducSyn/backend/scripts/run-shared-global-tests.cjs)

### Palier 3 - Scenarios de workflows

Commande :

```powershell
npm run test:workflows
```

But :

- verifier les scenarios transverses explicites documentes comme workflows composes
- garder un filet lisible de non-regression sur les grandes chaines metier

Sources :

- [package.json](/C:/Users/MON%20PC/Documents/EducSyn/backend/package.json)
- [run-workflow-scenario-tests.cjs](/C:/Users/MON%20PC/Documents/EducSyn/backend/scripts/run-workflow-scenario-tests.cjs)
- [backend/src/shared/tests/workflows](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/workflows)

## Lecture CTO De Cloture

L'etape workflows est maintenant lisible en trois couches :

- les documents de detail par BC et module portent la preuve metier fine
- cette cartographie finale porte la vue consolidée officielle
- les scripts de verification donnent un point d'entree executable unique pour la stabilisation finale

Tant qu'un nouveau workflow n'est pas ajoute avec :

- sa preuve backend
- sa documentation detaillee
- son rattachement a cette cartographie

il ne doit pas etre considere comme officiellement fige.
