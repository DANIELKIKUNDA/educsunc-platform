# Phase 20 - Composants UI

## Statut

Ce document fixe la doctrine officielle des composants UI d'EduSync.

Il intervient apres :

- les workflows reels
- la navigation frontend
- la navigation par acteur
- la navigation par module
- les pages et routes frontend
- les vues frontend

Il intervient avant :

- les contrats d'ecran detailles
- la composition fine des pages
- les maquettes d'implementation
- la bibliotheque finale du design system applicatif

Ce document ne dresse pas encore l'inventaire complet de tous les composants finaux.

Il fixe seulement :

- la definition officielle d'un composant UI EduSync
- la place du composant dans la chaine de projection
- les types officiels de composants attendus
- les regles de construction, d'assemblage et de responsabilite
- les limites a ne pas franchir

## Sources De Verite

Cette phase s'appuie exclusivement sur :

- [00-doctrine-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/00-doctrine-frontend.md)
- [15-navigation-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/15-navigation-frontend.md)
- [16-navigation-par-acteur.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/16-navigation-par-acteur.md)
- [17-navigation-par-module.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/17-navigation-par-module.md)
- [18-pages-et-routes-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/18-pages-et-routes-frontend.md)
- [19-vues-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/19-vues-frontend.md)
- [14-cartographie-finale-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/14-cartographie-finale-workflows.md)

Le backend reste la source ultime de verite metier.

## Definition Officielle D'un Composant UI

Un composant UI EduSync est une unite de presentation reutilisable, assemblee pour servir une vue frontend sans redefinir le metier ni la navigation.

Un composant :

- n'est pas un workflow
- n'est pas une page
- n'est pas une vue complete
- n'est pas une source d'autorisation autonome

Un composant est :

- une brique de presentation
- une brique d'interaction locale
- une brique d'affichage d'etat
- une brique de composition reutilisable

## Chaine Officielle

La chaine officielle devient :

Workflow reel
-> navigation
-> page
-> vue
-> composant

Cette chaine est obligatoire.

Elle signifie :

- le composant ne porte pas seul le sens metier
- le composant ne cree pas la page
- le composant ne decide pas de la navigation
- le composant sert une vue deja justifiee

## Difference Officielle Entre Vue Et Composant

### Vue

La vue organise l'experience globale d'une page.

Elle porte :

- la structure visuelle d'ensemble
- la hierarchie des blocs
- la lecture principale
- la projection des actions globales

### Composant

Le composant sert une partie de cette vue.

Il porte :

- un bloc local
- une interaction localisee
- un affichage specialise
- un comportement de presentation borné

Une vue assemble plusieurs composants.

Un composant ne doit jamais etre promu en vue implicite sans explicitation documentaire.

## Regles Fondatrices

### Regle 1

Un composant doit toujours etre rattache a un besoin de vue ou a un motif de presentation repete.

### Regle 2

Un composant ne doit jamais contenir la logique metier source du workflow.

### Regle 3

Un composant ne doit jamais devenir un moteur caché de permissions.

Les permissions doivent etre resolues avant ou au niveau de la page/vue, puis projetees en capacites visibles.

### Regle 4

Un composant doit avoir une responsabilite visuelle et interactionnelle claire.

### Regle 5

Un composant ne doit pas melanger plusieurs niveaux de granularite sans raison claire.

### Regle 6

Un composant de base doit rester agnostique du domaine metier quand cela est possible.

### Regle 7

Un composant metier peut exister, mais seulement s'il sert un motif de presentation metier stable.

### Regle 8

Les composants doivent rester compatibles avec les etats :

- loading
- vide
- erreur
- interdit
- donnees partielles

### Regle 9

Un composant ne doit pas forcer la page a adopter un seul mode de lecture si plusieurs vues restent possibles.

### Regle 10

La reutilisation ne doit jamais detruire la lisibilite metier.

## Les Grandes Familles Officielles De Composants

EduSync doit reconnaitre au minimum les familles suivantes.

### 1. Composants De Structure

Ils organisent la page ou la vue.

Exemples :

- shell de module
- conteneur de page
- grille de blocs
- panneau lateral
- zone de resume

### 2. Composants De Navigation

Ils portent la circulation locale.

Exemples :

- menu lateral
- onglets de section
- fil d'ariane
- commutateur de contexte
- navigation locale de centre de travail

### 3. Composants De Donnees

Ils affichent les contenus principaux.

Exemples :

- tableau
- carte resume
- liste detaillee
- fiche de ressource
- timeline

### 4. Composants D'Action

Ils supportent les mutations et commandes utilisateur.

Exemples :

- bouton principal
- barre d'actions
- formulaire
- dialogue de confirmation
- panneau de mutation

### 5. Composants D'Analyse

Ils servent les lectures analytiques.

Exemples :

- bloc de KPI
- tableau comparatif
- repartition d'indicateurs
- synthese d'echecs
- panneau de diagnostic

### 6. Composants D'Etat

