# Phase 8 - Workflows Scolaires

## Statut

Ce document ouvre la documentation detaillee des workflows scolaires reels d'EduSync.

Il s'appuie sur :

- [00-doctrine-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/00-doctrine-frontend.md)
- [01-acteurs.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/01-acteurs.md)
- [02-permissions-effectives.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/02-permissions-effectives.md)
- [03-cas-utilisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/03-cas-utilisation.md)
- [04-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/04-workflows.md)
- [05-workflows-reels.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/05-workflows-reels.md)

Le backend reste la source officielle de verite.

## Workflow SCO-01

### Identifiant

`SCO-01`

### Nom

Creer une inscription scolaire complete

### Categorie

`Scolaire`

### Niveau de criticite

`Critique`

### Objectif metier

Permettre a l'ecole d'enregistrer proprement l'entree scolaire complete d'un eleve dans une annee donnee, avec creation de l'identite eleve, creation de l'inscription annuelle, validation de l'inscription et affectation optionnelle a une classe, dans un flux atomique et idempotent.

### Acteur principal

`CAISSIER`

### Acteurs secondaires

Aucun acteur secondaire n'est explicitement atteste dans les preuves backend retenues pour ce workflow.

### Preconditions

- l'acteur doit etre un `CAISSIER` actif dans la bonne organisation et la bonne ecole
- le contexte actif doit porter la bonne organisation et la bonne ecole
- la permission `caisse.write` doit etre effectivement disponible
- un `idempotency-key` doit etre fourni
- le payload compose doit etre coherent :
  - meme eleve entre `eleve` et `inscription`
  - meme inscription entre `inscription` et `affectation` quand une affectation est fournie
- l'eleve cible doit etre actif pour recevoir une nouvelle inscription
- aucune inscription active ne doit deja exister pour le meme eleve et la meme annee
- si une affectation est demandee :
  - l'inscription doit pouvoir etre validee
  - la classe doit etre exploitable dans la meme ecole et la meme annee

### Permissions effectives requises

- `caisse.write`

Lecture officielle :

- le backend retient maintenant ce workflow comme un workflow de scolarite porte par le `CAISSIER`
- la permission effectivement revalidee localement est `caisse.write`
- le perimetre effectivement revalide est `organisation + ecole`

### Cas d'utilisation utilises

- `CreerEleve`
- `CreerInscriptionScolaire`
- `ValiderInscriptionScolaire`
- `AffecterEleveAClasse`
- `CreerInscriptionComplete`
- `OrchestrateurInscriptionEleve`

### Deroulement principal

Le deroulement principal retenu pour ce workflow est celui d'un caissier qui enregistre un nouvel eleve ou un eleve a reinscrire dans une ecole, pour une annee scolaire donnee, avec affectation immediate lorsque le contexte scolaire le permet.

1. Le caissier envoie une commande composee d'inscription complete.
2. Le backend relit l'identite utilisateur depuis le contexte authentifie de la requete.
3. Le backend revalide localement que l'acteur courant est bien un `CAISSIER` de la bonne ecole.
4. Le backend revalide localement la permission `caisse.write` dans le bon perimetre `organisation + ecole`.
5. Le backend exige une cle d'idempotence pour cette commande critique.
6. Le backend verifie si la meme cle a deja traite le meme payload.
7. Si oui, le backend rejoue la sortie precedente.
8. Sinon, le backend ouvre une transaction applicative unique.
9. Le backend cree l'identite eleve.
10. Le backend cree l'inscription scolaire annuelle.
11. Si une affectation est demandee, le backend valide l'inscription creee.
12. Si une affectation est demandee et qu'elle reste autorisee, le backend cree l'affectation de classe.
13. Le backend retourne une sortie composee contenant l'eleve, l'inscription et l'affectation eventuelle.

### Variantes

#### Variante 1 - Inscription complete sans affectation immediate

- le payload ne contient pas de bloc `affectation`
- le backend cree l'eleve et l'inscription
- aucune affectation n'est creee
- l'inscription reste consultable comme inscription annuelle sans classe assignee

#### Variante 2 - Rejeu idempotent

- la meme cle d'idempotence est reutilisee avec le meme payload
- le backend rejoue la meme sortie
- le workflow ne recreate pas silencieusement une deuxieme inscription

### Resultat attendu

En sortie de ce workflow, l'ecole doit disposer selon le cas :

- d'un eleve cree dans le bon tenant
- d'une inscription scolaire annuelle creee
- d'une inscription validee si une affectation immediate a ete demandee
- d'une affectation de classe active si le bloc `affectation` etait fourni et autorise
- d'une sortie composee stable et rejouable par idempotence

