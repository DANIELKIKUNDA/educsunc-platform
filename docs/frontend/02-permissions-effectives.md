# Phase 2 - Permissions Effectives Frontend EduSync

## Statut

Ce document fixe la comprehension officielle des permissions effectives frontend a partir du backend EduSync.

Il ne traite pas encore :

- des pages
- des menus detailles
- des dashboards detailles
- des workflows detailles

Il fixe uniquement :

- les capacites reelles des acteurs
- leurs restrictions
- leur portee effective
- l'effet des policies et du contexte actif
- la difference entre permissions brutes et permissions effectives
- l'impact officiel de la doctrine du titulariat

## Sources Backend Utilisees

Les permissions effectives sont etablies a partir des sources backend suivantes :

- facade d'autorisation : [SecurityFacade.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/application/services/SecurityFacade.ts)
- calcul central des capacites effectives : [SecurityCapacitesEffectivesService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/application/services/SecurityCapacitesEffectivesService.ts)
- lecture des capacites effectives : [CapacitesEffectivesReadModel.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/application/read-models/CapacitesEffectivesReadModel.ts)
- moteur de composition : [MoteurCapacitesEffectives.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/services/MoteurCapacitesEffectives.ts)
- capacites additionnelles du titulariat : [PolicyCapacitesTitulariat.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/policies/PolicyCapacitesTitulariat.ts)
- titulariat effectif par section : [PolicyTitulariatEffectifParSection.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/policies/PolicyTitulariatEffectifParSection.ts)
- role : [Role.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/aggregates/Role.ts)
- restrictions metier : [CodeRestrictionMetier.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/value-objects/CodeRestrictionMetier.ts)
- policies de restrictions :
  - [PolicyRestrictionCaisse.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/policies/PolicyRestrictionCaisse.ts)
  - [PolicyRestrictionBulletin.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/policies/PolicyRestrictionBulletin.ts)
- policies metier :
  - [PolicyPerceptionFrais.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/policies/PolicyPerceptionFrais.ts)
  - [PolicyLectureFinanciere.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/policies/PolicyLectureFinanciere.ts)
  - [PolicyEncodageCotes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/policies/PolicyEncodageCotes.ts)
- portee tenant et scope :
  - [PolicyIsolationTenant.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/policies/PolicyIsolationTenant.ts)
  - [PolicyScopeOrganisation.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/policies/PolicyScopeOrganisation.ts)
  - [PolicyScopeEcole.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/policies/PolicyScopeEcole.ts)
  - [PolicyScopeSection.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/policies/PolicyScopeSection.ts)
- portee de titulariat explicite :
  - [AffectationTitulariat.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/aggregates/AffectationTitulariat.ts)
- verite primaire de responsabilite de classe :
  - [ResponsabiliteClassePedagogique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/ResponsabiliteClassePedagogique.ts)
- fixtures et preuves existantes :
  - [GlobalFixtures.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/fixtures/GlobalFixtures.ts)

## Definition Officielle

### Permission Brute

Une permission brute est une permission portee par un role avant contextualisation.

Exemples :

- `bulletins.read`
- `cotes.write`
- `paiements.read`
- `roles.write`

La permission brute ne suffit pas, a elle seule, a determiner ce que l'acteur peut reellement faire.

### Permission Effective

Une permission effective est une permission reellement mobilisable apres prise en compte de :

- l'identite et l'etat du compte
- l'etat de la session
- l'acteur actif
- l'affectation active
- le contexte actif
- le scope autorise
- le perimetre metier effectivement fourni au backend
- l'isolement tenant
- les restrictions metier
- les policies specialisees
- les acteurs derives eventuels
- les modules effectivement disponibles

Autrement dit :

permission effective =
permission brute
+ compte et session valides
+ acteur actif
+ contexte actif valide
+ scope valide
+ perimetre metier valide
+ affectation valide
+ restrictions respectees
+ policies metier respectees
+ logique d'acteur derive appliquee
+ module effectivement disponible

## Role de `shared/security`

Le backend montre clairement que le calcul reel de capacite depend de plusieurs couches :

- permissions du role
- restrictions du role
- affectations actives
- scopes autorises
- contexte actif
- policies metier specialisees
- titulariat effectif, si applicable

Le frontend ne doit donc jamais raisonner uniquement en mode :

- role brut
- permission brute

Le frontend doit raisonner en mode :

- acteur reel
- contexte courant
- permission effective

## Contrat De Projection Des Capacites Effectives

Le frontend relit une projection serveur unique apres l'ouverture ou la restauration d'une session et apres chaque changement de contexte.

Cette projection est la seule source frontend pour :

- les acteurs disponibles et l'acteur actif
- les permissions effectives
- les scopes
- les restrictions
- le niveau de gouvernance
- l'organisation et l'ecole actives
- l'annee scolaire active
- les modules effectivement disponibles
- les capacites derivees et titulariats effectifs

Le resolver frontend ne copie pas le catalogue des permissions backend dans chaque module. Il relie les codes d'action documentes aux permissions backend existantes dans une politique centralisee, puis applique permission, scope, module, restriction, contexte et capacite derivee.

Une projection absente, invalide ou devenue obsolete produit un refus par defaut. Le frontend n'utilise ni profil fictif, ni wildcard de scope, ni union des permissions de plusieurs roles pour maintenir artificiellement l'interface ouverte.

## Matrice Officielle Attestee

La matrice ci-dessous reprend les acteurs pour lesquels le backend fournit une base suffisamment explicite.

### `ENSEIGNANT`

Permissions effectives de base explicites :

- `cotes.read`
- `cotes.write`
- `bulletins.read`
- `referentiel.read`
- `eleves.read`
- `paiements.read`

Restrictions explicites :

- aucune explicite dans la base lue

Portee reelle :

- ecole active
- uniquement ses cours et classes
- la permission seule ne suffit jamais
- l'autorisation reelle suppose aussi le bon perimetre pedagogique

Effet de policy explicite :

