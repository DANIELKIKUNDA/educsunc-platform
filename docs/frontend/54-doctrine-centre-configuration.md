# Phase 54 - Doctrine Du Centre Configuration

## Statut

Ce document ouvre la doctrine officielle du Centre `Configuration` d'EduSync.

Il ne cree aucun nouveau workflow.

Il ne modifie aucune permission backend.

Il ne remplace ni les workflows deja figes, ni les contrats d'ecran deja produits.

Il precise uniquement la maniere correcte de lire, nommer, organiser et presenter le module `Configuration`, a partir des preuves deja presentes dans le depot.

Le backend reste la source ultime de verite.

## Sources De Verite

Cette doctrine s'appuie exclusivement sur :

- [02-permissions-effectives.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/02-permissions-effectives.md)
- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)
- [16-navigation-par-acteur.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/16-navigation-par-acteur.md)
- [17-navigation-par-module.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/17-navigation-par-module.md)
- [18-pages-et-routes-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/18-pages-et-routes-frontend.md)
- [28-contrats-ecran-configuration.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/28-contrats-ecran-configuration.md)
- [Configuration.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/configuration/domain/aggregates/Configuration.ts)
- [EffectiveConfiguration.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/configuration/domain/aggregates/EffectiveConfiguration.ts)
- [PolitiqueClassificationConfiguration.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/configuration/domain/policies/PolitiqueClassificationConfiguration.ts)
- [ServiceCalculConfigurationEffective.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/configuration/domain/services/ServiceCalculConfigurationEffective.ts)
- [ModuleConfiguration.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/configuration/domain/entities/ModuleConfiguration.ts)
- [StatutLicenceConfiguration.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/configuration/domain/enums/StatutLicenceConfiguration.ts)
- [configuration.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/configuration/interfaces/http/routes/configuration.routes.ts)
- [configuration.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/configuration.routes.ts)
- [configuration-routes.integration.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/tests/integration/configuration-routes.integration.test.ts)

## Nature Du Module

Le module `Configuration` est un module transverse de gouvernance des parametres.

Il ne constitue pas un metier autonome.

Il ne cree aucun nouveau workflow metier.

Il ne remplace jamais les autres modules fonctionnels.

Il ne fait qu'exposer, organiser et gouverner les parametres des metiers deja presents dans le systeme.

## Regle D'Or

`Configuration` parametre le systeme.

`Configuration` ne pilote jamais directement les objets metiers eux-memes.

Toutes les interfaces du Centre `Configuration` utilisent un langage metier clair et humain.

Les termes techniques du backend, de l'infrastructure ou du developpement restent internes au systeme et ne sont jamais exposes directement aux utilisateurs, sauf necessite exceptionnelle.

La comprehension du metier ne doit jamais dependre d'une connaissance technique.

En consequence, le module `Configuration` ne gere jamais directement :

- les ecoles
- les organisations
- les utilisateurs
- les roles
- les permissions
- la securite
- les referentiels
- les licences commerciales
- les abonnements
- les workflows metiers

Ces responsabilites appartiennent a leurs modules respectifs.

## Hierarchie Officielle Du Centre

Le Centre `Configuration` est structure selon les quatre niveaux reels du backend :

- `Plateforme`
- `Organisation`
- `Ecole`
- `Utilisateur`

Cette hierarchie constitue la structure officielle et naturelle du Centre `Configuration`.

## Doctrine Par Niveau

### Plateforme

La portee `Plateforme` gouverne les parametres globaux du systeme.

Elle correspond aux configurations de niveau `SYSTEM`.

Elle couvre les parametres generaux de la plateforme, sans ouvrir la gouvernance locale d'une organisation, d'une ecole ou d'un utilisateur.

### Organisation

La portee `Organisation` gouverne les politiques communes applicables a l'ensemble des ecoles de l'organisation.

Elle correspond aux configurations de niveau `ORGANIZATION`.

Elle couvre notamment :

- les politiques communes
- les regles partagees
- les limites organisationnelles
- les modules autorises pour les ecoles

### Ecole

La portee `Ecole` gouverne les parametres locaux d'une ecole donnee.

Elle correspond aux configurations de niveau `SCHOOL`.

Elle couvre notamment :

- les modules actifs
- l'identite visuelle locale
- les notifications locales
- les parametres propres a l'ecole

### Utilisateur

La portee `Utilisateur` gouverne uniquement les preferences personnelles du proprietaire concerne.

Elle correspond aux configurations de niveau `USER`.

Elle ne couvre jamais :

- les modules
- la licence
- les parametres generaux de la plateforme
- la gouvernance globale

## Gouvernance Modulaire Officielle

La gouvernance des modules suit officiellement la logique suivante :

- l'`Organisation` autorise les modules
- l'`Ecole` active les modules autorises
- le systeme calcule ensuite les modules reellement disponibles

