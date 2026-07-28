# Workflows Transverses Frontend EduSync

## Statut

Ce document ouvre et fige les workflows transverses reels portes par `shared/*`.

## SHD-AUTH-01

### Identifiant

`SHD-AUTH-01`

### Nom

Se connecter et ouvrir une session

### Categorie

`Transverse`

### Niveau de criticite

`Critique`

### Objectif metier

Ouvrir une session utilisateur authentifiee et etablir un contexte actif exploitable par les autres BC.

### Acteur principal

`ACTEUR_AUTHENTIFIABLE`

### Acteurs secondaires

- aucun

### Preconditions

- compte utilisateur existant
- mot de passe valide
- scopes SECURITY compatibles avec l'organisation et l'ecole actives demandees

### Permissions effectives requises

- aucune permission metier locale obligatoire
- verification des scopes SECURITY du compte

### Cas d'utilisation utilises

- ouvrir une session AUTH
- consulter sa session active
- consulter son contexte actif
- changer son contexte actif
- fermer sa session
- revoquer toutes ses sessions

### Deroulement principal

1. L'utilisateur appelle `POST /api/auth/login`.
2. Le backend verifie le compte, le mot de passe et la compatibilite des scopes avec le contexte demande.
3. Le backend ouvre la session et retourne `accessToken`, `refreshToken`, `sessionId`, utilisateur et contexte actif.
4. Le frontend relit ensuite `GET /api/auth/session` et `GET /api/auth/contexte` selon son besoin d'initialisation.

### Variantes

- rotation des jetons via `POST /api/auth/refresh`
- changement d'organisation active
- changement d'ecole active
- revocation globale des sessions
- synchronisation offline

### Resultat attendu

Une session AUTH valide existe et le contexte actif requis par les autres workflows est etabli.

### Contraintes backend

- le workflow est transverse : il prepare les autres BC mais ne remplace pas leurs controles metier
- la compatibilite `organisation + ecole` est verifiee par les scopes SECURITY du compte
- `GET /api/auth/session` reste borne a la session courante
- `POST /api/auth/revoquer-toutes-sessions` reste borne au meme utilisateur authentifie

### Evenements importants

- ouverture de session
- rotation de refresh token
- logout
- revocation globale
- changement de contexte actif

### Donnees manipulees

- `UtilisateurAuth`
- `SessionUtilisateur`
- `RefreshToken`
- `ContexteActifAuth`

### Sources backend

- [auth.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/auth/interfaces/http/routes/auth.routes.ts)
- [auth.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/auth.routes.ts)
- [index.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/index.ts)
- [auth-routes.integration.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/tests/integration/auth-routes.integration.test.ts)
- [global-routes-activation.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/tests/architecture/global-routes-activation.test.ts)

### Notes de lecture frontend

- ce workflow doit etre traite comme le sas d'entree obligatoire des workflows reels
- le frontend peut reutiliser la meme source de verite AUTH pour initialiser menus, guardes et contexte courant

### Questions ouvertes

- aucune dette bloquante relevee apres branchement global des routes AUTH

## Verdict

`SHD-AUTH-01` est maintenant expose, teste et fige.

## Doctrine Audit

Le BC `shared/audit` ne doit pas etre lu comme un unique workflow global `consulter les audits`.

La lecture officielle est une famille de workflows distincts :

- `AUD-01` audit organisationnel
- `AUD-02` audit administratif et financier ecole
- `AUD-03` audit technique ecole
- `AUD-04` audit pedagogique
- `AUD-05` audit disciplinaire
- `AUD-06` audit plateforme

Convention de lecture deja figee :

- `AUD-06` correspond au workflow transverse deja documente sous l'identifiant `SHD-AUD-01`
- il ne faut donc pas ouvrir un second workflow backend distinct si la preuve technique vise seulement `GET /api/v1/audit*`

Chaque workflow d'audit doit etre defini par :

- le type d'audit
- les acteurs reels autorises
- la permission effective
- le perimetre metier reel

On ne doit donc jamais confondre :

- niveau d'acteur
- niveau de scope
- famille d'audit

## SHD-AUD-01

### Identifiant

`SHD-AUD-01`

### Nom

Consulter l'audit plateforme global

### Categorie

`Transverse`

### Niveau de criticite

`Eleve`

### Objectif metier

Permettre a un acteur systeme de consulter les traces d'audit techniques exposees par `shared/audit` au niveau global de la plateforme.

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

### Preconditions

- session AUTH valide
- contexte SECURITY actif coherent
- permissions `audit.*` attestees pour l'acteur
- scope `PLATEFORME` compatible avec l'acteur
- aucune organisation ni ecole active exigee
- lecture comprise comme une lecture plateforme, et non comme un audit ecole metier

### Permissions effectives requises

- `audit.read`
- `audit.timeline.read`
- `audit.history.read`

### Cas d'utilisation utilises

- consulter la liste d'audit technique globale
- consulter un audit technique par identifiant
- consulter la timeline d'audit technique
- consulter l'historique d'audit technique

### Deroulement principal

1. L'acteur systeme appelle `GET /api/v1/audit`.
2. Le backend verifie la permission `audit.read` et le scope `PLATEFORME` dans le contexte actif.
3. Le backend retourne la liste d'audit bornee au contexte autorise.
4. Le frontend peut ensuite appeler `GET /api/v1/audit/timeline` ou `GET /api/v1/audit/history` selon l'analyse souhaitee.

### Variantes

- consultation detaillee via `GET /api/v1/audit/:id`
- lecture timeline via `GET /api/v1/audit/timeline`
- lecture historique via `GET /api/v1/audit/history`

### Resultat attendu

Les donnees d'audit exposees correspondent uniquement au contexte autorise et aux permissions `audit.*` effectivement detenues, sans ouvrir pour autant un audit metier organisationnel, administratif, pedagogique ou disciplinaire.

### Contraintes backend

- le workflow reste ferme aux acteurs ecole sans permissions `audit.*`
- la route applique bien la doctrine `permission + perimetre`
- le perimetre concret porte par le backend est le scope `PLATEFORME` du contexte SECURITY
- la route ne depend pas d'une ecole active
- les acteurs positifs actuellement prouves restent des acteurs plateforme
- ce workflow ne doit pas etre relu comme un audit metier ecole
- le branchement global passe par les routes globales `app/routes`

### Evenements importants

- aucune mutation metier
- consultation tracee via l'infrastructure d'audit elle-meme

### Donnees manipulees

- liste d'audits
- timeline d'audit
- historique d'audit

### Sources backend

- [audit.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/audit.routes.ts)
- [http.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/audit/interfaces/http/routes/http.routes.ts)
- [audit.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/audit/interfaces/http/routes/audit.routes.ts)
- [AuditInterfacePermissionsSecurity.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/audit/interfaces/security/permissions/AuditInterfacePermissionsSecurity.ts)
- [PermissionSecurite.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/value-objects/PermissionSecurite.ts)
- [GlobalFixtures.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/fixtures/GlobalFixtures.ts)
- [audit-routes.integration.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/tests/integration/audit-routes.integration.test.ts)
- [global-routes-activation.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/tests/architecture/global-routes-activation.test.ts)

### Notes de lecture frontend

- ce workflow ouvre une lecture plateforme globale de l'audit
- il ne doit plus etre relu comme une preuve inachevee des autres familles
- `SUPPORT_SYSTEME` est positif sur la lecture, mais ne devient pas automatiquement acteur des futures mutations d'administration audit

### Questions ouvertes

- aucune dette bloquante restante sur `SHD-AUD-01`

## Verdict

`SHD-AUD-01` est fige comme workflow d'audit plateforme global, sans dependance artificielle a une organisation ou une ecole active.

## Verdict de correspondance

`AUD-06` est deja couvert par `SHD-AUD-01`.

Il ne s'agit pas d'un nouveau workflow backend distinct, mais du meme workflow d'audit plateforme sous la nomenclature de la famille `AUD-*`.

## AUD-01

### Identifiant

`AUD-01`