- `cotes.write` est soumise a [PolicyEncodageCotes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/policies/PolicyEncodageCotes.ts)
- l'encodage des cotes est reserve a l'enseignant concerne
- `TITULAIRE` n'obtient pas ici un droit d'encodage distinct
- quand un `TITULAIRE` encode des cotes, il le fait via ses capacites effectives d'`ENSEIGNANT`

### `TITULAIRE`

Origine :

- acteur derive d'`ENSEIGNANT`

Capacites additionnelles officielles du titulariat :

- `bulletins.generate`
- `proclamations.generate`

Le titulaire conserve d'abord toutes les capacites effectives de l'enseignant.

Puis il recoit en plus les capacites additionnelles ci-dessus.

Donc, pour le frontend :

`TITULAIRE`
= capacites effectives `ENSEIGNANT`
+ capacites additionnelles de titulariat

Restrictions explicites :

- aucune explicite propre au titulariat dans la base lue

Portee reelle :

- organisation active
- ecole active
- classe concernee
- annee scolaire concernee
- la permission ne devient reelle que sur la classe titulaire concernee
- pour `PF-05`, une lecture deleguee de l'historique des paiements peut exister seulement si l'ecole l'autorise explicitement
- cette lecture reste limitee a la classe titulaire effective du `TITULAIRE` dans la bonne annee scolaire
- pour `PF-06`, une lecture deleguee de la situation financiere d'un eleve peut exister seulement si l'ecole l'autorise explicitement
- cette lecture reste limitee a la classe titulaire effective du `TITULAIRE` dans la bonne annee scolaire

Source officielle du titulariat effectif :

- `RESPONSABILITE_CLASSE` pour maternelle et primaire
- `AFFECTATION_TITULARIAT` pour secondaire

### `PREFET_ETUDES`

Permissions effectives explicites :

- `bulletins.read`
- `eleves.read`
- `abandons.write`
- `transferts.write`
- `paiements.read`
- `referentiel.read`

Restrictions explicites :

- aucune explicite dans la base lue

Portee reelle :

- ecole active
- section secondaire de l'ecole quand le workflow fournit un perimetre sectionnel
- pas de lecture ecole globale par simple permission seule
- pour `PF-01`, une perception deleguee peut exister seulement si l'ecole l'autorise explicitement par `typeFrais`
- cette delegation reste limitee a la section secondaire du `PREFET_ETUDES`
- `FRAIS_MINERVAL` reste exclu de cette delegation
- pour `PF-05`, une lecture deleguee de l'historique des paiements peut exister seulement si l'ecole l'autorise explicitement
- cette lecture reste limitee a la section secondaire du `PREFET_ETUDES`
- pour `PF-06`, une lecture deleguee de la situation financiere d'un eleve peut exister seulement si l'ecole l'autorise explicitement
- cette lecture reste limitee a la section secondaire du `PREFET_ETUDES`
- pour `PF-07`, une annulation deleguee d'un paiement peut exister seulement si l'ecole l'autorise explicitement pour ce `typeFrais`
- cette annulation reste limitee a la section secondaire du `PREFET_ETUDES`
- pour `PF-08`, une restitution deleguee d'un paiement peut exister seulement si l'ecole l'autorise explicitement pour ce `typeFrais`
- cette restitution reste limitee a la section secondaire du `PREFET_ETUDES`
- `FRAIS_MINERVAL` reste exclu de cette delegation

### `DIRECTEUR_ETUDES`

Permissions effectives explicites :

- `bulletins.read`
- `eleves.read`
- `paiements.read`

Restrictions explicites :

- `INTERDICTION_CAISSE`

Portee reelle :

- ecole active
- section secondaire de l'ecole quand le workflow fournit un perimetre sectionnel
- pas de lecture ecole globale par simple permission seule
- pour `PF-05`, une lecture deleguee de l'historique des paiements peut exister seulement si l'ecole l'autorise explicitement
- cette lecture reste limitee a la section secondaire du `DIRECTEUR_ETUDES`
- pour `PF-06`, une lecture deleguee de la situation financiere d'un eleve peut exister seulement si l'ecole l'autorise explicitement
- cette lecture reste limitee a la section secondaire du `DIRECTEUR_ETUDES`

### `DIRECTEUR_DISCIPLINE`

Permissions effectives explicites :

- `eleves.read`
- `convocations.send`
- `paiements.read`
- `cotes.write`

Restrictions explicites :

- `INTERDICTION_CAISSE`

Portee reelle :

- ecole active
- section secondaire de l'ecole quand le workflow fournit un perimetre sectionnel
- perimetre discipline correspondant

Lecture doctrinale importante :

- la presence de `cotes.write` ne fait pas du `DIRECTEUR_DISCIPLINE` un encodeur generique de cotes
- en l'etat du backend reel, cette permission est exploitee pedagogiquement pour `PED-07 - Encoder la conduite`
- l'autorisation reste soumise a :
  - meme ecole
  - meme section
  - jamais hors section

### `CAISSIER`

Permissions effectives explicites :

- `paiements.write`
- `paiements.read`
- `caisse.write`
- `caisse.read`

Restrictions explicites :

- `INTERDICTION_BULLETINS`
- `INTERDICTION_TRANSFERT`
- `INTERDICTION_ABANDON`

Portee reelle :

- ecole active
- perimetre caisse et paiements
- pour `PF-01`, le `CAISSIER` reste l'acteur naturel de perception sur toute l'ecole
- pour les workflows de caisse reels, le backend reapplique localement :
  - `caisse.write` pour l'ouverture et la cloture
  - `caisse.read` pour la consultation
