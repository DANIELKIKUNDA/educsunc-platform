# Phase 00 - Standards UI Plateforme

## Statut

Ce document fixe les standards communs de l'interface des centres `Plateforme` d'EduSync.

Il ne cree :

- aucun nouveau workflow
- aucune nouvelle permission
- aucune nouvelle route
- aucune nouvelle regle metier

Il sert de constitution graphique et fonctionnelle commune pour :

- `Referentiel officiel`
- `Administration Ecole`
- `Configuration`
- `Securite`
- `Monitoring`
- `Notifications`
- tout futur centre `Plateforme`

## Objectif

Garantir qu'un utilisateur retrouve partout la meme famille d'interfaces :

- meme structure de page
- meme hierarchie visuelle
- meme langage utilisateur
- meme logique de cartes
- meme logique de tableaux
- meme logique de filtres
- meme comportement des modales
- meme qualite de messages

## Regle D'Or

Un centre `Plateforme` ne doit jamais donner l'impression de changer de produit d'un module a l'autre.

Un utilisateur doit reconnaitre immediatement EduSync, meme lorsqu'il passe de :

- `Referentiel officiel`
- a `Configuration`
- puis a `Administration Ecole`

## Structure Standard D'Une Page Centre

Ordre officiel :

1. bandeau de contexte
2. cartes de synthese
3. barre d'actions et filtres
4. onglets internes si necessaires
5. zone de travail principale
6. panneau detail
7. modales et confirmations

## Bandeau De Contexte

Chaque centre doit afficher clairement :

- le niveau courant
- l'acteur courant
- le perimetre courant
- le statut d'autorisation
- une phrase de contexte simple

Le bandeau doit repondre a :

- ou suis-je
- sur quoi j'agis
- ai-je le droit de modifier

## Cartes De Synthese

Regles :

- maximum 4 cartes par bandeau de synthese
- meme hauteur visuelle
- meme style d'icone
- meme densite
- meme logique de clic si les cartes sont interactives

Une carte doit toujours contenir :

- un libelle clair
- une valeur principale
- une phrase courte d'explication

## Barres D'Actions Et Filtres

Les centres `Plateforme` utilisent tous la meme grammaire :

- recherche en premier
- filtres ensuite
- bouton `Effacer les filtres`
- groupe d'actions a droite ou en dessous selon la largeur

Regles :

- alignement horizontal en desktop
- regroupement compact en mobile
- meme hauteur de boutons
- meme style de boutons primaires et secondaires

## Onglets

Lorsqu'un centre utilise des onglets :

- ils sont visuellement centres en desktop
- ils deviennent scrollables en mobile
- ils gardent le meme style entre tous les centres
- l'onglet actif doit etre immediatement identifiable

## Tableaux

Tous les tableaux `Plateforme` partagent :

- meme hauteur de ligne
- meme style d'en-tete
- meme densite
- memes badges
- actions compactes a droite
- etats vides homogenes

Pagination retenue :

- chargement progressif
- bouton `Afficher plus` ou scroll progressif maitrise
- jamais de pagination numerotee classique

## Panneaux Detail

Le detail d'un element doit :

- expliquer la situation
- rappeler le contexte
- montrer les valeurs importantes
- afficher seulement les actions autorisees

Le detail ne doit jamais etre un dump technique brut.

## Modales

Toutes les modales `Plateforme` doivent etre :

- centrees
- elegantes
- suffisamment larges
- lisibles sans effort

Elles doivent contenir :

- un titre clair
- un sous-titre ou une phrase de contexte
- un corps bien espace
- des boutons de fermeture et d'action

## Confirmations

Les confirmations critiques sont obligatoires pour :

- suppression
- activation ou desactivation sensible
- publication
- propagation
- actualisation sensible
- verrouillage ou reouverture de modifications

Chaque confirmation doit rappeler :

- l'action
- l'objet concerne
- le perimetre
- la consequence

## Etats D'Ecran

Chaque centre doit definir :

- chargement
- vide
- erreur
- acces refuse

Le style de ces etats doit etre coherent partout.

## Langage Utilisateur

Règle absolue :

le frontend parle un langage metier humain.

Il ne doit jamais exposer comme vocabulaire principal :

- des termes backend
- des termes d'infrastructure
- des termes de developpement

L'utilisateur pilote :

- sa plateforme
- son organisation
- son ecole

Il ne configure jamais une infrastructure.

## Densite Et Lisibilite

Un centre `Plateforme` doit etre :

- dense sans etre surcharge
- sobre sans etre vide
- premium sans etre decoratif

Il faut eviter :

- les grands blocs inutiles
- les cartes geantes
- les animations fatigantes
- les graphismes marketing

## Cohérence Avec Le Shell

Chaque centre doit heriter naturellement du shell global :

- meme logique de marge
- meme respiration
- meme largeur utile
- meme relation sidebar / top bar / contenu

## Accessibilite

Chaque centre doit prevoir :

- focus visible
- contrastes lisibles
- boutons suffisamment grands
- libelles courts
- icones avec aria-label quand necessaire

## Validation Finale D'Un Centre

Avant de figer un centre `Plateforme`, verifier :

1. conformite a la doctrine du module
2. conformite a la maquette du module
3. conformite au backend
4. respect du langage utilisateur
5. respect des standards UI Plateforme
6. coherence avec les autres centres
7. absence de dette UX evidente

## Statut De Figement

`STANDARDS UI PLATEFORME FIGES`

## Socle Technique D1.6

Les centres actuels et futurs reutilisent une seule pile UI :

- CSS EduSync et jetons semantiques `--ui-*`
- Lucide Vue pour les icones
- `notificationsService` et `ToastStack` pour les notifications temporaires
- `ModalShell` pour les dialogues et confirmations metier

PrimeVue, Tailwind, Sonner, SweetAlert2 et les dialogues natifs du navigateur ne sont pas introduits. Une nouvelle bibliotheque exige une decision d'architecture prouvant que le socle commun ne couvre pas le besoin.

Les composants futurs doivent suivre `docs/quality/d1-6-design-system-premium.md` et passer la certification `npm run test:design-system`.
