# Certification de la fiche école premium

## Périmètre certifié

- fiche école canonique compacte et responsive ;
- identité, coordonnées, fonctionnement et complétude ;
- modules autorisés par l'organisation, activés pour l'école et disponibles à l'activation ;
- actions de modification ouvertes dans des fenêtres dédiées ;
- protection des brouillons avant abandon ;
- activation et désactivation avec confirmation ;
- navigation de retour adaptée au parcours d'origine ;
- traçabilité enrichie avec les noms issus du dépôt d'identité officiel ;
- absence d'identifiant technique dans l'interface.

## Vérifications exécutées

- `npm run typecheck` backend : OK ;
- `npm run build` frontend : OK ;
- tests frontend Administration École : 14/14 OK ;
- tests backend écoles et traçabilité : 4/4 OK ;
- certification Chrome desktop et mobile : OK ;
- modification et restauration des coordonnées : OK ;
- renommage et restauration du nom : OK ;
- changement et restauration du mode d'exploitation : OK ;
- modification et restauration des modules : OK ;
- désactivation et réactivation : OK ;
- relecture après redémarrage backend : OK ;
- contrôle des débordements horizontaux desktop et mobile : OK.

## Verdict

**FICHE ÉCOLE PREMIUM — CERTIFIÉE**

Aucune dette bloquante spécifique à cette fiche n'est laissée ouverte. L'historique présenté reste limité aux repères réellement disponibles dans le backend actuel : création et dernière modification.
