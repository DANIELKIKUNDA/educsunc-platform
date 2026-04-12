# Donnees de reference du referentiel academique

Ce dossier regroupe les donnees JSON stables utilisees pour initialiser le BC Referentiel Academique.

Organisation actuelle :

- `sections/` : sections scolaires officielles importees par le seed `seed:sections-scolaires`.
- `options/` : options d'etudes officielles du secondaire importees par le seed `seed:options-etudes`.
- `classes/` : classes academiques officielles importees par le seed `seed:classes-academiques`.
- `cours/` : cours officiels uniques extraits des bulletins MINEDUC importes par le seed `seed:cours-officiels`.
- `programmes/` : programmes academiques par classe extraits des bulletins MINEDUC importes par le seed `seed:programmes-academiques`.

Les fichiers JSON doivent rester alignes sur les DTO d'import du backend.
Les options d'etudes portent `abreviation` comme champ metier dedie aux sigles, tandis que le champ legacy `typeOption` n'est plus utilise par les donnees de reference.
Les programmes ne dupliquent pas les cours : chaque ligne reference un `coursCode` issu du fichier des cours officiels.
La version officielle stabilisee des programmes MINEDUC 2024-2025 est `MINEDUC-2024-2025-V2`.