### Contraintes backend

- le workflow reapplique maintenant une autorisation locale dediee
- il ne se contente plus du seul contexte HTTP ou du seul tenant
- l'identite utilisateur consommee est celle du contexte authentifie, pas une valeur arbitraire de client
- l'idempotence est reellement branchee au niveau de l'orchestrateur
- le flux compose est execute dans une transaction applicative unique
- l'affectation ne peut pas etre creee sur une inscription non validee
- la validation complete HTTP du payload compose n'est plus un simple cast

### Evenements importants

Quand le flux nominal va jusqu'au bout, les transitions metier importantes sont :

- creation de l'eleve
- creation de l'inscription
- validation de l'inscription
- affectation de l'eleve a une classe

### Donnees manipulees

- `Eleve`
- `InscriptionScolaire`
- `AffectationClasse`
- contexte tenant `organisation + ecole`
- cle d'idempotence de commande

### Sources backend

- route : [scolarite-eleves.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/interfaces/http/routes/scolarite-eleves.routes.ts)
- composition : [scolarite-eleves.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/scolarite-eleves.routes.ts)
- controleur : [ControleurInscriptionsScolaires.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/interfaces/http/controllers/ControleurInscriptionsScolaires.ts)
- validateur : [inscriptions.validator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/interfaces/http/validators/inscriptions.validator.ts)
- use case compose : [CreerInscriptionComplete.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/application/use-cases/inscriptions/CreerInscriptionComplete.ts)
- orchestrateur : [OrchestrateurInscriptionEleve.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/application/services/OrchestrateurInscriptionEleve.ts)
- autorisation locale : [AutorisationInscriptionCompleteAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationInscriptionCompleteAdapter.ts)
- tests :
  - [CreerInscriptionComplete.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/integration/application/CreerInscriptionComplete.spec.ts)
  - [api-scolarite-eleves.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/e2e/api-scolarite-eleves.test.ts)
  - [security-inscription-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-inscription-scolarite.integration.spec.ts)

### Notes de lecture frontend

- ce workflow doit etre lu comme un workflow scolaire de commande critique, pas comme un simple formulaire CRUD
- le frontend doit traiter l'idempotency-key comme un vrai besoin fonctionnel du flux
- le frontend ne doit pas presenter ce workflow comme ouvert a tout acteur disposant d'un acces large d'ecole
- le resultat naturel du workflow peut se projeter en plusieurs etapes UI, mais le backend le traite comme un seul parcours compose

### Notes de verrouillage

Aucune question bloquante restante n'est retenue pour l'ouverture documentaire de ce workflow.

### Statut de figement

`SCO-01 FIGE`

## Workflow SCO-04

### Identifiant

`SCO-04`

### Nom

Gerer les affectations de classe

### Acteurs principaux

- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`
- `CAISSIER`

### Lecture officielle

- les gestionnaires pedagogiques agissent dans leur section reelle
- le `CAISSIER` agit dans toute son ecole
- les permissions existantes ne sont pas supprimees :
  - `eleves.read` / `eleves.write` pour les gestionnaires pedagogiques
  - `caisse.read` / `caisse.write` pour le `CAISSIER`
- le backend reapplique maintenant le perimetre metier reel :
  - organisation
  - ecole
  - section
  - annee scolaire
- `ENSEIGNANT` simple, `ADMINISTRATEUR_ECOLE` et `DIRECTEUR_DISCIPLINE` ne sont pas des acteurs positifs de ce workflow

### Cas d'utilisation utilises

- `AffecterEleveAClasse`
- `ChangerEleveDeClasse`
- `DesactiverAffectationClasse`
- `ConsulterAffectationActive`
- `ListerElevesParClasse`

### Sources backend

- routes : [scolarite-eleves.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/interfaces/http/routes/scolarite-eleves.routes.ts)
- controleur : [ControleurAffectationsClasses.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/interfaces/http/controllers/ControleurAffectationsClasses.ts)
- validateur : [affectations.validator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/interfaces/http/validators/affectations.validator.ts)
- autorisation locale : [AutorisationAffectationClasseAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationAffectationClasseAdapter.ts)
- tests :
  - [AffectationsClasses.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/integration/application/AffectationsClasses.spec.ts)
  - [security-affectations-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-affectations-scolarite.integration.spec.ts)
- [api-scolarite-eleves.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/e2e/api-scolarite-eleves.test.ts)

### Statut de figement

`SCO-04 FIGE`

## Workflow SCO-05

### Identifiant

`SCO-05`

### Nom

Gerer les familles et leurs responsables

### Acteur principal

`CAISSIER`

### Lecture officielle

- le workflow familles reste rattache au flux reel d'inscription scolaire
- l'acteur local retenu est le `CAISSIER`
- les mutations reappliquent `caisse.write`
- les lectures reappliquent `caisse.read`
- le perimetre retenu est `organisation + ecole`
- aucun autre acteur n'est retenu positivement dans ce workflow

### Cas d'utilisation utilises

- `CreerFamille`
- `ModifierFamille`
- `ConsulterFamille`
- `ListerFamilles`
- `AjouterResponsableFamille`
- `ModifierResponsableFamille`
- `RetirerResponsableFamille`
- `DefinirResponsablePrincipal`
- `EvaluerFamilleNombreuse`

### Sources backend

- routes : [scolarite-eleves.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/interfaces/http/routes/scolarite-eleves.routes.ts)
- controleur : [ControleurFamilles.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/interfaces/http/controllers/ControleurFamilles.ts)
- validateur : [familles.validator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/interfaces/http/validators/familles.validator.ts)
- autorisation locale : [AutorisationFamilleAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationFamilleAdapter.ts)
- tests :
  - [Familles.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/integration/application/Familles.spec.ts)
  - [security-familles-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-familles-scolarite.integration.spec.ts)
  - [api-scolarite-eleves.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/e2e/api-scolarite-eleves.test.ts)

### Statut de figement

`SCO-05 FIGE`

## Workflow SCO-06

### Identifiant

`SCO-06`

### Nom

Gerer l'identite eleve et son lien familial

### Acteur principal

`CAISSIER`

### Lecture officielle

- le workflow couvre l'identite eleve hors inscription annuelle
- l'acteur local retenu est le `CAISSIER`
- les mutations reappliquent `caisse.write`
- les lectures reappliquent `caisse.read`
- le perimetre retenu est `organisation + ecole`

### Cas d'utilisation utilises

- `CreerEleve`
- `ModifierEleve`
- `ConsulterEleve`
- `ListerEleves`
- `RechercherEleves`
- `RattacherEleveAFamille`
- `DetacherEleveDeFamille`

### Sources backend

- routes : [scolarite-eleves.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/interfaces/http/routes/scolarite-eleves.routes.ts)
- controleur : [ControleurEleves.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/interfaces/http/controllers/ControleurEleves.ts)
- validateur : [eleves.validator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/interfaces/http/validators/eleves.validator.ts)
- autorisation locale : [AutorisationEleveAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationEleveAdapter.ts)
- tests :
  - [Eleves.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/integration/application/Eleves.spec.ts)
  - [security-eleves-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-eleves-scolarite.integration.spec.ts)
  - [api-scolarite-eleves.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/e2e/api-scolarite-eleves.test.ts)

### Statut de figement

`SCO-06 FIGE`

## Workflow SCO-03

### Identifiant

`SCO-03`

### Nom

Consulter le parcours scolaire de l'eleve

### Categorie

`Scolaire`

### Niveau de criticite

`Important`

### Objectif metier

Permettre aux responsables pedagogiques autorises de lire l'historique scolaire exploitable d'un eleve, sans ouvrir ce workflow a des acteurs administratifs hors perimetre pedagogique.

### Acteurs principaux

- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`

### Acteurs secondaires

Aucun acteur secondaire positif n'est retenu apres correction.

### Preconditions

- l'acteur doit etre authentifie
- le contexte actif doit porter la bonne organisation et la bonne ecole
- le backend doit pouvoir resoudre le perimetre pedagogique effectif de l'eleve :
  - derniere inscription active
  - affectation active
  - section effective de la classe
- la section de l'eleve doit correspondre a la section de l'acteur

### Permissions effectives requises

- consultation par eleve ou par annee :
  - permission `eleves.read`
  - perimetre `organisation + ecole + section`
Lecture officielle :

- le `CAISSIER` ne fait pas partie de ce workflow
- `ADMINISTRATEUR_ECOLE` n'ouvre pas implicitement ce parcours par heritage de permission
- `ENSEIGNANT` simple non titulaire ne fait pas partie des acteurs retenus
- la reconstruction de parcours n'est plus exposee comme route publique du workflow

### Cas d'utilisation utilises

- `ConsulterParcoursEleve`
- `ListerEvenementsParEleve`
- `ListerEvenementsParAnnee`

### Deroulement principal