- pour `PF-05`, le backend reapplique localement `paiements.read` pour la consultation de l'historique des paiements d'un eleve dans la meme ecole
- pour `PF-06`, le backend reapplique localement `paiements.read` pour la consultation de la situation financiere d'un eleve dans la meme ecole
- pour `PF-07`, le backend reapplique maintenant localement l'autorisation reelle d'annulation de paiement dans la meme ecole
- pour `PF-08`, le backend reapplique maintenant localement l'autorisation reelle de restitution de paiement dans la meme ecole
- pour `PF-09`, le backend reapplique `paiements.read` mais reserve la reimpression d'un recu au seul `CAISSIER` actif de la meme ecole
- pour `PF-19`, le backend reapplique `paiements.read` mais reserve aussi la consultation et la recherche des recus au seul `CAISSIER` actif de la meme ecole
- pour `PF-10`, le backend autorise le `CAISSIER` a gerer sa propre signature documentaire de recu dans son ecole
- pour `PF-11`, le backend reapplique `paiements.read` pour la consultation du rapport financier journalier
- pour `PF-12`, le backend reapplique `paiements.read` pour la consultation des paiements agregees par caissier
- pour `PF-13`, le backend reapplique `paiements.read` pour la consultation des paiements agregees par type de frais
- pour `PF-14`, le backend reapplique `paiements.read` pour la consultation des fonds anticipes
- pour `PF-15`, le backend reapplique `paiements.read` pour la consultation des arrieres d'un eleve
- pour `PF-AG`, le backend reapplique maintenant `paiements.write` pour activer ou desactiver une qualification financiere eleve comme `ENFANT_AGENT` dans sa propre ecole
- pour `PF-AG`, le backend reapplique maintenant `paiements.read` pour relire les qualifications financieres d'un eleve dans sa propre ecole
- pour `AUD-02`, le backend reapplique maintenant `audit.finance.read` pour la consultation de l'audit administratif et financier de sa propre ecole
- les frais mensuels `FRAIS_MINERVAL` restent reserves a ce canal naturel ou a un `ADMINISTRATEUR_ECOLE` deja porteur de `paiements.write`

### `ADMINISTRATEUR_ECOLE`

Permissions effectives explicites :

- `cotes.write`
- `bulletins.generate`
- `proclamations.generate`
- `paiements.write`
- `caisse.write`
- `referentiel.write`
- `abandons.write`
- `transferts.write`
- `utilisateurs.write`
- `bulletins.read`
- `paiements.read`
- `referentiel.read`
- `eleves.read`
- `eleves.write`
- `utilisateurs.read`
- `roles.read`
- `roles.write`
- `permissions.read`
- `permissions.write`
- `caisse.read`

Restrictions explicites :

- aucune explicite dans la base lue

Portee reelle :

- ecole active
- administration complete d'ecole
- sur `PF-01`, cette capacite ecole globale ne transforme pas les acteurs pedagogiques en caissiers
- elle laisse seulement l'`ADMINISTRATEUR_ECOLE` dans sa portee ecole deja couverte par `paiements.write`
- sur les workflows de caisse reels deja figes :
  - elle ne transforme pas l'`ADMINISTRATEUR_ECOLE` en acteur local positif d'ouverture ou de cloture de caisse
  - elle autorise maintenant la consultation de la caisse du jour dans sa propre ecole
- pour `PF-05`, elle autorise aussi la consultation de l'historique des paiements d'un eleve dans sa propre ecole
- pour `PF-06`, elle autorise aussi la consultation de la situation financiere d'un eleve dans sa propre ecole
- pour `PF-07`, elle autorise aussi l'annulation d'un paiement dans sa propre ecole
- pour `PF-08`, elle autorise aussi la restitution d'un paiement dans sa propre ecole
- pour `PF-09`, elle ne suffit pas : la reimpression d'un recu reste reservee au seul `CAISSIER` actif de l'ecole
- pour `PF-19`, elle ne suffit pas : la consultation des recus reste reservee au seul `CAISSIER` actif de l'ecole
- pour `PF-11`, elle autorise aussi la consultation du rapport financier journalier dans sa propre ecole
- pour `PF-12`, elle autorise aussi la consultation des paiements par caissier dans sa propre ecole
- pour `PF-13`, elle autorise aussi la consultation des paiements par type de frais dans sa propre ecole
- pour `PF-18`, elle autorise aussi la gestion des exonerations dans sa propre ecole
- pour `PF-AG`, elle autorise aussi la gestion et la lecture des qualifications financieres d'un eleve dans sa propre ecole
- pour `AUD-02`, elle autorise aussi la consultation de l'audit administratif et financier dans sa propre ecole

Note doctrinale importante pour PED-02 :

- la presence de `cotes.write` dans les fixtures de securite ne suffit pas, a elle seule, a retenir `ADMINISTRATEUR_ECOLE` comme acteur metier d'encodage des cotes
- en l'etat du backend audite, `ADMINISTRATEUR_ECOLE` ne doit pas etre retenu comme acteur principal de PED-02 sans preuve d'execution pedagogique explicite supplementaire

### `GESTIONNAIRE_ORGANISATION`

Permissions effectives explicites :

- `referentiel.read`
- `eleves.read`
- `paiements.read`
- `utilisateurs.read`

Restrictions explicites :

- aucune explicite dans la base lue

Portee reelle :

- organisation active
- supervision transversale des ecoles de l'organisation
- pour `PF-04`, cette portee ouvre maintenant la consultation de la caisse du jour des ecoles de l'organisation
- pour `PF-05`, cette portee ouvre maintenant la consultation de l'historique des paiements d'un eleve dans les ecoles de l'organisation
- pour `PF-06`, cette portee ouvre maintenant la consultation de la situation financiere d'un eleve dans les ecoles de l'organisation
- pour `PF-18`, cette portee ouvre maintenant la gestion des exonerations dans les ecoles de l'organisation
- pour `PF-AG`, cette portee ouvre maintenant la lecture des qualifications financieres eleve dans les ecoles de l'organisation

### `PROMOTEUR_ORGANISATION`

Permissions effectives explicites :

- `referentiel.read`
- `eleves.read`
- `paiements.read`
- `utilisateurs.read`

Restrictions explicites :

- aucune explicite dans la base lue

Portee reelle :

