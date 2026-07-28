# Phase 21 - Contrats D'Ecran

## Statut

Ce document fixe la doctrine officielle des contrats d'ecran frontend d'EduSync.

Il intervient apres :

- les workflows reels
- la navigation frontend
- la navigation par acteur
- la navigation par module
- les pages et routes frontend
- les vues frontend
- les composants UI

Il intervient avant :

- l'implementation concrete des ecrans
- les specifications fines de developpement frontend
- les jeux de donnees d'interface definitifs
- la recette fonctionnelle ecran par ecran

Ce document ne detaille pas encore tous les ecrans un a un.

Il fixe seulement :

- la definition officielle d'un contrat d'ecran
- les sections obligatoires d'un contrat d'ecran
- les regles de derivation depuis pages, vues et composants
- les regles de robustesse et de verification

## Sources De Verite

Cette phase s'appuie exclusivement sur :

- [00-doctrine-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/00-doctrine-frontend.md)
- [14-cartographie-finale-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/14-cartographie-finale-workflows.md)
- [15-navigation-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/15-navigation-frontend.md)
- [16-navigation-par-acteur.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/16-navigation-par-acteur.md)
- [17-navigation-par-module.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/17-navigation-par-module.md)
- [18-pages-et-routes-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/18-pages-et-routes-frontend.md)
- [19-vues-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/19-vues-frontend.md)
- [20-composants-ui.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/20-composants-ui.md)

Le backend reste la source ultime de verite metier.

## Definition Officielle D'un Contrat D'Ecran

Un contrat d'ecran EduSync est la specification fonctionnelle et structurelle minimale qui definit ce qu'un ecran doit afficher, permettre, refuser et verifier pour rester coherent avec les workflows reels et la doctrine de securite.

Un contrat d'ecran :

- n'est pas une maquette visuelle
- n'est pas un schema technique de composants
- n'est pas une simple liste de champs
- n'est pas une route backend

Un contrat d'ecran est :

- un engagement de comportement
- un cadre de donnees attendues
- un cadre d'actions visibles
- un cadre d'etats obligatoires
- un cadre de contraintes d'autorisation et de perimetre

## Chaine Officielle

La chaine officielle devient :

Workflow reel
-> navigation
-> page
-> vue
-> composants
-> contrat d'ecran

Cette chaine signifie :

- le contrat d'ecran herite d'une page legitime
- le contrat d'ecran ne recree pas un workflow
- le contrat d'ecran fige ce que l'ecran doit garantir

## Role Officiel Du Contrat D'Ecran

Le contrat d'ecran sert a :

- aligner produit, design et developpement
- eviter les ecrans incoherents avec le backend
- garantir les bons etats d'interface
- garantir la bonne projection des permissions et perimetres
- verifier qu'une vue ne promet pas plus que le workflow reel

## Regles Fondatrices

### Regle 1

Un contrat d'ecran doit toujours se rattacher a une page officielle.

### Regle 2

Un contrat d'ecran doit toujours expliciter son objectif metier.

### Regle 3

Un contrat d'ecran doit toujours declarer son acteur principal et ses acteurs secondaires eventuels.

### Regle 4

Un contrat d'ecran doit toujours declarer ses preconditions de visibilite.

### Regle 5

Un contrat d'ecran doit toujours raisonner en `permission + perimetre`.

### Regle 6

Un contrat d'ecran doit distinguer :

- donnees a charger
- donnees a afficher
- actions visibles
- actions interdites

### Regle 7

Un contrat d'ecran doit declarer explicitement ses etats obligatoires.

### Regle 8

Un contrat d'ecran ne doit jamais laisser implicite un contexte actif critique.

### Regle 9

Un contrat d'ecran doit rester stable tant que le workflow reel et les routes backend prouvees ne changent pas.

### Regle 10

Un contrat d'ecran doit pouvoir etre relu sans maquette graphique et rester compréhensible.

## Sections Obligatoires D'Un Contrat D'Ecran

Tout futur contrat d'ecran devra contenir au minimum :

### 1. Identifiant d'ecran

Code stable.

Exemple de forme :

- `SCR-PF-001`
- `SCR-PED-008`

### 2. Page parente

Reference a la page officielle.

### 3. Vue parente

Reference a la vue officielle attendue.

### 4. Module

Module proprietaire.

### 5. Section

Section du module.

### 6. Objectif metier

