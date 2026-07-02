# Phase 32 - Maquettes Shell Global

## Statut

Ce document a ouvert la conception officielle du shell global frontend EduSync.

Le shell global doctrinal est maintenant implemente et stabilise dans le frontend Vue.

Le present document reste la specification de reference de cette couche.

Il ne cree :

- aucun nouveau workflow
- aucun nouvel acteur
- aucune nouvelle permission
- aucune nouvelle route backend

Il transforme en maquettes de structure globale ce qui est deja fige dans :

- la navigation
- les pages
- les vues
- les composants
- les contrats d'ecran

La suite naturelle de cette phase est l'ouverture des maquettes metier du domaine finance dans [33-maquettes-finances.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/33-maquettes-finances.md).

## Objectif

Le shell global est la premiere vraie couche visible de l'application.

Il doit permettre a un utilisateur de :

- comprendre ou il se trouve
- voir uniquement les modules et sections legitimes
- changer de contexte sans perdre la coherence
- ouvrir rapidement son centre de travail principal
- conserver une lecture claire entre plateforme, organisation, ecole et espace personnel

Le shell global ne doit jamais :

- promettre un workflow non branche
- melanger des niveaux de gouvernance sans signal fort
- afficher un menu plus large que le couple `permission + perimetre`
- forcer une meme ergonomie pour tous les acteurs si leur niveau d'usage est different

## Sources De Verite

Cette phase s'appuie exclusivement sur :

- [15-navigation-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/15-navigation-frontend.md)
- [16-navigation-par-acteur.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/16-navigation-par-acteur.md)
- [17-navigation-par-module.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/17-navigation-par-module.md)
- [18-pages-et-routes-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/18-pages-et-routes-frontend.md)
- [19-vues-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/19-vues-frontend.md)
- [20-composants-ui.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/20-composants-ui.md)
- [21-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/21-contrats-ecran.md)
- [31-synthese-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/31-synthese-contrats-ecran.md)

Le backend reste la source ultime de verite.

## Role Officiel Du Shell Global

Le shell global est la coque d'experience commune qui entoure les pages metier.

Il porte :

- l'identite produit
- la navigation principale
- le contexte actif
- les alertes globales
- les raccourcis d'usage
- la sortie de session
- l'acces a l'espace personnel

Il ne porte pas directement :

- la logique metier fine d'un ecran
- la totalite des actions d'un workflow
- les validations fonctionnelles profondes

## Etat Reel D'Implementation

Le shell global est maintenant materialise dans le frontend autour de :

- `frontend/src/shell/AppShellDesktop.vue`
- `frontend/src/shell/AppShellMobile.vue`
- `frontend/src/shell/components/AppSidebar.vue`
- `frontend/src/shell/components/AppTopbar.vue`
- `frontend/src/shell/components/AppDrawerMobile.vue`
- `frontend/src/shell/components/ContextSwitcher.vue`
- `frontend/src/shell/components/UserMenu.vue`
- `frontend/src/shared/doctrine/frontend-doctrine.ts`
- `frontend/src/shared/doctrine/doctrine.resolver.ts`
- `frontend/src/shared/navigation/navigation.builder.ts`
- `frontend/src/router/guards.ts`

Le principe effectivement retenu en code est :

acteur
-> niveau de gouvernance actif
-> pages accessibles par doctrine
-> modules visibles
-> sous-menus visibles
-> actions visibles dans les ecrans

Le shell n'est donc plus un shell statique par domaine.

Il est devenu un shell doctrinal compose a partir de la source de verite frontend.

Les pages racines de module ne sont plus de simples placeholders visuels :

- elles relisent la doctrine active
- elles recomposent les acces visibles du module courant
- elles exposent les pages et actions reelles du profil courant

## Verifications De Figement

Les verifications suivantes ont ete confirmees sur l'implementation reelle :

1. les pages d'accueil doctrinales des acteurs existants sont resolues et accessibles
2. la navigation laterale est calculee a partir de la doctrine active
3. le garde-route refuse les pages non autorisees et redirige vers une route ouvrable
4. la topbar relit la doctrine pour le titre courant et la recherche
5. un module sans sous-menu visible ne devient pas un lien mort dans le shell
6. le changement d'acteur et de contexte recompose la navigation visible
7. les centres de module se recomposent eux aussi depuis les pages et actions visibles

Verification technique :

- `npm run build` : OK

## Doctrine De Conception

### Regle 1

Le shell doit etre compose par niveau de gouvernance.

### Regle 2

Le shell doit se recomposer quand changent :