### Nom

Consulter l'audit organisationnel

### Categorie

`Transverse`

### Niveau de criticite

`Eleve`

### Objectif metier

Permettre aux acteurs organisationnels de superviser les signaux d'audit consolides de leurs ecoles sans ouvrir l'audit plateforme ni les audits metier locaux d'ecole.

### Acteur principal

`PROMOTEUR_ORGANISATION`

### Acteurs secondaires

- `GESTIONNAIRE_ORGANISATION`

### Preconditions

- session AUTH valide
- contexte SECURITY actif coherent
- organisation active compatible avec le scope controle par la route
- aucune ecole active requise
- permissions organisationnelles `audit.monitoring.read`, `audit.analytics.read` ou `audit.security.read` selon la lecture demandee

### Permissions effectives requises

- `audit.monitoring.read`
- `audit.analytics.read`
- `audit.security.read`

### Cas d'utilisation utilises

- consulter le monitoring organisationnel
- consulter les analytics d'audit organisationnels
- consulter un incident de securite organisationnel

### Deroulement principal

1. L'acteur organisationnel appelle une route `monitoring/*`, `analytics/*` ou `security/*` bornee a `ORGANISATION`.
2. Le backend verifie la permission de lecture d'audit requise.
3. Le backend verifie le scope `ORGANISATION` dans le contexte actif.
4. Le backend retourne uniquement les donnees autorisees pour l'organisation active.

### Variantes

- `GET /api/v1/monitoring/health`
- `GET /api/v1/analytics/audit`
- `GET /api/v1/security/incidents/:id`

### Resultat attendu

Les donnees exposees restent bornees a l'organisation active et ne transforment pas les acteurs organisationnels en acteurs plateforme.

### Contraintes backend

- les routes actuellement prouvees pour `AUD-01` sont bornees a `ORGANISATION`
- une ecole eventuellement choisie sert uniquement de filtre descendant autorise ; elle n'est pas une precondition d'ouverture
- `ADMINISTRATEUR_ECOLE` reste refuse sur ce workflow
- `AUD-01` ne vaut pas encore preuve pour les autres familles d'audit

### Evenements importants

- aucune mutation metier
- consultation de supervision organisationnelle

### Donnees manipulees

- monitoring de sante audit
- analytics d'audit
- incidents de securite

### Sources backend

- [monitoring.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/audit/interfaces/http/routes/monitoring.routes.ts)
- [analytics.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/audit/interfaces/http/routes/analytics.routes.ts)
- [security.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/audit/interfaces/http/routes/security.routes.ts)
- [GlobalFixtures.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/fixtures/GlobalFixtures.ts)
- [audit-organisation-routes.integration.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/tests/integration/audit-organisation-routes.integration.test.ts)

### Notes de lecture frontend

- `AUD-01` correspond a un audit organisationnel de supervision
- ce workflow ne doit pas etre presente comme un audit ecole, pedagogique, disciplinaire ou technique local

### Questions ouvertes

- l'export organisationnel et les autres sous-workflows avances d'audit restent a figer individuellement

## Verdict

`AUD-01` est maintenant expose, securise, teste et fige.

## AUD-02

### Identifiant

`AUD-02`

### Nom

Consulter l'audit administratif et financier ecole

### Categorie

`Transverse`

### Niveau de criticite

`Eleve`

### Objectif metier

Permettre aux acteurs ecole reellement responsables de l'administration et de la finance locale de consulter les traces d'audit administratives et financieres bornees a leur ecole active.

### Acteur principal

`ADMINISTRATEUR_ECOLE`

### Acteurs secondaires

- `CAISSIER`

### Preconditions

- session AUTH valide
- contexte SECURITY actif coherent
- ecole active compatible avec le scope controle par la route
- permission `audit.finance.read`

### Permissions effectives requises

- `audit.finance.read`

### Cas d'utilisation utilises

- consulter la liste de l'audit administratif et financier de l'ecole
- consulter l'historique administratif et financier borne a l'ecole
- consulter la timeline administrative et financiere bornee a l'ecole

### Deroulement principal

1. L'acteur ecole appelle `GET /api/v1/ecole/audit/administratif-financier`.
2. Le backend verifie la permission `audit.finance.read`.
3. Le backend verifie le scope `ECOLE` dans le contexte actif.
4. Le backend force le filtre `categorieAudit=FINANCIER`.
5. Le backend retourne uniquement les donnees d'audit de l'ecole active relevant de cette famille.

### Variantes

- `GET /api/v1/ecole/audit/administratif-financier/history`
- `GET /api/v1/ecole/audit/administratif-financier/timeline`

### Resultat attendu

Les acteurs ecole autorises lisent uniquement l'audit administratif et financier de leur ecole active, sans ouverture implicite vers l'audit organisationnel, technique, pedagogique ou disciplinaire.

### Contraintes backend

- la route est bornee a `ECOLE`
- le filtre backend impose `categorieAudit=FINANCIER`
- `DIRECTEUR_ETUDES` reste refuse en l'etat
- le workflow ne transforme pas les acteurs pedagogiques en lecteurs generiques d'audit

### Evenements importants

- aucune mutation metier
- consultation d'audit financier et administratif local

### Donnees manipulees

- liste d'audits categorie `FINANCIER`
- historique d'audit categorie `FINANCIER`
- timeline d'audit categorie `FINANCIER`

### Sources backend

- [ecole.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/audit/interfaces/http/routes/ecole.routes.ts)
- [AuditQueryValidators.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/audit/interfaces/http/validators/AuditQueryValidators.ts)
- [SearchAuditQuery.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/audit/application/dto/queries/SearchAuditQuery.ts)
- [AuditTimelineQuery.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/audit/application/dto/queries/AuditTimelineQuery.ts)
- [PermissionSecurite.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/value-objects/PermissionSecurite.ts)
- [GlobalFixtures.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/fixtures/GlobalFixtures.ts)
- [audit-ecole-routes.integration.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/tests/integration/audit-ecole-routes.integration.test.ts)

### Notes de lecture frontend

- `AUD-02` est un audit ecole local, pas un audit plateforme
- la famille lue est administrative et financiere via la categorie `FINANCIER`
- cette ouverture ne vaut pas encore preuve pour `AUD-03`, `AUD-04` ou `AUD-05`

### Questions ouvertes

- les autres familles d'audit ecole restent a auditer individuellement

## Verdict

`AUD-02` est maintenant expose, securise, teste et fige.

## AUD-03

### Identifiant

`AUD-03`

### Nom

Consulter l'audit technique ecole

### Categorie

`Transverse`

### Niveau de criticite

`Eleve`

### Objectif metier

Permettre a l'acteur systeme local de l'ecole de consulter les traces et metriques techniques bornees a son ecole active, sans ouvrir le monitoring global plateforme.

### Acteur principal

`ADMIN_SYSTEME_ECOLE`

### Acteurs secondaires

- aucun

### Preconditions

- session AUTH valide
- contexte SECURITY actif coherent
- ecole active compatible avec le scope controle par la route
- permission `audit.technical.read`

### Permissions effectives requises

- `audit.technical.read`

### Cas d'utilisation utilises

- consulter les traces techniques de l'ecole
- consulter les metriques techniques locales de l'ecole

### Deroulement principal

1. L'acteur appelle `GET /api/v1/ecole/audit/technique/traces` ou `GET /api/v1/ecole/audit/technique/metrics`.
2. Le backend verifie la permission `audit.technical.read`.
3. Le backend verifie le scope `ECOLE` dans le contexte actif.
4. Le backend filtre les traces et metriques sur `organisation + ecole` actives.
5. Le backend retourne uniquement les donnees techniques locales de cette ecole.

### Variantes

- `GET /api/v1/ecole/audit/technique/traces`
- `GET /api/v1/ecole/audit/technique/metrics`

### Resultat attendu

L'acteur systeme ecole consulte une vue technique locale de son ecole sans obtenir les snapshots globaux de sante, de queues ou de volumetrie plateforme.

### Contraintes backend

