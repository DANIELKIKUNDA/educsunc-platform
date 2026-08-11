# Audit L3 - Lectures PostgreSQL et pagination

## Decision

Le journal Audit, son detail, ses chronologies et ses lectures analytiques utilisent PostgreSQL comme source de verite. Les services applicatifs dependent de `AuditReadRepositoryPort`; ils ne dependent ni de Fastify ni de SQL.

Le perimetre d'autorisation reste celui de L1. Le controleur remplace les identifiants tenant fournis par le client par le contexte authentifie pour les niveaux Organisation et Ecole. Le repository applique ensuite ces identifiants dans la clause `WHERE`, y compris avant toute lecture par identifiant.

## Contrat de recherche

Les filtres reconnus sont : action, type principal, categorie, gravite, resultat, acteur, type et identifiant de ressource, correlation, requete, source, debut et fin de periode. Les identifiants organisation et ecole sont des filtres globaux uniquement au niveau Plateforme; ils ne peuvent jamais elargir un contexte Organisation ou Ecole.

Les dates utilisent le format ISO 8601. `dateDebut` doit preceder `dateFin`. La taille par defaut est 25 et la taille maximale est 100.

## Pagination canonique

Le tri est toujours :

```text
date_action DESC, id_audit_entry DESC
```

La page suivante utilise une condition keyset parametree sur ce couple. Le repository demande `limite + 1` lignes pour calculer `hasNextPage`; aucun `COUNT(*)` global ni `OFFSET` profond n'est execute par la liste.

Le curseur est un document JSON encode en Base64 URL-safe contenant :

- une version de contrat ;
- la date de la derniere ligne ;
- son identifiant ;
- une empreinte SHA-256 du tenant et des filtres normalises.

Le curseur reste opaque pour le client. Il est limite a 1 024 caracteres. Un curseur invalide, d'une autre version, d'un autre filtre ou d'un autre tenant est refuse par une erreur 400 controlee.

Les anciens champs `page`, `taillePage`, `total` et `totalPages` sont conserves temporairement pour la compatibilite du frontend. Ils decrivent uniquement la page courante et ne declenchent aucun comptage global. Toute navigation apres la premiere page doit utiliser `nextCursor`.

## Projections et donnees sensibles

Les listes ne selectionnent pas les colonnes JSONB, l'adresse IP, le user-agent, les permissions, les snapshots ou les metadonnees. Le detail relit l'evenement canonique complet puis applique les mappers et mecanismes de redaction existants.

Analytics utilise des agregats SQL bornes au tenant. Forensic utilise la meme lecture tenant-safe et limite une investigation a 100 evenements; L3 ne constitue pas un moteur BI.

## Index PostgreSQL

La migration 5 ajoute :

- `audit_entries_keyset_idx` pour la lecture Plateforme ;
- `audit_entries_organisation_keyset_idx` pour une organisation ;
- `audit_entries_ecole_keyset_idx` pour une ecole ;
- `audit_categories_lookup_idx` pour le filtrage par categorie.

Chaque index suit le prefixe tenant de la requete puis le tri canonique. Aucun index unitaire n'est ajoute pour chaque filtre secondaire afin d'eviter la sur-indexation de la table append-only.

## Frontieres

L3 ne modifie pas les producteurs d'evenements (L4), les exports avances, la retention, l'archivage ou l'integrite cryptographique (L5), ni l'UX finale du Centre Audit (L6).