Ils rendent visible l'etat du systeme ou de la page.

Exemples :

- skeleton de chargement
- etat vide
- alerte d'erreur
- panneau non autorise
- banniere module desactive

### 7. Composants De Contexte

Ils rendent visible le perimetre courant.

Exemples :

- badge ecole active
- badge section
- badge classe
- badge annee scolaire
- resume eleve cible

## Les Trois Niveaux De Composants

La lecture officielle doit distinguer trois niveaux.

### Niveau 1 - Composants Generiques

Ils sont reutilisables sans dependance forte a un domaine.

Exemples :

- boutons
- cartes
- tableaux de base
- boites d'etat
- modales generiques

### Niveau 2 - Composants Applicatifs

Ils portent une logique de presentation recurrente du produit.

Exemples :

- shell de module
- bandeau de contexte actif
- en-tete de centre de travail
- barre d'actions standardisee

### Niveau 3 - Composants Metier

Ils servent un motif stable lie a un domaine.

Exemples :

- carte situation financiere eleve
- bloc de diagnostic d'echec
- bloc de caisse du jour
- bloc de conduite eleve

## Regles De Composition

La composition officielle doit suivre cet ordre :

1. la page appelle une vue
2. la vue choisit ses blocs
3. les blocs assemblent des composants
4. les composants reutilisent des primitives communes

Le mouvement inverse ne doit pas piloter l'architecture.

Il ne faut pas partir d'une liste de composants pour essayer ensuite de leur trouver un metier.

## Composants Et Contexte Actif

Les composants qui affichent ou utilisent un perimetre actif doivent recevoir explicitement les donnees de contexte necessaires.

Exemples :

- ecole courante
- section courante
- classe courante
- annee scolaire courante
- eleve cible

Un composant ne doit pas supposer silencieusement un contexte implicite introuvable par l'utilisateur.

## Composants Et Permissions Visibles

Un composant peut recevoir :

- une capacite visible
- un mode lecture seule
- une action desactivee
- une condition metier temporaire expliquant une action desactivee

Mais un composant ne doit pas recalculer seul toute la doctrine d'autorisation.

La regle officielle reste :

- la permission est resolue au niveau page/vue
- le composant ne fait que projeter l'etat autorise

`AccessBoundary` et les helpers equivalents consomment la projection centrale des capacites effectives. Ils appliquent la politique d'action documentee, le module, le scope, le contexte, les restrictions et les capacites derivees sans inventer une permission locale.

La projection officielle des etats est :

- interdit : composant ou action absent
- module inactif : composant ou action absent
- autorise en lecture seule : lecture visible, mutation absente
- autorise mais condition metier temporaire non satisfaite : action visible et desactivee avec explication
- autorise : action visible et active

Le composant ne monte pas son contenu protege avant resolution de la capacite et ne declenche pas l'appel API associe lorsqu'il est interdit.

## Composants Et Analyse

Les vues analytiques d'EduSync demanderont une famille de composants plus exigeante que de simples tableaux.

Ces composants devront pouvoir porter :

- comparaison
- diagnostic
- synthese
- regroupement
- filtres lisibles
- details actionnables

Cela concerne notamment :

- `PED-05`
- `PED-08`
- `PF-*` analytiques
- `MON-*`
- `AUD-*`

## Composants Et Etats De Robustesse

Chaque famille de composants devra prevoir, si pertinent :

- variante loading
- variante vide
- variante erreur
- variante partielle
- variante lecture seule

L'absence de ces variantes creera une dette UX et de robustesse.

## Ce Que Les Composants Ne Doivent Pas Faire

Les composants ne doivent pas :

- remplacer les workflows
- reconstruire la navigation
- recalculer la securite transverse
- afficher puis masquer une action apres un refus backend previsible
- utiliser un role visible comme autorisation suffisante
- masquer le contexte actif
- lier de force plusieurs modules sans justification
- imposer un design system qui ecrase le sens metier

## Modele De Description Des Futurs Composants

Les futurs composants devront etre documentes avec au minimum :

1. identifiant composant
2. famille
3. niveau
4. objectif de presentation
5. vue(s) consommatrice(s)
6. donnees d'entree
7. actions emises
8. etats supportes
9. contraintes de contexte
10. contraintes d'autorisation visible
11. remarques de reutilisation

## Ce Que Cette Phase Ne Fait Pas Encore

Cette phase ne fait pas encore :

- l'inventaire final des composants
- la bibliotheque detaillee
- les props techniques
- la specification pixel-perfect
- les contrats d'ecran complets

## Verdict

Les composants UI EduSync doivent maintenant etre lus comme la couche de projection reutilisable des vues frontend, sans confusion avec les pages, les workflows ou la logique metier.

La suite officielle la plus propre devient :

- contrats d'ecran detailles
- catalogue des vues par module
- puis catalogue des composants concrets

Cette phase est maintenant ouverte dans :

- [21-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/21-contrats-ecran.md)