- organisation active
- pour `PF-04`, cette portee ouvre maintenant la consultation de la caisse du jour des ecoles de l'organisation
- pour `PF-05`, cette portee ouvre maintenant la consultation de l'historique des paiements d'un eleve dans les ecoles de l'organisation
- pour `PF-06`, cette portee ouvre maintenant la consultation de la situation financiere d'un eleve dans les ecoles de l'organisation
- pour `PF-18`, cette portee ouvre maintenant la gestion des exonerations dans les ecoles de l'organisation
- pour `PF-AG`, cette portee ouvre maintenant la lecture des qualifications financieres eleve dans les ecoles de l'organisation

### `SECRETAIRE`

Permissions effectives explicites :

- `eleves.read`
- `paiements.read`

Restrictions explicites :

- `INTERDICTION_CAISSE`

Portee reelle :

- ecole active
- aucune capacite financiere d'ecriture globale n'est portee par ce role
- pour `PF-18`, une gestion delegatee des exonerations peut exister seulement si l'ecole l'autorise explicitement
- cette delegation reste limitee a la meme ecole
- sans ce parametrage local, `SECRETAIRE` reste refuse

### `PARENT`

Permissions effectives explicites :

- `bulletins.read`
- `paiements.read`
- `eleves.read`
- `notifications.send`

Restrictions explicites :

- `INTERDICTION_CAISSE`

Portee reelle :

- ecole active
- uniquement ses enfants autorises

Point de verite backend actuel :

- la doctrine `PARENT -> ses enfants autorises` est maintenant effectivement portee par le backend
- pour la lecture des bulletins et de leur historique, le parent n'accede qu'aux eleves rattaches a son `idUtilisateurAuth` dans les responsables de famille
- pour `PF-05`, le parent n'accede qu'aux eleves rattaches a son `idUtilisateurAuth` dans les responsables de famille
- pour `PF-06`, le parent n'accede qu'a la situation financiere des eleves rattaches a son `idUtilisateurAuth` dans les responsables de famille

### `ADMIN_SYSTEME_ECOLE`

Permissions effectives explicites :

- `referentiel.write`
- `referentiel.read`
- `utilisateurs.write`
- `utilisateurs.read`
- `audit.technical.read`
- `notifications.create`
- `notifications.read`
- `notifications.timeline.read`
- `notifications.acknowledge`
- `notifications.escalate`
- `notifications.retry.execute`
- `notifications.retry.read`
- `notifications.replay.execute`
- `notifications.replay.read`
- `notifications.monitoring.read`
- `notifications.dead-letter.read`

Restrictions explicites :

- pour l'identite documentaire officielle des recus, l'acteur systeme positif est `ADMIN_SYSTEME_ECOLE` et non `ADMINISTRATEUR_ECOLE`
- pour `PF-10`, cette portee couvre la gestion du logo et du cachet documentaires des recus dans son propre perimetre `organisation + ecole`
- pour `PF-16`, cette portee couvre aussi la consultation et la configuration des parametres actifs de paiement de son ecole
- pour `PF-17`, cette portee couvre aussi la consultation et la gestion des grilles de tarification de son ecole et de son annee scolaire
- pour `AUD-03`, cette portee couvre la lecture de l'audit technique local de son ecole
- pour `NOTIF-01`, cette portee couvre l'administration technique locale des notifications de son ecole
- les notifications automatiques issues de `paiements-facturation`, `scolarite-eleves` et `bulletins-evaluations` remontent maintenant dans ce meme perimetre via la runtime Notifications partagee
- cette portee couvre le logo et le cachet documentaires de l'ecole dans son propre perimetre `organisation + ecole`
- elle ne transforme pas `ADMIN_SYSTEME_ECOLE` en percepteur de paiement
- la signature documentaire d'un recu n'appartient pas a ce role par defaut : elle reste reservee au percepteur reel autorise qui enregistre effectivement l'operation

### `GESTIONNAIRE_ORGANISATION`

Permissions effectives explicites :

- `paiements.read`
- `notifications.admin.archives.read`
- `notifications.admin.tenant.read`
- `notifications.admin.escalation.read`
- `notifications.realtime.read`

Restrictions explicites :

- pour `PF-11`, cette portee organisation autorise la consultation du rapport financier journalier des ecoles de son organisation
- pour `PF-12`, cette portee organisation autorise la consultation des paiements par caissier des ecoles de son organisation
- pour `PF-13`, cette portee organisation autorise la consultation des paiements par type de frais des ecoles de son organisation
- pour `PF-14`, cette portee organisation autorise la consultation des fonds anticipes des ecoles de son organisation
- pour `PF-15`, cette portee organisation autorise la consultation des arrieres d'un eleve dans les ecoles de son organisation
- pour `NOTIF-02`, cette portee organisation autorise la lecture consolidee et temps reel des notifications de son organisation

### `PROMOTEUR_ORGANISATION`

Permissions effectives explicites :

- `paiements.read`
- `notifications.admin.archives.read`
- `notifications.admin.tenant.read`
- `notifications.admin.escalation.read`
- `notifications.realtime.read`
- `notifications.realtime.publish`

Restrictions explicites :

- pour `PF-11`, cette portee organisation autorise la consultation du rapport financier journalier des ecoles de son organisation
- pour `PF-12`, cette portee organisation autorise la consultation des paiements par caissier des ecoles de son organisation
- pour `PF-13`, cette portee organisation autorise la consultation des paiements par type de frais des ecoles de son organisation
- pour `PF-14`, cette portee organisation autorise la consultation des fonds anticipes des ecoles de son organisation
- pour `PF-15`, cette portee organisation autorise la consultation des arrieres d'un eleve dans les ecoles de son organisation
- pour `NOTIF-02`, cette portee organisation autorise la supervision globale des notifications de son organisation

