# Donnees de reference du referentiel academique

Ce dossier regroupe les donnees JSON stables utilisees pour initialiser le BC Referentiel Academique.

Organisation actuelle :

- `sections/` : sections scolaires officielles importees par le seed `seed:sections-scolaires`.
- `options/` : options d'etudes officielles du secondaire importees par le seed `seed:options-etudes`.

Les fichiers JSON doivent rester alignes sur les DTO d'import du backend.
Les options d'etudes portent `abreviation` comme champ metier dedie aux sigles, tandis que le champ legacy `typeOption` n'est plus utilise par les donnees de reference.