Cette logique est la lecture doctrinale officielle de :

- `modules.allowed`
- `modules.enabled`
- la resolution effective des modules

Elle est correcte et ne doit pas etre modifiee.

La lecture utilisateur de cette resolution doit rester simple :

- un module peut etre autorise sans etre encore active localement
- un module peut etre active localement seulement s'il a deja ete autorise
- la disponibilite reelle d'un module correspond toujours a ce qui est a la fois autorise et active

Le Centre `Configuration` doit donc toujours distinguer clairement :

- ce qui est permis par le niveau superieur
- ce qui a ete active au niveau courant
- ce qui est reellement disponible pour l'usage

## Capacites Reelles A Representer

Sans creer de nouveau workflow, la doctrine du Centre `Configuration` doit couvrir les capacites deja prouvees par le backend :

- creer une configuration
- consulter une configuration
- modifier une configuration
- supprimer une configuration quand cette capacite existe pour la famille concernee
- verrouiller temporairement des modifications
- autoriser a nouveau les modifications
- creer une version enregistree
- comparer des versions enregistrees
- verifier une configuration avant application
- personnaliser localement une valeur heritee lorsque la famille l'autorise
- consulter la configuration appliquee
- appliquer une modification aux niveaux concernes lorsque la famille la porte
- actualiser l'application d'un parametre lorsque la famille la porte

Le Centre `Configuration` ne doit pas promettre davantage.

En particulier, la doctrine ne doit pas presenter aujourd'hui un workflow officiel de restauration tant qu'aucune route HTTP officielle de restauration n'est exposee dans le backend actuel.

## Cycle De Vie Metier D'Un Reglage

Quel que soit le niveau concerne, un reglage doit etre compris comme un element pouvant suivre un cycle de vie lisible :

- il peut etre cree
- il peut etre consulte et modifie
- il peut etre temporairement verrouille
- il peut etre verifie avant application
- il peut produire une ou plusieurs versions enregistrees
- ses versions enregistrees peuvent etre comparees
- sa valeur effectivement appliquee peut etre relue
- selon sa famille, il peut etre applique aux niveaux concernes ou actualise dans le systeme

Cette lecture doit rester constante entre `Plateforme`, `Organisation`, `Ecole` et `Utilisateur`, avec seulement les actions reellement autorisees pour chaque niveau.

## Personnalisation Locale Et Heritage

Le backend porte une logique reelle d'heritage et de personnalisation locale.

La doctrine doit donc expliquer cela en langage metier simple :

- un niveau superieur peut definir un reglage commun
- un niveau inferieur peut parfois conserver cette valeur telle quelle
- un niveau inferieur peut parfois appliquer son propre reglage local si la famille de cles l'autorise
- un verrouillage peut limiter certaines modifications descendantes

L'utilisateur ne doit pas voir un langage d'architecture.

Il doit simplement comprendre :

- si la valeur vient d'un niveau superieur
- s'il utilise la valeur commune
- s'il applique un reglage propre a son organisation, son ecole ou son compte
- si une modification locale est interdite ou verrouillee

## Langage Metier Obligatoire

Le Centre `Configuration` doit employer un langage comprehensible immediatement par un utilisateur non technique.

L'utilisateur ne doit jamais avoir l'impression de configurer un logiciel de developpeur.

Les concepts techniques du backend peuvent exister en interne, mais ils ne doivent pas etre exposes comme vocabulaire principal d'interface.

## Matrice Officielle De Traduction Metier

- `runtime.*` -> `Parametres de la plateforme`
- `override` -> `Personnalisation locale`
- `snapshot` -> `Version enregistree`
- `lock` -> `Verrouiller les modifications`
- `unlock` -> `Autoriser les modifications`
- `reload` -> `Actualiser`
- `effective configuration` -> `Configuration appliquee`
- `propagation` -> `Appliquer aux niveaux concernes`
- `branding.*` -> `Identite visuelle`
- `modules.allowed` -> `Modules autorises`
- `modules.enabled` -> `Modules actifs`
- `validate` -> `Verifier la configuration`
- `compare snapshots` -> `Comparer des versions enregistrees`

Les termes techniques peuvent rester :

- dans le code
- dans les DTO
- dans les logs
- dans les objets de domaine

Mais ils ne doivent pas constituer le premier niveau de langage visible pour l'utilisateur metier.

## Structure Metier Cible Du Centre

Le Centre `Configuration` doit etre organise autour de familles comprehensibles, et non principalement autour de cles techniques.

Les sections cibles sont :

- `Parametres de la plateforme`
- `Politiques organisationnelles`
- `Modules autorises`
- `Modules actifs`
- `Identite visuelle`
- `Notifications`
- `Preferences personnelles`
- `Historique des modifications`
- `Configuration appliquee`