- le workflow est borne a `ECOLE`
- `ADMINISTRATEUR_ECOLE` reste refuse
- les endpoints globaux `monitoring/*` restent hors de `AUD-03`
- la lecture actuelle couvre les traces et metriques techniques locales, pas encore tout le monitoring global

### Evenements importants

- aucune mutation metier
- consultation technique locale

### Donnees manipulees

- traces techniques de l'ecole
- metriques techniques locales de l'ecole

### Sources backend

- [ecole.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/audit/interfaces/http/routes/ecole.routes.ts)
- [AuditTraceService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/audit/infrastructure/monitoring/traces/AuditTraceService.ts)
- [AuditSchoolTechnicalMetricsService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/audit/infrastructure/monitoring/ecole/AuditSchoolTechnicalMetricsService.ts)
- [PermissionSecurite.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/value-objects/PermissionSecurite.ts)
- [GlobalFixtures.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/fixtures/GlobalFixtures.ts)
- [audit-technique-ecole-routes.integration.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/tests/integration/audit-technique-ecole-routes.integration.test.ts)

### Notes de lecture frontend

- `AUD-03` est un audit technique local d'ecole
- il ne doit pas etre presente comme un monitoring global plateforme
- l'absence volontaire de `health` global dans ce workflow est une protection de perimetre, pas un manque accidentel

### Questions ouvertes

- la famille `AUD-05` reste a prouver individuellement

## Verdict

`AUD-03` est maintenant expose, securise, teste et fige.

## AUD-04

### Identifiant

`AUD-04`

### Nom

Consulter l'audit pedagogique

### Categorie

`Transverse`

### Niveau de criticite

`Eleve`

### Objectif metier

Permettre aux acteurs pedagogiques reellement autorises de relire les traces d'audit locales des cotes, de la conduite, des bulletins et des classements, sans ouvrir une lecture libre hors perimetre.

### Acteur principal

`TITULAIRE`

### Acteurs secondaires

- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_DISCIPLINE`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`
- `ADMINISTRATEUR_ECOLE`
- `PROMOTEUR_ORGANISATION`

### Preconditions

- session AUTH valide
- contexte SECURITY actif coherent
- permission `bulletins.read` ou capacite pedagogique equivalente effectivement exploitable
- route appelee avec les headers de contexte requis
- perimetre metier resolvable depuis la fiche, le resultat, le bulletin ou la classe demandee

### Permissions effectives requises

- `bulletins.read`
- pour la lecture d'audit conduite, `cotes.write` reste aussi une voie d'acces locale pour `DIRECTEUR_DISCIPLINE` via le controle de conduite deja prouve

### Cas d'utilisation utilises

- consulter l'audit des cotes
- consulter l'audit de conduite
- consulter l'audit des bulletins
- consulter l'audit des classements

### Deroulement principal

1. L'acteur appelle une route `GET /api/audit/*`.
2. Le backend relit d'abord l'objet metier cible pour retrouver `ecole + classe + annee`.
3. Le backend reapplique ensuite la doctrine `permission + perimetre` via les adaptateurs d'autorisation pedagogique deja existants.
4. Le backend retourne uniquement les traces d'audit autorisees pour ce perimetre.

### Variantes

- `GET /api/audit/cotes?idFicheCotationEleveCours=...`
- `GET /api/audit/conduite?idResultatBulletinEleve=...`
- `GET /api/audit/bulletins?idBulletinEleve=...`
- `GET /api/audit/classements?idClassePedagogique=...&idAnneeScolaire=...&codeColonne=...`

### Resultat attendu

Les traces pedagogiques sont relues uniquement dans le perimetre effectivement autorise, et un acteur non autorise ne peut plus utiliser ces routes comme lecture technique ouverte.

### Contraintes backend

- `AUD-04` n'est plus une simple exposition HTTP libre
- les routes `cotes`, `conduite` et `bulletins` resolvent maintenant le perimetre reel depuis l'agregat demande
- la route `classements` reapplique `idEcole + classe + annee scolaire`
- un `ENSEIGNANT` simple non titulaire n'est pas positif par cette lecture
- `DIRECTEUR_DISCIPLINE` n'obtient pas une lecture pedagogique globale : sa voie specifique reste bornee a la conduite de sa section

### Evenements importants

- aucune mutation metier
- consultation d'audit pedagogique locale

### Donnees manipulees

- audits d'encodage des cotes
- audits de conduite
- historique de generation des bulletins
- historique de recalcul des classements

### Sources backend

- [AutorisationAuditPedagogiqueAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationAuditPedagogiqueAdapter.ts)
- [AuditBulletinController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/controllers/AuditBulletinController.ts)
- [audit.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/routes/audit.routes.ts)
- [bulletins-evaluations.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/bulletins-evaluations.routes.ts)
- [AuditRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/interfaces/routes/AuditRoutes.spec.ts)

### Notes de lecture frontend

- `AUD-04` est une famille d'audit pedagogique local, pas un audit plateforme
- le frontend doit le presenter comme une lecture de traces pedagogiques par objet metier
- la securite depend reellement du couple `permission + perimetre`

### Questions ouvertes

- `AUD-05` ne constitue pas un workflow backend distinct en l'etat
- la lecture disciplinaire reelle deja prouvee est absorbee par la voie conduite de `AUD-04`

## Verdict

`AUD-04` est maintenant expose, securise, teste et fige.

## Cloture Shared/Audit

La cloture officielle du volet workflows pour `shared/audit` est la suivante :

- `AUD-05` n'ouvre pas un workflow officiel distinct dans le backend actuel
- la partie disciplinaire backend prouvee passe deja par la conduite et reste donc couverte par `AUD-04`
- `AUD-06` reste couvert par `SHD-AUD-01`

Les surfaces avancees suivantes existent bien dans le backend :

- `exports`
- `forensic`
- `replay`
- `retry`
- `retention`
- `synchronization`
- `admin`
- `internal`

Lecture de cloture retenue :

- ces surfaces sont reelles au niveau backend
- elles appartiennent pour l'instant au socle d'exploitation et d'administration Audit
- elles ne sont pas encore retenues comme workflows frontend officiels individuels faute de matrice d'acteurs documentaire deja figee dans les documents front
- elles ne bloquent donc plus la fermeture de l'etape "workflows reels" tant qu'elles restent classees comme socle operatoire transverse

Preuve technique complementaire :

- les routes `admin/*` et `internal/*` d'audit sont maintenant explicitement reverrouillees par des garde-fous dedies dans le pipeline HTTP
- la surface avancee n'est donc plus une exposition libre derriere les seules permissions brutes

Sources backend de cloture :

- [http.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/audit/interfaces/http/routes/http.routes.ts)
- [_route-helpers.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/audit/interfaces/http/routes/_route-helpers.ts)
- [AuditRouteMiddlewareComposer.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/audit/interfaces/http/middlewares/AuditRouteMiddlewareComposer.ts)
- [AuditAdminMiddleware.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/audit/interfaces/http/middlewares/admin/AuditAdminMiddleware.ts)
- [AuditInternalMiddleware.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/audit/interfaces/http/middlewares/internal/AuditInternalMiddleware.ts)
- [audit-advanced-routes.integration.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/tests/integration/audit-advanced-routes.integration.test.ts)

## Verdict Final Audit

`shared/audit` est considere cloture pour l'etape workflows.

## Doctrine Monitoring

Le module `shared/monitoring` porte une famille transverse distincte de `shared/audit`.

Lecture officielle :

- `MON-01` etat systeme
- `MON-02` tableau de bord Monitoring
- `MON-03` observabilite
- `MON-04` sante systeme
- `MON-05` lecture des incidents
- `MON-06` ouverture d incident
- `MON-07` escalation d incident
- `MON-08` lecture des alertes
- `MON-09` creation d alerte
- `MON-10` resolution d alerte
- `MON-11` lecture des diagnostics
- `MON-12` generation de diagnostic
- `MON-13` lecture des capacites
- `MON-14` calcul de capacite
- `MON-15` calcul de saturation
- `MON-16` lecture des traces
- `MON-17` capture de trace