- pour `PF-13`, les acteurs pedagogiques `TITULAIRE`, `PREFET_ETUDES`, `DIRECTEUR_ETUDES`, `DIRECTEUR_PRIMAIRE` et `DIRECTEUR_MATERNELLE` ne lisent ce bloc que si l'ecole les autorise explicitement
- pour `PF-13`, cette delegation pedagogique ne donne jamais une vue globale ecole : elle se reduit a la classe titulaire effective ou a la section reelle de l'acteur
- pour `PF-14`, ces memes acteurs pedagogiques ne lisent les fonds anticipes que si l'ecole les autorise explicitement
- pour `PF-14`, la lecture pedagogique est reduite aux eleves visibles de leur perimetre reel
- pour `PF-15`, ces memes acteurs pedagogiques ne lisent les arrieres d'un eleve que si l'ecole les autorise explicitement
- pour `PF-15`, cette lecture reste bornee a l'eleve effectivement visible dans leur perimetre reel
- pour `VF-01`, `CAISSIER` et `ADMINISTRATEUR_ECOLE` lisent le registre financier de classe dans leur propre ecole
- pour `VF-01`, `GESTIONNAIRE_ORGANISATION` et `PROMOTEUR_ORGANISATION` lisent le registre financier de classe dans les ecoles de leur organisation
- pour `VF-01`, `TITULAIRE` ne lit le registre que sur sa classe titulaire effective et sa propre annee scolaire
- pour `VF-01`, `PREFET_ETUDES`, `DIRECTEUR_ETUDES`, `DIRECTEUR_PRIMAIRE` et `DIRECTEUR_MATERNELLE` ne lisent ce registre que si l'ecole les autorise explicitement
- pour `VF-01`, cette delegation pedagogique ne donne jamais une vue globale ecole : elle reste bornee a la section reelle de l'acteur et refuse explicitement une autre classe
- `utilisateurs.write`
- `utilisateurs.read`

Restrictions explicites :

- aucune explicite dans la base lue

Portee reelle :

- ecole active
- administration systeme locale d'ecole

## Doctrine Officielle du Titulariat et Impact Permissionnel

La doctrine du titulariat impacte directement les permissions effectives frontend.

### Regle 1

`TITULAIRE` n'est pas un role brut.

### Regle 2

Le titulaire garde toujours toutes les capacites effectives d'`ENSEIGNANT`.

### Regle 3

Le titulaire recoit ensuite uniquement les capacites additionnelles de titulariat :

- `bulletins.generate`
- `proclamations.generate`

### Regle 4

Le backend calcule maintenant aussi la source du titulariat effectif :

- `AUCUNE`
- `AFFECTATION_TITULARIAT`
- `RESPONSABILITE_CLASSE`

### Regle 5

Le frontend ne doit pas recalculer cette source lui-meme.

Il doit la consommer si elle est exposee dans les contrats utiles.

## Derivation Officielle du Titulariat

### Maternelle

Le titulariat effectif vient de la responsabilite de classe pedagogique.

Condition :

- enseignant responsable de la classe
- section maternelle
- bonne organisation
- bonne ecole
- bonne classe
- bonne annee scolaire

### Primaire

Le titulariat effectif vient de la responsabilite de classe pedagogique.

Condition :

- enseignant responsable de la classe
- section primaire
- bonne organisation
- bonne ecole
- bonne classe
- bonne annee scolaire

### Secondaire

Le titulariat effectif vient de la combinaison :

- responsabilite de classe pedagogique valide
- affectation explicite de titulariat active et scoped

Condition :

- enseignant responsable de la classe
- affectation de titulariat active et scoped
- bonne organisation
- bonne ecole
- bonne classe
- bonne annee scolaire

## Restrictions Metier Officielles

Les restrictions metier officielles presentes dans le backend sont :

- `INTERDICTION_CAISSE`
- `INTERDICTION_BULLETINS`
- `INTERDICTION_FINANCES`
- `INTERDICTION_MODIFICATION_COTES`
- `INTERDICTION_TRANSFERT`
- `INTERDICTION_ABANDON`

Source :

- [CodeRestrictionMetier.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/value-objects/CodeRestrictionMetier.ts)

## Impact des Policies

### 1. Policies de Scope

Les permissions effectives dependent du scope autorise.

Le backend sait maintenant verifier :

- l'organisation autorisee
- l'ecole autorisee
- la section autorisee quand le workflow la fournit explicitement

Une permission brute peut donc devenir non effective si :

- l'organisation n'est pas autorisee
- l'ecole n'est pas autorisee
- la section fournie n'est pas autorisee

Point de lecture important :

- `shared/security` ne peut verifier un perimetre plus fin que si le workflow consommateur le fournit vraiment
- autrement dit :
  - permission seule = insuffisante
  - permission + perimetre metier fourni = autorisation reelle

Point de transport technique maintenant fige dans le BC pedagogique :

- le frontend ne doit pas compter sur un contexte implicite ou de secours
- les headers de contexte attendus doivent etre reellement presents quand le workflow les exige, en particulier :
  - `x-user-id`
  - `x-tenant-id`
- le backend pedagogique ne fabrique plus de faux contexte `SYSTEME` ou `ECOLE_INCONNUE` pour laisser passer une requete incomplete
- une requete sans ces informations doit maintenant echouer explicitement

### 2. Policy d'Isolation Tenant

Le contexte actif doit rester coherent :

- une ecole active exige une organisation active
- l'ecole active doit appartenir a l'organisation active

Sinon la permission devient inoperante.

### 3. Policy d'Encodage des Cotes

`cotes.write` n'est pas librement activable par tout acteur qui la porte.

Le backend impose explicitement :

- role `ENSEIGNANT`
- enseignant concerne par le cours

### 4. Policy de Titulariat Effectif Par Section

Le backend determine maintenant si une responsabilite de classe ouvre ou non le titulariat effectif selon la section.

Cela signifie :

- maternelle et primaire : auto-titulariat effectif via responsabilite de classe
- secondaire : pas d'auto-titulariat via section

### 5. Policies de Restrictions

Une permission brute portee par un acteur n'est pas forcement utilisable.

Les restrictions peuvent la rendre non effective.

## Portee Reelle

Le backend montre que la portee reelle d'un acteur depend au minimum de :

- ses affectations actives
- son niveau d'acces
- son organisation active
- son ecole active
- ses scopes autorises
- ses restrictions
- ses eventuelles derivations metier

La portee reelle n'est jamais reduite a :

- "ce role existe"

