# Phase 15 - Navigation Frontend EduSync

## Statut

Ce document fixe la doctrine officielle de navigation frontend d'EduSync.

Il intervient apres :

- la doctrine frontend
- la cartographie des acteurs
- les permissions effectives
- les cas d'utilisation
- les workflows reels
- la cartographie finale des workflows

Il intervient avant :

- les vues frontend
- les composants UI
- les dashboards ecran par ecran
- les contrats de page

Ce document ne dessine encore aucune vue finale.

Il fixe seulement :

- la definition officielle de la navigation EduSync
- les regles de composition des modules visibles
- les regles de construction des menus
- les regles de projection des workflows en routes et pages
- la methode officielle de cartographie navigation par acteur

La cartographie suivante est maintenant ouverte dans :

- [16-navigation-par-acteur.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/16-navigation-par-acteur.md)

Le backend reste la source ultime de verite metier.

## Sources De Verite

La navigation frontend EduSync doit etre lue a partir des sources deja figees :

- [00-doctrine-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/00-doctrine-frontend.md)
- [01-acteurs.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/01-acteurs.md)
- [02-permissions-effectives.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/02-permissions-effectives.md)
- [03-cas-utilisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/03-cas-utilisation.md)
- [04-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/04-workflows.md)
- [05-workflows-reels.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/05-workflows-reels.md)
- [14-cartographie-finale-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/14-cartographie-finale-workflows.md)

Et, comme source backend ultime :

- les routes reelles
- les read models exposes
- les contraintes de contexte actif
- la doctrine `permission + perimetre`
- les workflows officiellement figes

## Definition Officielle De La Navigation EduSync

La navigation EduSync est l'organisation officielle des points d'entree visibles et accessibles de l'application frontend, projetes a partir des workflows reels, du contexte actif et des permissions effectives.

La navigation :

- n'est pas un simple menu graphique
- n'est pas une copie des routes backend
- n'est pas une liste brute de modules techniques
- n'est pas une projection libre du design

La navigation est :

- une structure de parcours
- une projection des workflows reels
- une composition gouvernee par l'acteur courant
- une composition gouvernee par les permissions effectives
- une composition gouvernee par le perimetre actif
- une composition gouvernee par les modules effectivement actifs

## Objet Reels De La Navigation

La navigation frontend doit permettre a un utilisateur autorise de :

- comprendre ce qu'il peut faire
- trouver rapidement ses workflows reels
- rester dans son perimetre autorise
- changer de contexte sans perdre la coherence metier
- distinguer ce qui releve de l'ecole, de l'organisation ou de la plateforme

La navigation ne doit jamais :

- promettre un workflow non branche
- exposer implicitement un workflow interdit
- melanger plusieurs niveaux de gouvernance sans l'indiquer
- faire croire qu'une permission globale suffit sans scope reel

## Chaine Officielle

La chaine officielle devient :

Acteur
-> Permissions effectives
-> Perimetre actif
-> Workflows visibles
-> Navigation
-> Vues

Cette chaine est obligatoire.

Elle signifie :

- l'acteur seul ne suffit pas
- la permission seule ne suffit pas
- le perimetre actif borne ce qui peut devenir visible
- les workflows reels restent la source de la navigation
- les vues n'arrivent qu'apres la navigation

## Regles Fondatrices

### Regle 1

La navigation doit etre construite a partir des workflows reels figes, jamais depuis une intuition UI seule.

### Regle 2

Un item de navigation ne vaut pas preuve metier.

La preuve reste :

- le workflow fige
- la route backend reelle
- la securite reelle

### Regle 3

La navigation doit raisonner en modules visibles, sections visibles, pages visibles et actions visibles.

### Regle 4

La navigation doit rester gouvernee par `permission + perimetre`.

### Regle 5

Le frontend ne doit jamais transformer un acteur d'un niveau en acteur d'un autre niveau par simple presence d'un menu.

### Regle 6

La navigation doit distinguer explicitement :

