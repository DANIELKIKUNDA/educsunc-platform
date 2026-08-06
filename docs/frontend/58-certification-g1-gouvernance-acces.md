# Certification G1 - Gouvernance globale des acces frontend

## 1. Objet

Cette matrice relie chaque exigence G1 a une preuve executable. La
certification combine les tests unitaires frontend, les tests d'integration
backend et les parcours navigateur reels. Aucune interception de reponse
metier n'est autorisee. Le tenant de certification est cree ou relu par les
routes officielles puis configure par les workflows Modules existants.

## 2. Matrice des acteurs

| Acteur | Profil et niveau effectifs | Menu, route ou action prouvee |
| --- | --- | --- |
| `MANAGER_SYSTEME` | Playwright G1, audit Plateforme | Audit Plateforme sans contexte ecole |
| `SUPPORT_SYSTEME` | Session reelle G1 | Menus et action interdits absents, URL directe refusee |
| `PROMOTEUR_ORGANISATION` | Matrice Playwright G1 | Profil `ORGANISATION` uniquement |
| `ADMIN_SYSTEME_ORGANISATION` | Matrice Playwright G1 | Profil `ORGANISATION` uniquement |
| `ADMINISTRATEUR_ECOLE` | Matrice Playwright G1 | Profil `ECOLE` uniquement |
| `ADMIN_SYSTEME_ECOLE` | Matrice Playwright G1 | Profil `ECOLE` uniquement |
| `PREFET_ETUDES` | Matrice Playwright G1 | Profil `ECOLE` uniquement |
| `SECRETAIRE` | Matrice Playwright G1 | Profil `ECOLE` uniquement |
| `CAISSIER` | Playwright G1, audit financier | Audit financier de son ecole, audit Plateforme refuse |
| `ENSEIGNANT` | Matrice Playwright G1 | Profil `ECOLE` uniquement |
| `PARENT` | Matrice Playwright G1 | Profil `ECOLE` uniquement |

## 3. Matrice des scenarios obligatoires

| Scenario | Couche | Preuve executable |
| --- | --- | --- |
| Menu visible ou absent | Navigateur | `g1-access-governance.spec.ts`, scenarios Support et Caissier |
| Route directe interdite | Navigateur | `g1-access-governance.spec.ts`, scenarios Support et Caissier |
| Bouton ou action absent | Navigateur | recherche globale Support sans action interdite |
| Module desactive | Frontend unitaire | `run-effective-access-tests.cjs`, refus par module |
| Permission retiree en session | Frontend cycle de vie | `run-frontend-lifecycle-tests.cjs`, purge et annulation |
| Organisation A vers B | Frontend cycle de vie et backend | invalidation du store Organisation et controle de contexte |
| Ecole A vers B | Frontend cycle de vie et backend | revision monotone, annulation et controle tenant |
| Reponse ancienne A ignoree | Frontend cycle de vie | revision monotone et annulation des requetes precedentes |
| Deconnexion | Navigateur et frontend | scenario Playwright deconnexion et purge des portees |
| Session revoquee | Backend | `SessionMiddleware.test.ts` |
| Compte suspendu | Backend et frontend | `PostgresAuthTokenLifecycle.integration.test.ts` et refus frontend |
| `tokenVersion` invalide | Backend | `login.e2e.spec.ts` et tests du cycle de vie des jetons |
| Parent autorise et enfant etranger | Backend et frontend | `parent-workflow.e2e.spec.ts`, `security-lecture-bulletins.integration.spec.ts`, moteur frontend |
| Enseignant affecte et classe etrangere | Backend | tests `security-*` limites par affectation et classe |
| Caissier et audit financier | Navigateur | scenario Playwright Caissier |
| Titulaire derive | Backend et frontend | `SecurityCapacitesEffectivesService.test.ts`, moteur frontend et absence d'acteur statique |
| Audit Plateforme sans ecole | Navigateur | scenario Playwright Manager |
| Audit Organisation sans ecole | Backend HTTP | `audit-organisation-routes.integration.test.ts` |

## 4. Commandes de certification

Depuis `frontend` :

```powershell
npm run test:access
npx playwright test --config e2e/g1/playwright.g1.config.ts
npm run build
```

Depuis `backend` :

```powershell
npm run typecheck
npm run build
npm run test:security
```

Les tests PostgreSQL d'authentification, les routes Configuration et les
routes Audit ciblees sont executes dans le Codespace de certification avec
PostgreSQL et Redis reels.

## 5. Resultats de certification

| Controle | Resultat |
| --- | --- |
| Parcours navigateur G1 | 13/13 passes |
| Tests frontend | 55/55 passes |
| Tests backend SECURITY | 72/72 passes |
| Matrice backend ciblee | 25/25 passes |
| Certification E2E racine | passee en 75,9 s |
| Builds backend et frontend | passes |
| Verification rapide et verification code | passees |
| Semgrep bloquant | 0 resultat |
| Gitleaks | aucun secret detecte |
| Trivy filesystem et configuration | aucun risque HIGH ou CRITICAL |
| Baseline k6 | 1 493 requetes, p95 29 ms, p99 44 ms |

La mise a jour de `vue-tsc` a supprime la vulnerabilite transitive
`CVE-2026-14257`. Les onze alertes Semgrep non bloquantes restent documentees :
politique CORS dynamique, impressions historiques utilisant `document.write`
et expression reguliere dynamique du resolveur doctrinal. Le bundle frontend
principal depasse encore 500 Ko minifies. Les avertissements deprecation
Fastify et PostgreSQL observes pendant les tests ne bloquent pas G1, mais
doivent etre traites avant les prochaines montes de versions majeures.

## 6. Regles de verdict

G1 n'est certifiable que si :

- les onze acteurs passent leurs scenarios de session reelle ;
- chaque acteur est ouvert et verifie directement par son scenario, sans
  duplication prealable de sessions ;
- chaque scenario obligatoire possede une preuve verte ;
- les builds backend et frontend sont verts ;
- les tests securite, authentification, contexte et audit sont verts ;
- la CI GitHub est verte ;
- Git est propre et synchronise ;
- le Codespace de certification est arrete apres collecte des preuves.
