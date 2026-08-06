# Triage courant de la securite statique

## Limite de tracabilite

Le rapport historique mentionnant 29 resultats, 263 regles et 6 322 fichiers
n a pas ete conserve dans le depot. Les 29 lignes historiques ne peuvent donc
pas etre reconstituees individuellement sans inventer leurs chemins ou regles.
La campagne versionnee reprend les familles prouvees et produit desormais JSON
et SARIF pour chaque execution.

## Matrice des constats reproduits

| Surface | Occurrences | Classification | Decision |
| --- | ---: | --- | --- |
| TLS PostgreSQL `rejectUnauthorized: false` | 5 | Faiblesse reelle de durcissement | Politique TLS commune, certificat verifie |
| CORS dynamique | 1 | Alerte contextuelle | Origine refletee seulement apres allowlist stricte ; conserver les tests |
| Fusion params/query avec `Object.assign` | 5 | Faiblesse de durcissement | Remplacer par une fusion de proprietes propres sans setter de prototype |
| `document.write` pour impression | 9 | Non determine, risque XSS selon echappement | Conserver en avertissement et migrer vers l impression securisee partagee |
| `RegExp` dynamique doctrine | 1 | Alerte contextuelle | Fragment echappe avant construction ; ajouter une preuve unitaire |

## TLS PostgreSQL

Fichiers concernes :

- `ClientPoolPostgresAuth.ts`
- `ClientPoolPostgresConfiguration.ts`
- `ClientPoolPostgresReferentielAcademique.ts`
- `ClientPoolPostgresScolariteEleves.ts`
- `ClientPoolPostgresPaiementsFacturation.ts`

La variable `ssl` activait le chiffrement tout en acceptant n importe quel
certificat. L impact potentiel est une interception de la connexion a la base.
La correction impose `rejectUnauthorized: true` et accepte une autorite racine
via `DB_SSL_CA`.

## CORS

`backend/src/app/serveur.ts` renvoie l origine demandee uniquement apres
normalisation et appartenance a la liste autorisee. La valeur n est pas acceptee
depuis une source arbitraire. La regle reste visible comme avertissement afin de
detecter toute future suppression de l allowlist.

## Fusion des entrees HTTP

Les cinq routes de bulletins fusionnent des objets Fastify `params` et `query`.
Les controleurs valident ensuite les donnees, mais `Object.assign` conserve une
surface inutile autour des cles speciales de prototype. Une fusion par spread,
qui utilise la creation de proprietes propres, preserve le contrat et ferme ce
durcissement.

## Impression HTML

Les neuf occurrences construisent des documents d impression avec des donnees
metier. Certaines valeurs proviennent de noms, libelles ou descriptions. Tant
que chaque valeur dynamique n est pas echappee ou que le document complet n est
pas nettoye avant insertion, la classification reste `non determine`. Elles sont
des avertissements visibles, pas des faux positifs declares.

## Expression reguliere

`frontend/src/shared/doctrine/doctrine.resolver.ts` transforme un motif de route
en expression reguliere. Le code echappe les caracteres actifs avant de
remplacer les parametres doctrinaux. L entree provient de la doctrine versionnee,
pas d une requete utilisateur. Classification : alerte contextuelle.

## Politique de sortie

Les regles `ERROR` sont bloquantes. Les regles `WARNING` restent dans le rapport
complet et exigent ce triage ; elles ne sont ni masquees par `nosemgrep`, ni
desactivees globalement.