- plateforme
- organisation
- ecole
- utilisateur

### Regle 7

La navigation ne doit pas exposer un module desactive pour l'ecole ou l'organisation courante.

### Regle 8

La navigation ne doit pas confondre :

- workflow
- page
- vue
- widget
- dashboard

### Regle 9

Une route frontend ne doit pas etre exposee comme accessible si son workflow reel n'est pas ouvrable dans le contexte courant.

### Regle 10

Un changement de contexte actif doit pouvoir recomposer la navigation sans redefinition manuelle de tout le shell.

## Definition Des Niveaux De Navigation

La navigation EduSync doit etre lue en quatre niveaux.

### 1. Navigation De Niveau Plateforme

Elle concerne les acteurs :

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

Elle ouvre les workflows :

- plateforme
- monitoring
- security transverse
- audit plateforme
- configuration plateforme

### 2. Navigation De Niveau Organisation

Elle concerne les acteurs :

- `PROMOTEUR_ORGANISATION`
- `ADMIN_SYSTEME_ORGANISATION`
- `GESTIONNAIRE_ORGANISATION`

Elle ouvre les workflows :

- organisation
- configuration organisationnelle
- audit organisationnel
- supervision transverse autorisee

### 3. Navigation De Niveau Ecole

Elle concerne notamment :

- `ADMINISTRATEUR_ECOLE`
- `ADMIN_SYSTEME_ECOLE`
- `CAISSIER`
- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_DISCIPLINE`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`
- `ENSEIGNANT`
- `TITULAIRE`
- `SECRETAIRE`

Elle ouvre les workflows :

- scolaires
- pedagogiques
- financiers
- administration ecole
- notifications ecole
- audit local selon nature
- configuration locale selon gouvernance

### 4. Navigation De Niveau Utilisateur

Elle concerne notamment :

- `PARENT`
- les preferences de compte
- les centres personnels de lecture et d'historique

Elle ouvre :

- les vues personnelles autorisees
- les preferences utilisateur
- les historiques et lectures bornees a l'utilisateur ou a ses enfants autorises

## Les Quatre Objets Officiels De Navigation

La navigation doit etre decomposee en quatre objets.

### Modules

Les grands blocs visibles du produit :

- Academique
- Pedagogique
- Scolarite
- Paiements et facturation
- Administration ecole
- Organisation
- Plateforme
- Audit
- Monitoring
- Configuration
- Notifications
- Security

### Sections

Les regroupements fonctionnels internes a un module.

Exemples :

- bulletins
- resultats
- classement
- caisse
- recus
- dette
- familles
- eleves
- incidents
- diagnostics

### Pages

Les points d'entree frontend par workflow ou sous-workflow.

Une page :

- ouvre une intention d'usage
- porte un etat d'ecran
- sera detaillee plus tard dans la phase vues

### Actions Visibles

Les actions locales exposees dans une page ou une section.

Exemples :

- consulter
- generer
- encoder
- reimprimer
- comparer
- configurer
- publier

Les actions visibles ne doivent pas etre rendues uniquement par role brut, mais par capacite effective.

## Ce Que La Navigation Doit Projeter

La navigation doit projeter au minimum :

- les modules activables reellement actifs
- les workflows reels officiellement figes
- les pages d'entree utiles pour chaque acteur
- les changements de contexte autorises
- les centres de travail principaux

La navigation ne doit pas encore projeter :

- les maquettes d'ecran finales
- les composants atomiques
- les tableaux, cartes ou graphiques precis

## Modules Visibles Et Activation

La navigation doit toujours appliquer le filtre suivant :

1. module connu
2. module autorise pour le niveau proprietaire
3. module active pour le tenant courant
4. workflow reel ouvert
5. permission effective satisfaite
6. perimetre actif satisfait

Si l'un de ces six points manque, le module ou la page ne doit pas etre presente comme normalement ouvrable.

## Navigation Et Contexte Actif