Finalite fonctionnelle de l'ecran.

### 7. Acteur principal

Acteur qui ouvre l'ecran comme usage normal.

### 8. Acteurs secondaires

Autres acteurs pouvant consommer cet ecran dans des variantes legitimes.

### 9. Preconditions de visibilite

Exemples :

- module actif
- permission effective
- scope compatible
- restriction respectee
- organisation active
- ecole active
- classe concernee
- annee scolaire courante
- delegation locale active

### 10. Donnees attendues

Les donnees minimales que l'ecran doit pouvoir charger.

### 11. Donnees affichees

Les blocs de donnees visibles a l'utilisateur.

### 12. Actions visibles

Les actions que l'utilisateur peut voir et utiliser apres resolution de la projection des capacites effectives.

### 13. Actions masquées ou interdites

Les actions que l'ecran ne doit pas exposer dans certains contextes.

La regle officielle est :

- action interdite : absente
- mutation non autorisee en lecture seule : absente
- action autorisee mais temporairement indisponible pour une condition metier : visible et desactivee avec explication

Le contrat ne doit jamais demander de charger une donnee interdite avant de la masquer.

### 14. Etats obligatoires

Exemples :

- loading
- vide
- erreur
- interdit
- ressource introuvable
- module desactive

### 15. Contraintes de perimetre

Exemples :

- meme ecole
- meme section
- meme classe
- meme annee scolaire
- enfant autorise

### 16. Composants majeurs attendus

Sans encore descendre au niveau technique des props.

### 17. Sources backend

Preuves backend rattachees.

### 18. Notes d'UX

Points de vigilance utiles a l'implementation.

## Les Quatre Blocs Officiels D'Un Ecran

Tout ecran EduSync devra pouvoir etre relu en quatre blocs :

### Bloc 1 - Contexte

Ce que l'utilisateur doit comprendre immediatement :

- ou il est
- dans quel perimetre il agit
- quel objet ou workflow il manipule

### Bloc 2 - Donnees

Ce que l'ecran doit rendre visible comme contenu principal.

### Bloc 3 - Actions

Ce que l'ecran permet vraiment de faire.

### Bloc 4 - Etats

Ce que l'ecran affiche quand la situation n'est pas nominale.

## Contrats D'Ecran Et Types D'Ecrans

Les contrats devront couvrir selon les cas :

- ecrans centre de travail
- ecrans liste
- ecrans detail
- ecrans action
- ecrans analyse
- ecrans dashboard
- ecrans parametrage

Le niveau d'exigence reste le meme pour chacun.

## Contrats D'Ecran Et Perimetres

Les contrats devront declarer clairement les differences de comportement selon le perimetre.

Exemples :

- `TITULAIRE` sur sa classe titulaire seulement
- `PARENT` sur ses enfants autorises seulement
- `PREFET_ETUDES` sur sa section secondaire seulement
- `CAISSIER` sur son ecole seulement
- `PROMOTEUR_ORGANISATION` sur les ecoles de son organisation

## Contrats D'Ecran Et Robustesse

Un contrat d'ecran doit aussi specifier ce qui se passe quand :

- une route est ouverte sans bon contexte
- une ressource n'existe plus
- le module est desactive
- la delegation locale n'est pas active
- les donnees sont partielles
- une action devient interdite entre chargement et affichage

## Contrats D'Ecran Et Tests

Un contrat d'ecran doit pouvoir ensuite alimenter :

- les tests d'interface
- les tests d'acceptation
- les tests de non-regression UX
- les tests de permissions visibles

Il ne remplace pas les tests backend.

Il les prolonge au niveau de l'ecran.

## Ce Que Cette Phase Ne Fait Pas Encore

Cette phase ne fait pas encore :

- le catalogue complet des ecrans
- les maquettes finales
- les composants techniques detailles
- les props et contrats TypeScript exacts
- les specifications responsive

## Verdict

Les contrats d'ecran EduSync doivent maintenant etre lus comme le niveau de formalisation qui verrouille chaque ecran avant implementation concrete.

La suite officielle la plus propre devient :

- cataloguer les ecrans prioritaires par module
- produire les premiers contrats d'ecran reels
- puis seulement ouvrir l'implementation UI ecran par ecran

Le premier lot operationnel est maintenant ouvert dans :

- [22-contrats-ecran-finances.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/22-contrats-ecran-finances.md)