Acteurs officiels de famille :

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

Perimetre officiel :

- plateforme / systeme
- jamais ecole
- jamais organisation

## MON-01

### Identifiant

`MON-01`

### Nom

Consulter l etat systeme

### Categorie

`Transverse`

### Niveau de criticite

`Critique`

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

### Permissions effectives requises

- `monitoring.read`

### Route backend reelle

- `GET /api/v1/monitoring/state`

### Perimetre reel

- `PLATEFORME / SYSTEME`

### Contraintes backend

- permission locale `monitoring.read`
- projection du scope route `SYSTEM` sur la portee SECURITY `PLATEFORME`

### Statut de figement

`MON-01 FIGE`

## MON-02

### Identifiant

`MON-02`

### Nom

Consulter le tableau de bord Monitoring

### Categorie

`Transverse`

### Niveau de criticite

`Important`

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

### Permissions effectives requises

- `monitoring.dashboard.read`

### Route backend reelle

- `GET /api/v1/monitoring/dashboard`

### Perimetre reel

- `PLATEFORME / SYSTEME`

### Statut de figement

`MON-02 FIGE`

## MON-03

### Identifiant

`MON-03`

### Nom

Consulter l observabilite systeme

### Categorie

`Transverse`

### Niveau de criticite

`Important`

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

### Permissions effectives requises

- `monitoring.observability.read`

### Route backend reelle

- `GET /api/v1/monitoring/observability`

### Perimetre reel

- `PLATEFORME / SYSTEME`

### Statut de figement

`MON-03 FIGE`

## MON-04

### Identifiant

`MON-04`

### Nom

Consulter la sante systeme

### Categorie

`Transverse`

### Niveau de criticite

`Critique`

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

### Permissions effectives requises

- `monitoring.health.read`
- `monitoring.health.snapshot.read`

### Routes backend reelles

- `GET /api/v1/monitoring/health`
- `GET /api/v1/monitoring/health/snapshot`

### Perimetre reel

- `PLATEFORME / SYSTEME`

### Statut de figement

`MON-04 FIGE`

## MON-05

### Identifiant

`MON-05`

### Nom

Consulter les incidents systeme

### Categorie

`Transverse`

### Niveau de criticite

`Important`

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

### Permissions effectives requises

- `monitoring.incidents.read`

### Route backend reelle

- `GET /api/v1/monitoring/incidents`

### Perimetre reel

- `PLATEFORME / SYSTEME`

### Statut de figement

`MON-05 FIGE`

## MON-06

### Identifiant

`MON-06`

### Nom

Ouvrir un incident systeme

### Categorie

`Transverse`

### Niveau de criticite

`Critique`

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`

### Permissions effectives requises

- `monitoring.incidents.create`

### Route backend reelle

- `POST /api/v1/monitoring/incidents`

### Perimetre reel

- `PLATEFORME / SYSTEME`

### Contraintes backend

- `SUPPORT_SYSTEME` reste refuse

### Statut de figement

`MON-06 FIGE`

## MON-07

### Identifiant

`MON-07`

### Nom

Escalader un incident systeme

### Categorie

`Transverse`

### Niveau de criticite

`Critique`

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`

### Permissions effectives requises

- `monitoring.incidents.escalate`

### Route backend reelle

- `POST /api/v1/monitoring/incidents/:id/escalate`

### Perimetre reel

- `PLATEFORME / SYSTEME`

### Contraintes backend

- `SUPPORT_SYSTEME` reste refuse

### Statut de figement

`MON-07 FIGE`

## MON-08

### Identifiant

`MON-08`

### Nom

Consulter les alertes systeme

### Categorie

`Transverse`

### Niveau de criticite

`Important`

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

### Permissions effectives requises

- `monitoring.alerts.read`

### Route backend reelle

- `GET /api/v1/monitoring/alerts`

### Perimetre reel

- `PLATEFORME / SYSTEME`

### Statut de figement

`MON-08 FIGE`

## MON-09

### Identifiant

`MON-09`

### Nom

Creer une alerte systeme

### Categorie

`Transverse`

### Niveau de criticite

`Important`

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`

### Permissions effectives requises

- `monitoring.alerts.create`

### Route backend reelle

- `POST /api/v1/monitoring/alerts`

### Perimetre reel

- `PLATEFORME / SYSTEME`

### Contraintes backend

- `SUPPORT_SYSTEME` reste refuse

### Statut de figement

`MON-09 FIGE`

## MON-10

### Identifiant

`MON-10`

### Nom

Resoudre une alerte systeme

### Categorie

`Transverse`

### Niveau de criticite

`Important`

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`

### Permissions effectives requises

- `monitoring.alerts.resolve`

### Route backend reelle

- `POST /api/v1/monitoring/alerts/:id/resolve`

### Perimetre reel

- `PLATEFORME / SYSTEME`

### Contraintes backend

- `SUPPORT_SYSTEME` reste refuse

### Statut de figement

`MON-10 FIGE`

## MON-11

### Identifiant

`MON-11`

### Nom

Consulter les diagnostics systeme

### Categorie

`Transverse`

### Niveau de criticite

`Important`

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

### Permissions effectives requises

- `monitoring.diagnostics.read`

### Route backend reelle

- `GET /api/v1/monitoring/diagnostics`

### Perimetre reel

- `PLATEFORME / SYSTEME`

### Statut de figement

`MON-11 FIGE`

## MON-12

### Identifiant

`MON-12`

### Nom

Generer un diagnostic d incident

### Categorie

`Transverse`

### Niveau de criticite

`Important`

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`

### Permissions effectives requises

- `monitoring.diagnostics.create`

### Route backend reelle

- `POST /api/v1/monitoring/incidents/:id/diagnostics`

### Perimetre reel

- `PLATEFORME / SYSTEME`

### Contraintes backend

- `SUPPORT_SYSTEME` reste refuse

### Statut de figement

`MON-12 FIGE`

## MON-13

### Identifiant

`MON-13`

### Nom

Consulter les capacites systeme

### Categorie

`Transverse`

### Niveau de criticite

`Important`

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

### Permissions effectives requises

- `monitoring.capacity.read`

### Route backend reelle

- `GET /api/v1/monitoring/capacity`

### Perimetre reel

- `PLATEFORME / SYSTEME`

### Statut de figement

`MON-13 FIGE`

## MON-14

### Identifiant

`MON-14`

### Nom

Calculer la capacite systeme

### Categorie

`Transverse`

### Niveau de criticite

`Important`

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`

### Permissions effectives requises

- `monitoring.capacity.calculate`

### Route backend reelle

- `POST /api/v1/monitoring/capacity`

### Perimetre reel

- `PLATEFORME / SYSTEME`

### Contraintes backend

- `SUPPORT_SYSTEME` reste refuse

### Statut de figement

`MON-14 FIGE`

## MON-15

### Identifiant

`MON-15`

### Nom

Calculer la saturation systeme

### Categorie

`Transverse`

### Niveau de criticite

`Important`

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`

### Permissions effectives requises

- `monitoring.saturation.calculate`

### Route backend reelle

- `POST /api/v1/monitoring/capacity/saturation`

### Perimetre reel

- `PLATEFORME / SYSTEME`

### Contraintes backend

- `SUPPORT_SYSTEME` reste refuse

### Statut de figement

`MON-15 FIGE`

## MON-16

### Identifiant

`MON-16`

### Nom

Consulter les traces systeme

### Categorie

`Transverse`

### Niveau de criticite

`Important`

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

### Permissions effectives requises

- `monitoring.traces.read`

### Route backend reelle

- `GET /api/v1/monitoring/traces`

### Perimetre reel

- `PLATEFORME / SYSTEME`

### Statut de figement

`MON-16 FIGE`

## MON-17

### Identifiant

`MON-17`

### Nom

Capturer une trace systeme

### Categorie

`Transverse`

### Niveau de criticite

`Important`

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`

