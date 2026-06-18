# Phase 5 - Workflows Reels Frontend EduSync

## Statut

Ce document fixe le cadre officiel de documentation des workflows reels frontend d'EduSync.

Il ne documente encore aucun workflow reel.

Il fixe uniquement :

- la methode officielle de documentation des workflows reels
- le modele unique obligatoire a utiliser
- les sections obligatoires d'un workflow
- les regles de nommage et de preuve
- l'ordre officiel de documentation des workflows

Ce document doit etre utilise comme gabarit de reference pour toutes les futures documentations de workflows reels.

## Objet du Document

L'objectif de cette phase est de preparer une documentation homogene, stable et exploitable pour tous les workflows reels du projet.

Cette phase ne sert pas a :

- inventer des parcours UI
- definir des ecrans
- definir des menus
- definir la navigation
- produire des maquettes

Cette phase sert a definir comment les workflows reels seront documentes de maniere uniforme et verifiable.

## Sources de Verite

Cette phase s'appuie exclusivement sur les documents frontend deja figes :

- [00-doctrine-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/00-doctrine-frontend.md)
- [01-acteurs.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/01-acteurs.md)
- [02-permissions-effectives.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/02-permissions-effectives.md)
- [03-cas-utilisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/03-cas-utilisation.md)
- [04-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/04-workflows.md)

Et, comme source ultime :

- le backend reel
- les acteurs reels
- les permissions effectives reelles
- les cas d'utilisation attestes
- les contraintes de contexte actif
- les policies metier

Le backend reste la source officielle de verite.

## Regles de Lecture de ce Document

Ce document doit etre lu avec les regles suivantes :

1. Il ne contient encore aucun workflow reel detaille.

2. Il ne decrit pas encore les ecrans.

3. Il ne decrit pas encore les menus.

4. Il ne decrit pas encore la navigation.

5. Il fixe uniquement le cadre documentaire commun a tous les workflows reels.

6. Tout futur workflow reel devra respecter integralement ce document.

## Methode de Documentation des Workflows Reels

La documentation d'un workflow reel devra toujours suivre la logique officielle suivante :

Acteur
-> Permissions effectives
-> Cas d'utilisation
-> Objectif metier
-> Workflow

La methode retenue est strictement descendante et backend-first.

Ordre de construction d'un workflow reel :

1. identifier l'acteur principal
2. identifier les acteurs secondaires eventuels
3. identifier les permissions effectives necessaires
4. identifier les cas d'utilisation attestes mobilises
5. formuler l'objectif metier
6. decrire le deroulement principal
7. decrire les variantes utiles
8. expliciter les contraintes backend
9. expliciter le resultat attendu

Un workflow reel ne doit jamais etre invente depuis l'UI.

## Modele Unique Officiel de Workflow

Tous les workflows reels du projet devront utiliser exactement le meme modele documentaire.

Ce modele unique est obligatoire afin de :

- garder une lecture homogene
- comparer les workflows entre eux
- preparer la future navigation
- preparer les futurs ecrans
- preparer les futurs dashboards
- faciliter la priorisation produit et technique

## Sections Obligatoires d'un Workflow

Chaque workflow reel devra obligatoirement contenir les sections suivantes.

### 1. `Identifiant`

Code stable et unique du workflow.

Exemple de logique attendue :

- `WF-PED-001`
- `WF-SCO-002`
- `WF-FIN-003`

L'identifiant doit rester stable dans le temps.

### 2. `Nom`

Nom metier clair et lisible du workflow.

Le nom doit decrire le parcours, pas un ecran.

### 3. `Categorie`

Valeur obligatoire parmi :

- `Academique`
- `Pedagogique`
- `Scolaire`
- `Financier`
- `Parent`
- `Administration Ecole`
- `Organisation`
- `Plateforme`
- `Transverse`

### 4. `Niveau de criticite`

Valeur obligatoire parmi :

- `Critique`
- `Important`
- `Standard`

Cette section sert a prioriser :

- l'implementation
- les tests
- la stabilisation
- l'experience utilisateur

### 5. `Objectif metier`

Finalite fonctionnelle explicite du workflow.

Le workflow doit toujours repondre a un objectif metier clair.