La navigation EduSync est gouvernee par le contexte actif.

Les contextes les plus structurants sont :

- organisation active
- ecole active
- section active si necessaire
- annee scolaire active
- classe concernee si necessaire
- utilisateur ou enfant concerne

Le frontend doit donc prevoir une navigation capable d'etre recomposee lorsque :

- l'ecole change
- l'organisation change
- le module actif change
- le scope metier change

## Menus Officiels

Un menu frontend EduSync doit etre lu comme une projection d'acces, jamais comme une autorisation autonome.

Un menu peut etre :

- principal
- secondaire
- contextuel
- local a une page

### Menu Principal

Il porte :

- les grands modules visibles
- les centres de travail prioritaires
- l'entree dans les families de workflows

### Menu Secondaire

Il porte :

- les sections internes du module courant
- les regroupements de pages
- les variantes de lecture d'un meme domaine

### Menu Contextuel

Il depend :

- de l'acteur
- du workflow courant
- de la ressource courante
- du perimetre courant

### Navigation Locale

Elle depend :

- de la page ouverte
- des actions disponibles
- des vues internes d'un centre de travail

## Ce Qu'Un Menu Ne Doit Jamais Faire

Un menu ne doit jamais :

- masquer un probleme de securite backend
- ouvrir un faux workflow theorique
- promettre une action juste parce qu'elle existe dans un autre perimetre
- confondre consultation et mutation
- confondre acteur principal et acteur secondaire

## Relation Officielle Entre Workflow Et Navigation

La relation officielle est la suivante :

- un workflow reel peut produire une ou plusieurs pages de navigation
- une page peut contribuer a un seul workflow principal ou a un centre de travail coherent
- plusieurs workflows proches peuvent etre regroupes dans une meme section, mais sans perdre leur distinction metier

Exemple de lecture correcte :

- `PF-01` a `PF-19` peuvent produire un module financier avec plusieurs sections
- `PED-08` peut ouvrir un centre d'analyse pedagogique
- `MON-*` peut ouvrir un centre monitoring plateforme

## Centres De Travail

La navigation frontend ne doit pas se limiter a des pages isolees.

Elle doit permettre d'ouvrir des centres de travail coherents par acteur.

Exemples attendus plus tard :

- centre de travail caissier
- centre pedagogique titulaire
- centre de supervision prefet
- centre organisationnel promoteur
- centre monitoring plateforme

Un centre de travail est une composition de pages et de sections autour d'une mission recurrente.

## Ordre Officiel De Construction

L'ordre officiel de la phase navigation est :

1. identifier les modules reels
2. identifier les workflows figes rattaches a chaque module
3. identifier les acteurs reels de chaque module
4. identifier les perimetres reels de chaque acteur
5. identifier les pages d'entree principales
6. identifier les menus par niveau
7. identifier les routes frontend candidates
8. seulement apres ouvrir la phase vues

## Modele De Cartographie A Utiliser Ensuite

Les futurs documents de navigation devront utiliser au minimum les sections suivantes :

### 1. Module

### 2. Niveau de navigation

### 3. Acteurs visibles

### 4. Preconditions de visibilite

### 5. Workflows rattaches

### 6. Sections du module

### 7. Pages d'entree principales

### 8. Actions visibles

### 9. Contraintes de contexte actif

### 10. Notes de perimetre

### 11. Sources backend

## Ce Que La Phase Navigation Ne Fait Pas Encore

Cette phase ne fait pas encore :

- la maquette des ecrans
- le design visuel
- la composition des composants
- les contrats UI detail par detail
- la micro-navigation interne d'une vue finale

Elle prepare ces phases sans les remplacer.

## Verdict

La navigation frontend EduSync doit maintenant etre lue comme une projection structuree des workflows reels figes, gouvernee par les permissions effectives, les modules actifs et les perimetres reels.

La suite officielle devient donc :

- phase navigation par module et par acteur
- puis phase vues frontend
- puis phase composants et integration