- l'acteur courant
- le contexte actif
- les modules actifs
- les permissions effectives

### Regle 3

Le shell doit toujours montrer clairement le niveau courant :

- plateforme
- organisation
- ecole
- utilisateur

### Regle 4

Le shell doit donner une impression de puissance et de lisibilite, pas une sensation de menu administratif plat.

### Regle 5

Le shell doit rester dense mais respirant :

- priorites visibles
- sections bien segmentees
- peu de bruit
- forte clarte contextuelle

### Regle 6

Le shell mobile ne doit pas etre une copie ecrasee du desktop.

## Intention Visuelle Globale

La direction recommandee pour EduSync est la suivante :

- application de pilotage serieuse
- ton institutionnel moderne
- sensation de gouvernance et de maitrise
- profondeur legere dans les couches
- contrastes nets sans agressivite
- typographie ferme et lisible

Lecture d'ambiance retenue :

- plus centre de commandement que simple back-office
- plus produit professionnel que theme scolaire enfantin
- plus intelligence operationnelle que formulaire administratif

## Architecture De Shell Retenue

La maquette officielle recommande une structure en cinq zones.

### 1. Bandeau superieur global

Role :

- marque EduSync
- recherche globale future
- contexte actif
- notifications globales
- acces compte
- logout

Contenu minimal :

- logo ou monogramme EduSync
- nom de l'espace courant
- selecteur de contexte
- indicateurs globaux
- avatar / menu utilisateur

### 2. Navigation laterale principale

Role :

- modules visibles
- sections prioritaires
- raccourcis vers centres de travail

Contenu minimal :

- bloc modules
- bloc sections favorites
- bloc acces rapide

### 3. Bandeau de contexte metier

Role :

- rappeler ou l'utilisateur travaille reellement
- afficher l'organisation, l'ecole, la section, la classe ou l'annee selon le cas

Contenu minimal :

- fil d'Ariane
- badges de contexte
- etat du module

### 4. Surface centrale de travail

Role :

- accueillir la page et sa vue active

Contenu minimal :

- titre d'ecran
- resume
- actions principales
- contenu de page

### 5. Rail secondaire optionnel

Role :

- signaux secondaires
- aide contextuelle
- activites recentes
- syntheses laterales

Ce rail ne doit pas etre obligatoire sur tous les ecrans.

## Maquette Desktop De Reference

La maquette desktop de reference est la suivante :

```text
+--------------------------------------------------------------------------------------------------+
| Logo EduSync | Contexte actif | Recherche | Signaux | Notifications | Profil                     |
+-------------------------+----------------------------------------------------------------+-------+
| Modules                 | Fil d'Ariane / Badges contexte / Etat module                            |
| - Academique            +------------------------------------------------------------------------+
| - Pedagogique           | Titre ecran                     | Actions principales                  |
| - Scolarite             +------------------------------------------------------------------------+
| - Finances              |                                                                        |
| - Audit                 |                                                                        |
| - Monitoring            |                      Surface centrale de travail                       |
| - Configuration         |                                                                        |
| - Notifications         |                                                                        |
| - Security              |                                                                        |
|                         |                                                                        |
| Sections / favoris      |                                                                        |
| Raccourcis              |                                                                        |
+-------------------------+---------------------------------------------------------------+--------+
| Pied compact            | Etat global / activites optionnelles / aide contextuelle      | Rail   |
+-------------------------+---------------------------------------------------------------+--------+
```

## Maquette Mobile De Reference

La maquette mobile de reference doit changer de logique :

- top bar compacte
- drawer de navigation
- contexte actif tres visible
- actions critiques remontees en haut
- rail secondaire transforme en panneaux contextuels ou blocs empiles

Structure recommandee :

```text
+--------------------------------------------------+
| Menu | EduSync | Contexte | Signaux | Profil     |
+--------------------------------------------------+
| Fil d'Ariane court / badges essentiels           |
+--------------------------------------------------+
| Titre ecran                                      |
| Resume / action principale                       |
+--------------------------------------------------+
| Contenu principal                                |
|                                                  |
|                                                  |
+--------------------------------------------------+
| Blocs secondaires empiles si necessaire          |
+--------------------------------------------------+
```

## Variantes Officielles Du Shell

Le shell global n'est pas identique pour tous les profils.

Quatre variantes meres sont retenues.

### Shell Plateforme

Acteurs :

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

Traits UX :

- plus dense
- plus analytique
- plus de signaux globaux
- navigation transverse prioritaire

Modules dominants :

