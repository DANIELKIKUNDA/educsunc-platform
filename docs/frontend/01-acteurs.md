# Phase 1 - Acteurs Frontend EduSync

## Statut

Ce document fixe la reference officielle des acteurs frontend a partir du backend EduSync.

Il ne propose aucun nouvel acteur.

Il ne repose sur aucune hypothese frontend libre.

Il decrit uniquement :

- les acteurs attestes
- les acteurs officiellement presents
- leur origine
- leur niveau
- la distinction role / acteur derive
- la doctrine officielle du titulariat

## Sources Backend Utilisees

Les acteurs sont etablis a partir des sources suivantes :

- roles securite officiels : [CodeRole.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/value-objects/CodeRole.ts)
- role securite comme agregat officiel : [Role.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/aggregates/Role.ts)
- affectations utilisateur : [AffectationUtilisateur.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/aggregates/AffectationUtilisateur.ts)
- contexte actif : [ContexteActifUtilisateur.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/aggregates/ContexteActifUtilisateur.ts)
- titulariat explicite : [AffectationTitulariat.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/aggregates/AffectationTitulariat.ts)
- responsabilite de classe pedagogique : [ResponsabiliteClassePedagogique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/ResponsabiliteClassePedagogique.ts)
- titulariat effectif par section : [PolicyTitulariatEffectifParSection.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/policies/PolicyTitulariatEffectifParSection.ts)
- calcul central des capacites effectives : [SecurityCapacitesEffectivesService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/application/services/SecurityCapacitesEffectivesService.ts)
- modele de lecture des capacites effectives : [CapacitesEffectivesReadModel.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/application/read-models/CapacitesEffectivesReadModel.ts)
- fixtures et preuves d'acteurs : [GlobalFixtures.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/fixtures/GlobalFixtures.ts)

## Definitions

### Role Securite

Un role securite est un code officiel reconnu par le backend `shared/security`.

Un role securite :

- est valide au sens du domaine `security`
- peut porter permissions et restrictions
- peut etre affecte a un utilisateur

### Acteur

Un acteur est une figure reellement exercee par le systeme du point de vue de l'experience.

Un acteur peut provenir :

- directement d'un role securite
- d'une affectation metier derivee
- d'une combinaison role + affectation + contexte + policy metier

### Acteur Metier Derive

Un acteur metier derive est un acteur qui n'est pas un role securite autonome, mais une position fonctionnelle obtenue par une regle metier ou une affectation.

Le cas officiel majeur dans EduSync est :

- `TITULAIRE`

## Niveaux Retenus

Les niveaux de lecture frontend des acteurs sont :

- `Plateforme`
- `Organisation`
- `Ecole`
- `Pedagogique`
- `Externe`

## Acteurs Attestes

Les acteurs suivants sont attestes a la fois :

- par leur existence formelle
- par leur exercice ou leur materialisation explicite dans le backend

### 1. `MANAGER_SYSTEME`

- origine : role securite
- niveau : `Plateforme`

### 2. `PROMOTEUR_ORGANISATION`

- origine : role securite
- niveau : `Organisation`

### 3. `ADMINISTRATEUR_ECOLE`

- origine : role securite
- niveau : `Ecole`

### 4. `ADMIN_SYSTEME_ECOLE`

- origine : role securite
- niveau : `Ecole`

### 5. `CAISSIER`

- origine : role securite
- niveau : `Ecole`

### 6. `ENSEIGNANT`

- origine : role securite
- niveau : `Pedagogique`

### 7. `PREFET_ETUDES`

- origine : role securite
- niveau : `Pedagogique`

### 8. `DIRECTEUR_ETUDES`

- origine : role securite
- niveau : `Pedagogique`

### 9. `DIRECTEUR_DISCIPLINE`

- origine : role securite
- niveau : `Pedagogique`

### 10. `PARENT`

- origine : role securite
- niveau : `Externe`

### 11. `TITULAIRE`

- origine : acteur metier derive
- role support : `ENSEIGNANT`
- niveau : `Pedagogique`

## Acteurs Officiels Presents

Les acteurs suivants existent officiellement dans le backend comme roles securite, mais sans le meme niveau de preuve d'exercice detaille dans les sources de phase 1 :

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`
- `ADMIN_SYSTEME_ORGANISATION`
- `GESTIONNAIRE_ORGANISATION`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`
- `COMPTABLE`