## Permissions Attestees Versus Permissions Potentielles

Il faut distinguer deux choses :

### Permissions Attestees

Ce sont les permissions explicitement reliees a des acteurs et suffisamment materialisees dans les sources backend lues.

### Permissions Potentielles

Pour certains roles officiels presents dans `CodeRole`, aucune matrice explicite complete n'a ete fixee ici.

On ne doit donc pas leur attribuer de capacites detaillees sans source backend plus explicite.

Cela concerne notamment :

- `ADMIN_SYSTEME_ORGANISATION`
- `GESTIONNAIRE_ORGANISATION`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`
- `COMPTABLE`

## Exception Attestee Pour ACA-08

Une matrice locale explicite est maintenant materialisee pour le workflow `ACA-08` du BC referentiel academique.

Acteurs systeme attestes :

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

Permissions effectives attestees :

- `referentiel.read`
  - consultation du socle academique officiel :
    - `SectionScolaire`
    - `ClasseAcademique`
    - `OptionEtude`
- `referentiel.write`
  - administration du socle academique officiel :
    - creation de `SectionScolaire`
    - creation de `ClasseAcademique`
    - creation de `OptionEtude`

Perimetre reel :

- niveau plateforme / systeme
- pas un scope ecole local
- pas un workflow d'exploitation locale de `ClassePedagogique`

La meme matrice locale est maintenant reappliquee pour `ACA-09` :

- lecture des migrations de referentiel : `referentiel.read`
- mutation des migrations de referentiel : `referentiel.write`
- acteurs systeme reels :
  - `MANAGER_SYSTEME`
  - `OPERATEUR_SYSTEME`
  - `SUPPORT_SYSTEME`

La meme logique de plateforme explicite est maintenant materialisee pour `PLT-01` et `PLT-02` :

- publication officielle de version de referentiel : `referentiel.write`
  - `MANAGER_SYSTEME`
  - `OPERATEUR_SYSTEME` seulement si `EDUCSYN_PLT01_ALLOW_OPERATEUR_SYSTEME=true`
- activation officielle de version de referentiel : `referentiel.write`
  - `MANAGER_SYSTEME`
  - `OPERATEUR_SYSTEME` seulement si `EDUCSYN_PLT02_ALLOW_OPERATEUR_SYSTEME=true`

Perimetre reel :

- niveau plateforme / systeme
- jamais un scope ecole
- jamais un scope organisation
- `SUPPORT_SYSTEME`, `ADMIN_SYSTEME_ECOLE` et `ADMINISTRATEUR_ECOLE` restent refuses

La meme logique de plateforme explicite est maintenant materialisee pour `PLT-03` :

- import officiel de referentiel : `referentiel.write`
  - `MANAGER_SYSTEME`
  - `OPERATEUR_SYSTEME` seulement si `EDUCSYN_PLT03_ALLOW_OPERATEUR_SYSTEME=true`

Perimetre reel :

- niveau plateforme / systeme
- jamais un scope ecole
- jamais un scope organisation
- `SUPPORT_SYSTEME`, `ADMIN_SYSTEME_ECOLE` et `ADMINISTRATEUR_ECOLE` restent refuses

La meme logique de plateforme explicite est maintenant materialisee pour `PLT-04` :

- comparaison officielle de versions de referentiel : `referentiel.read`
  - `MANAGER_SYSTEME`
  - `OPERATEUR_SYSTEME` seulement si `EDUCSYN_PLT04_ALLOW_OPERATEUR_SYSTEME=true`

Perimetre reel :

- niveau plateforme / systeme
- jamais un scope ecole
- jamais un scope organisation
- `SUPPORT_SYSTEME`, `ADMIN_SYSTEME_ECOLE` et `ADMINISTRATEUR_ECOLE` restent refuses

La meme logique de plateforme explicite est maintenant materialisee pour `PLT-05` :

- lecture officielle des referentiels : `referentiel.read`
  - `MANAGER_SYSTEME`
  - `OPERATEUR_SYSTEME` seulement si `EDUCSYN_PLT05_ALLOW_OPERATEUR_SYSTEME=true`

Perimetre reel :

- niveau plateforme / systeme
- jamais un scope ecole
- jamais un scope organisation
- `SUPPORT_SYSTEME`, `ADMIN_SYSTEME_ECOLE` et `ADMINISTRATEUR_ECOLE` restent refuses

## Exception Transverse Attestee Pour `SHD-AUTH-01`

Le workflow transverse `SHD-AUTH-01` ne suit pas la logique habituelle :

- permission metier brute
- puis scope metier

Point de verite backend :

- l'ouverture de session AUTH repose d'abord sur :
  - compte actif
  - mot de passe valide
  - scopes SECURITY compatibles avec l'organisation et l'ecole actives demandees
- il n'exige pas une permission metier locale comme `bulletins.read` ou `paiements.write`

Portee reelle :

- tout acteur authentifiable peut ouvrir sa propre session
- seulement dans une organisation et une ecole compatibles avec ses scopes SECURITY
- `GET /api/auth/session` et `GET /api/auth/contexte` restent ensuite bornes a sa propre session et a son propre contexte actif
- `POST /api/auth/revoquer-toutes-sessions` ne revoque que les sessions du meme utilisateur authentifie

Lecture doctrinale importante :

- `SHD-AUTH-01` est un workflow transverse d'identite et de contexte
- il ne remplace pas la doctrine officielle `permission + perimetre` des workflows metier
- il la prepare en etablissant un contexte actif coherent avant les autres BC

## Exception Transverse Attestee Pour `SHD-AUD-01`

Le premier workflow reel de `shared/audit` maintenant fige est :

- consultation de l'audit plateforme global

Permissions effectives attestees :

- `audit.read`
  - lecture de `GET /api/v1/audit`
  - lecture de `GET /api/v1/audit/:id`
- `audit.timeline.read`
  - lecture de `GET /api/v1/audit/timeline`
- `audit.history.read`
  - lecture de `GET /api/v1/audit/history`

Acteurs reels actuellement attestes :

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

Perimetre reel :

- la permission seule reste insuffisante
- les routes imposent un scope `PLATEFORME`
- aucune organisation ni ecole active n'est exigee pour cette lecture globale
- les acteurs positifs prouves restent des acteurs plateforme
- ce workflow ne constitue donc pas encore un audit metier ecole
- `ADMINISTRATEUR_ECOLE` n'herite pas implicitement de ce workflow et reste refuse sans permissions `audit.*`

Lecture doctrinale importante :

- `SHD-AUD-01` respecte bien la doctrine officielle `permission + perimetre`
- ici le perimetre concret porte par le backend est :
  - permission `audit.*`
  - plus scope `PLATEFORME` compatible dans le contexte SECURITY
- le BC `shared/audit` doit etre relu comme une famille de workflows distincts :
  - audit organisationnel
  - audit administratif et financier ecole
  - audit technique ecole
  - audit pedagogique
  - audit disciplinaire
  - audit plateforme
- `SHD-AUD-01` prouve la famille audit plateforme globale, sans dependance artificielle a une ecole

Correspondance officielle :

- `AUD-06` de la famille audit correspond ici a `SHD-AUD-01`
- il n'existe pas, en l'etat du backend audite, un second workflow plateforme distinct a figer derriere cette meme surface `GET /api/v1/audit*`

## Exception Transverse Attestee Pour `shared/monitoring`

Le bloc transverse plateforme maintenant prouve est :

- supervision Monitoring plateforme

Acteurs reels actuellement attestes :

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME` pour les seules lectures Monitoring

