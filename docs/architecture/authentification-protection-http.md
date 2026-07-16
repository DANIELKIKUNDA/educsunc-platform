# Protection HTTP systematique

## Decision

EduSync applique une politique **privee par defaut**. Une route HTTP nouvelle est inaccessible sans authentification tant qu'elle n'a pas ete ajoutee explicitement a l'allowlist publique centrale.

La protection est appliquee avant les controleurs metier par `authentication.plugin.ts`. Elle complete, sans les remplacer, les permissions et perimetres de `shared/security`.

## Surface publique officielle

| Categorie | Methode | Route | Environnements | Justification |
|---|---|---|---|---|
| A - publique legitime | `GET` | `/health` | tous | Sonde minimale de disponibilite |
| B - authentification publique | `POST` | `/api/auth/login` | tous | Ouverture de session |
| B - authentification publique | `POST` | `/api/auth/refresh` | tous | Rotation securisee du jeton |
| E - developpement | `POST` | `/api/auth/dev/session` | `development` uniquement | Pilotage local par acteur |

La route developpeur n'est pas enregistree hors de l'environnement `development`. Une methode differente, un sous-chemin, une route de diagnostic detaillee ou une route inconnue ne beneficie jamais de cette exception.

## Matrice des routes privees

Toutes les routes des familles suivantes appartiennent a la categorie C : authentification et session actives obligatoires. Leurs permissions et perimetres metier restent ensuite controles par les politiques locales existantes.

| Famille | Surface principale | Classification | Protection complementaire |
|---|---|---|---|
| Auth privee | `/api/auth/logout`, `/api/auth/session`, `/api/auth/contexte/**`, `/api/auth/revoquer-toutes-sessions`, `/api/auth/offline/synchroniser` | C | coherence session, tenant et mode hors ligne |
| Configuration | `/api/v1/configuration/**` | C | permissions Configuration et niveau proprietaire |
| Securite | `/api/v1/security/**` | C | permissions, roles, affectations et scopes |
| Audit et forensic | `/api/v1/audit/**`, `/api/v1/forensic/**`, `/api/v1/exports/**` | C/F | politiques Audit et gouvernance |
| Monitoring | `/api/v1/monitoring/**` | C/F | acteurs Plateforme et politiques Monitoring |
| Notifications | `/api/v1/notifications/**`, `/api/v1/admin/notifications/**` | C | permissions et perimetres de notification |
| Referentiel academique | `/api/organisations/**`, `/api/ecoles/**`, `/api/sections-scolaires/**`, `/api/classes-academiques/**`, `/api/options-etudes/**`, `/api/referentiels/**`, `/api/migrations-referentiel/**` | C | `referentiel.read/write` et perimetre concerne |
| Scolarite et eleves | `/api/eleves/**`, `/api/familles/**`, `/api/inscriptions-scolaires/**`, `/api/affectations-classes/**`, `/api/parcours/**` | C | permissions Scolarite et perimetre metier |
| Paiements et facturation | `/api/paiements/**`, `/api/caisses/**`, `/api/facturation/**` et lectures financieres associees | C | permissions financieres et perimetre |
| Bulletins et evaluations | `/api/bulletins/**`, `/cotes/**`, `/resultats/**`, `/classements/**`, `/proclamations/**`, `/conduite/**` et routes documentaires associees | C | permissions pedagogiques et perimetre |
| Sante detaillee des BC | par exemple `/api/bulletins/health/**` | F | session obligatoire, contrairement a `/health` |
| Route absente de la matrice | toute nouvelle route | G puis C automatiquement | privee tant qu'aucune decision publique explicite n'est codee |

Cette matrice decrit l'integralite des points d'entree enregistres par `registerGlobalRoutes` et leurs sous-routes. Elle ne constitue pas une liste d'exceptions : seule la surface publique officielle ci-dessus en est une.

## Chaine de confiance

Pour chaque route privee, le backend verifie dans cet ordre :

1. presence d'un Bearer token ;
2. signature, algorithme, issuer, audience, expiration et claims obligatoires du JWT ;
3. existence et etat actif du compte PostgreSQL ;
4. egalite de la `tokenVersion` du jeton et du compte ;
5. presence du `sid` et coherence avec `x-session-id` lorsqu'il est fourni ;
6. existence et etat actif de la session PostgreSQL ;
7. appartenance de la session au `sub` du JWT ;
8. coherence de `x-user-id`, `x-organisation-id` et `x-tenant-id` avec l'identite et le contexte actifs ;
9. enrichissement du `RequestContext` a partir des donnees verifiees ;
10. calcul des permissions, restrictions, scopes et titulariats par `shared/security` ;
11. controle du perimetre organisation, ecole, section, classe ou autre selon le workflow.

Les en-tetes clients ne creent jamais une identite. `x-user-id` est verifie puis remplace par le `sub` authentifie. Les en-tetes de contexte ne peuvent pas selectionner silencieusement une organisation ou une ecole differente de la session active.

## Contrat d'erreur

| Statut | Code central | Signification |
|---|---|---|
| `401` | `AUTHENTICATION_REQUIRED` | aucun Bearer token valide fourni |
| `401` | `AUTHENTICATION_INVALID` | jeton, compte, version ou session invalide/revoque |
| `403` | `IDENTITY_CONTEXT_MISMATCH` | tentative d'imposer une autre identite |
| `403` | `ACTIVE_CONTEXT_MISMATCH` | organisation ou ecole transmise differente de la session active |
| `403` | code metier existant | authentification valide, mais permission, restriction ou perimetre refuse |

Les reponses publiques restent generiques. Les details techniques sont journalises cote serveur et ne sont pas exposes au client.

## Regles de maintenance

- Une route n'est jamais rendue publique par convention de nommage.
- Toute nouvelle exception publique exige une entree methode + chemin exact dans `HttpRouteAuthenticationPolicy`, une justification documentaire et un test.
- Les diagnostics detailles restent prives ; seule la sonde minimale `/health` est publique.
- La protection globale ne dispense jamais d'une permission et d'un perimetre metier.
- Les controleurs lisent l'acteur depuis le `RequestContext` authentifie, jamais depuis un en-tete libre.

## Preuves automatisees

- `http-route-authentication-policy.test.ts` verrouille l'allowlist et le comportement prive par defaut.
- `http-private-by-default.integration.test.ts` couvre toutes les familles globales et une route future inconnue.
- `request-context-pipeline.test.ts` couvre l'enrichissement complet et les tentatives d'usurpation.
- `auth-routes.integration.test.ts` couvre login, session, contexte contradictoire, logout et revocation PostgreSQL.
- `JwtTokenHardening.test.ts` couvre signature, expiration, issuer, audience, algorithme et claims.
- `auth.dev-session.routes.test.ts` couvre la disponibilite stricte de la session developpeur.