### Permissions effectives requises

- `monitoring.traces.create`

### Route backend reelle

- `POST /api/v1/monitoring/traces`

### Perimetre reel

- `PLATEFORME / SYSTEME`

### Contraintes backend

- `SUPPORT_SYSTEME` reste refuse

### Statut de figement

`MON-17 FIGE`

## Doctrine Configuration

Le premier noyau officiel de `shared/configuration` est maintenant borne a la gouvernance modulaire.

Il repose sur trois workflows reels et branches :

- `CFG-03` : definir les modules autorises au niveau organisation
- `CFG-05` : resoudre les modules effectifs d'une ecole
- `CFG-04` : bloquer l'execution d'un module inactif avant l'ouverture d'un BC

Acteurs officiels actuellement attestes :

- niveau organisation :
  - `PROMOTEUR_ORGANISATION`
  - `ADMIN_SYSTEME_ORGANISATION`
  - `GESTIONNAIRE_ORGANISATION`
- niveau ecole :
  - `ADMIN_SYSTEME_ECOLE`
  - `ADMINISTRATEUR_ECOLE`

Lecture backend maintenant attestee :

- les routes generiques `POST/GET/PUT/DELETE /api/v1/configuration...` ne sont plus protegees par un simple `scope SYSTEM`
- la portee reelle est maintenant resolue depuis :
  - le `scope` du body pour la creation, la validation et l'override
  - la configuration existante pour la lecture, la mise a jour, le lock, l'unlock, les snapshots, la propagation et le reload
  - la query de portee pour la lecture effective
- un acteur organisation peut gerer la configuration de son organisation et lire les configurations ecole de son organisation
- un acteur ecole peut gerer la configuration de son ecole, mais ne peut pas muter directement une configuration `SYSTEM` ou `ORGANISATION`
- un override ecole sur une configuration heritee reste autorise uniquement vers la portee ecole concernee

Noyau familial maintenant executable :

- `CFG-PLAT-RUNTIME` :
  - `runtime.*`
  - proprietaire `PLATEFORME`
  - mutation `MANAGER_SYSTEME`, `OPERATEUR_SYSTEME`
  - lecture `SUPPORT_SYSTEME` seulement
  - override interdit par defaut
- `CFG-ORG-POLICIES` :
  - `modules.allowed`, `policies.*`, `governance.*`, `limits.*`, `organization.*`
  - proprietaire `ORGANISATION`
  - mutation `PROMOTEUR_ORGANISATION`, `ADMIN_SYSTEME_ORGANISATION`
  - lecture `GESTIONNAIRE_ORGANISATION` autorisee
- `CFG-ECOLE-MODULES` :
  - `modules.enabled`
  - proprietaire `ECOLE`
  - mutation `ADMIN_SYSTEME_ECOLE`, `ADMINISTRATEUR_ECOLE`
- `CFG-ECOLE-BRANDING` :
  - `branding.*`
  - proprietaire `ECOLE`
  - mutation principale `ADMIN_SYSTEME_ECOLE`
  - `ADMINISTRATEUR_ECOLE` seulement sur les sous-cles editoriales attestees
- `CFG-ECOLE-NOTIFICATIONS` :
  - `notifications.*`
  - proprietaire `ECOLE`
  - mutation `ADMIN_SYSTEME_ECOLE`, `ADMINISTRATEUR_ECOLE`
- `CFG-USER-PREFERENCES` :
  - `preferences.*`, `user.preferences.*`, `notifications.preferences.*`
  - proprietaire `UTILISATEUR`
  - mutation et lecture reservees au proprietaire lui-meme

## CFG-03

### Identifiant

`CFG-03`

### Nom

Definir les modules autorises au niveau organisation

### Categorie

`Transverse`

### Niveau de criticite

`Critique`

### Acteur principal

`PROMOTEUR_ORGANISATION`

### Acteurs secondaires

- `ADMIN_SYSTEME_ORGANISATION`
- `GESTIONNAIRE_ORGANISATION` pour la lecture seule

### Permissions effectives requises

- `configuration.modules.read`
- `configuration.modules.organization.write`

### Route backend reelle

- `PUT /api/v1/configuration/modules/organisations/:organisationId`

### Perimetre reel

`ORGANISATION`

### Contraintes backend

- la configuration est bornee a l'organisation active
- la source de verite est portee dans `modules.allowed`

### Statut de figement

`CFG-03 FIGE`

## CFG-05

### Identifiant

`CFG-05`

### Nom

Resoudre les modules effectifs d'une ecole

### Categorie

`Transverse`

### Niveau de criticite

`Critique`

### Acteur principal

`ADMIN_SYSTEME_ECOLE`

### Acteurs secondaires

- `ADMINISTRATEUR_ECOLE`
- `PROMOTEUR_ORGANISATION`
- `ADMIN_SYSTEME_ORGANISATION`
- `GESTIONNAIRE_ORGANISATION`

### Permissions effectives requises

- `configuration.modules.read`

### Route backend reelle

- `GET /api/v1/configuration/modules/effective`

### Perimetre reel

`ORGANISATION + ECOLE`

### Contraintes backend

- la resolution effective recalcule `modules.allowed` intersect `modules.enabled`

### Statut de figement

`CFG-05 FIGE`

## CFG-04

### Identifiant

`CFG-04`

### Nom

Bloquer l'execution d'un module inactif

### Categorie

`Transverse`

### Niveau de criticite

`Critique`

### Acteur principal

Aucun acteur humain direct, controle runtime transverse

### Acteurs secondaires

- tous les acteurs des BC couverts par la garde modulaire

### Permissions effectives requises

- aucune permission locale dediee
- le workflow depend de la resolution effective du module avant execution du BC

### Route backend reelle

- pas de route HTTP dediee
- application globale dans `backend/src/app/routes/index.ts`

### Perimetre reel

`ORGANISATION + ECOLE`

### Contraintes backend

- la garde est actuellement appliquee a `AUDIT`
- la garde est actuellement appliquee a `MONITORING`
- la garde est actuellement appliquee a `REFERENTIEL_ACADEMIQUE`
- la garde est actuellement appliquee a `SCOLARITE_ELEVES`
- la garde est actuellement appliquee a `PAIEMENTS_FACTURATION`
- la garde est actuellement appliquee a `BULLETINS_EVALUATIONS`
- un module inactif renvoie `403 MODULE_INACTIF`
- l'absence ou l'invalidite de `modules.allowed` ferme le module
- l'absence de `modules.enabled` ne produit aucune activation implicite pour une ecole

### Statut de figement

`CFG-04 FIGE`

## Cartographie Configuration

Les routes generiques du module Configuration sont maintenant lues comme une cartographie officielle de workflows reels, groupes par niveau proprietaire et par famille de cles.

Routes generiques actuellement exposees :

- `POST /api/v1/configuration`
- `GET /api/v1/configuration/:id`
- `PUT /api/v1/configuration/:id`
- `DELETE /api/v1/configuration/:id`
- `POST /api/v1/configuration/:id/lock`
- `POST /api/v1/configuration/:id/unlock`
- `POST /api/v1/configuration/:id/override`
- `GET /api/v1/configuration/effective`
- `POST /api/v1/configuration/:id/snapshots`
- `GET /api/v1/configuration/:id/snapshots/compare`
- `POST /api/v1/configuration/validate`
- `POST /api/v1/configuration/:id/propagate`
- `POST /api/v1/configuration/:id/reload`

## CFG-PLAT-01

### Identifiant

`CFG-PLAT-01`

### Nom

Piloter les configurations runtime globales

### Categorie

`Transverse`

### Niveau de criticite

`Critique`

### Famille de cles

