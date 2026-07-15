# Certification du Centre Organisation - ecoles et modules

## Verdict

`CENTRE ORGANISATION - PARCOURS ECOLES ET MODULES CERTIFIES`

La certification couvre le pilotage Plateforme par `MANAGER_SYSTEME`, la navigation canonique, la creation contextualisee d'une ecole, les modules autorises d'une organisation, PostgreSQL, le redemarrage backend et les rendus desktop/mobile.

## Causes racines corrigees

1. Le plugin de tenancy remplacait le perimetre explicitement demande par le contexte actif de session. Un Manager Systeme portant une portee `PLATEFORME` etait donc refuse lorsqu'il consultait une autre organisation.
2. La creation lancee depuis les ecoles rattachees ouvrait le registre Administration Ecole sans declencher le formulaire contextualise ni garantir le retour vers l'organisation.
3. La lecture effective d'une configuration `ORGANIZATION` refusait les acteurs Plateforme. Le `PUT` des modules reussissait, mais la relecture recevait `CONFIGURATION_FAMILY_DENIED`; le frontend affichait alors un catalogue de repli qui donnait l'impression d'une perte de donnees.
4. La requete d'historique comparait un UUID d'organisation a une colonne texte sans conversion PostgreSQL et produisait une erreur `500`.
5. La fiche Organisation conservait un petit tableau d'ecoles concurrent de la page dediee.

## Parcours canonique

`Registre des organisations -> Detail organisation -> Ecoles rattachees -> Page dediee`

Les deux entrees suivantes utilisent la route unique :

- action `Ouvrir les ecoles` du registre ;
- onglet `Ecoles rattachees` de la fiche Organisation.

Route frontend canonique :

`/app/organisation/organisations/:idOrganisation/ecoles`

La creation reutilise le registre officiel Administration Ecole avec l'organisation verrouillee et un chemin de retour controle vers la page canonique.

## Securite et perimetres

- Une portee `PLATEFORME` conserve le perimetre Organisation ou Ecole explicitement demande.
- Les acteurs Organisation restent limites a leur organisation active.
- La lecture descendante des configurations effectives est ouverte aux roles Plateforme deja autorises en lecture.
- Les droits de mutation generiques ne sont pas elargis.
- `modules.allowed` reste porte par l'Organisation et `modules.enabled` par l'Ecole.

## Preuves de persistance

- Ecole certifiee : `Ecole Certification 20499080`.
- L'ecole est reapparue apres actualisation et apres redemarrage backend.
- `modules.allowed` a ete modifie, relu apres actualisation, puis relu apres redemarrage.
- La selection initiale `REFERENTIEL_ACADEMIQUE` a ete restauree et relue en version 6.
- L'historique Organisation repond sans erreur serveur apres correction SQL.
- Etat machine de certification : `frontend/artifacts/organization-center-certification/state.json`.
- Captures : `desktop-prepare.png` et `mobile-prepare.png` dans le meme dossier.

## Tests executes

- Backend : typecheck complet.
- Backend : 16 tests cibles tenancy, Organisation et Configuration.
- Frontend : build de production, 2 277 modules transformes.
- Frontend : tests de formulaires et parcours Administration Ecole.
- Navigateur Chrome reel : navigation par les deux entrees, creation, rechargement, modules, redemarrage, restauration, desktop et mobile.

## Donnees de certification

Les essais navigateur interrompus avant la stabilisation ont cree des ecoles de certification dans la base locale de developpement. Elles n'ont pas ete supprimees directement en SQL, car aucun workflow metier de suppression n'existe. Le harnais est maintenant idempotent et reutilise l'ecole enregistree dans son etat de certification.

## Dettes restantes

Aucune dette bloquante de code, securite, navigation ou persistance n'est ouverte pour ce perimetre. Le nettoyage eventuel des donnees locales de certification doit passer par un futur workflow metier explicite, et non par une suppression technique hors domaine.
