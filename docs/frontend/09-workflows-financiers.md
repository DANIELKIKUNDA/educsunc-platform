# Phase 9 - Workflows Financiers

## Statut

Ce document ouvre la documentation detaillee des workflows financiers reels d'EduSync.

Il s'appuie sur :

- [00-doctrine-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/00-doctrine-frontend.md)
- [01-acteurs.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/01-acteurs.md)
- [02-permissions-effectives.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/02-permissions-effectives.md)
- [03-cas-utilisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/03-cas-utilisation.md)
- [04-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/04-workflows.md)
- [05-workflows-reels.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/05-workflows-reels.md)

Le backend reste la source officielle de verite.

## Lecture Transverse De Securite

Pour les workflows financiers reels, la lecture correcte des permissions est maintenant :

- permission + perimetre metier

Et non :

- permission seule

Pour `PF-01`, cela signifie :

- le `CAISSIER` reste l'acteur principal naturel de perception
- le perimetre naturel du `CAISSIER` est `organisation + ecole`
- certains acteurs pedagogiques peuvent percevoir seulement des frais delegues
- cette delegation n'existe que si l'ecole la parametre explicitement par `typeFrais`
- cette delegation reste bornee a la section reelle de l'acteur
- `FRAIS_MINERVAL` n'entre jamais dans cette delegation

Consequence technique frontend maintenant figee :

- le backend privilegie l'utilisateur authentifie du contexte sur tout `x-user-id` fourni par le client
- les integrations frontend ne doivent donc jamais reposer sur une usurpation de header pour piloter l'acteur percepteur
- le contexte actif `organisation + ecole` doit etre correctement transporte

## Workflow PF-01

### Identifiant

`PF-01`

### Nom

Percevoir un paiement

### Categorie

`Financier`

### Niveau de criticite

`Critique`

### Objectif metier

Permettre l'enregistrement d'un paiement eleve dans la bonne ecole, pour le bon type de frais, avec verification du mode de paiement autorise, repartition sur les obligations exigibles, emission des recus, alimentation eventuelle de la caisse du jour et revalidation locale de l'autorisation reelle du percepteur.

### Acteur principal

`CAISSIER`

### Acteurs secondaires

- `PREFET_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`
- `ADMINISTRATEUR_ECOLE`

Lecture officielle :

- le `CAISSIER` reste l'acteur principal du workflow
- `ADMINISTRATEUR_ECOLE` reste un acteur positif seulement parce qu'il porte deja `paiements.write` sur son ecole
- `PREFET_ETUDES`, `DIRECTEUR_PRIMAIRE` et `DIRECTEUR_MATERNELLE` ne deviennent pas des caissiers generiques
- ces acteurs secondaires ne peuvent percevoir que des frais explicitement delegues par l'ecole et seulement dans leur section reelle

### Preconditions

- le contexte actif doit porter la bonne organisation et la bonne ecole
- l'utilisateur authentifie doit etre resolu dans le contexte de requete
- l'eleve cible doit appartenir a la meme organisation et a la meme ecole
- des parametres de paiement actifs doivent exister pour l'ecole
- le mode de paiement choisi doit etre autorise par les parametres actifs
- une cle d'idempotence doit etre fournie
- il doit exister au moins une obligation exigible correspondant au `typeFrais` declare
- pour un acteur delegue :
  - l'ecole doit avoir autorise ce role pour ce `typeFrais`
  - la classe active de l'eleve doit permettre de resoudre une section reelle
  - cette section doit correspondre a la section de l'acteur delegue
- `FRAIS_MINERVAL` doit rester hors delegation

### Permissions effectives requises

- `paiements.write` pour le `CAISSIER`
- `paiements.write` pour `ADMINISTRATEUR_ECOLE`
- `paiements.write` + delegation ecole par type de frais + section reelle pour :
  - `PREFET_ETUDES`
  - `DIRECTEUR_PRIMAIRE`
  - `DIRECTEUR_MATERNELLE`

Lecture officielle :

- le workflow n'a pas supprime les permissions existantes
- il a ajoute un filtre local de perception reelle
- la perception n'est donc plus lue comme `permission + ecole` seulement
- elle est maintenant lue comme `permission + organisation + ecole + section si necessaire + parametrage ecole par type de frais`

### Cas d'utilisation utilises

- `EnregistrerPaiementUseCase`
- `ConsulterDetteEleveUseCase`
- `ConsulterFraisExigiblesEleveUseCase`

### Deroulement principal

Le deroulement principal retenu pour ce workflow est celui d'un caissier qui enregistre un paiement dans sa propre ecole.

1. Le frontend envoie une demande de perception de paiement.
2. Le backend relit l'utilisateur authentifie dans le contexte de requete.
3. Le backend recharge l'organisation et l'ecole actives.
4. Le backend reapplique l'autorisation locale de perception.
5. Le backend verifie que l'eleve cible appartient bien au meme perimetre `organisation + ecole`.
6. Le backend recharge les parametres de paiement actifs de l'ecole.
7. Le backend verifie que le mode de paiement choisi est autorise.
8. Le backend recharge l'inscription active de l'eleve pour retrouver l'annee scolaire courante.
9. Le backend charge les obligations exigibles de cette annee et de ce type de frais.
10. Le backend cree le paiement et repartit le montant sur les obligations cibles.
11. Le backend emet les recus associes.
12. Si une caisse du jour est ouverte, le backend ajoute l'operation de caisse.
13. Le backend journalise l'action financiere et memorise la sortie idempotente.

### Variantes

#### Variante 1 - Perception deleguee secondaire

- le percepteur n'est pas un `CAISSIER`
- le backend resolve la classe active de l'eleve
- le backend resolve la section reelle de cette classe
- le backend verifie que l'acteur delegue est dans cette meme section
- le backend verifie que l'ecole a autorise ce role pour ce `typeFrais`
- si toutes les conditions sont reunies, la perception est autorisee

#### Variante 2 - Rejeu idempotent

- la meme cle d'idempotence est reutilisee avec le meme payload
- le backend rejoue la sortie precedente
- le workflow ne recreate pas silencieusement un deuxieme paiement

#### Variante 3 - Refus de delegation sur frais mensuel

- le percepteur tente une delegation sur `FRAIS_MINERVAL`
- le backend refuse la perception
- le workflow reste reserve au `CAISSIER` ou a un `ADMINISTRATEUR_ECOLE` deja autorise

### Resultat attendu

En sortie de ce workflow, l'ecole doit disposer :

- d'un paiement valide
- d'une repartition correcte sur les obligations eligibles
- d'un ou plusieurs recus emis
- d'une operation de caisse si une caisse du jour etait ouverte
- d'une trace d'audit financiere
- d'une sortie stable rejouable par idempotence

### Contraintes backend

- le workflow reapplique maintenant une autorisation locale dediee a la perception
- il ne fait plus confiance a un `x-user-id` arbitraire quand un utilisateur authentifie existe deja
- il recharge maintenant l'annee scolaire active de l'eleve avant de lire les obligations
- il conserve les permissions existantes mais leur ajoute un filtre metier de perception reelle
- le parametrage de delegation par type de frais est maintenant persiste
- la lecture de dette recharge aussi l'ecole reelle de l'eleve au lieu d'utiliser un identifiant vide

### Evenements importants

Quand le flux nominal va jusqu'au bout, les transitions metier importantes sont :

- creation du paiement
- repartition du paiement
- emission des recus
- ajout d'une operation de caisse si applicable
- journalisation de l'action financiere

### Donnees manipulees