`runtime.*`

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME` en lecture seulement

### Permissions effectives requises

- `configuration.create`
- `configuration.read`
- `configuration.update`
- `configuration.delete`
- `configuration.lock`
- `configuration.unlock`
- `configuration.snapshots.create`
- `configuration.snapshots.compare`
- `configuration.propagate`
- `configuration.reload`
- `configuration.validate`
- `configuration.effective.read`

### Routes backend reelles

- `POST /api/v1/configuration`
- `GET /api/v1/configuration/:id`
- `PUT /api/v1/configuration/:id`
- `DELETE /api/v1/configuration/:id`
- `POST /api/v1/configuration/:id/lock`
- `POST /api/v1/configuration/:id/unlock`
- `POST /api/v1/configuration/:id/snapshots`
- `GET /api/v1/configuration/:id/snapshots/compare`
- `POST /api/v1/configuration/validate`
- `POST /api/v1/configuration/:id/propagate`
- `POST /api/v1/configuration/:id/reload`
- `GET /api/v1/configuration/effective?niveau=SYSTEM`

### Perimetre reel

`PLATEFORME / SYSTEME`

### Contraintes backend

- `runtime.*` reste proprietaire `PLATEFORME`
- `SUPPORT_SYSTEME` ne mute pas
- override interdit par defaut

### Statut de figement

`CFG-PLAT-01 FIGE`

## CFG-ORG-01

### Identifiant

`CFG-ORG-01`

### Nom

Gouverner les politiques organisationnelles communes

### Categorie

`Transverse`

### Niveau de criticite

`Critique`

### Famille de cles

- `policies.*`
- `governance.*`
- `limits.*`
- `organization.*`
- `modules.allowed`

### Acteur principal

`PROMOTEUR_ORGANISATION`

### Acteurs secondaires

- `ADMIN_SYSTEME_ORGANISATION`
- `GESTIONNAIRE_ORGANISATION` en lecture

### Permissions effectives requises

- `configuration.create`
- `configuration.read`
- `configuration.update`
- `configuration.delete`
- `configuration.lock`
- `configuration.unlock`
- `configuration.snapshots.create`
- `configuration.snapshots.compare`
- `configuration.propagate`
- `configuration.validate`
- `configuration.effective.read`
- `configuration.modules.organization.write`

### Routes backend reelles

- `POST /api/v1/configuration`
- `GET /api/v1/configuration/:id`
- `PUT /api/v1/configuration/:id`
- `DELETE /api/v1/configuration/:id`
- `POST /api/v1/configuration/:id/lock`
- `POST /api/v1/configuration/:id/unlock`
- `POST /api/v1/configuration/:id/snapshots`
- `GET /api/v1/configuration/:id/snapshots/compare`
- `POST /api/v1/configuration/:id/propagate`
- `POST /api/v1/configuration/validate`
- `GET /api/v1/configuration/effective?niveau=ORGANIZATION`
- `PUT /api/v1/configuration/modules/organisations/:organisationId`

### Perimetre reel

`ORGANISATION`

### Contraintes backend

- `GESTIONNAIRE_ORGANISATION` ne mute pas
- override vers `ECOLE` seulement si la cle est explicitement overridable

### Statut de figement

`CFG-ORG-01 FIGE`

## CFG-ECOLE-SYS-01

### Identifiant

`CFG-ECOLE-SYS-01`

### Nom

Administrer les configurations systeme locales d'une ecole

### Categorie

`Transverse`

### Niveau de criticite

`Critique`

### Famille de cles

- `modules.enabled`
- cles generiques locales de type `school.*`

### Acteur principal

`ADMIN_SYSTEME_ECOLE`

### Acteurs secondaires

- `ADMINISTRATEUR_ECOLE` selon les cles autorisees

### Permissions effectives requises

- `configuration.create`
- `configuration.read`
- `configuration.update`
- `configuration.delete`
- `configuration.lock`
- `configuration.unlock`
- `configuration.snapshots.create`
- `configuration.snapshots.compare`
- `configuration.propagate`
- `configuration.reload`
- `configuration.validate`
- `configuration.effective.read`
- `configuration.modules.school.write`

### Routes backend reelles

- `POST /api/v1/configuration`
- `GET /api/v1/configuration/:id`
- `PUT /api/v1/configuration/:id`
- `DELETE /api/v1/configuration/:id`
- `POST /api/v1/configuration/:id/lock`
- `POST /api/v1/configuration/:id/unlock`
- `POST /api/v1/configuration/:id/snapshots`
- `GET /api/v1/configuration/:id/snapshots/compare`
- `POST /api/v1/configuration/:id/propagate`
- `POST /api/v1/configuration/:id/reload`
- `POST /api/v1/configuration/validate`
- `GET /api/v1/configuration/effective?niveau=SCHOOL`
- `PUT /api/v1/configuration/modules/ecoles/:ecoleId`

### Perimetre reel

`ECOLE`

### Contraintes backend

- l'ecole n'ouvre jamais une configuration `SYSTEM`
- l'ecole ne mute jamais directement une configuration `ORGANISATION`

### Statut de figement

`CFG-ECOLE-SYS-01 FIGE`

## CFG-ECOLE-METIER-01

### Identifiant

`CFG-ECOLE-METIER-01`

### Nom

Gerer le branding d'ecole

### Categorie

`Transverse`

### Niveau de criticite

`Important`

### Famille de cles

`branding.*`

### Acteur principal

`ADMIN_SYSTEME_ECOLE`

### Acteurs secondaires

- `ADMINISTRATEUR_ECOLE` pour les sous-cles editoriales attestees

### Permissions effectives requises

- `configuration.create`
- `configuration.read`
- `configuration.update`
- `configuration.lock`
- `configuration.unlock`
- `configuration.snapshots.create`
- `configuration.snapshots.compare`
- `configuration.propagate`
- `configuration.validate`
- `configuration.effective.read`

### Routes backend reelles

- `POST /api/v1/configuration`
- `GET /api/v1/configuration/:id`
- `PUT /api/v1/configuration/:id`
- `POST /api/v1/configuration/:id/lock`
- `POST /api/v1/configuration/:id/unlock`
- `POST /api/v1/configuration/:id/snapshots`
- `GET /api/v1/configuration/:id/snapshots/compare`
- `POST /api/v1/configuration/:id/propagate`
- `POST /api/v1/configuration/validate`
- `GET /api/v1/configuration/effective?niveau=SCHOOL&keyPrefix=branding.`

### Perimetre reel

`ECOLE`

### Contraintes backend

- le branding technique reste reserve en priorite a `ADMIN_SYSTEME_ECOLE`
- un `ADMINISTRATEUR_ECOLE` ne peut pas prendre le branding technique global de l'ecole

### Statut de figement

`CFG-ECOLE-METIER-01 FIGE`

## CFG-ECOLE-METIER-02

### Identifiant

`CFG-ECOLE-METIER-02`

### Nom

Gerer les notifications locales d'une ecole

### Categorie

`Transverse`

### Niveau de criticite

`Important`

### Famille de cles

`notifications.*`

### Acteur principal

`ADMIN_SYSTEME_ECOLE`

### Acteurs secondaires

- `ADMINISTRATEUR_ECOLE`

### Permissions effectives requises

- `configuration.create`
- `configuration.read`
- `configuration.update`
- `configuration.lock`
- `configuration.unlock`
- `configuration.snapshots.create`
- `configuration.snapshots.compare`
- `configuration.propagate`
- `configuration.reload`
- `configuration.validate`
- `configuration.effective.read`

### Routes backend reelles

- `POST /api/v1/configuration`
- `GET /api/v1/configuration/:id`
- `PUT /api/v1/configuration/:id`
- `POST /api/v1/configuration/:id/lock`
- `POST /api/v1/configuration/:id/unlock`
- `POST /api/v1/configuration/:id/snapshots`
- `GET /api/v1/configuration/:id/snapshots/compare`
- `POST /api/v1/configuration/:id/propagate`
- `POST /api/v1/configuration/:id/reload`
- `POST /api/v1/configuration/validate`
- `GET /api/v1/configuration/effective?niveau=SCHOOL&keyPrefix=notifications.`

### Perimetre reel

`ECOLE`

### Contraintes backend

- l'ecole gere ses notifications locales
- l'override implicite n'est pas ouvert par defaut

### Statut de figement

`CFG-ECOLE-METIER-02 FIGE`

## CFG-USER-01

### Identifiant

`CFG-USER-01`

### Nom

Gerer ses preferences personnelles

### Categorie

`Transverse`

### Niveau de criticite

`Important`

### Famille de cles

- `preferences.*`
- `user.preferences.*`
- `notifications.preferences.*`

### Acteur principal

Utilisateur proprietaire

### Acteurs secondaires

Aucun acteur delegue par defaut

### Permissions effectives requises

- `configuration.create`
- `configuration.read`
- `configuration.update`
- `configuration.effective.read`

### Routes backend reelles

- `POST /api/v1/configuration`
- `GET /api/v1/configuration/:id`
- `PUT /api/v1/configuration/:id`
- `GET /api/v1/configuration/effective?niveau=USER`

### Perimetre reel

`UTILISATEUR`

### Contraintes backend

- la lecture et la mutation restent reservees au proprietaire lui-meme
- `USER` ne gouverne jamais les modules, la licence ou le runtime global

### Statut de figement

`CFG-USER-01 FIGE`

## Cloture Frontend Configuration

Les workflows `configuration` deja figes sont maintenant materialises en frontend reel, sans rouvrir leur doctrine metier.

Preuves frontend :

- [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/routes.ts)
- [ModuleHomeView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ModuleHomeView.vue)
- [ConfigurationWorkspaceView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationWorkspaceView.vue)
- [ConfigurationOrganizationView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationOrganizationView.vue)
- [ConfigurationSchoolModulesView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationSchoolModulesView.vue)
- [ConfigurationSchoolBrandingView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationSchoolBrandingView.vue)
- [ConfigurationSchoolNotificationsView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationSchoolNotificationsView.vue)
- [ConfigurationUserPreferencesView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationUserPreferencesView.vue)
- [configuration.api.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/services/configuration.api.ts)
- [configuration-center.store.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/stores/configuration-center.store.ts)
- [configuration-modules.store.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/stores/configuration-modules.store.ts)

Correspondance ecrans / routes reelles :

- `SCR-CFG-001` : `/app/configuration/plateforme/runtime`
- `SCR-CFG-002` : `/app/configuration/organisation` et `/app/configuration/organisation/modules`
- `SCR-CFG-003` : `/app/configuration/ecole/modules`
- `SCR-CFG-004` : `/app/configuration/ecole/branding`
- `SCR-CFG-005` : `/app/configuration/ecole/notifications`
- `SCR-CFG-006` : `/app/configuration/utilisateur/preferences` et `/app/moi/preferences`

Verification technique de cloture :

- `npm run build` frontend : OK

Verdict de cloture :

- aucune dette bloquante de branchement relevee sur `configuration`
- la documentation frontend et l'implementation reelle sont maintenant synchronisees

## NOTIF-01

### Identifiant

`NOTIF-01`

### Nom

Administrer les notifications locales d'une ecole

### Categorie

`Transverse`

### Acteur principal

`ADMIN_SYSTEME_ECOLE`

### Acteurs secondaires

- `ADMINISTRATEUR_ECOLE`

### Permissions effectives requises

- `notifications.create`
- `notifications.read`
- `notifications.timeline.read`
- `notifications.acknowledge`
- `notifications.escalate`
- `notifications.monitoring.read`
- `notifications.dead-letter.read`
- `notifications.retry.execute`
- `notifications.retry.read`
- `notifications.replay.execute`
- `notifications.replay.read`

### Routes backend reelles

- `POST /api/v1/notifications`
- `GET /api/v1/notifications`
- `GET /api/v1/notifications/:id`
- `GET /api/v1/notifications/:id/timeline`
- `POST /api/v1/notifications/:id/acknowledge`
- `POST /api/v1/notifications/:id/escalate`
- `GET /api/v1/notifications/monitoring`
- `GET /api/v1/notifications/dead-letter`
- `POST /api/v1/notifications/:id/retry`
- `GET /api/v1/notifications/:id/retries`
- `POST /api/v1/notifications/:id/replay`
- `GET /api/v1/notifications/:id/replay/diagnostic`

### Perimetre reel

`ECOLE`

### Contraintes backend

- `ADMINISTRATEUR_ECOLE` ne porte pas les operations techniques `retry` et `replay`
- `ADMIN_SYSTEME_ECOLE` porte les operations techniques locales de son ecole
- le module est maintenant branche via une runtime Notifications unique partagee par les routes HTTP et les integrations backend
- les signaux `paiements-facturation`, `scolarite-eleves` et `bulletins-evaluations` alimentent maintenant le meme registre Notifications
- le module est protege par `permission + scope`

### Statut de figement

`NOTIF-01 FIGE`

## NOTIF-02

### Identifiant

`NOTIF-02`

### Nom

Superviser les notifications d'une organisation

### Categorie

`Transverse`

### Acteurs principaux

- `PROMOTEUR_ORGANISATION`
- `ADMIN_SYSTEME_ORGANISATION`

### Acteur secondaire

- `GESTIONNAIRE_ORGANISATION`

### Permissions effectives requises

- `notifications.admin.archives.read`
- `notifications.admin.tenant.read`
- `notifications.admin.escalation.read`
- `notifications.realtime.read`
- `notifications.realtime.publish`

### Routes backend reelles

- `GET /api/v1/admin/notifications/archives`
- `GET /api/v1/admin/notifications/tenant`
- `GET /api/v1/admin/notifications/:id/escalades`
- `GET /api/v1/notifications/realtime-futur/capabilities`
- `POST /api/v1/notifications/realtime-futur/publish-test`

### Perimetre reel

## Cloture Frontend Notifications

Les workflows `notifications` deja figes sont maintenant materialises en frontend reel, sans rouvrir la doctrine metier.

Preuves frontend :

- [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/routes.ts)
- [ModuleHomeView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/views/ModuleHomeView.vue)
- [NotificationsSchoolComposeView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/views/NotificationsSchoolComposeView.vue)
- [NotificationsSchoolCenterView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/views/NotificationsSchoolCenterView.vue)
- [NotificationsSchoolOperationsView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/views/NotificationsSchoolOperationsView.vue)
- [NotificationsOrganizationView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/views/NotificationsOrganizationView.vue)
- [NotificationsOrganizationRealtimeView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/views/NotificationsOrganizationRealtimeView.vue)
- [notifications.api.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/services/notifications.api.ts)
- [notifications.store.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/stores/notifications.store.ts)
- [notifications.model.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/models/notifications.model.ts)
- [notifications.mapper.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/mappers/notifications.mapper.ts)

Correspondance ecrans / routes reelles :

- `SCR-NOTIF-001` : `/app/notifications/ecole/envoyer`
- `SCR-NOTIF-002` : `/app/notifications/ecole` et `/app/notifications/ecole/:idNotification`
- `SCR-NOTIF-003` : `/app/notifications/ecole/operations` et `/app/notifications/ecole/dead-letter`
- `SCR-NOTIF-004` : `/app/notifications/organisation` et `/app/notifications/organisation/escalades`
- `SCR-NOTIF-005` : `/app/notifications/organisation/realtime`

Verification technique de cloture :

- `npm run build` frontend : OK

Verdict de cloture :

- aucune dette bloquante de branchement relevee sur `notifications`
- la documentation frontend et l'implementation reelle sont maintenant synchronisees
`ORGANISATION`

### Contraintes backend

- les routes organisationnelles sont refusees aux acteurs `ECOLE`
- `GESTIONNAIRE_ORGANISATION` reste en lecture seule sur le bloc temps reel
- le module est activable comme les autres modules transversaux

### Statut de figement

`NOTIF-02 FIGE`

## SEC-01

### Identifiant

`SEC-01`

### Nom

Gouverner les roles et permissions security

### Categorie

`Transverse`

### Acteur principal

`MANAGER_SYSTEME`

### Acteur secondaire

- `OPERATEUR_SYSTEME` si les permissions brutes de gouvernance security lui sont explicitement attribuees

### Permissions effectives requises

- `roles.read`
- `roles.write`
- `permissions.read`
- `permissions.write`

### Routes backend reelles

- `GET /api/v1/security/roles`
- `POST /api/v1/security/roles`
- `PATCH /api/v1/security/roles/:codeRole/activate`
- `PATCH /api/v1/security/roles/:codeRole/deactivate`
- `GET /api/v1/security/roles/:codeRole/permissions`
- `POST /api/v1/security/roles/:codeRole/permissions`
- `DELETE /api/v1/security/roles/:codeRole/permissions/:permission`
- `POST /api/v1/security/roles/:codeRole/restrictions`
- `DELETE /api/v1/security/roles/:codeRole/restrictions/:codeRestriction`

### Perimetre reel

`PLATEFORME / SYSTEME`

### Contraintes backend

- cette API de gouvernance security est maintenant exposee dans l'application
- elle est reservee au niveau `PLATEFORME`
- les acteurs `ECOLE` et `ORGANISATION` restent refuses meme s'ils portent localement des permissions brutes similaires

### Statut de figement

`SEC-01 FIGE`

## SEC-02

### Identifiant

`SEC-02`

### Nom

Gouverner les affectations, scopes et titulariats security

### Categorie

`Transverse`

### Acteur principal

`MANAGER_SYSTEME`

### Acteur secondaire

- `OPERATEUR_SYSTEME` si les permissions brutes de gouvernance security lui sont explicitement attribuees

### Permissions effectives requises

- `utilisateurs.read`
- `utilisateurs.write`

### Routes backend reelles

- `POST /api/v1/security/affectations`
- `PATCH /api/v1/security/affectations/:idAffectationUtilisateur/activate`
- `PATCH /api/v1/security/affectations/:idAffectationUtilisateur/deactivate`
- `POST /api/v1/security/affectations/:idAffectationUtilisateur/scopes`
- `DELETE /api/v1/security/affectations/:idAffectationUtilisateur/scopes/:typeScope/:valeurScope`
- `GET /api/v1/security/affectations/utilisateur/:idUtilisateur`
- `GET /api/v1/security/affectations/utilisateur/:idUtilisateur/scopes`
- `POST /api/v1/security/titulariats`
- `DELETE /api/v1/security/titulariats/classe/:idClasse/annee/:idAnneeScolaire`
- `GET /api/v1/security/titulariats/classe/:idClasse/annee/:idAnneeScolaire`

### Perimetre reel

`PLATEFORME / SYSTEME`

### Contraintes backend

- les operations brutes d'affectation et de titulariat exposees par `shared/security` ne sont pas les workflows metier ecole
- les workflows metier consommes par les sections restent portes par les BC fonctionnels et reappliquent `shared/security` localement
- l'API transverse brute est reservee a la gouvernance plateforme pour eviter toute fuite inter-tenant

### Statut de figement

`SEC-02 FIGE`

## SEC-03

### Identifiant

`SEC-03`

### Nom

Verifier les permissions, scopes et acces security

### Categorie

`Transverse`

### Acteur principal

`MANAGER_SYSTEME`

### Acteur secondaire

- `OPERATEUR_SYSTEME` si les permissions brutes de lecture security lui sont explicitement attribuees

### Permissions effectives requises

- `permissions.read`

### Routes backend reelles

- `POST /api/v1/security/permissions/check`
- `POST /api/v1/security/scopes/check`
- `POST /api/v1/security/restrictions/check`
- `POST /api/v1/security/access/check`

### Perimetre reel

`PLATEFORME / SYSTEME`

### Contraintes backend

- ces routes servent au diagnostic et a la verification transverse
- le contexte actif utilisateur courant reste gere par `AUTH`
- `shared/security` n'ouvre donc pas un second workflow officiel de changement de contexte

### Statut de figement

`SEC-03 FIGE`

## SEC-04

### Identifiant

`SEC-04`

### Nom

Consulter l'audit security transverse

### Categorie

`Transverse`

### Acteur principal

`MANAGER_SYSTEME`

### Acteur secondaire

- `OPERATEUR_SYSTEME` si `audit.security.read` lui est explicitement attribuee

### Permissions effectives requises

- `audit.security.read`

### Routes backend reelles

- `GET /api/v1/security/audit/logs`
- `GET /api/v1/security/audit/refus`
- `GET /api/v1/security/audit/access`

### Perimetre reel

`PLATEFORME / SYSTEME`

### Contraintes backend

  - l'audit security brut n'est pas une lecture ecole
  - les acteurs locaux consomment plutot les audits fonctionnels de leurs propres BC
  - cette lecture transverse est maintenant reellement exposee et testee

## Cloture Frontend Security

Les workflows `security` deja figes sont maintenant materialises en frontend reel, sans rouvrir la doctrine metier.

Preuves frontend :

- [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/routes.ts)
- [ModuleHomeView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/views/ModuleHomeView.vue)
- [SecurityRolesView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/views/SecurityRolesView.vue)
- [SecurityAssignmentsView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/views/SecurityAssignmentsView.vue)
- [SecurityChecksView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/views/SecurityChecksView.vue)
- [SecurityAuditView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/views/SecurityAuditView.vue)
- [security.api.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/services/security.api.ts)
- [security.store.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/stores/security.store.ts)
- [security.model.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/models/security.model.ts)
- [security.mapper.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/mappers/security.mapper.ts)

Correspondance ecrans / routes reelles :

- `SCR-SEC-001` : `/app/security/roles` et `/app/security/roles/:codeRole`
- `SCR-SEC-002` : `/app/security/affectations`, `/app/security/affectations/utilisateurs/:idUtilisateur` et `/app/security/titulariats`
- `SCR-SEC-003` : `/app/security/verifications`
- `SCR-SEC-004` : `/app/security/audit`

Verification technique de cloture :

- `npm run build` frontend : OK

Verdict de cloture :

- aucune dette bloquante de branchement relevee sur `security`
- la documentation frontend et l'implementation reelle sont maintenant synchronisees

### Statut de figement

`SEC-04 FIGE`

## Cloture Frontend Monitoring

Les workflows `monitoring` deja figes sont maintenant materialises en frontend reel, toujours dans le perimetre `PLATEFORME / SYSTEME`.

Preuves frontend :

- [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/routes.ts)
- [ModuleHomeView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/views/ModuleHomeView.vue)
- [MonitoringOverviewView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/views/MonitoringOverviewView.vue)
- [MonitoringIncidentsView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/views/MonitoringIncidentsView.vue)
- [MonitoringAlertsView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/views/MonitoringAlertsView.vue)
- [MonitoringDiagnosticsView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/views/MonitoringDiagnosticsView.vue)
- [MonitoringCapacityView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/views/MonitoringCapacityView.vue)
- [MonitoringTracesView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/views/MonitoringTracesView.vue)
- [monitoring.api.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/services/monitoring.api.ts)
- [monitoring.store.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/stores/monitoring.store.ts)
- [monitoring.model.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/models/monitoring.model.ts)
- [monitoring.mapper.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/mappers/monitoring.mapper.ts)

Correspondance ecrans / routes reelles :

- `SCR-MON-001` : `/app/monitoring/etat-systeme`
- `SCR-MON-002` : `/app/monitoring/dashboard`
- `SCR-MON-003` : `/app/monitoring/observabilite`
- `SCR-MON-004` : `/app/monitoring/sante`
- `SCR-MON-005` : `/app/monitoring/incidents`
- `SCR-MON-006` : `/app/monitoring/alertes`
- `SCR-MON-007` : `/app/monitoring/diagnostics`
- `SCR-MON-008` : `/app/monitoring/capacite`
- `SCR-MON-009` : `/app/monitoring/traces`

Verification technique de cloture :

- `npm run build` frontend : OK

Verdict de cloture :

- les workflows `MON-01` a `MON-17` disposent maintenant d'une materialisation frontend coherente avec leurs routes backend reelles
- aucune dette bloquante de branchement n'est relevee sur `shared/monitoring`