- plateforme
- monitoring
- security
- audit
- configuration

### Shell Organisation

Acteurs :

- `PROMOTEUR_ORGANISATION`
- `ADMIN_SYSTEME_ORGANISATION`
- `GESTIONNAIRE_ORGANISATION`

Traits UX :

- vision multi-ecoles
- forte visibilite des filtres d'organisation
- supervision, archives, configuration autorisee

Modules dominants :

- organisation
- audit
- configuration
- notifications
- finances de supervision

### Shell Ecole

Acteurs :

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

Traits UX :

- centre de travail metier
- orientation action et consultation
- contexte ecole tres visible
- acces rapide aux workflows du quotidien

Modules dominants :

- finances
- scolarite
- pedagogique
- audit local
- notifications ecole
- configuration locale selon gouvernance

### Shell Personnel

Acteurs :

- `PARENT`
- utilisateur final sur son espace personnel

Traits UX :

- plus simple
- plus lisible
- moins de densite
- parcours tres directs

Modules dominants :

- espace personnel
- preferences
- historique paiements
- resultats ou bulletins autorises

## Composition Des Menus

Le menu lateral doit suivre cet ordre de lecture :

### Bloc 1 - Mission principale

Les 3 a 5 points d'entree les plus utiles a l'acteur.

### Bloc 2 - Modules visibles

Les autres modules actifs et autorises.

### Bloc 3 - Supervision ou parametrage

Visible seulement quand il existe reellement pour l'acteur.

### Bloc 4 - Personnel

- mes preferences
- mon compte
- deconnexion

Le menu ne doit pas etre un annuaire complet de toutes les pages.

## Composants Structurants Du Shell

Les composants structurants recommandes sont :

- `AppShell`
- `TopBar`
- `ContextSwitcher`
- `PrimarySidebar`
- `ModuleNavSection`
- `QuickActionsPanel`
- `BreadcrumbBar`
- `PageHeader`
- `GlobalStatusBanner`
- `SecondaryInsightRail`
- `UserMenu`

Ces composants restent des cadres de composition.

Ils ne doivent pas cacher la logique de permissions.

## Etats Globaux A Prevoir

Le shell doit gerer explicitement les etats suivants :

- session en chargement
- session absente
- contexte incomplet
- aucun module actif
- acteur authentifie mais sans espace ouvrable
- contexte invalide
- module desactive
- erreur technique de composition

## Regles De Recomposition

Quand le contexte change, le shell doit savoir recomposer :

- les modules visibles
- les sections visibles
- les favoris
- le fil d'Ariane
- les raccourcis
- les badges de contexte

Sans :

- recharger mentalement toute l'application
- laisser des menus morts
- conserver des liens vers un ancien perimetre

## Raccourcis Prioritaires Recommandes

Les raccourcis du shell doivent etre choisis par famille d'acteurs.

Exemples :

- `CAISSIER` : enregistrer paiement, caisse du jour, recus, dette eleve
- `TITULAIRE` : bulletins, proclamation, classement, conduite
- `PREFET_ETUDES` : resultats, analyses, conduite, suspension scolaire
- `ADMINISTRATEUR_ECOLE` : supervision financiere, audit financier, notifications ecole
- `MANAGER_SYSTEME` : monitoring, security, audit, configuration runtime

## Regles De Style Pour Les Futures Maquettes Visuelles

Les futures maquettes visuelles devront respecter :

- une colonne laterale stable
- un bandeau haut fort
- des titres de pages tres lisibles
- des cartes et tableaux nets
- des accents visuels mesurés
- une couleur de statut coherente
- une hierarchie claire entre action primaire et actions secondaires

Elles devront eviter :

- le look scolaire enfantin
- les interfaces vides sans structure
- les effets decoratifs gratuits
- les dashboards surcharges
- les menus interminables

## Verification Avant Implementation

Avant de coder le shell global, il faudra verifier pour chaque variante :

1. quels modules sont visibles
2. quel contexte actif est requis
3. quels raccourcis sont vraiment legitimes
4. quels etats globaux doivent etre testes
5. quelles routes racines sont ouvertes

## Verdict

Le shell global EduSync est maintenant implemente comme une vraie coque produit de haut niveau, sans reouvrir les workflows ni improviser la structure d'experience.

Le statut retenu est :

- doctrine shell : figee
- shell doctrinal frontend : implemente
- navigation par acteur : stabilisee
- centres de module doctrinaux : implementes
- prochaine etape legitime : poursuite et finition des ecrans metier dans le shell stabilise