- `Paiement`
- `ObligationFinanciereEleve`
- `RecuPaiement`
- `CaisseJour`
- `ParametresPaiementEcole`
- contexte tenant `organisation + ecole`
- section reelle de l'eleve si delegation
- cle d'idempotence

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [EnregistrerPaiementController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/EnregistrerPaiementController.ts)
- validateur : [EnregistrerPaiementValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/validators/EnregistrerPaiementValidator.ts)
- use case : [EnregistrerPaiementUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/paiements/EnregistrerPaiementUseCase.ts)
- autorisation locale : [AutorisationPerceptionPaiementAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationPerceptionPaiementAdapter.ts)
- migration de parametrage : [Migration_013_AddPerceptionDelegueeParametresPaiement.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/migrations/Migration_013_AddPerceptionDelegueeParametresPaiement.ts)
- tests :
  - [EnregistrerPaiementUseCase.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/EnregistrerPaiementUseCase.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [security-perception-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-perception-paiements-facturation.integration.spec.ts)

### Notes de lecture frontend

- le frontend doit presenter ce workflow d'abord comme un workflow `CAISSIER`
- les perceptions deleguees doivent etre lues comme des exceptions explicitement parametrees par l'ecole
- le frontend ne doit jamais presenter `PREFET_ETUDES`, `DIRECTEUR_PRIMAIRE` ou `DIRECTEUR_MATERNELLE` comme percepteurs universels
- le frontend doit considerer `FRAIS_MINERVAL` comme hors delegation
- la route backend reelle ouverte pour ce workflow est `POST /api/paiements`

### Verdict d'ouverture

`PF-01 OUVRABLE`

Justification technique :

- la doctrine `permission + perimetre` est maintenant appliquee dans le backend reel
- la delegation par `typeFrais` est persistee, branchee et testee
- la protection contre l'usurpation de `x-user-id` est en place
- l'annee scolaire active est rechargee avant lecture des obligations
- le workflow passe au `typecheck`
- les tests cibles du flux et de sa securite sont verts

### Statut de figement

`PF-01 FIGE`

## Workflow PF-02

### Identifiant

`PF-02`

### Nom

Ouvrir la caisse du jour

### Categorie

`Financier`

### Niveau de criticite

`Critique`

### Objectif metier

Permettre l'ouverture d'une caisse journaliere unique pour une ecole et une date donnees, avec verification du percepteur autorise, prevention des doublons de caisse active et journalisation de l'operation financiere.

### Acteur principal

`CAISSIER`

### Acteurs secondaires

Aucun acteur secondaire positif n'est retenu apres correction backend locale.

Lecture officielle :

- le backend ne retient plus `ADMINISTRATEUR_ECOLE` comme ouvreur implicite de caisse, meme s'il porte `caisse.write` dans les fixtures globales
- l'ouverture reelle de caisse est maintenant filtree localement au seul `CAISSIER`

### Preconditions

- le contexte actif doit porter la bonne organisation et la bonne ecole
- l'utilisateur authentifie doit etre resolu dans le contexte de requete
- l'acteur courant doit etre un `CAISSIER` actif dans cette organisation et cette ecole
- la permission `caisse.write` doit etre effectivement disponible
- aucune restriction `INTERDICTION_CAISSE` ne doit bloquer l'acteur
- aucune autre caisse active ne doit deja exister pour cette ecole et cette date

### Permissions effectives requises

- `caisse.write`

Lecture officielle :

- l'ouverture de caisse n'est plus lue comme une simple consequence de la permission brute
- elle est maintenant lue comme `role CAISSIER + permission caisse.write + organisation + ecole`
- `ADMINISTRATEUR_ECOLE` n'est plus un acteur positif local de ce workflow

### Cas d'utilisation utilises

- `OuvrirCaisseJourUseCase`

### Deroulement principal

Le deroulement principal retenu pour ce workflow est celui d'un caissier qui ouvre la caisse du jour de son ecole.

1. Le frontend envoie une demande d'ouverture de caisse.
2. Le backend relit l'utilisateur authentifie dans le contexte de requete.
3. Le backend recharge l'organisation et l'ecole actives.
4. Le backend reapplique l'autorisation locale d'ouverture de caisse.
5. Le backend verifie que l'acteur courant est bien un `CAISSIER` actif dans ce perimetre.
6. Le backend revalide `caisse.write` dans le bon perimetre `organisation + ecole`.
7. Le backend verifie qu'aucune caisse active n'existe deja pour cette ecole et cette date.
8. Le backend cree la `CaisseJour`.
9. Le backend sauvegarde la caisse ouverte.
10. Le backend journalise `OUVRIR_CAISSE_JOUR`.
11. Le backend retourne la projection de caisse ouverte.

### Variantes

#### Variante 1 - Refus pour une caisse deja active

- une caisse active existe deja pour la meme ecole et la meme date
- le backend refuse l'ouverture
- aucune deuxieme caisse active n'est creee

#### Variante 2 - Refus pour un acteur non caissier

- l'acteur courant n'est pas un `CAISSIER`
- le backend refuse l'ouverture
- ce refus couvre maintenant explicitement `ADMINISTRATEUR_ECOLE` et les acteurs pedagogiques

### Resultat attendu

En sortie de ce workflow, l'ecole doit disposer :

- d'une caisse journaliere ouverte
- d'un identifiant stable de caisse
- d'une trace d'audit `OUVRIR_CAISSE_JOUR`
- d'une projection HTTP lisible par le frontend

### Contraintes backend

- le workflow reapplique maintenant une autorisation locale dediee a l'ouverture de caisse
- cette autorisation est limitee au `CAISSIER`
- l'entree applicative porte maintenant `idOrganisation`
- le backend privilegie l'utilisateur authentifie du contexte sur tout `x-user-id` fourni
- la contrainte d'unicite fonctionnelle reste `une caisse active par ecole et par date`

### Evenements importants

Quand le flux nominal va jusqu'au bout, les transitions metier importantes sont :

- ouverture de la caisse du jour
- journalisation financiere de l'ouverture

### Donnees manipulees

- `CaisseJour`
- contexte tenant `organisation + ecole`
- identite authentifiee du caissier
- date de caisse

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [OuvrirCaisseController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/OuvrirCaisseController.ts)
- validateur : [ParamValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/validators/ParamValidator.ts)
- use case : [OuvrirCaisseJourUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/caisse/OuvrirCaisseJourUseCase.ts)
- autorisation locale : [AutorisationOuvertureCaisseAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationOuvertureCaisseAdapter.ts)
- tests :
  - [CaisseUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/CaisseUseCases.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [security-ouverture-caisse-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-ouverture-caisse-paiements.integration.spec.ts)

### Notes de lecture frontend

- le frontend doit presenter ce workflow comme un workflow strictement `CAISSIER`
- le frontend ne doit pas reutiliser la simple presence de `caisse.write` pour exposer cette action a d'autres acteurs
- l'ecole et la date sont les deux parametres fonctionnels centraux de l'ouverture
- la route backend reelle ouverte pour ce workflow est `POST /api/caisse/ouverture`

### Verdict d'ouverture

`PF-02 OUVRABLE`

Justification technique :

- le workflow est reellement expose par une route backend dediee
- le cas d'usage applicatif est reel et teste
- l'autorisation locale est maintenant branchee
- le perimetre `organisation + ecole` est maintenant porte explicitement
- le transport HTTP privilegie l'utilisateur authentifie
- les tests cibles du flux, de la route et de la securite locale sont verts

### Statut de figement

`PF-02 FIGE`

## Workflow PF-03

### Identifiant

`PF-03`

### Nom

Cloturer la caisse du jour

### Categorie

`Financier`

### Niveau de criticite

`Critique`

### Objectif metier

Permettre la cloture d'une caisse journaliere existante dans la bonne ecole, avec verification du caissier autorise, refus des clotures hors perimetre, conservation des totaux calcules et journalisation de la fermeture.

### Acteur principal

`CAISSIER`

### Acteurs secondaires

Aucun acteur secondaire positif n'est retenu apres correction backend locale.

Lecture officielle :

- la cloture de caisse suit maintenant la meme doctrine locale que l'ouverture
- `ADMINISTRATEUR_ECOLE` n'est pas retenu comme clotureur implicite de caisse
- la cloture reelle de caisse est maintenant filtree localement au seul `CAISSIER`

### Preconditions

- le contexte actif doit porter la bonne organisation et la bonne ecole
- l'utilisateur authentifie doit etre resolu dans le contexte de requete
- l'acteur courant doit etre un `CAISSIER` actif dans cette organisation et cette ecole
- la permission `caisse.write` doit etre effectivement disponible
- aucune restriction `INTERDICTION_CAISSE` ne doit bloquer l'acteur
- la caisse cible doit exister
- la caisse cible doit appartenir a l'ecole courante

### Permissions effectives requises

- `caisse.write`

Lecture officielle :

- la cloture de caisse n'est plus lue comme une simple consequence de la permission brute
- elle est maintenant lue comme `role CAISSIER + permission caisse.write + organisation + ecole`
- `ADMINISTRATEUR_ECOLE` n'est plus un acteur positif local de ce workflow

### Cas d'utilisation utilises

- `CloturerCaisseJourUseCase`

### Deroulement principal

Le deroulement principal retenu pour ce workflow est celui d'un caissier qui cloture la caisse du jour de son ecole.

1. Le frontend envoie une demande de cloture de caisse.
2. Le backend relit l'utilisateur authentifie dans le contexte de requete.
3. Le backend recharge l'organisation et l'ecole actives.
4. Le backend reapplique l'autorisation locale de cloture de caisse.
5. Le backend verifie que l'acteur courant est bien un `CAISSIER` actif dans ce perimetre.
6. Le backend revalide `caisse.write` dans le bon perimetre `organisation + ecole`.
7. Le backend recharge la caisse cible.
8. Le backend verifie que cette caisse appartient bien a l'ecole courante.
9. Le backend cloture la caisse.
10. Le backend sauvegarde la caisse cloturee.
11. Le backend journalise `CLOTURER_CAISSE_JOUR`.
12. Le backend retourne la projection de caisse cloturee.

### Variantes

#### Variante 1 - Refus pour une caisse introuvable

- la caisse cible n'existe pas
- le backend refuse la cloture
- aucune mutation n'est appliquee

#### Variante 2 - Refus pour une caisse hors ecole

- la caisse cible existe mais appartient a une autre ecole
- le backend refuse la cloture
- aucune mutation hors perimetre n'est appliquee

#### Variante 3 - Refus pour un acteur non caissier

- l'acteur courant n'est pas un `CAISSIER`
- le backend refuse la cloture
- ce refus couvre maintenant explicitement `ADMINISTRATEUR_ECOLE` et les acteurs pedagogiques

### Resultat attendu

En sortie de ce workflow, l'ecole doit disposer :

- d'une caisse journaliere cloturee
- des totaux calcules conserves
- d'une trace d'audit `CLOTURER_CAISSE_JOUR`
- d'une projection HTTP lisible par le frontend

### Contraintes backend

- le workflow reapplique maintenant une autorisation locale dediee a la cloture de caisse
- cette autorisation est limitee au `CAISSIER`
- l'entree applicative porte maintenant `idOrganisation + idEcole`
- le backend privilegie l'utilisateur authentifie du contexte sur tout `x-user-id` fourni
- le backend refuse explicitement une cloture de caisse hors ecole courante

### Evenements importants

Quand le flux nominal va jusqu'au bout, les transitions metier importantes sont :

- cloture de la caisse du jour
- journalisation financiere de la cloture

### Donnees manipulees

- `CaisseJour`
- contexte tenant `organisation + ecole`
- identite authentifiee du caissier
- montant physique declare optionnel
- observation de cloture optionnelle

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [CloturerCaisseController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/CloturerCaisseController.ts)
- validateur : [ParamValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/validators/ParamValidator.ts)
- use case : [CloturerCaisseJourUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/caisse/CloturerCaisseJourUseCase.ts)
- autorisation locale : [AutorisationOuvertureCaisseAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationOuvertureCaisseAdapter.ts)
- tests :
  - [CaisseUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/CaisseUseCases.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [security-ouverture-caisse-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-ouverture-caisse-paiements.integration.spec.ts)

### Notes de lecture frontend

- le frontend doit presenter ce workflow comme un workflow strictement `CAISSIER`
- le frontend ne doit pas reutiliser la simple presence de `caisse.write` pour exposer cette action a d'autres acteurs
- l'ecole courante et l'identifiant de caisse sont les deux ancrages fonctionnels centraux de la cloture
- la route backend reelle ouverte pour ce workflow est `POST /api/caisse/cloture`

### Verdict d'ouverture

`PF-03 OUVRABLE`

Justification technique :

- le workflow est reellement expose par une route backend dediee
- le cas d'usage applicatif est reel et teste
- l'autorisation locale est maintenant branchee
- le perimetre `organisation + ecole` est maintenant porte explicitement
- le backend refuse une cloture hors ecole courante
- le transport HTTP privilegie l'utilisateur authentifie
- les tests cibles du flux, de la route et de la securite locale sont verts

### Statut de figement

`PF-03 FIGE`

## Workflow PF-04

### Identifiant

`PF-04`

### Nom

Consulter la caisse du jour

### Categorie

`Financier`

### Niveau de criticite

`Important`

### Objectif metier

Permettre la consultation de la caisse journaliere active d'une ecole a une date donnee, avec revalidation locale du caissier autorise et sans exposition implicite de cette lecture aux autres roles porteurs de `caisse.read`.

### Acteur principal

`CAISSIER`

### Acteurs secondaires

- `ADMINISTRATEUR_ECOLE`
- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`

Lecture officielle :

- le `CAISSIER` reste l'acteur operationnel naturel de la caisse
- `ADMINISTRATEUR_ECOLE` peut consulter la caisse du jour de sa propre ecole
- `GESTIONNAIRE_ORGANISATION` peut consulter la caisse du jour des ecoles de son organisation
- `PROMOTEUR_ORGANISATION` peut consulter la caisse du jour des ecoles de son organisation
- ces acteurs secondaires n'ouvrent pas pour autant les workflows d'ouverture ou de cloture

### Preconditions

- le contexte actif doit porter la bonne organisation et la bonne ecole
- l'utilisateur authentifie doit etre resolu dans le contexte de requete
- l'acteur courant doit etre :
  - un `CAISSIER` actif dans cette organisation et cette ecole
  - ou un `ADMINISTRATEUR_ECOLE` actif dans cette organisation et cette ecole
  - ou un `GESTIONNAIRE_ORGANISATION` actif dans cette organisation
  - ou un `PROMOTEUR_ORGANISATION` actif dans cette organisation
- la permission effectivement relue doit etre :
  - `caisse.read` pour `CAISSIER` et `ADMINISTRATEUR_ECOLE`
  - `paiements.read` pour `GESTIONNAIRE_ORGANISATION` et `PROMOTEUR_ORGANISATION`
- aucune restriction `INTERDICTION_CAISSE` ne doit bloquer les lecteurs ecole
- une caisse active doit exister pour cette ecole et cette date

### Permissions effectives requises

- `caisse.read` pour `CAISSIER` et `ADMINISTRATEUR_ECOLE`
- `paiements.read` pour `GESTIONNAIRE_ORGANISATION` et `PROMOTEUR_ORGANISATION`

Lecture officielle :

- la consultation de caisse n'est plus lue comme une simple consequence d'une permission brute
- elle est maintenant lue comme :
  - `role CAISSIER ou ADMINISTRATEUR_ECOLE + caisse.read + organisation + ecole`
  - `role GESTIONNAIRE_ORGANISATION ou PROMOTEUR_ORGANISATION + paiements.read + organisation`

### Cas d'utilisation utilises

- `ConsulterCaisseJourUseCase`

### Deroulement principal

Le deroulement principal retenu pour ce workflow est celui d'un acteur autorise qui consulte la caisse active du jour.

1. Le frontend envoie une demande de consultation de caisse.
2. Le backend relit l'utilisateur authentifie dans le contexte de requete.
3. Le backend recharge l'organisation et l'ecole actives.
4. Le backend reapplique l'autorisation locale de consultation de caisse.
5. Le backend identifie la famille d'acteur reelle de consultation.
6. Le backend reapplique soit une lecture ecole, soit une lecture organisationnelle selon le role.
7. Le backend revalide la permission correspondante dans le bon perimetre.
8. Le backend charge la caisse active de cette ecole a la date demandee.
9. Le backend retourne la projection de caisse journaliere.

### Variantes

#### Variante 1 - Refus pour un acteur non autorise

- l'acteur courant n'est ni `CAISSIER`, ni `ADMINISTRATEUR_ECOLE`, ni `GESTIONNAIRE_ORGANISATION`, ni `PROMOTEUR_ORGANISATION`
- le backend refuse la consultation
- ce refus couvre les acteurs pedagogiques et les autres profils non finances

#### Variante 2 - Refus pour une caisse indisponible

- aucune caisse active n'existe pour cette ecole et cette date
- le backend refuse la consultation
- aucune lecture de secours n'est inventee

### Resultat attendu

En sortie de ce workflow, l'ecole doit disposer :

- d'une projection fiable de la caisse active du jour
- d'une lecture bornee au bon perimetre `organisation + ecole`
- d'un transport HTTP aligne sur l'utilisateur authentifie

### Contraintes backend

- le workflow reapplique maintenant une autorisation locale dediee a la consultation de caisse
- cette autorisation distingue maintenant :
  - une lecture ecole pour `CAISSIER` et `ADMINISTRATEUR_ECOLE`
  - une lecture organisationnelle pour `GESTIONNAIRE_ORGANISATION` et `PROMOTEUR_ORGANISATION`
- l'entree applicative porte maintenant `idOrganisation + idEcole + idUtilisateur`
- le backend privilegie l'utilisateur authentifie du contexte sur tout `x-user-id` fourni
- la lecture reste strictement bornee a la caisse active de l'ecole et de la date demandees

### Evenements importants

Quand le flux nominal va jusqu'au bout, les transitions metier importantes sont :

- revalidation de l'autorisation locale de lecture caisse
- projection de la caisse active du jour

### Donnees manipulees

- `CaisseJour`
- contexte tenant `organisation + ecole`
- identite authentifiee du caissier
- date de caisse

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [ConsulterCaisseJourController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/ConsulterCaisseJourController.ts)
- validateur : [ParamValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/validators/ParamValidator.ts)
- use case : [ConsulterCaisseJourUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/caisse/ConsulterCaisseJourUseCase.ts)
- autorisation locale : [AutorisationOuvertureCaisseAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationOuvertureCaisseAdapter.ts)
- tests :
  - [CaisseUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/CaisseUseCases.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [security-ouverture-caisse-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-ouverture-caisse-paiements.integration.spec.ts)

### Notes de lecture frontend

- le frontend doit presenter ce workflow comme un workflow strictement `CAISSIER`
- le frontend doit presenter `CAISSIER` comme acteur operationnel principal
- le frontend doit aussi exposer cette lecture a `ADMINISTRATEUR_ECOLE`, `GESTIONNAIRE_ORGANISATION` et `PROMOTEUR_ORGANISATION` selon leur perimetre reel
- l'ecole courante et la date sont les deux ancrages fonctionnels centraux de la consultation
- la route backend reelle ouverte pour ce workflow est `GET /api/caisse/jour`

### Verdict d'ouverture

`PF-04 OUVRABLE`

Justification technique :

- le workflow est reellement expose par une route backend dediee
- le cas d'usage applicatif est reel et teste
- l'autorisation locale est maintenant branchee
- le perimetre `organisation + ecole` est maintenant porte explicitement
- le transport HTTP privilegie l'utilisateur authentifie
- les tests cibles du flux, de la route et de la securite locale sont verts
- le `typecheck` backend est vert

### Statut de figement

`PF-04 FIGE`

## Workflow PF-05

### Identifiant

`PF-05`

### Nom

Consulter l'historique des paiements d'un eleve

### Categorie

`Financier`

### Niveau de criticite

`Important`

### Objectif metier

Permettre la consultation de l'historique reel des paiements d'un eleve dans le bon perimetre d'organisation et d'ecole, avec revalidation locale des lecteurs financiers autorises et sans lecture transverse non filtree par simple identifiant d'eleve.

### Acteur principal

`CAISSIER`

### Acteurs secondaires

- `ADMINISTRATEUR_ECOLE`
- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`
- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`
- `TITULAIRE`

Lecture officielle :

- le `CAISSIER` reste l'acteur operationnel naturel de consultation locale
- `ADMINISTRATEUR_ECOLE` peut consulter l'historique des paiements d'un eleve de sa propre ecole
- `GESTIONNAIRE_ORGANISATION` peut consulter l'historique des paiements d'un eleve d'une ecole de son organisation
- `PROMOTEUR_ORGANISATION` peut consulter l'historique des paiements d'un eleve d'une ecole de son organisation
- les acteurs pedagogiques ne peuvent consulter cet historique que si l'ecole les autorise explicitement
- cette delegation pedagogique reste bornee a la section reelle de l'eleve
- un `TITULAIRE` ne peut consulter cet historique que si l'ecole l'autorise explicitement et seulement pour sa propre classe titulaire dans la bonne annee scolaire
- un `PARENT` peut consulter l'historique des paiements de ses enfants effectivement relies a son utilisateur authentifie dans les responsables de famille

### Preconditions

- le contexte actif doit porter la bonne organisation et la bonne ecole
- l'utilisateur authentifie doit etre resolu dans le contexte de requete
- l'acteur courant doit etre :
  - un `CAISSIER` actif dans cette organisation et cette ecole
  - ou un `ADMINISTRATEUR_ECOLE` actif dans cette organisation et cette ecole
  - ou un `GESTIONNAIRE_ORGANISATION` actif dans cette organisation
  - ou un `PROMOTEUR_ORGANISATION` actif dans cette organisation
- la permission effectivement relue doit etre `paiements.read`
- l'eleve cible doit appartenir au meme perimetre `organisation + ecole` transporte par la requete
- pour un `TITULAIRE`, l'eleve cible doit appartenir a sa classe titulaire effective dans la bonne annee scolaire
- pour un `PARENT`, l'eleve cible doit etre rattache a une famille dont un responsable porte `idUtilisateurAuth = utilisateur courant`
- pour une delegation pedagogique :
  - l'ecole doit avoir autorise explicitement ce role
  - la classe active de l'eleve doit permettre de resoudre une section reelle
  - cette section doit correspondre a la section de l'acteur delegue

### Permissions effectives requises

- `paiements.read`

Lecture officielle :

- la consultation de l'historique n'est plus lue comme une simple consequence de la permission brute
- elle est maintenant lue comme :
  - `role CAISSIER ou ADMINISTRATEUR_ECOLE + paiements.read + organisation + ecole`
  - `role GESTIONNAIRE_ORGANISATION ou PROMOTEUR_ORGANISATION + paiements.read + organisation`
  - `role ENSEIGNANT + capacite derivee TITULAIRE + paiements.read + organisation + ecole + classe titulaire effective + annee scolaire courante + parametrage ecole`
  - `role PARENT + paiements.read + organisation + ecole + rattachement famille utilisateur -> eleve`
  - `role PREFET_ETUDES ou DIRECTEUR_ETUDES ou DIRECTEUR_PRIMAIRE ou DIRECTEUR_MATERNELLE + paiements.read + organisation + ecole + section + parametrage ecole`

### Cas d'utilisation utilises

- `ConsulterHistoriquePaiementsEleveUseCase`

### Deroulement principal

Le deroulement principal retenu pour ce workflow est celui d'un acteur autorise qui consulte l'historique des paiements d'un eleve.

1. Le frontend envoie une demande de consultation d'historique.
2. Le backend relit l'utilisateur authentifie dans le contexte de requete.
3. Le backend recharge l'organisation et l'ecole actives.
4. Le backend recharge l'eleve cible.
5. Le backend verifie que l'eleve appartient bien au perimetre `organisation + ecole` courant.
6. Le backend reapplique l'autorisation locale de consultation d'historique.
7. Le backend revalide `paiements.read` dans le bon perimetre.
8. Le backend charge l'historique des paiements par `idEleve + idEcole`.
9. Le backend retourne la projection d'historique.

### Variantes

#### Variante 1 - Refus pour un acteur non autorise

- l'acteur courant n'est ni `CAISSIER`, ni `ADMINISTRATEUR_ECOLE`, ni `GESTIONNAIRE_ORGANISATION`, ni `PROMOTEUR_ORGANISATION`, ni un acteur pedagogique explicitement delegue
- le backend refuse la consultation

#### Variante 2 - Refus pour un eleve hors perimetre courant

- l'eleve cible n'appartient pas au `organisation + ecole` transporte
- le backend refuse la consultation
- la lecture n'est pas resolvee par simple identifiant d'eleve

### Resultat attendu

En sortie de ce workflow, l'ecole doit disposer :

- d'un historique fiable des paiements de l'eleve
- d'une lecture bornee au bon perimetre `organisation + ecole`
- d'un transport HTTP aligne sur l'utilisateur authentifie

### Contraintes backend

- le workflow passe maintenant par un vrai use case applicatif au lieu d'un branchement direct du controleur vers le repository
- il reapplique maintenant une autorisation locale dediee a l'historique des paiements
- l'entree applicative porte maintenant `idOrganisation + idEcole + idUtilisateur + idEleve`
- le backend privilegie l'utilisateur authentifie du contexte sur tout `x-user-id` fourni
- le repository de lecture filtre maintenant par `idEleve + idEcole`
- la delegation pedagogique d'historique est maintenant portee par les parametres d'ecole et par la section reelle de l'eleve
- le lien `PARENT -> enfants autorises` est maintenant lu via les responsables de famille relies a `idUtilisateurAuth`

### Evenements importants

Quand le flux nominal va jusqu'au bout, les transitions metier importantes sont :

- revalidation de l'autorisation locale de lecture financiere
- projection de l'historique de paiement de l'eleve

### Donnees manipulees

- `Paiement`
- `HistoriquePaiementsEleveReadModel`
- contexte tenant `organisation + ecole`
- identite authentifiee du lecteur
- eleve cible

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [ConsulterHistoriquePaiementsController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/ConsulterHistoriquePaiementsController.ts)
- validateur : [ParamValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/validators/ParamValidator.ts)
- use case : [ConsulterHistoriquePaiementsEleveUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/dettes/ConsulterHistoriquePaiementsEleveUseCase.ts)
- autorisation locale : [AutorisationHistoriquePaiementsAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationHistoriquePaiementsAdapter.ts)
- query repository : [HistoriquePaiementsEleveQueryRepository.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/queries/HistoriquePaiementsEleveQueryRepository.ts)
- lecture famille-eleve : [ScolariteElevesAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/adapters/ScolariteElevesAdapter.ts)
- modele responsable famille : [ResponsableFamille.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/domain/entities/ResponsableFamille.ts)
- tests :
  - [ConsulterHistoriquePaiementsEleveUseCase.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/ConsulterHistoriquePaiementsEleveUseCase.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [security-historique-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-historique-paiements-facturation.integration.spec.ts)
  - [ScolariteElevesAdapter.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/infrastructure/adapters/ScolariteElevesAdapter.spec.ts)
  - [Familles.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/integration/application/Familles.spec.ts)

### Notes de lecture frontend

- le frontend doit presenter `CAISSIER` comme acteur principal de lecture locale
- le frontend doit aussi exposer cette lecture a `ADMINISTRATEUR_ECOLE`, `GESTIONNAIRE_ORGANISATION` et `PROMOTEUR_ORGANISATION` selon leur perimetre reel
- la route backend reelle ouverte pour ce workflow est `GET /api/eleves/:idEleve/paiements`

### Verdict d'ouverture

`PF-05 OUVRABLE`

Justification technique :

- le workflow est reellement expose par une route backend dediee
- il est maintenant branche sur un vrai use case applicatif
- l'autorisation locale est maintenant branchee
- le perimetre `organisation + ecole` est maintenant verifie
- le repository de lecture ne lit plus par simple `idEleve`
- la delegation pedagogique conditionnelle par ecole et section est maintenant branchee
- les tests cibles du flux, de la route et de la securite locale sont verts
- le `typecheck` backend est vert
- la doctrine `PARENT -> ses enfants autorises` est maintenant fermee via le rattachement backend des responsables de famille

### Statut de figement

`PF-05 FIGE`

## Workflow PF-06

`PF-06`

Consulter la situation financiere d'un eleve

### Intention metier

Permettre la consultation de la dette consolidee et des frais exigibles d'un eleve dans le bon perimetre d'organisation et d'ecole, avec revalidation locale des lecteurs autorises et sans lecture transverse non filtree par simple identifiant d'eleve.

### Acteurs reels

- `CAISSIER`
- `ADMINISTRATEUR_ECOLE`
- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`
- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`
- `TITULAIRE`
- `PARENT`

Lecture officielle :

- `PF-06` reprend exactement la doctrine d'acteurs de `PF-05`
- le `CAISSIER` reste l'acteur operationnel naturel de lecture locale
- `ADMINISTRATEUR_ECOLE` peut consulter la situation financiere d'un eleve de sa propre ecole
- `GESTIONNAIRE_ORGANISATION` peut consulter la situation financiere d'un eleve d'une ecole de son organisation
- `PROMOTEUR_ORGANISATION` peut consulter la situation financiere d'un eleve d'une ecole de son organisation
- les acteurs pedagogiques ne peuvent consulter cette situation que si l'ecole les autorise explicitement
- cette delegation pedagogique reste bornee a la section reelle de l'eleve
- un `TITULAIRE` peut consulter cette situation seulement si l'ecole l'autorise explicitement et seulement pour sa propre classe titulaire dans la bonne annee scolaire
- un `PARENT` peut consulter la situation financiere de ses enfants effectivement relies a son utilisateur authentifie dans les responsables de famille

### Preconditions

- le contexte actif doit porter la bonne organisation et la bonne ecole
- l'utilisateur authentifie doit etre resolu dans le contexte de requete
- la permission effectivement relue doit etre `paiements.read`
- l'eleve cible doit appartenir au meme perimetre `organisation + ecole` transporte par la requete
- pour un `TITULAIRE`, l'eleve cible doit appartenir a sa classe titulaire effective dans la bonne annee scolaire
- pour un `PARENT`, l'eleve cible doit etre rattache a une famille dont un responsable porte `idUtilisateurAuth = utilisateur courant`
- pour une delegation pedagogique :
  - l'ecole doit avoir autorise explicitement ce role
  - la classe active de l'eleve doit permettre de resoudre une section reelle
  - cette section doit correspondre a la section de l'acteur delegue

### Permissions effectives requises

- `paiements.read`

Lecture officielle :

- la consultation de la situation financiere n'est plus lue comme une simple consequence de la permission brute
- elle est maintenant lue comme :
  - `role CAISSIER ou ADMINISTRATEUR_ECOLE + paiements.read + organisation + ecole`
  - `role GESTIONNAIRE_ORGANISATION ou PROMOTEUR_ORGANISATION + paiements.read + organisation`
  - `role ENSEIGNANT + capacite derivee TITULAIRE + paiements.read + organisation + ecole + classe titulaire effective + annee scolaire courante + parametrage ecole`
  - `role PARENT + paiements.read + organisation + ecole + rattachement famille utilisateur -> eleve`
  - `role PREFET_ETUDES ou DIRECTEUR_ETUDES ou DIRECTEUR_PRIMAIRE ou DIRECTEUR_MATERNELLE + paiements.read + organisation + ecole + section + parametrage ecole`

### Cas d'utilisation utilises

- `ConsulterDetteEleveUseCase`
- `ConsulterFraisExigiblesEleveUseCase`

### Routes reelles

- `GET /api/eleves/:idEleve/dette`
- `GET /api/eleves/:idEleve/frais-exigibles`

### Deroulement principal

Le deroulement principal retenu pour ce workflow est celui d'un acteur autorise qui consulte la situation financiere d'un eleve.

1. Le frontend envoie une demande de consultation de dette ou de frais exigibles.
2. Le backend relit l'utilisateur authentifie dans le contexte de requete.
3. Le backend recharge l'organisation et l'ecole actives.
4. Le backend recharge l'eleve cible.
5. Le backend verifie que l'eleve appartient bien au perimetre `organisation + ecole` courant.
6. Le backend reapplique l'autorisation locale de consultation de situation financiere.
7. Le backend revalide `paiements.read` dans le bon perimetre.
8. Le backend charge soit la dette consolidee, soit les obligations exigibles de l'eleve.
9. Le backend retourne la projection correspondante.

### Variantes

#### Variante 1 - Refus pour un acteur non autorise

- l'acteur courant n'est ni `CAISSIER`, ni `ADMINISTRATEUR_ECOLE`, ni `GESTIONNAIRE_ORGANISATION`, ni `PROMOTEUR_ORGANISATION`, ni un acteur pedagogique explicitement delegue
- le backend refuse la consultation

#### Variante 2 - Refus pour un eleve hors perimetre courant

- l'eleve cible n'appartient pas au `organisation + ecole` transporte
- le backend refuse la consultation

### Resultat attendu

En sortie de ce workflow, l'ecole doit disposer :

- d'une lecture fiable de la dette consolidee de l'eleve
- d'une lecture fiable des frais encore exigibles
- d'une lecture bornee au bon perimetre `organisation + ecole`
- d'un transport HTTP aligne sur l'utilisateur authentifie

### Contraintes backend

- le workflow passe par deux vrais use cases applicatifs distincts mais coherents
- il reapplique maintenant une autorisation locale dediee a la situation financiere eleve
- l'entree applicative porte maintenant `idOrganisation + idEcole + idUtilisateur + idEleve`
- le backend privilegie l'utilisateur authentifie du contexte sur tout `x-user-id` fourni
- la doctrine de securite reutilise exactement celle de `PF-05`
- le lien `PARENT -> enfants autorises` est lu via les responsables de famille relies a `idUtilisateurAuth`

### Donnees manipulees

- `DetteEleve`
- `DetteEleveOutput`
- `FraisExigiblesEleveOutput`
- contexte tenant `organisation + ecole`
- identite authentifiee du lecteur
- eleve cible

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleurs :
  - [ConsulterDetteEleveController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/ConsulterDetteEleveController.ts)
  - [ConsulterFraisExigiblesController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/ConsulterFraisExigiblesController.ts)
- validateur : [ParamValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/validators/ParamValidator.ts)
- use cases :
  - [ConsulterDetteEleveUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/dettes/ConsulterDetteEleveUseCase.ts)
  - [ConsulterFraisExigiblesEleveUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/dettes/ConsulterFraisExigiblesEleveUseCase.ts)
- autorisation locale : [AutorisationSituationFinanciereEleveAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationSituationFinanciereEleveAdapter.ts)
- doctrine reutilisee : [AutorisationHistoriquePaiementsAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationHistoriquePaiementsAdapter.ts)
- tests :
  - [ConsulterDetteEtFraisExigibles.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/ConsulterDetteEtFraisExigibles.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [security-situation-financiere-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-situation-financiere-paiements.integration.spec.ts)

### Notes de lecture frontend

- le frontend peut presenter `PF-06` comme un centre de lecture financiere eleve
- les deux ecrans ou blocs naturels sont :
  - dette consolidee
  - frais exigibles
- la doctrine d'acteurs et de perimetre est la meme que `PF-05`

### Verdict d'ouverture

`PF-06 OUVRABLE`

Justification technique :

- le workflow est reellement expose par deux routes backend dediees
- il est branche sur de vrais use cases applicatifs
- l'autorisation locale est maintenant branchee
- le perimetre `organisation + ecole` est maintenant verifie
- les routes privilegient l'utilisateur authentifie du contexte
- les tests cibles du flux, de la route et de la securite locale sont verts
- le `typecheck` backend est vert

### Statut de figement

`PF-06 FIGE`

## Workflow PF-07

`PF-07`

Annuler un paiement

### Intention metier

Permettre l'annulation d'un paiement deja enregistre dans le bon perimetre `organisation + ecole`, avec revalidation locale de l'acteur autorise, persistance des recus annules et inscription d'une contre-operation de caisse sans casser la caisse du jour.

### Acteurs reels

- `CAISSIER`
- `ADMINISTRATEUR_ECOLE`
- `PREFET_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`

Lecture officielle :

- `PF-07` reprend la meme doctrine d'acteurs que `PF-01`
- les acteurs pedagogiques delegues ne peuvent annuler que dans leur section reelle et selon le parametrage ecole par `typeFrais`
- `FRAIS_MINERVAL` reste hors delegation

### Permissions effectives requises

- `paiements.write` pour `CAISSIER` et `ADMINISTRATEUR_ECOLE`
- `paiements.write` + delegation locale par type de frais + section reelle pour `PREFET_ETUDES`, `DIRECTEUR_PRIMAIRE` et `DIRECTEUR_MATERNELLE`

Lecture officielle :

- l'annulation n'est plus lue comme `permission seule`
- elle est maintenant relue comme `acteur reel de perception + organisation + ecole + section si necessaire + parametrage ecole par type de frais`

### Route reelle

- `POST /api/paiements/:idPaiement/annulation`

### Contraintes backend

- l'entree applicative porte maintenant `idOrganisation + idEcole + idUtilisateur + idPaiement`
- le backend recharge l'eleve du paiement pour reverifier le perimetre `organisation + ecole`
- le backend reapplique une autorisation locale dediee a l'annulation
- les recus annules sont maintenant sauvegardes explicitement
- l'annulation ajoute maintenant une operation de caisse `ANNULATION` au lieu de cloturer la caisse
- la contre-operation neutralise la collecte initiale dans les totaux de caisse, tandis que `annulePar` reste historise dans `AnnulationPaiement`

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [AnnulerPaiementController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/AnnulerPaiementController.ts)
- validateur : [AnnulerPaiementValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/validators/AnnulerPaiementValidator.ts)
- use case : [AnnulerPaiementUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/annulations/AnnulerPaiementUseCase.ts)
- moteur metier : [MoteurAnnulationPaiement.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/domain/services/MoteurAnnulationPaiement.ts)
- autorisation locale : [AutorisationAnnulationPaiementAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationAnnulationPaiementAdapter.ts)
- tests :
  - [RestitutionEtAnnulation.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/RestitutionEtAnnulation.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [security-annulation-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-annulation-paiements-facturation.integration.spec.ts)

### Verdict d'ouverture

`PF-07 OUVRABLE`

Justification technique :

- le workflow est reellement expose par une route backend dediee
- l'autorisation locale est maintenant branchee
- le perimetre `organisation + ecole` est maintenant reverifie
- les recus annules sont maintenant persistes
- la caisse n'est plus cloturee par erreur pendant une annulation
- le `typecheck` backend est vert
- les tests cibles du flux, de la route et de la securite locale sont verts

### Statut de figement

`PF-07 FIGE`

## Workflow PF-08

`PF-08`

Restituer un excedent de paiement

### Intention metier

Permettre la restitution d'un excedent de paiement dans le bon perimetre `organisation + ecole`, avec revalidation locale de l'acteur autorise, prevention des doubles restitutions et inscription d'une contre-operation de caisse coherente.

### Acteurs reels

- `CAISSIER`
- `ADMINISTRATEUR_ECOLE`
- `PREFET_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`

Lecture officielle :

- `PF-08` reprend la meme doctrine d'acteurs que `PF-07`
- les acteurs pedagogiques delegues ne peuvent restituer que dans leur section reelle et selon le parametrage ecole par `typeFrais`
- `FRAIS_MINERVAL` reste hors delegation

### Permissions effectives requises

- `paiements.write` pour `CAISSIER` et `ADMINISTRATEUR_ECOLE`
- `paiements.write` + delegation locale par type de frais + section reelle pour `PREFET_ETUDES`, `DIRECTEUR_PRIMAIRE` et `DIRECTEUR_MATERNELLE`

Lecture officielle :

- la restitution n'est plus lue comme `permission seule`
- elle est maintenant relue comme `acteur reel de perception + organisation + ecole + section si necessaire + parametrage ecole par type de frais`

### Route reelle

- `POST /api/paiements/restitution`

### Contraintes backend

- l'entree applicative porte maintenant `idOrganisation + idEcole + idUtilisateur + idPaiement + idEleve`
- le backend recharge l'eleve du paiement pour reverifier le perimetre `organisation + ecole`
- le backend reapplique une autorisation locale dediee a la restitution
- une double restitution du meme paiement est maintenant refusee
- la restitution marque le paiement en `REMBOURSE`
- la restitution exige maintenant une caisse active et ajoute une operation de caisse `RESTITUTION`
- la contre-operation neutralise comptablement la collecte initiale, tandis que `effectuePar` reste historise dans `Restitution`

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [RestituerExcedentController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/RestituerExcedentController.ts)
- validateur : [RestituerExcedentValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/validators/RestituerExcedentValidator.ts)
- use case : [RestituerExcedentUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/annulations/RestituerExcedentUseCase.ts)
- autorisation locale : [AutorisationRestitutionPaiementAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationRestitutionPaiementAdapter.ts)
- tests :
  - [RestitutionEtAnnulation.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/RestitutionEtAnnulation.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [security-restitution-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-restitution-paiements-facturation.integration.spec.ts)

### Verdict d'ouverture

`PF-08 OUVRABLE`

Justification technique :

- le workflow est reellement expose par une route backend dediee
- l'autorisation locale est maintenant branchee
- le perimetre `organisation + ecole` est maintenant reverifie
- la double restitution est maintenant refusee
- la restitution est maintenant coherente avec la caisse du jour
- le `typecheck` backend est vert
- les tests cibles du flux, de la route et de la securite locale sont verts

### Statut de figement

`PF-08 FIGE`

## Workflow PF-09

`PF-09`

Reimprimer un recu

### Intention metier

Permettre la relecture d'un recu deja emis dans le bon perimetre `organisation + ecole`, avec priorite a l'utilisateur authentifie et sans ouvrir ce workflow a d'autres acteurs que le `CAISSIER`.

### Acteur reel

- `CAISSIER`

Lecture officielle :

- `PF-09` n'ouvre pas une lecture generique de recu pour toute l'ecole
- `ADMINISTRATEUR_ECOLE` ne devient pas reimprimeur de recu par simple heritage de `paiements.read`
- la doctrine appliquee est `permission + role reel + organisation + ecole`

### Permissions effectives requises

- `paiements.read`

Lecture officielle :

- la permission seule est insuffisante
- le backend reapplique d'abord la qualite de `CAISSIER` actif dans la meme ecole
- le backend reverifie ensuite que le recu appartient bien a l'ecole courante

### Route reelle

- `GET /api/recus/:idRecu`
- `GET /api/recus/:idRecu/pdf`

### Contraintes backend

- l'entree applicative porte maintenant `idOrganisation + idEcole + idUtilisateur + idRecu`
- le backend recharge le recu par son identifiant reel puis recompose un recu officiel par operation de caisse
- le backend refuse un recu hors ecole courante
- l'utilisateur authentifie reste prioritaire sur tout `x-user-id` fourni
- le JSON expose un recu officiel `un eleve + une operation + plusieurs lignes`
- l'export PDF officiel reprend `No | Type de frais | Libelle / mois | Montant (FC)` sans colonne `periode`
- le bloc final ne garde que le `caissier` et le `cachet de l'ecole` si disponible
- le logo, le cachet et la signature sont maintenant supportes par une persistance dediee, meme lorsqu ils restent optionnels
- l'identite documentaire de l'ecole releve maintenant de `ADMIN_SYSTEME_ECOLE` et non de `ADMINISTRATEUR_ECOLE`
- la signature documentaire relue sur le recu appartient au percepteur reel autorise de l'operation : `CAISSIER` naturellement, ou acteur delegue autorise a percevoir dans son perimetre

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [ReimprimerRecuController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/ReimprimerRecuController.ts)
- validateur : [ReimprimerRecuValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/validators/ReimprimerRecuValidator.ts)
- use case : [ReimprimerRecuUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/recus/ReimprimerRecuUseCase.ts)
- use case PDF : [TelechargerRecuPdfUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/recus/TelechargerRecuPdfUseCase.ts)
- service d'assemblage : [AssemblageRecuPaiementOfficielService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/services/AssemblageRecuPaiementOfficielService.ts)
- projection transverse : [ProjectionRecuPaiementAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/adapters/ProjectionRecuPaiementAdapter.ts)
- service PDF : [ServicePdfRecuPaiement.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/services/ServicePdfRecuPaiement.ts)
- migration assets : [Migration_016_AssetsDocumentairesRecus.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/migrations/Migration_016_AssetsDocumentairesRecus.ts)
- autorisation locale : [AutorisationReimpressionRecuAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationReimpressionRecuAdapter.ts)
- depot : [DepotRecuPaiement.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/domain/repositories/DepotRecuPaiement.ts)
- tests :
  - [RestitutionEtAnnulation.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/RestitutionEtAnnulation.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [security-reimpression-recu-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-reimpression-recu-paiements-facturation.integration.spec.ts)

### Verdict d'ouverture

`PF-09 OUVRABLE`

Justification technique :

- le workflow est maintenant expose par une route backend dediee
- la reimpression est reliee a une autorisation locale `CAISSIER` seulement
- le perimetre `organisation + ecole` est reverifie
- le recu relu doit appartenir a l'ecole courante
- les tests cibles du use case, de la route et de la securite locale sont verts

### Statut de figement

`PF-09 FIGE`

## Workflow PF-10

`PF-10`

Gerer les assets documentaires des recus

### Intention metier

Permettre la gestion des assets documentaires utilises par les recus officiels, en separant l'identite documentaire de l'ecole et la signature du percepteur reel, dans le bon perimetre `organisation + ecole`.

### Acteur reel principal

- `ADMIN_SYSTEME_ECOLE`

### Acteurs secondaires reels

- `CAISSIER`
- `PREFET_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`

Lecture officielle :

- `ADMIN_SYSTEME_ECOLE` gere uniquement l'identite documentaire de l'ecole : `logo` et `cachet`
- la signature documentaire appartient uniquement au percepteur reel autorise
- `ADMINISTRATEUR_ECOLE` et les autres lecteurs financiers ne deviennent pas signataires documentaires par simple heritage de permission

### Permissions effectives requises

- role actif reel
- perimetre `organisation + ecole`

### Routes reelles

- `GET /api/recus/assets/ecole`
- `PUT /api/recus/assets/ecole`
- `GET /api/recus/assets/ecole/logo`
- `GET /api/recus/assets/ecole/cachet`
- `GET /api/recus/assets/signature`
- `PUT /api/recus/assets/signature`
- `GET /api/recus/assets/signature/fichier`

### Contraintes backend

- l'identite documentaire ecole reste reservee a `ADMIN_SYSTEME_ECOLE`
- la signature reste reservee aux percepteurs reels autorises : `CAISSIER`, `PREFET_ETUDES`, `DIRECTEUR_PRIMAIRE`, `DIRECTEUR_MATERNELLE`
- les assets supportes sont `png`, `jpg`, `jpeg`, `svg`
- les fichiers sont persistes sous `recus-assets/...`
- le contexte authentifie et le `x-role-actif` restent prioritaires

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [AssetsRecusController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/AssetsRecusController.ts)
- validateur : [AssetsRecusValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/validators/AssetsRecusValidator.ts)
- use case : [GererAssetsRecusUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/recus/GererAssetsRecusUseCase.ts)
- tests :
  - [GererAssetsRecusUseCase.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/GererAssetsRecusUseCase.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)

### Verdict d'ouverture

`PF-10 OUVRABLE`

### Statut de figement

`PF-10 FIGE`

Justification technique :

- le workflow est deja expose par des routes backend reelles
- le use case applicatif est deja branche
- la separation `identite ecole` versus `signature du percepteur` est deja imposee par le backend
- la priorite au contexte authentifie et au role actif est testee
- les assets documentaires sont deja industrialises cote persistance et lecture

## Workflow PF-11

`PF-11`

Consulter le rapport financier journalier

### Intention metier

Permettre la consultation d'un rapport financier journalier dans le bon perimetre `organisation + ecole`, avec revalidation locale des lecteurs autorises et priorite a l'utilisateur authentifie transporte par le contexte.

### Acteur reel

- `CAISSIER`

### Acteurs secondaires reels

- `ADMINISTRATEUR_ECOLE`
- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`

### Permissions effectives requises

- `paiements.read`

### Perimetre reel applique

- `CAISSIER` : meme ecole
- `ADMINISTRATEUR_ECOLE` : meme ecole
- `GESTIONNAIRE_ORGANISATION` : meme organisation
- `PROMOTEUR_ORGANISATION` : meme organisation

### Route backend reelle

- `GET /api/rapports-financiers/journalier?date=YYYY-MM-DD`

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [ConsulterRapportFinancierController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/ConsulterRapportFinancierController.ts)
- use case : [ConsulterRapportFinancierJournalierUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/rapports/ConsulterRapportFinancierJournalierUseCase.ts)
- repository de lecture : [RapportFinancierQueryRepository.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/queries/RapportFinancierQueryRepository.ts)
- autorisation locale : [AutorisationRapportFinancierAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationRapportFinancierAdapter.ts)
- tests :
  - [ConsulterRapportFinancierJournalierUseCase.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/ConsulterRapportFinancierJournalierUseCase.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [security-rapport-financier-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-rapport-financier-paiements-facturation.integration.spec.ts)

### Verdict d'ouverture

`PF-11 OUVRABLE`

### Statut de figement

`PF-11 FIGE`

Justification technique :

- le workflow est maintenant expose par une route backend dediee
- un vrai use case applicatif est maintenant branche
- l'autorisation locale est maintenant branchee
- la doctrine `permission + perimetre` est maintenant appliquee pour les quatre acteurs retenus
- les routes privilegient l'utilisateur authentifie du contexte
- le `typecheck` backend est vert
- les tests cibles du use case, de la route, du produit et de la securite locale sont verts

## Workflow PF-12

`PF-12`

Consulter les paiements par caissier

### Intention metier

Permettre la consultation analytique des paiements agregees par caissier dans le bon perimetre `organisation + ecole`, avec revalidation locale des lecteurs autorises et priorite a l'utilisateur authentifie transporte par le contexte.

### Acteur reel

- `CAISSIER`

### Acteurs secondaires reels

- `ADMINISTRATEUR_ECOLE`
- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`

### Permissions effectives requises

- `paiements.read`

### Perimetre reel applique

- `CAISSIER` : meme ecole
- `ADMINISTRATEUR_ECOLE` : meme ecole
- `GESTIONNAIRE_ORGANISATION` : meme organisation
- `PROMOTEUR_ORGANISATION` : meme organisation

### Route backend reelle

- `GET /api/rapports-financiers/paiements-par-caissier`

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [ConsulterRapportFinancierController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/ConsulterRapportFinancierController.ts)
- use case : [ConsulterPaiementsParCaissierUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/rapports/ConsulterPaiementsParCaissierUseCase.ts)
- repository de lecture : [PaiementsParCaissierQueryRepository.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/queries/PaiementsParCaissierQueryRepository.ts)
- autorisation locale : [AutorisationRapportFinancierAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationRapportFinancierAdapter.ts)
- tests :
  - [ConsulterPaiementsParCaissierUseCase.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/ConsulterPaiementsParCaissierUseCase.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [security-rapport-financier-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-rapport-financier-paiements-facturation.integration.spec.ts)

### Verdict d'ouverture

`PF-12 OUVRABLE`

### Statut de figement

`PF-12 FIGE`

Justification technique :

- le workflow est maintenant expose par une route backend dediee
- un vrai use case applicatif est maintenant branche
- l'autorisation locale est mutualisee avec le bloc analytique `PF-11`
- la doctrine `permission + perimetre` est maintenant appliquee pour les quatre acteurs retenus
- les routes privilegient l'utilisateur authentifie du contexte
- le `typecheck` backend est vert
- les tests cibles du use case, de la route, du produit et de la securite locale sont verts

## Workflow PF-13

`PF-13`

Consulter les paiements par type de frais

### Intention metier

Permettre la consultation analytique des paiements agregees par type de frais dans le bon perimetre `organisation + ecole`, avec revalidation locale des lecteurs autorises et reduction pedagogique explicite du jeu de donnees lorsque l'ecole delegue cette lecture a un `TITULAIRE` ou a un responsable de section.

### Acteurs reels

- `CAISSIER`
- `ADMINISTRATEUR_ECOLE`
- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`

### Acteurs pedagogiques delegables

- `TITULAIRE`
- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`

### Permissions effectives requises

- `paiements.read`

### Perimetre reel applique

- `CAISSIER` : meme ecole
- `ADMINISTRATEUR_ECOLE` : meme ecole
- `GESTIONNAIRE_ORGANISATION` : meme organisation
- `PROMOTEUR_ORGANISATION` : meme organisation
- `TITULAIRE` : sa classe titulaire effective
- responsables pedagogiques de section : leur section reelle

### Doctrine locale supplementaire

- les acteurs pedagogiques ne lisent ce workflow que si l'ecole les autorise explicitement
- cette autorisation est relue via les parametres actifs de paiement de l'ecole
- la lecture pedagogique n'ouvre jamais la totalite de l'ecole : elle filtre les paiements sur les eleves visibles du perimetre delegue

### Route backend reelle

- `GET /api/rapports-financiers/paiements-par-type-frais`

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [ConsulterRapportFinancierController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/ConsulterRapportFinancierController.ts)
- use case : [ConsulterPaiementsParTypeFraisUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/rapports/ConsulterPaiementsParTypeFraisUseCase.ts)
- repository de lecture : [PaiementsParTypeFraisQueryRepository.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/queries/PaiementsParTypeFraisQueryRepository.ts)
- autorisation locale : [AutorisationPaiementsParTypeFraisAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationPaiementsParTypeFraisAdapter.ts)
- tests :
  - [ConsulterPaiementsParTypeFraisUseCase.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/ConsulterPaiementsParTypeFraisUseCase.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [security-paiements-par-type-frais-pedagogique.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-paiements-par-type-frais-pedagogique.integration.spec.ts)

### Verdict d'ouverture

`PF-13 OUVRABLE`

### Statut de figement

`PF-13 FIGE`

Justification technique :

- le workflow est maintenant expose par une route backend dediee
- un vrai use case applicatif est maintenant branche
- la doctrine `permission + perimetre` est appliquee pour les acteurs financiers globaux et les delegations pedagogiques
- la lecture pedagogique est maintenant effectivement filtree sur les eleves visibles du perimetre delegue
- les routes privilegient l'utilisateur authentifie du contexte
- le `typecheck` backend est vert
- les tests cibles du use case, de la route, du produit et de la securite locale sont verts

## Workflow PF-14

## Workflow PF-AG

`PF-AG`

Gerer la qualification financiere `ENFANT_AGENT`

### Intention metier

Permettre de porter proprement le statut financier `AG` comme qualification autonome d'un eleve, distincte d'une exoneration, puis de l'activer, le desactiver et le relire dans le bon perimetre.

### Routes backend reelles

- `POST /api/qualifications-financieres-eleves`
- `POST /api/qualifications-financieres-eleves/:idQualification/desactivation`
- `GET /api/eleves/:idEleve/qualifications-financieres`

### Acteur principal reel

- `CAISSIER`

### Acteurs secondaires reels

- `ADMINISTRATEUR_ECOLE`
- `GESTIONNAIRE_ORGANISATION` en lecture
- `PROMOTEUR_ORGANISATION` en lecture

### Doctrine de securite appliquee

- mutation : `paiements.write` + meme organisation + meme ecole
- lecture locale : `paiements.read` + meme organisation + meme ecole
- lecture organisationnelle : `paiements.read` + meme organisation
- `ENFANT_AGENT` reste une qualification autonome
- aucune reutilisation abusive des exonerations pour produire `AG`

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [QualificationFinanciereEleveController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/QualificationFinanciereEleveController.ts)
- use cases :
  - [ActiverQualificationFinanciereEleveUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/qualifications-financieres/ActiverQualificationFinanciereEleveUseCase.ts)
  - [DesactiverQualificationFinanciereEleveUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/qualifications-financieres/DesactiverQualificationFinanciereEleveUseCase.ts)
  - [ListerQualificationsFinancieresEleveUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/qualifications-financieres/ListerQualificationsFinancieresEleveUseCase.ts)
- autorisation : [AutorisationQualificationFinanciereEleveAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationQualificationFinanciereEleveAdapter.ts)
- persistance :
  - [QualificationFinanciereEleve.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/domain/aggregates/QualificationFinanciereEleve.ts)
  - [PostgresDepotQualificationFinanciereEleve.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/depots/PostgresDepotQualificationFinanciereEleve.ts)
  - [Migration_018_CreateQualificationsFinancieresEleves.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/migrations/Migration_018_CreateQualificationsFinancieresEleves.ts)
- tests :
  - [QualificationsFinancieresEleveUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/QualificationsFinancieresEleveUseCases.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)

### Etat technique

- `AG` est maintenant industrialise comme qualification backend autonome
- le registre financier de classe lit cette qualification sans la confondre avec `ENFANT_PROMOTEUR`
- le workflow ne remplace ni l'exoneration, ni la prise en charge, ni la famille nombreuse
- il fournit seulement le support officiel du statut `AG`

## Source backend VF-01

`VF-01`

Consulter le registre financier de classe

### Intention metier

Exposer une vraie source backend pour le registre financier de classe, afin que les vues `MF-01` a `MF-05` derivent d'un moteur commun au lieu de recalculs frontend divergents.

### Route backend reelle

- `GET /api/rapports-financiers/registre-classe`

### Doctrine de securite appliquee

- permission `paiements.read`
- `CAISSIER`, `ADMINISTRATEUR_ECOLE` : meme ecole
- `GESTIONNAIRE_ORGANISATION`, `PROMOTEUR_ORGANISATION` : meme organisation
- `TITULAIRE` : meme classe titulaire + meme annee scolaire
- `PREFET_ETUDES`, `DIRECTEUR_ETUDES`, `DIRECTEUR_PRIMAIRE`, `DIRECTEUR_MATERNELLE` : meme section reelle seulement si l'ecole a active la delegation pedagogique

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [ConsulterRapportFinancierController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/ConsulterRapportFinancierController.ts)
- use case : [ConsulterRegistreFinancierClasseUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/rapports/ConsulterRegistreFinancierClasseUseCase.ts)
- repository de lecture : [RegistreFinancierClasseQueryRepository.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/queries/RegistreFinancierClasseQueryRepository.ts)
- autorisation locale : [AutorisationRegistreFinancierClasseAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationRegistreFinancierClasseAdapter.ts)
- tests :
  - [ConsulterRegistreFinancierClasseUseCase.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/ConsulterRegistreFinancierClasseUseCase.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [security-registre-financier-classe-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-registre-financier-classe-paiements.integration.spec.ts)

### Etat technique

- le backend expose maintenant le registre par classe avec colonnes mensuelles, tranches Etat, inscription et statistiques par colonne
- les montants attendus sont calcules sur la partie reellement exigible apres exoneration
- `AG`, `FN`, `PC`, `EX`, `EX50`, `AB`, `TR`, `DC` sont portes lorsqu'ils sont materialisables par les donnees backend actuelles
- `AG` est porte par une qualification financiere eleve autonome `ENFANT_AGENT`, distincte des exonerations comme `ENFANT_PROMOTEUR`
- la qualification `ENFANT_AGENT` peut maintenant etre activee, desactivee et relue via un workflow backend dedie, sans detour par les exonerations

## Source backend VF-02

`VF-02`

Consulter la synthese financiere d'une classe

### Intention metier

Exposer une vraie source backend de synthese mensuelle par classe, derivee du moteur `VF-01`, pour eviter tout recalcul frontend divergent.

### Route backend reelle

- `GET /api/rapports-financiers/synthese-classe`

### Doctrine de securite appliquee

- identique a `VF-01`
- permission `paiements.read`
- `CAISSIER`, `ADMINISTRATEUR_ECOLE` : meme ecole
- `GESTIONNAIRE_ORGANISATION`, `PROMOTEUR_ORGANISATION` : meme organisation
- `TITULAIRE` : meme classe titulaire + meme annee scolaire
- `PREFET_ETUDES`, `DIRECTEUR_ETUDES`, `DIRECTEUR_PRIMAIRE`, `DIRECTEUR_MATERNELLE` : meme section reelle seulement si l'ecole a active la delegation pedagogique

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [ConsulterRapportFinancierController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/ConsulterRapportFinancierController.ts)
- use case : [ConsulterSyntheseFinanciereClasseUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/rapports/ConsulterSyntheseFinanciereClasseUseCase.ts)
- repository de lecture : [SyntheseFinanciereClasseQueryRepository.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/queries/SyntheseFinanciereClasseQueryRepository.ts)
- source amont : [RegistreFinancierClasseQueryRepository.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/queries/RegistreFinancierClasseQueryRepository.ts)
- autorisation locale reutilisee : [AutorisationRegistreFinancierClasseAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationRegistreFinancierClasseAdapter.ts)
- tests :
  - [ConsulterSyntheseFinanciereClasseUseCase.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/ConsulterSyntheseFinanciereClasseUseCase.spec.ts)
  - [SyntheseFinanciereClasseQueryRepository.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/infrastructure/queries/SyntheseFinanciereClasseQueryRepository.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)

### Etat technique

- `VF-02` est maintenant branche sur une vraie route backend
- la synthese mensuelle derive du registre officiel `VF-01`
- les statuts `AG`, `EX`, `EX50`, `FN`, `PC`, `AB`, `TR`, `DC` restent portes par le meme moteur source

## Source backend VF-03

`VF-03`

Consulter la synthese financiere d'une section

### Intention metier

Comparer les classes d'une section a partir d'une vraie projection backend, heritee de `VF-02` puis de `VF-01`, sans calcul parallele dans le frontend.

### Route backend reelle

- `GET /api/rapports-financiers/synthese-section`

### Doctrine de securite appliquee

- permission `paiements.read`
- `CAISSIER`, `ADMINISTRATEUR_ECOLE` : meme ecole
- `GESTIONNAIRE_ORGANISATION`, `PROMOTEUR_ORGANISATION` : meme organisation
- `PREFET_ETUDES` : meme section secondaire seulement
- `DIRECTEUR_PRIMAIRE` : meme section primaire seulement
- `DIRECTEUR_MATERNELLE` : meme section maternelle seulement

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [ConsulterRapportFinancierController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/ConsulterRapportFinancierController.ts)
- use case : [ConsulterSyntheseFinanciereSectionUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/rapports/ConsulterSyntheseFinanciereSectionUseCase.ts)
- repository de lecture : [SyntheseFinanciereSectionQueryRepository.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/queries/SyntheseFinanciereSectionQueryRepository.ts)
- source amont : [SyntheseFinanciereClasseQueryRepository.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/queries/SyntheseFinanciereClasseQueryRepository.ts)
- autorisation locale : [AutorisationSyntheseFinanciereSectionAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationSyntheseFinanciereSectionAdapter.ts)
- tests :
  - [ConsulterSyntheseFinanciereSectionUseCase.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/ConsulterSyntheseFinanciereSectionUseCase.spec.ts)
  - [SyntheseFinanciereSectionQueryRepository.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/infrastructure/queries/SyntheseFinanciereSectionQueryRepository.spec.ts)
  - [security-synthese-financiere-section-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-synthese-financiere-section-paiements.integration.spec.ts)

### Etat technique

- `VF-03` est maintenant branche sur une vraie route backend
- la synthese sectionnelle consolide les classes d'une section reelle
- le detail reste ouvrable vers `VF-02` puis `VF-01`

## Source backend VF-04

`VF-04`

Consulter la synthese financiere d'une ecole

### Intention metier

Comparer les sections d'une ecole a partir d'une vraie projection backend, heritee de `VF-03`, `VF-02` puis `VF-01`, sans recalcul parallele dans le frontend.

### Route backend reelle

- `GET /api/rapports-financiers/synthese-ecole`

### Doctrine de securite appliquee

- permission `paiements.read`
- `CAISSIER`, `ADMINISTRATEUR_ECOLE` : meme ecole
- `GESTIONNAIRE_ORGANISATION`, `PROMOTEUR_ORGANISATION` : meme organisation

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [ConsulterRapportFinancierController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/ConsulterRapportFinancierController.ts)
- use case : [ConsulterSyntheseFinanciereEcoleUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/rapports/ConsulterSyntheseFinanciereEcoleUseCase.ts)
- repository de lecture : [SyntheseFinanciereEcoleQueryRepository.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/queries/SyntheseFinanciereEcoleQueryRepository.ts)

### Preuves de tests

- use case : [ConsulterSyntheseFinanciereEcoleUseCase.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/ConsulterSyntheseFinanciereEcoleUseCase.spec.ts)
- repository : [SyntheseFinanciereEcoleQueryRepository.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/infrastructure/queries/SyntheseFinanciereEcoleQueryRepository.spec.ts)
- routes HTTP : [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
- activation produit : [activated-product-routes.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/tests/integration/activated-product-routes.test.ts)

### Verdict technique

- `VF-04` est maintenant branche sur une vraie route backend
- la synthese ecole consolide les sections reelles de l ecole
- le detail reste ouvrable vers `VF-03`, puis `VF-02`, puis `VF-01`

## Source backend VF-05

`VF-05`

Consulter la synthese financiere d'une organisation

### Intention metier

Comparer les ecoles d'une organisation a partir d'une vraie projection backend, heritee de `VF-04`, `VF-03`, `VF-02` puis `VF-01`, sans recalcul parallele dans le frontend.

### Route backend reelle

- `GET /api/rapports-financiers/synthese-organisation`

### Doctrine de securite appliquee

- permission `paiements.read`
- `GESTIONNAIRE_ORGANISATION`, `PROMOTEUR_ORGANISATION` : meme organisation uniquement
- aucun acteur ecole n est promu implicitement lecteur organisationnel

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [ConsulterRapportFinancierController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/ConsulterRapportFinancierController.ts)
- use case : [ConsulterSyntheseFinanciereOrganisationUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/rapports/ConsulterSyntheseFinanciereOrganisationUseCase.ts)
- repository de lecture : [SyntheseFinanciereOrganisationQueryRepository.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/queries/SyntheseFinanciereOrganisationQueryRepository.ts)
- autorisation : [AutorisationRapportFinancierAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationRapportFinancierAdapter.ts)

### Preuves de tests

- use case : [ConsulterSyntheseFinanciereOrganisationUseCase.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/ConsulterSyntheseFinanciereOrganisationUseCase.spec.ts)
- repository : [SyntheseFinanciereOrganisationQueryRepository.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/infrastructure/queries/SyntheseFinanciereOrganisationQueryRepository.spec.ts)
- routes HTTP : [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
- activation produit : [activated-product-routes.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/tests/integration/activated-product-routes.test.ts)

### Verdict technique

- `VF-05` est maintenant branche sur une vraie route backend
- la synthese organisation consolide les ecoles reelles de l organisation
- le detail reste ouvrable vers `VF-04`, puis `VF-03`, puis `VF-02`, puis `VF-01`

`PF-14`

Consulter les fonds anticipes

### Intention metier

Permettre la consultation analytique des fonds anticipes dans le bon perimetre `organisation + ecole`, avec la meme doctrine d'acteurs que `PF-13` et une reduction pedagogique effective des donnees aux eleves visibles du perimetre delegue.

### Acteurs reels

- `CAISSIER`
- `ADMINISTRATEUR_ECOLE`
- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`

### Acteurs pedagogiques delegables

- `TITULAIRE`
- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`

### Permissions effectives requises

- `paiements.read`

### Perimetre reel applique

- `CAISSIER` : meme ecole
- `ADMINISTRATEUR_ECOLE` : meme ecole
- `GESTIONNAIRE_ORGANISATION` : meme organisation
- `PROMOTEUR_ORGANISATION` : meme organisation
- `TITULAIRE` : sa classe titulaire effective
- responsables pedagogiques de section : leur section reelle

### Doctrine locale supplementaire

- les acteurs pedagogiques ne lisent ce workflow que si l'ecole les autorise explicitement
- la lecture pedagogique filtre les paiements sur les eleves visibles du perimetre delegue
- le total expose est reconstruit depuis les repartitions `ANTICIPE` et `LISSAGE`, et non depuis un cumul de caisse non sectionnable

### Route backend reelle

- `GET /api/rapports-financiers/fonds-anticipes`

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [ConsulterRapportFinancierController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/ConsulterRapportFinancierController.ts)
- use case : [ConsulterFondsAnticipesUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/rapports/ConsulterFondsAnticipesUseCase.ts)
- repository de lecture : [FondsAnticipesQueryRepository.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/queries/FondsAnticipesQueryRepository.ts)
- autorisation locale : [AutorisationPaiementsParTypeFraisAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationPaiementsParTypeFraisAdapter.ts)
- tests :
  - [ConsulterFondsAnticipesUseCase.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/ConsulterFondsAnticipesUseCase.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [security-fonds-anticipes-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-fonds-anticipes-paiements-facturation.integration.spec.ts)

### Verdict d'ouverture

`PF-14 OUVRABLE`

### Statut de figement

`PF-14 FIGE`

Justification technique :

- le workflow est maintenant expose par une route backend dediee
- un vrai use case applicatif est maintenant branche
- la doctrine `permission + perimetre` est appliquee pour les acteurs financiers globaux et les delegations pedagogiques
- la lecture pedagogique est reellement filtrable car elle est calculee sur les repartitions anticipees liees aux eleves
- les routes privilegient l'utilisateur authentifie du contexte
- le `typecheck` backend est vert
- les tests cibles du use case, de la route, du produit et de la securite locale sont verts

## Workflow PF-15

`PF-15`

Consulter les arrieres d'un eleve

### Intention metier

Permettre la consultation ciblee des arrieres d'un eleve dans le bon perimetre `organisation + ecole`, avec les memes acteurs que `PF-14` et la meme doctrine de delegation pedagogique explicite.

### Acteurs reels

- `CAISSIER`
- `ADMINISTRATEUR_ECOLE`
- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`

### Acteurs pedagogiques delegables

- `TITULAIRE`
- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`

### Permissions effectives requises

- `paiements.read`

### Perimetre reel applique

- `CAISSIER` : meme ecole
- `ADMINISTRATEUR_ECOLE` : meme ecole
- `GESTIONNAIRE_ORGANISATION` : meme organisation
- `PROMOTEUR_ORGANISATION` : meme organisation
- `TITULAIRE` : sa classe titulaire effective
- responsables pedagogiques de section : leur section reelle

### Doctrine locale supplementaire

- les acteurs pedagogiques ne lisent ce workflow que si l'ecole les autorise explicitement
- la lecture pedagogique reste bornee a l'eleve effectivement visible dans leur perimetre
- la lecture reverifie maintenant `idEcole + idEleve` jusqu'au repository d'arrieres

### Route backend reelle

- `GET /api/eleves/:idEleve/arrieres`

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [ConsulterArrieresEleveController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/ConsulterArrieresEleveController.ts)
- use case : [ConsulterArrieresEleveUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/dettes/ConsulterArrieresEleveUseCase.ts)
- repository de lecture : [ArrieresEleveQueryRepository.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/queries/ArrieresEleveQueryRepository.ts)
- autorisation locale : [AutorisationSituationFinanciereEleveAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationSituationFinanciereEleveAdapter.ts)
- tests :
  - [ConsulterArrieresEleveUseCase.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/ConsulterArrieresEleveUseCase.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [security-arrieres-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-arrieres-paiements-facturation.integration.spec.ts)

### Verdict d'ouverture

`PF-15 OUVRABLE`

### Statut de figement

`PF-15 FIGE`

Justification technique :

- le workflow est maintenant expose par une route backend dediee
- un vrai use case applicatif est maintenant branche
- la doctrine `permission + perimetre` est reappliquee avec les memes acteurs que `PF-14`
- la lecture reverifie l'appartenance `organisation + ecole` de l'eleve puis relit les arrieres dans la meme ecole
- les routes privilegient l'utilisateur authentifie du contexte
- le `typecheck` backend est vert
- les tests cibles du use case, de la route, du produit et de la securite locale sont verts

## Workflow PF-16

`PF-16`

Configurer les parametres de paiement de l'ecole

### Intention metier

Permettre la consultation et la configuration des parametres actifs de paiement dans le bon perimetre `organisation + ecole`, avec un acteur systeme d'ecole explicite et sans ouvrir implicitement ce workflow a l'administration metier d'ecole.

### Acteur reel

- `ADMIN_SYSTEME_ECOLE`

### Permissions effectives requises

- role actif `ADMIN_SYSTEME_ECOLE`

Lecture officielle :

- le backend ne suppose pas qu'une permission brute suffit a elle seule pour ouvrir ce workflow
- il reapplique un filtre local d'acteur reel
- `ADMINISTRATEUR_ECOLE` ne devient donc pas configureur implicite des parametres de paiement

### Perimetre reel applique

- meme organisation
- meme ecole

### Routes backend reelles

- `GET /api/paiements/parametres`
- `PUT /api/paiements/parametres`

### Cas d'utilisation utilises

- `ConsulterParametresPaiementEcoleUseCase`
- `ConfigurerParametresPaiementEcoleUseCase`

### Donnees principales couvertes

- modes de paiement autorises
- politique d'arrieres
- autorisation du paiement partiel
- regles locales d'inscription avec dette
- regles de retrait de documents
- options de delegation de consultation d'historique selon la politique de l'ecole

### Contraintes backend

- le contexte authentifie reste prioritaire sur les headers bruts
- le role actif transporte par la requete est maintenant relu jusqu'au cas d'usage
- la lecture et l'ecriture sont toutes deux reservees a `ADMIN_SYSTEME_ECOLE`
- le workflow ne remplace pas les permissions existantes : il ajoute un filtre local d'acteur et de perimetre

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [ParametresPaiementController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/ParametresPaiementController.ts)
- validateur : [ParametresPaiementValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/validators/ParametresPaiementValidator.ts)
- use cases :
  - [ConfigurerParametresPaiementEcoleUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/parametres/ConfigurerParametresPaiementEcoleUseCase.ts)
  - [ConsulterParametresPaiementEcoleUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/parametres/ConsulterParametresPaiementEcoleUseCase.ts)
- tests :
  - [ParametresPaiementEcoleUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/ParametresPaiementEcoleUseCases.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [activated-product-routes.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/tests/integration/activated-product-routes.test.ts)

### Verdict d'ouverture

`PF-16 OUVRABLE`

### Statut de figement

`PF-16 FIGE`

Justification technique :

- le workflow est maintenant expose par deux routes backend reelles
- la lecture et la configuration sont branchees jusqu'a la composition applicative
- le backend filtre maintenant l'acteur reel `ADMIN_SYSTEME_ECOLE` au niveau des cas d'usage
- le perimetre `organisation + ecole` continue d'etre transporte par le contexte tenant
- les tests cibles couvrent le use case, la propagation du role actif et l'exposition produit

## Workflow PF-17

`PF-17`

Gerer la tarification

### Intention metier

Permettre a l'`ADMIN_SYSTEME_ECOLE` de consulter, creer, modifier et desactiver les grilles de tarification de son ecole pour une annee scolaire donnee, avec filtrage local d'acteur, perimetre `organisation + ecole` et prise en compte reelle des criteres pedagogiques lors de la generation des obligations.

### Acteur reel

- `ADMIN_SYSTEME_ECOLE`

### Permissions effectives requises

- role actif `ADMIN_SYSTEME_ECOLE`

Lecture officielle :

- le backend ne deduit pas ce workflow depuis une permission brute generique
- il reapplique un filtre local d'acteur reel au niveau des cas d'usage
- `ADMINISTRATEUR_ECOLE` ne devient donc pas gestionnaire implicite des grilles de tarification

### Perimetre reel applique

- meme organisation
- meme ecole
- meme annee scolaire

### Routes backend reelles

- `GET /api/tarification/grilles`
- `POST /api/tarification/grilles`
- `PUT /api/tarification/grilles/:idGrilleTarification`
- `POST /api/tarification/grilles/:idGrilleTarification/desactivation`

### Cas d'utilisation utilises

- `ListerGrillesTarificationUseCase`
- `CreerGrilleTarificationUseCase`
- `ModifierGrilleTarificationUseCase`
- `DesactiverGrilleTarificationUseCase`

### Donnees principales couvertes

- type de frais
- libelle
- montant
- section
- categorie frais Etat
- categorie technique
- indicateurs `TENASOSP`, `EXETAT`, `finaliste`
- mois scolaire
- tranche des frais Etat
- caractere obligatoire
- dates de validite
- statut actif

### Doctrine metier appliquee

- la lecture et la mutation des grilles sont maintenant bornees a `organisation + ecole`
- la modification et la desactivation ne relisent plus une grille par identifiant seul
- la generation des obligations ne consomme plus indistinctement toutes les grilles actives :
  - elle filtre maintenant les grilles selon les regles reelles de la classe
  - section
  - categorie technique
  - categorie frais Etat
  - marqueurs `TENASOSP`, `EXETAT`, `finaliste`

### Contraintes backend

- le contexte authentifie reste prioritaire sur les headers bruts
- le role actif transporte par la requete est maintenant relu jusqu'aux cas d'usage de tarification
- les projections de sortie exposent maintenant les criteres riches de la grille
- le workflow ne remplace aucune permission existante : il ajoute un filtre local d'acteur et de perimetre

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [TarificationController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/TarificationController.ts)
- validateur : [TarificationValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/validators/TarificationValidator.ts)
- use cases :
  - [CreerGrilleTarificationUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/tarification/CreerGrilleTarificationUseCase.ts)
  - [ListerGrillesTarificationUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/tarification/ListerGrillesTarificationUseCase.ts)
  - [ModifierGrilleTarificationUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/tarification/ModifierGrilleTarificationUseCase.ts)
  - [DesactiverGrilleTarificationUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/tarification/DesactiverGrilleTarificationUseCase.ts)
- dependance metier aval :
  - [GenererObligationsEleveUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/obligations/GenererObligationsEleveUseCase.ts)
- tests :
  - [TarificationUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/TarificationUseCases.spec.ts)
  - [GenererObligationsEleveUseCase.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/GenererObligationsEleveUseCase.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [activated-product-routes.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/tests/integration/activated-product-routes.test.ts)

### Verdict d'ouverture

`PF-17 OUVRABLE`

### Statut de figement

`PF-17 FIGE`

Justification technique :

- les routes backend reelles sont maintenant exposees et composees
- le backend filtre maintenant l'acteur reel `ADMIN_SYSTEME_ECOLE`
- le perimetre `organisation + ecole + annee scolaire` est porte jusqu'aux cas d'usage
- la relire par identifiant seul a ete supprimee pour la mutation des grilles
- la projection expose maintenant les criteres riches utiles au frontend
- la generation des obligations applique maintenant les criteres reels des grilles a la classe
- le `typecheck` backend est vert
- les tests cibles use case, route et produit sont verts

## Workflow PF-18

### Identifiant

`PF-18`

### Nom

Gerer les exonerations

### Categorie

`Financier`

### Objectif metier

Permettre d'accorder puis d'annuler une exoneration sur une obligation financiere d'eleve, avec verification de l'acteur reel, du perimetre `organisation + ecole`, d'une delegation locale optionnelle pour `SECRETAIRE`, et restauration correcte de l'obligation quand une exoneration est annulee.

### Acteur principal

`ADMINISTRATEUR_ECOLE`

### Acteurs secondaires

- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`
- `SECRETAIRE`

Lecture officielle :

- `ADMINISTRATEUR_ECOLE` reste l'acteur local naturel de PF-18
- `GESTIONNAIRE_ORGANISATION` et `PROMOTEUR_ORGANISATION` sont autorises dans la portee de leur organisation
- `SECRETAIRE` n'obtient jamais un pouvoir global d'exoneration
- `SECRETAIRE` devient acteur positif seulement si l'ecole l'autorise explicitement par `exonerationDeleguee`

### Preconditions

- le contexte actif doit porter la bonne organisation et la bonne ecole
- l'utilisateur authentifie doit etre resolu dans le contexte de requete
- l'obligation cible doit appartenir au meme `idEcole` et au meme `idEleve`
- une exoneration a annuler doit appartenir a cette meme ecole
- pour `SECRETAIRE`, un parametrage actif de l'ecole doit autoriser explicitement `exonerationDeleguee = ['SECRETAIRE']`

### Permissions effectives requises

- `paiements.write` pour `ADMINISTRATEUR_ECOLE`
- `paiements.read` + portee organisationnelle pour :
  - `GESTIONNAIRE_ORGANISATION`
  - `PROMOTEUR_ORGANISATION`
- `paiements.read` + parametrage local d'ecole pour `SECRETAIRE`

Lecture officielle :

- PF-18 ne supprime aucune permission existante
- PF-18 ajoute un filtre local de gestion d'exoneration
- la lecture correcte devient donc `permission + organisation + ecole + parametrage local si secretaire`

### Routes backend

- `POST /api/exonerations`
- `POST /api/exonerations/:idExoneration/annulation`

### Cas d'utilisation utilises

- `AccorderExonerationUseCase`
- `AnnulerExonerationUseCase`

### Deroulement principal

1. Le frontend envoie une demande d'exoneration.
2. Le backend relit l'utilisateur authentifie dans le contexte de requete.
3. Le backend reapplique l'autorisation locale PF-18.
4. Le backend recharge l'obligation cible et reverifie `idEcole + idEleve`.
5. Le backend applique l'exoneration sur l'obligation.
6. Le backend persiste l'obligation et l'exoneration.
7. En cas d'annulation, le backend recharge l'exoneration puis l'obligation associee.
8. Le backend retire le montant exonere de l'obligation avant de marquer l'exoneration `ANNULEE`.
9. Le backend persiste a nouveau l'obligation restauree et l'exoneration annulee.

### Resultat attendu

- une exoneration accordee reste bornee au bon perimetre
- une exoneration annulee restaure correctement `montantExonere` et `solde` de l'obligation
- la delegation `SECRETAIRE` reste purement locale et optionnelle

### Sources backend

- routes HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [ExonerationController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/ExonerationController.ts)
- validateur : [ExonerationValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/validators/ExonerationValidator.ts)
- use cases :
  - [AccorderExonerationUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/exonerations/AccorderExonerationUseCase.ts)
  - [AnnulerExonerationUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/exonerations/AnnulerExonerationUseCase.ts)
- autorisation locale : [AutorisationExonerationAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationExonerationAdapter.ts)
- migration de parametrage : [Migration_017_AddExonerationDelegueeParametresPaiement.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/migrations/Migration_017_AddExonerationDelegueeParametresPaiement.ts)
- tests :
  - [ExonerationUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/ExonerationUseCases.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [security-exonerations-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-exonerations-paiements-facturation.integration.spec.ts)

### Verdict d'ouverture

`PF-18 OUVRABLE`

### Statut de figement

`PF-18 FIGE`

## Workflow PF-19

### Identifiant

`PF-19`

### Nom

Consulter et rechercher les recus

### Categorie

`Financier`

### Niveau de criticite

`Important`

### Objectif metier

Permettre au `CAISSIER` de relire les recus emis dans sa propre ecole avec des filtres de recherche simples, sans transformer cette lecture en capacite generique pour les autres acteurs.

### Acteur principal

`CAISSIER`

### Preconditions

- le contexte actif doit porter la bonne organisation et la bonne ecole
- l'utilisateur authentifie doit etre resolu dans le contexte de requete
- l'acteur doit etre un `CAISSIER` actif de l'ecole courante
- la permission `paiements.read` doit etre effective

### Permissions effectives requises

- `paiements.read`
- role actif `CAISSIER`
- perimetre `organisation + ecole`

Lecture officielle :

- `PF-19` ne repose pas sur `permission + ecole` seulement
- `PF-19` reapplique `permission + role reel + organisation + ecole`
- `ADMINISTRATEUR_ECOLE` ne devient pas lecteur des recus par simple heritage de permission

### Routes backend

- `GET /api/recus`

### Cas d'utilisation utilises

- `ConsulterRecusPaiementUseCase`

### Filtres reels exposes

- `idEleve`
- `numeroRecu`
- `dateDebut`
- `dateFin`

### Resultat attendu

Le workflow retourne une liste de recus officiels avec :

- `idRecu`
- `numeroRecu`
- `idPaiement`
- `idEleve`
- `idCaissier`
- `dateEmission`
- `heureEmission`
- `modePaiement`
- `totalPaye`
- `statutRecu`

### Sources backend

- route HTTP : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes.ts)
- composition : [paiements-facturation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/paiements-facturation.routes.ts)
- controleur : [ConsulterRecusPaiementController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/ConsulterRecusPaiementController.ts)
- validateur : [RecusPaiementValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/validators/RecusPaiementValidator.ts)
- use case : [ConsulterRecusPaiementUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/recus/ConsulterRecusPaiementUseCase.ts)
- query repository : [RecusPaiementQueryRepository.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/queries/RecusPaiementQueryRepository.ts)
- autorisation locale : [AutorisationConsultationRecusAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationConsultationRecusAdapter.ts)
- tests :
  - [ConsulterRecusPaiementUseCase.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/ConsulterRecusPaiementUseCase.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [security-consultation-recus-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-consultation-recus-paiements-facturation.integration.spec.ts)
  - [activated-product-routes.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/tests/integration/activated-product-routes.test.ts)

### Verdict d'ouverture

`PF-19 OUVRABLE`

### Statut de figement

`PF-19 FIGE`