Selon la famille de reglages ouverte, ces sections peuvent aussi faire apparaitre :

- `Verification des reglages`
- `Versions enregistrees`
- `Comparaison des versions`
- `Personnalisation locale`

## Ecrans Reels Rattaches A Cette Doctrine

Les ecrans frontend deja materialises dans cette doctrine sont :

- `SCR-CFG-001`
- `SCR-CFG-002`
- `SCR-CFG-003`
- `SCR-CFG-004`
- `SCR-CFG-005`
- `SCR-CFG-006`

Ils restent documentes plus finement dans [28-contrats-ecran-configuration.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/28-contrats-ecran-configuration.md).

La presente doctrine ne remplace pas leurs contrats d'ecran.

Elle fixe seulement leur lecture officielle de plus haut niveau.

## Ce Que Le Centre Ne Doit Pas Devenir

Le Centre `Configuration` ne doit jamais devenir :

- un centre d'administration generale
- un centre de securite
- un centre de gestion commerciale
- un centre de licences
- un centre d'abonnements
- un fourre-tout transverse
- un substitut aux modules metiers

## Doctrine Sur Les Licences

Le backend contient un socle de licence et de modularite.

Mais en l'etat actuel du depot :

- aucun workflow metier complet de licence n'est officiellement ouvert
- aucune gouvernance commerciale complete n'est officiellement ouverte
- aucune interface officielle de gestion commerciale n'est officiellement ouverte

En consequence, le module `Configuration` ne doit pas creer aujourd'hui :

- un centre `Licence`
- une page `Abonnements`
- une page `Commerciale`

La licence reste, pour cette phase, une capacite de socle interne non encore ouverte comme module metier officiel.

## Permissions Et Responsabilites

Le Centre `Configuration` doit rester strictement aligne sur les permissions backend existantes.

Il ne cree jamais de permission frontend autonome.

Les responsabilites doivent rester lisibles :

- la `Plateforme` gouverne les parametres globaux
- l'`Organisation` gouverne ses politiques communes et ses modules autorises
- l'`Ecole` gere ses modules actifs et ses reglages locaux autorises
- l'`Utilisateur` gere uniquement ses preferences personnelles

Une lecture visible dans l'interface ne donne jamais automatiquement un droit de mutation.

Une action de mutation, de verrouillage, de verification, d'application aux niveaux concernes ou d'actualisation doit toujours rester conditionnee par la permission backend reelle et par le perimetre reel.

## Regles UX Officielles

Le Centre `Configuration` doit donner l'impression de piloter :

- une plateforme
- une organisation
- une ecole
- ou ses preferences personnelles

Il ne doit jamais donner l'impression de manipuler des objets de developpeur.

Chaque ecran doit permettre de comprendre immediatement :

- ou l'on agit
- sur quel perimetre l'on agit
- ce que l'on peut modifier
- ce qui est actuellement applique
- ce qui est herite d'un niveau superieur
- ce qui reste hors perimetre

Les etats d'ecran doivent etre definis clairement dans toute future maquette et dans toute implementation :

- chargement
- aucune donnee disponible
- aucune configuration encore enregistree
- acces refuse
- erreur metier comprehensible
- erreur technique reformulee en message utilisateur simple

Les confirmations utilisateur doivent exister au minimum pour :

- la suppression
- le verrouillage
- la reouverture des modifications
- l'application aux niveaux concernes
- l'actualisation d'un parametre sensible

Les messages utilisateur doivent rester courts, rassurants et orientes action.

Exemples attendus :

- `Les modifications ont ete enregistrees.`
- `La configuration a ete verifiee avec succes.`
- `Certaines valeurs necessitent votre attention avant validation.`
- `Cette valeur est heritee d'un niveau superieur et ne peut pas etre modifiee ici.`
- `Cette action n'est pas autorisee pour votre perimetre actuel.`

La question de verification finale reste la suivante :

`Si je montre cette interface a un responsable d'etablissement qui ne connait rien au developpement logiciel, comprendra-t-il immediatement ce que chaque ecran, chaque onglet et chaque action signifient ?`

Si la reponse est non pour un seul terme, ce terme doit etre reformule.

## Regle De Coherence Future

Toute evolution future du module `Configuration` devra respecter simultanement :

- la verite backend
- la hierarchie des portees
- la separation des responsabilites
- la lisibilite metier
- l'interdiction du fourre-tout transverse

## Verdict Doctrinal

Le module `Configuration` est officiellement un centre transverse de gouvernance des parametres existants.

Sa mission n'est pas d'administrer les metiers.

Sa mission est de parametrer proprement, par niveau de portee, les capacites deja portees par les autres modules.

## Statut De Figement

`DOCTRINE CONFIGURATION FIGEE`