### 6. `Acteur principal`

Acteur qui porte principalement l'execution du workflow.

### 7. `Acteurs secondaires`

Autres acteurs impliques dans le workflow, si necessaire.

### 8. `Preconditions`

Conditions minimales requises avant execution.

Exemples :

- contexte actif requis
- organisation active
- ecole active
- classe concernee
- annee scolaire concernee
- affectation valide

### 9. `Permissions effectives requises`

Liste des permissions effectivement necessaires.

Cette section doit toujours raisonner en permissions effectives, jamais en role brut seul.

### 10. `Cas d'utilisation utilises`

Liste des cas d'utilisation backend reels mobilises par le workflow.

### 11. `Deroulement principal`

Sequence metier nominale du workflow.

Cette section decrit le parcours principal, sans encore tomber dans la navigation UI.

### 12. `Variantes`

Variantes legitimes du parcours.

Cette section couvre :

- alternatives metier
- branchements reussis
- cas secondaires importants

### 13. `Resultat attendu`

Etat ou sortie metier attendue a la fin du workflow.

### 14. `Contraintes backend`

Contraintes backend reelles qui bornent le workflow.

Exemples :

- policies
- restrictions
- scope
- contexte actif
- validations fortes

### 15. `Evenements importants`

Evenements metier ou points de transition importants, lorsqu'ils existent et sont utiles a la lecture du workflow.

### 16. `Donnees manipulees`

Grandes donnees ou objets metier concernes par le workflow.

Cette section reste metier et ne doit pas devenir une description technique de schema.

### 17. `Sources backend`

References de preuve backend ayant permis de documenter le workflow.

Exemples :

- routes
- tests
- policies
- services d'application
- use cases

### 18. `Notes de lecture frontend`

Points d'attention pour la future traduction UX et UI.

Cette section n'est pas un espace de maquette.

### 19. `Questions ouvertes`

Section optionnelle mais recommandee si un point backend reste non tranche ou non eclaire.

## Regles de Nommage et d'Identification

Les workflows reels devront respecter des regles de nommage coherentes.

### Identifiant

L'identifiant doit :

- etre unique
- etre stable
- porter une categorie reconnaissable

### Nom

Le nom doit :

- etre metier
- etre lisible
- eviter les termes purement techniques
- ne pas ressembler a un nom d'ecran

## Regles de Preuve Backend

Chaque workflow reel devra toujours reposer sur des preuves backend explicites.

Sources de preuve attendues :

- routes protegees
- tests d'integration
- tests e2e
- workflows backend existants
- policies
- use cases
- services d'application

Aucun workflow reel ne pourra etre documente sur la seule base :

- d'une intuition produit
- d'une habitude utilisateur supposee
- d'une idee d'interface

## Ordre Officiel de Documentation des Workflows

L'ordre officiel de documentation des workflows reels est le suivant :

1. workflows academiques
2. workflows pedagogiques
3. workflows scolaires
4. workflows financiers
5. workflows parent
6. workflows administration ecole
7. workflows organisation
8. workflows plateforme
9. workflows transverses

## Justification de l'Ordre

Cet ordre est retenu parce qu'il :

- respecte la doctrine de [04-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/04-workflows.md)
- traite d'abord les workflows les plus structurants
- facilite ensuite la construction de la navigation
- limite les contradictions dans la future traduction UI

## Regles Pour les Phases Suivantes

Les futures phases devront respecter les regles suivantes :

1. aucun workflow reel ne sera detaille hors du modele unique defini ici
2. aucun ecran ne sera defini avant le workflow reel auquel il appartient
3. aucune navigation ne sera fixee avant la documentation des workflows reels
4. aucun dashboard ne sera decrit hors des objectifs metier qu'il sert
5. aucun parcours UI ne devra contourner les contraintes backend reelles

## Conclusion

La phase 5 - workflows reels est desormais figee comme suit :

- tous les workflows reels seront documentes selon un modele unique obligatoire
- le niveau de criticite fait partie du modele officiel
- les sections obligatoires d'un workflow sont desormais fixees
- l'ordre officiel de documentation des workflows est desormais fixe
- ce document devient le gabarit de reference pour toute la suite du projet frontend
