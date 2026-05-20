-- Ce script de rattrapage renseigne la categorie technique des options d'etude.
-- Il n'ajoute aucun montant et ne calcule aucun frais.

UPDATE "options_etudes"
SET "categorie_technique" = CASE
  WHEN "est_technique" = false THEN NULL
  WHEN "code" IN (301, 302, 401, 501, 502, 503, 504, 505, 601, 701, 702, 703, 704) THEN 'GROUPE_1'
  ELSE 'GROUPE_2'
END;
