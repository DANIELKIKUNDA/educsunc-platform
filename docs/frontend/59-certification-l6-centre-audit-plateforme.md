# Certification L6 - Centre Audit Plateforme

## Objet

L6 materialise dans le frontend les contrats certifies L1 a L5 sans modifier le metier ni l'infrastructure Audit.

## Base certifiee

- branche de depart: `main`
- merge L5: `4d7b1b777ee873bee9b6d82413e00b1c4a9a6820`
- branche L6: `feat/l6-audit-frontend-ux-certification`
- L1: securite tenant et IDOR
- L2: ecriture canonique, outbox et durabilite
- L3: lecture PostgreSQL, filtres SQL et pagination keyset
- L4: producteurs canoniques et journaux historiques
- L5: exports, replay, retention et integrite

## Architecture frontend

Le Centre Audit Plateforme respecte MVVM:

- vue mince: `AuditPlatformView.vue`
- ViewModel: `usePlatformAuditCenterViewModel.ts`
- store: `platform-audit-center.store.ts`
- service HTTP: `platform-audit.api.ts`
- contrats: `platform-audit.model.ts`
- mapper: `platform-audit.mapper.ts`
- composants dedies dans `domains/audit/components`

La vue ne construit aucun payload HTTP et n'implemente aucune permission.

## Parcours couverts

1. ouverture du cockpit Plateforme;
2. lecture PostgreSQL du journal;
3. filtres structures par periode, type, gravite, resultat, acteur, ressource et tenant restrictif;
4. chargement progressif avec curseur opaque;
5. detail par deep-link securise;
6. chronologie chargee uniquement a la demande;
7. export asynchrone, statut et telechargement prive;
8. export forensic lorsqu'il est autorise;
9. replay de projections avec verification sans modification par defaut;
10. consultation et archivage logique;
11. verification d'integrite d'un evenement ou d'une plage bornee.

## Permissions

| Capacite | Permission backend |
| --- | --- |
| journal et detail | `audit.read` |
| chronologie | `audit.timeline.read` |
| historique | `audit.history.read` |
| demander un export | `audit.export` |
| suivre un export | `audit.export.read` |
| telecharger | `audit.export.download` |
| supprimer le fichier | `audit.export.delete` |
| export investigation | `forensic.export` |
| replay | `audit.replay` |
| archives | `audit.retention.read` |
| archivage | `audit.retention.archive` |
| apercu retention | `audit.retention.purge` |
| integrite | `audit.security.read` |

Les boutons sont masques ou desactives selon ces permissions. Le backend reste l'autorite de securite.

## Securite frontend

- aucun contexte organisation ou ecole actif n'est injecte dans les en-tetes des routes Plateforme;
- les filtres tenant facultatifs ne peuvent que restreindre la lecture backend L1;
- aucun curseur n'est fabrique ou decode;
- aucun JSON brut n'est affiche;
- aucun `v-html` n'est utilise;
- aucune donnee Audit n'est stockee dans `localStorage` ou `sessionStorage`;
- les telechargements passent par le transport authentifie canonique;
- les noms de metadata sensibles sont filtres defensivement apres la redaction backend;
- les erreurs techniques ne sont pas restituees telles quelles.

## Corrections revelees par la certification

- les reponses de lecture L3 et les reponses d'operation L5 sont relues sans supposer une enveloppe HTTP unique;
- un tenant absent en session (`null`) est normalise en absence de filtre avant la lecture PostgreSQL;
- le `correlationId` de la requete HTTP reste une information de tracage et n'est plus injecte comme filtre implicite du journal, du detail ou des exports;
- les exceptions applicatives Audit conservent leur statut HTTP: validation `400`, refus `403`, absence `404` et conflit `409`;
- Vite ignore les artefacts Playwright afin de ne pas surveiller les videos de certification sous Windows.

Ces corrections ne modifient aucune permission ni aucun perimetre. Elles retablissent les contrats L1, L3 et L5 deja figes.

## UX, responsive et accessibilite

- tokens et composants du design system EduSync;
- tableau sticky sur desktop et cartes sur mobile;
- focus clavier visible;
- dialogues avec focus trap, echappement et verrouillage de scroll;
- etiquettes explicites, badges textuels et etats non fondes uniquement sur la couleur;
- chargement, vide, erreur, hors connexion, acces refuse et fin de liste;
- animations respectant `prefers-reduced-motion`.

## Limites honnetes

- les investigations forensic detaillees restent au scope ecole dans les routes existantes;
- le backend ne fournit pas une route de liste globale des exports: la vue suit les exports de la session courante;
- le backend ne fournit pas un statut global d'integrite persistant: la vue affiche le dernier resultat de controle de la session;
- la retention n'effectue aucune suppression physique;
- le module Audit Plateforme reste connecte et n'est pas mis artificiellement hors ligne.

## Tests

- `npm run test:audit` frontend: `7/7`, contrats, mapper, routes, permissions, pagination et architecture;
- `npm run test:audit` backend: `53` reussis, `3` integrations PostgreSQL deleguees aux suites dediees, aucun echec;
- `npm run test:e2e:audit`: `18/18`, aucun echec et aucun scenario ignore;
- le jeu E2E contient `36` evenements Plateforme persistants, idempotents et append-only;
- les scenarios navigateur couvrent Manager, Support, refus acteur Organisation, refus acteur Ecole, detail, curseur, exports, telechargement, forensic, integrite, replay, erreur, reprise, vide et tablette;
- suites backend L1-L5 relancees avant certification;
- build, typecheck, lint et `git diff --check` obligatoires;
- la certification finale exige une CI GitHub Actions entierement verte.