Permissions effectives attestees :

- lectures :
  - `monitoring.read`
  - `monitoring.dashboard.read`
  - `monitoring.observability.read`
  - `monitoring.health.read`
  - `monitoring.health.snapshot.read`
  - `monitoring.incidents.read`
  - `monitoring.alerts.read`
  - `monitoring.diagnostics.read`
  - `monitoring.capacity.read`
  - `monitoring.traces.read`
- mutations :
  - `monitoring.incidents.create`
  - `monitoring.incidents.escalate`
  - `monitoring.alerts.create`
  - `monitoring.alerts.resolve`
  - `monitoring.diagnostics.create`
  - `monitoring.capacity.calculate`
  - `monitoring.saturation.calculate`
  - `monitoring.traces.create`

Perimetre reel :

- niveau plateforme / systeme
- jamais un scope ecole
- jamais un scope organisation
- le backend projette le scope route `SYSTEM` sur une portee SECURITY `PLATEFORME`

Lecture doctrinale importante :

- `shared/monitoring` ne doit pas etre confondu avec `shared/audit`
- les lectures Monitoring globales ne doivent pas etre reetiquetees comme audit organisationnel ou audit ecole
- `SUPPORT_SYSTEME` est positif sur les lectures Monitoring, mais pas sur les mutations Monitoring actuellement prouvees

## Exception Transverse Attestee Pour `AUD-01`

Le premier workflow d'audit metier maintenant prouve au niveau organisationnel est :

- consultation de l'audit organisationnel

Permissions effectives attestees :

- `audit.monitoring.read`
  - lecture de `GET /api/v1/monitoring/health`
  - plus largement lecture des routes `monitoring/*` bornees a `ORGANISATION`
- `audit.analytics.read`
  - lecture de `GET /api/v1/analytics/audit`
  - plus largement lecture des routes `analytics/*` bornees a `ORGANISATION`
- `audit.security.read`
  - lecture de `GET /api/v1/security/incidents/:id`
  - plus largement lecture des routes `security/*` bornees a `ORGANISATION`

Acteurs reels actuellement attestes :

- `PROMOTEUR_ORGANISATION`
- `GESTIONNAIRE_ORGANISATION`

Perimetre reel :

- la permission seule reste insuffisante
- les routes imposees par `AUD-01` sont bornees a un scope `ORGANISATION`
- la lecture est donc limitee aux ecoles de l'organisation active dans le contexte securise
- aucune ecole active n'est exigee pour ouvrir cette synthese organisationnelle
- `ADMINISTRATEUR_ECOLE` reste refuse en l'etat sur ces routes organisationnelles

Lecture doctrinale importante :

- `AUD-01` materialise un audit organisationnel
- il ne doit pas etre confondu avec :
  - l'audit plateforme
  - l'audit administratif et financier ecole
  - l'audit pedagogique
  - l'audit disciplinaire

## Exception Transverse Attestee Pour `AUD-02`

Le workflow transverse ecole maintenant prouve est :

- consultation de l'audit administratif et financier ecole

Permissions effectives attestees :

- `audit.finance.read`
  - lecture de `GET /api/v1/ecole/audit/administratif-financier`
  - lecture de `GET /api/v1/ecole/audit/administratif-financier/history`
  - lecture de `GET /api/v1/ecole/audit/administratif-financier/timeline`

Acteurs reels actuellement attestes :

- `ADMINISTRATEUR_ECOLE`
- `CAISSIER`

Perimetre reel :

- la permission seule reste insuffisante
- les routes imposees par `AUD-02` sont bornees a un scope `ECOLE`
- le backend force en plus la famille `categorieAudit=FINANCIER`
- le frontend affiche l'entree au `CAISSIER` lorsque `audit.finance.read`, le scope de son ecole, le module Audit et les restrictions effectives sont satisfaits
- `DIRECTEUR_ETUDES` reste refuse en l'etat

Lecture doctrinale importante :

- `AUD-02` materialise un audit ecole local administratif et financier
- il ne doit pas etre confondu avec :
  - l'audit organisationnel
  - l'audit plateforme
  - l'audit pedagogique
  - l'audit disciplinaire

## Exception Transverse Attestee Pour `AUD-03`

Le workflow transverse ecole maintenant prouve est :

- consultation de l'audit technique ecole

Permissions effectives attestees :

- `audit.technical.read`
  - lecture de `GET /api/v1/ecole/audit/technique/traces`
  - lecture de `GET /api/v1/ecole/audit/technique/metrics`

Acteur reel actuellement atteste :

