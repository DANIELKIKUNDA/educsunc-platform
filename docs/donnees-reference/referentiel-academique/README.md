# Donnees de reference du referentiel academique

Ce dossier regroupe les donnees JSON stables utilisees pour initialiser le BC Referentiel Academique.

Organisation actuelle :

- `sections/` : sections scolaires officielles importees par le cas d'usage `ImporterSectionsDepuisJson`.
- `options/` : options d'etudes officielles du secondaire importees par le cas d'usage `ImporterOptionsDepuisJson`.

Les fichiers JSON doivent rester alignes sur les DTO d'import du backend.
Les champs metier de reference non persistants, comme `sectionCode`, servent uniquement a documenter le rattachement officiel quand le cas d'usage d'import courant ne porte pas encore cette propriete.