1. Un responsable pedagogique consulte le parcours d'un eleve ou les evenements d'une annee.
2. Le backend relit l'utilisateur authentifie depuis le contexte de requete.
3. Le backend reapplique localement la doctrine `permission + perimetre`.
4. Pour une lecture par eleve, le backend resout la section effective de l'eleve et exige la meme section cote acteur.
5. Pour une lecture par annee, le backend relit les inscriptions de l'annee, resout la section de chaque parcours et ne retourne que les eleves de sections autorisees.
6. Le backend retourne le parcours ou les evenements filtres.

### Resultat attendu

- la lecture du parcours devient reellement sectionnelle
- les lectures par annee ne fuient plus les autres sections
- le parcours est maintenant alimente par les workflows amont reels :
  - inscription
  - validation d'inscription
  - affectation
  - changement de classe
  - mutations de statut

### Contraintes backend

- les routes HTTP exigent maintenant un utilisateur authentifie reel
- une autorisation locale dediee a ete ajoutee pour le parcours
- le filtrage par annee passe par les inscriptions et affectations reelles avant de relire les parcours
- le workflow ne se contente plus du seul tenant `ecole`
- la route publique de reconstruction a ete retiree tant qu'une reconstruction exhaustive depuis sources autoritatives n'est pas attestee

### Donnees manipulees

- `ParcoursScolaireEleve`
- `EvenementParcours`
- `InscriptionScolaire`
- `AffectationClasse`
- section effective de la classe
- contexte tenant `organisation + ecole`

### Sources backend

- routes : [scolarite-eleves.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/interfaces/http/routes/scolarite-eleves.routes.ts)
- composition : [scolarite-eleves.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/scolarite-eleves.routes.ts)
- controleur : [ControleurParcoursEleves.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/interfaces/http/controllers/ControleurParcoursEleves.ts)
- validateur : [parcours.validator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/interfaces/http/validators/parcours.validator.ts)
- use cases :
  - [ConsulterParcoursEleve.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/application/use-cases/parcours/ConsulterParcoursEleve.ts)
  - [ListerEvenementsParEleve.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/application/use-cases/parcours/ListerEvenementsParEleve.ts)
  - [ListerEvenementsParAnnee.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/application/use-cases/parcours/ListerEvenementsParAnnee.ts)
- historisation amont : [HistorisationParcoursScolaire.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/application/services/HistorisationParcoursScolaire.ts)
- autorisation locale : [AutorisationParcoursEleveAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationParcoursEleveAdapter.ts)
- tests :
  - [ParcoursEleve.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/integration/application/ParcoursEleve.spec.ts)
  - [api-scolarite-eleves.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/e2e/api-scolarite-eleves.test.ts)
  - [security-parcours-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-parcours-scolarite.integration.spec.ts)

### Notes de lecture frontend

- ce workflow doit etre lu comme une lecture pedagogique gouvernee par la section
- le frontend ne doit pas presenter le parcours complet comme un droit naturel du `CAISSIER`
- le frontend ne doit plus exposer de bouton public de reconstruction de parcours

### Notes de verrouillage

Aucune question bloquante restante n'est retenue pour l'ouverture documentaire de ce workflow.

### Statut de figement

`SCO-03 FIGE`

## Workflow SCO-02

### Identifiant

`SCO-02`

### Nom

Gerer le statut scolaire de l'eleve

### Categorie

`Scolaire`

### Niveau de criticite

`Critique`

### Objectif metier

Permettre a l'ecole de faire evoluer proprement le statut scolaire d'un eleve selon les mutations reelles attestees par le backend : abandon, transfert, reintegration, suspension, reactivation et deces.

### Acteurs principaux

- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`
- `CAISSIER`

### Acteurs secondaires

- `DIRECTEUR_DISCIPLINE`

### Preconditions

- l'acteur doit etre authentifie
- le contexte actif doit porter la bonne organisation et la bonne ecole
- `versionAttendue` doit etre fournie
- un `idempotency-key` doit etre fourni
- l'eleve cible doit exister
- le backend doit pouvoir resoudre le perimetre scolaire exploitable de l'eleve :
  - derniere inscription active
  - affectation active si elle existe
  - section de classe si elle existe

### Permissions effectives requises

Selon l'action :

- acteurs sectionnels :
  - permission `eleves.write`
  - perimetre `organisation + ecole + section`
- `CAISSIER` :
  - permission `caisse.write`
  - perimetre `organisation + ecole`

Lecture officielle :

- `PREFET_ETUDES`, `DIRECTEUR_ETUDES`, `DIRECTEUR_PRIMAIRE`, `DIRECTEUR_MATERNELLE` partagent le meme bloc d'actions, chacun dans sa section
- `DIRECTEUR_DISCIPLINE` ne porte que la suspension, dans sa section
- `CAISSIER` porte :
  - abandon
  - transfert
  - reactivation
  - deces
  sur toute l'ecole

### Cas d'utilisation utilises

- `ChangerStatutEleve`
- `DeclarerAbandonEleve`
- `TransfererEleve`
- `ReintegrerEleve`
- `SuspendreEleve`
- `ReactiverEleve`
- `DeclarerDecesEleve`

### Deroulement principal

1. Un acteur autorise envoie une commande de mutation de statut sur un eleve.
2. Le backend relit l'identite utilisateur depuis le contexte authentifie.
3. Le backend relit l'eleve cible.
4. Le backend reapplique localement la doctrine `permission + perimetre`.
5. Si l'action releve du `CAISSIER`, le backend revalide localement `caisse.write` sur `organisation + ecole`.
6. Sinon, le backend resout la section effective de l'eleve a partir de sa derniere inscription active et de son affectation active.
7. Le backend verifie que l'acteur courant est autorise pour cette section et pour cette action precise.
8. Le backend verifie la concurrence via `versionAttendue`.
9. Le backend applique la transition de statut dans l'agregat `Eleve`.
10. Le backend sauvegarde l'eleve modifie.
11. Le backend retourne l'eleve mis a jour.

### Variantes

#### Variante 1 - Suspension sectionnelle

- l'acteur est un `DIRECTEUR_DISCIPLINE`
- la mutation demandee est `suspension`
- toute autre mutation est refusee via cet acteur

#### Variante 2 - Reactivation

- la mutation demandee est `reactivation`
- le backend porte maintenant ce cas comme use case explicite
- la transition domaine reste une transition vers `ACTIF`

#### Variante 3 - Deces

- la mutation demandee est `deces`
- la route passe par l'espace de cycle de vie
- un eleve deja decede ne peut plus revenir vers un statut actif ou administratif

### Resultat attendu

- l'eleve voit son statut global mis a jour
- la transition metier est emise dans les evenements de domaine
- la mutation est refusee explicitement si l'acteur, la permission ou le perimetre ne sont pas valides

### Contraintes backend

- le workflow ne repose plus seulement sur la couche globale de securite
- une autorisation locale dediee est appliquee avant la sauvegarde
- la section effective de l'eleve est resolue depuis les donnees scolaires reelles
- `reactivation` n'est plus seulement un alias applicatif
- la route `deces` passe par le controleur de cycle de vie

### Evenements importants

- `EleveAbandonne`
- `EleveTransfere`
- `EleveSuspendu`
- `EleveReactive`
- `EleveDecede`
- `EleveStatutGlobalChange`

### Donnees manipulees

- `Eleve`
- `InscriptionScolaire`
- `AffectationClasse`
- section effective de classe
- contexte tenant `organisation + ecole`

### Sources backend

- routes : [scolarite-eleves.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/interfaces/http/routes/scolarite-eleves.routes.ts)
- composition : [scolarite-eleves.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/scolarite-eleves.routes.ts)
- controleur : [ControleurCycleVieEleves.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/interfaces/http/controllers/ControleurCycleVieEleves.ts)
- validateur : [cycle-vie.validator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/interfaces/http/validators/cycle-vie.validator.ts)
- coeur applicatif : [ChangerStatutEleve.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/application/use-cases/eleves/ChangerStatutEleve.ts)
- autorisation locale : [AutorisationCycleVieEleveAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationCycleVieEleveAdapter.ts)
- tests :
  - [ChangerStatutEleve.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/integration/application/ChangerStatutEleve.spec.ts)
  - [CycleVie.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/integration/application/CycleVie.spec.ts)
  - [api-scolarite-eleves.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/e2e/api-scolarite-eleves.test.ts)
  - [security-cycle-vie-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-cycle-vie-scolarite.integration.spec.ts)

### Notes de lecture frontend

- ce workflow doit etre lu comme un workflow de mutation critique, pas comme un simple changement CRUD de champ `statut`
- le frontend ne doit jamais presenter ces actions comme ouvertes a tout acteur disposant d'un acces large d'ecole
- la bonne section de l'eleve reste structurante pour les acteurs sectionnels
- `DIRECTEUR_DISCIPLINE` ne doit jamais voir dans l'UI des actions hors suspension

### Notes de verrouillage

Aucune question bloquante restante n'est retenue pour l'ouverture documentaire de ce workflow.

### Statut de figement

`SCO-02 FIGE`