- `ADMIN_SYSTEME_ECOLE`

Perimetre reel :

- la permission seule reste insuffisante
- les routes imposees par `AUD-03` sont bornees a un scope `ECOLE`
- les donnees exposees sont limitees aux traces et metriques techniques de l'ecole active
- `ADMINISTRATEUR_ECOLE` reste refuse en l'etat

## Exception Transverse Attestee Pour `AUD-04`

Le workflow transverse ecole maintenant prouve est :

- consultation de l'audit pedagogique

Permissions effectives attestees :

- `bulletins.read`
  - lecture de `GET /api/audit/cotes`
  - lecture de `GET /api/audit/conduite`
  - lecture de `GET /api/audit/bulletins`
  - lecture de `GET /api/audit/classements`
- pour la lecture d'audit de conduite, la voie locale `cotes.write` deja exploitee par `PED-07` reste aussi mobilisable pour `DIRECTEUR_DISCIPLINE`

Acteurs reels actuellement attestes :

- `TITULAIRE`
- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_DISCIPLINE`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`
- `ADMINISTRATEUR_ECOLE`
- `PROMOTEUR_ORGANISATION`

Perimetre reel :

- la permission seule reste insuffisante
- les routes `cotes`, `conduite` et `bulletins` resolvent maintenant `idEcole + idClassePedagogique + idAnneeScolaire` depuis l'objet metier demande
- la route `classements` reapplique `idEcole + idClassePedagogique + idAnneeScolaire`
- un `ENSEIGNANT` simple non titulaire n'est pas positif sur cette lecture
- `DIRECTEUR_DISCIPLINE` reste borne a sa section pour la voie conduite

Lecture doctrinale importante :

- `AUD-04` materialise maintenant un audit pedagogique local reel
- il ne doit pas etre confondu avec :
  - l'audit plateforme
  - l'audit organisationnel
  - l'audit administratif et financier ecole
  - l'audit disciplinaire

Lecture doctrinale importante :

- `AUD-03` materialise un audit technique local d'ecole
- le backend ne l'ouvre pas comme un monitoring global plateforme
- les endpoints `monitoring/health`, `monitoring/queues` ou `monitoring/volumetrie` globaux ne doivent pas etre reetiquetes comme `AUD-03`

## Exception Transverse Attestee Pour `shared/configuration`

Le premier bloc transverse Configuration maintenant prouve est :

- gouvernance modulaire `organisation + ecole`
- resolution effective des modules actifs d'une ecole
- blocage runtime d'un module inactif avant execution d'un BC

Permissions effectives attestees :

- lecture :
  - `configuration.modules.read`
- mutation organisation :
  - `configuration.modules.organization.write`
- mutation ecole :
  - `configuration.modules.school.write`

Acteurs reels actuellement attestes :

- `PROMOTEUR_ORGANISATION`
- `ADMIN_SYSTEME_ORGANISATION`
- `GESTIONNAIRE_ORGANISATION` pour la lecture
- `ADMIN_SYSTEME_ECOLE`
- `ADMINISTRATEUR_ECOLE`

Perimetre reel :

- la permission seule reste insuffisante
- `modules.allowed` est maintenant borne a `ORGANISATION`
- `modules.enabled` est maintenant borne a `ECOLE`
- la resolution effective recalcule `organisation autorisee + ecole active`
- le blocage runtime reapplique ensuite cette resolution sur les routes globales des modules actives

Lecture doctrinale importante :

- `shared/configuration` ne doit pas etre fige comme un simple bloc `SYSTEM`
- le premier noyau commercial prouve se lit maintenant en trois couches :
  - autorisation organisationnelle
  - activation ecole
  - verification runtime `module actif`
- les routes generiques `configuration/*` ne sont plus bornees a un faux `SYSTEM` global
- elles reappliquent maintenant la portee reelle de la configuration cible :
  - `ORGANISATION` pour les acteurs organisationnels attestes
  - `ECOLE` pour les acteurs ecole attestes
  - `USER` pour un acteur sur sa propre configuration ou via sa hierarchie autorisee
- une ecole peut surcharger une configuration heritee vers sa propre portee, mais ne peut pas muter directement une configuration `SYSTEM`
- `NOTIFICATIONS`, `AUDIT` et `MONITORING` font partie des modules activables au meme titre que les BC metier
- l'absence ou l'invalidite de `modules.allowed` n'autorise aucun module implicitement
- la creation d'une organisation initialise explicitement son catalogue autorise afin de conserver un parcours d'onboarding utilisable sans introduire de comportement fail-open
- l'absence de `modules.enabled` n'active jamais automatiquement les modules d'une ecole
- les routes brutes `shared/security` exposees sous `/api/v1/security/*` sont maintenant bornees a `PLATEFORME / SYSTEME`
- le contexte actif officiel continue de rester porte par `AUTH`
- les BC metier ecole et organisation consomment `shared/security` indirectement via leurs propres adaptateurs locaux, pas via la raw API plateforme

## Consequence Frontend Officielle

Le frontend devra toujours raisonner en termes de :

- capacites effectives
- restrictions effectives
- portee reelle
- contexte actif
- actor derivation deja decidee par le backend
- transport explicite du contexte de securite attendu
- modules effectivement disponibles
- acteur actif sans union des permissions de ses autres roles

Et jamais en termes de :

- simple role brut
- simple permission brute
- simple deduction locale de titulariat
- contexte HTTP suppose ou reconstruit localement
- permission frontend inventee ou profil de demonstration utilise comme autorisation

## Conclusion

La phase 2 - permissions effectives est figee comme suit :

- le backend ne fournit pas seulement des permissions
- il fournit un systeme de capacites conditionnelles
- la notion utile pour le frontend est la permission effective
- la permission effective depend du role, des affectations, du contexte actif, du scope, des restrictions, des policies et des derivations d'acteur
- le titulariat est une capacite derivee, jamais un role brut
- les matrices explicitement attestees servent de base officielle
- les roles officiels sans matrice explicite ne doivent pas recevoir de capacites inventees