Ils sont donc consideres comme acteurs officiels presents.

## Origine des Acteurs

### Acteurs Portes Directement Par un Role Securite

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`
- `PROMOTEUR_ORGANISATION`
- `ADMIN_SYSTEME_ORGANISATION`
- `GESTIONNAIRE_ORGANISATION`
- `ADMINISTRATEUR_ECOLE`
- `ADMIN_SYSTEME_ECOLE`
- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_DISCIPLINE`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`
- `ENSEIGNANT`
- `CAISSIER`
- `COMPTABLE`
- `PARENT`

### Acteur Porte Par une Derivation Metier

- `TITULAIRE`

## Doctrine Officielle du Titulariat

Le frontend doit desormais utiliser la doctrine backend suivante.

### Regle de Base

- `ENSEIGNANT` est le seul role pedagogique de base
- `TITULAIRE` n'est pas un role securite autonome
- `TITULAIRE` est un acteur metier effectif derive

### Derivation Officielle

#### Maternelle

- `ENSEIGNANT responsable de classe`
- = `TITULAIRE` effectif

La source de verite primaire est la responsabilite de classe pedagogique.

#### Primaire

- `ENSEIGNANT responsable de classe`
- = `TITULAIRE` effectif

La source de verite primaire est la responsabilite de classe pedagogique.

#### Secondaire

- `ENSEIGNANT responsable de classe`
- + `AffectationTitulariat` active et scoped
- = `TITULAIRE` effectif

La source de verite pedagogique primaire est la responsabilite de classe pedagogique.

La source de verite d'activation du titulariat reste l'affectation de titulariat explicite.

### Consequence Frontend

Le frontend doit traiter `TITULAIRE` comme un acteur reel d'experience.

Mais il ne doit jamais le modeliser comme :

- un code role brut
- un role securite additionnel
- une branche autonome de role dans `auth`

Le frontend peut raisonner en termes de `TITULAIRE` pour :

- la lecture des usages
- la lecture des permissions effectives
- la lecture des parcours

Le frontend ne doit pas en faire un role brut autonome.

## Rapport Entre Role et Acteur

Le backend montre clairement que :

- un role securite peut devenir directement un acteur
- un acteur peut aussi resulter d'une combinaison :
  - role
  - affectation
  - contexte
  - portee
  - policy metier

Le frontend devra donc respecter cette distinction.

Il ne devra pas reduire tous les acteurs a de simples roles bruts.

## Rapport Entre Acteur et Contexte Actif

Le backend impose deja que l'acteur reel soit toujours lie a :

- un contexte actif coherent
- une organisation active eventuelle
- une ecole active eventuelle
- une affectation valide
- une portee reelle

Autrement dit :

- un acteur n'est pas juste une identite
- un acteur est une identite situee

Cette idee est fondamentale pour le frontend.

## Regle Frontend Officielle sur `TITULAIRE`

Le frontend ne doit pas essayer de recomposer seul :

- qu'un enseignant primaire serait titulaire
- qu'un enseignant maternelle serait titulaire
- qu'un enseignant secondaire serait titulaire

Le frontend doit consommer :

- les permissions effectives
- les capacites effectives
- et, si le contrat backend les expose, les indicateurs de titulariat effectif

## Consequences Pour les Phases Futures

Le document acteurs doit servir de base a :

- la navigation par acteur
- la lecture des dashboards
- la lecture des permissions UI
- la lecture des workflows
- la lecture des cas d'usage

Dans toutes ces phases :

- `ENSEIGNANT` reste le role pedagogique de base
- `TITULAIRE` reste un acteur derive

## Conclusion

La phase 1 - acteurs est figee comme suit :

- les roles securite officiels sont ceux definis dans `CodeRole`
- les acteurs reels du systeme ne se limitent pas aux roles
- `TITULAIRE` est confirme comme acteur metier derive
- la derivation de `TITULAIRE` depend du niveau d'enseignement
- le frontend devra traiter separement :
  - les roles bruts
  - les acteurs reels
  - les affectations ou responsabilites derivees
  - le contexte actif
