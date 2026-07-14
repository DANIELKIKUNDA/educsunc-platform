# Certification du Centre Administration Ecole

Date de certification : 14 juillet 2026.

## Verdict

**ADMINISTRATION ECOLE - CERTIFIEE**

Le tableau de bord, le registre, la creation et la fiche canonique utilisent les donnees reelles du backend. La creation de controle a ete relue apres actualisation puis apres redemarrage du backend.

## Causes racines corrigees

1. Le contexte frontend conservait les organisations de demonstration et ajoutait les organisations relues au lieu de remplacer le catalogue. Le Centre pouvait donc cibler `org-archedu`, absent de PostgreSQL, et afficher des valeurs de repli.
2. La fiche ecole transmettait l'ecole de demonstration dans le contexte tenant au lieu de l'identifiant de la fiche. PostgreSQL recevait deux identifiants incompatibles pour la meme lecture.
3. Le changement d'organisation pouvait etre ignore pendant la courte phase d'initialisation du registre.
4. Les acces depuis Organisation utilisaient encore une ancienne fiche concurrente.
5. Le moteur de portee Security ne reconnaissait pas le scope `PLATEFORME` comme une portee globale. La session `MANAGER_SYSTEME` etait donc refusee lors du changement d'organisation depuis le Shell.
6. Des formulations techniques pouvaient remonter dans les messages utilisateur.

## Corrections certifiees

- remplacement des contextes de demonstration par le catalogue reel des organisations ;
- synchronisation du Centre avec l'organisation active du Shell ;
- rechargement automatique apres changement d'organisation ;
- compteurs calcules a partir des ecoles effectivement relues ;
- transmission explicite de l'ecole cible pour chaque lecture ou mutation ;
- fiche canonique enrichie avec la lecture des modules actifs ;
- redirection de l'ancienne URL Organisation vers la fiche canonique ;
- messages utilisateur sans vocabulaire PostgreSQL ;
- reconnaissance du scope Plateforme sans modifier les permissions metier ;
- scenario navigateur reproductible desktop et mobile.

## Routes canoniques

- Centre : `/app/administration-ecole`
- Registre : `/app/administration-ecole/ecoles`
- Fiche : `/app/administration-ecole/ecoles/:idEcole`
- Compatibilite : `/app/organisation/ecoles/:idEcole` redirige vers la fiche canonique.

## Preuve de persistance

Ecole de controle conservee comme preuve :

- code : `ADM-35182757`
- nom : `Ecole Certification ADM 35182757`
- identifiant : `977ee028-fb28-4058-a5dc-385fcccb691a`
- organisation : `0a906509-de8d-4821-9537-ace6ab397575`

La fiche a ete relue apres redemarrage du backend, avec son identite et son bloc de modules actifs.

## Validations executees

- tests frontend Administration Ecole : 12/12 ;
- tests backend auth, tenancy, routes ecoles et securite ADM : 9/9 ;
- tests d'integration Configuration et modules : 10/10 ;
- typecheck backend : OK ;
- build frontend, incluant `vue-tsc --noEmit` : OK ;
- scenario Chrome desktop et mobile : OK ;
- changement d'organisation depuis le Shell : OK ;
- verification apres redemarrage backend : OK.

Les captures et l'etat de certification se trouvent dans `frontend/artifacts/school-administration-certification/`.

## Dettes restantes

Aucune dette bloquante propre au Centre Administration Ecole n'a ete identifiee a l'issue de cette certification.
