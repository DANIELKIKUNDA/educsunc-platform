# TRANSPORT+ — Schéma de base de données

## Objectif

Transformer le cahier des charges fonctionnel de TRANSPORT+ en un modèle de données relationnel PostgreSQL.

## Contexte

Le système doit gérer :

- les agences partenaires
- les voyages (bus, lignes, départs)
- les ventes de billets et les paiements Mobile Money
- les validations (embarquement) avec scan QR
- les annulations, remboursements et transferts
- le mode hors-ligne des agents de contrôle

## Principales entités

### `transport_plus_agences`

- `id_agence UUID PRIMARY KEY`
- `nom_agence TEXT NOT NULL`
- `ville_principale TEXT NULL`
- `responsable TEXT NULL`
- `est_actif BOOLEAN NOT NULL DEFAULT TRUE`
- `contrat_valide BOOLEAN NOT NULL DEFAULT FALSE`
- `cree_le TIMESTAMPTZ NOT NULL`
- `cree_par TEXT NULL`
- `modifie_le TIMESTAMPTZ NULL`
- `modifie_par TEXT NULL`
- `version INTEGER NOT NULL DEFAULT 1`

### `transport_plus_buses`

- `id_bus UUID PRIMARY KEY`
- `id_agence UUID NOT NULL REFERENCES transport_plus_agences(id_agence)`
- `reference_bus TEXT NOT NULL`
- `plaque TEXT NULL`
- `capacite INTEGER NOT NULL`
- `classe_bus TEXT NULL` (ex. VIP, normal)
- `est_actif BOOLEAN NOT NULL DEFAULT TRUE`
- `cree_le TIMESTAMPTZ NOT NULL`
- `modifie_le TIMESTAMPTZ NULL`
- `supprime_logiquement BOOLEAN NOT NULL DEFAULT FALSE`

### `transport_plus_routes`

- `id_route UUID PRIMARY KEY`
- `id_agence UUID NOT NULL REFERENCES transport_plus_agences(id_agence)`
- `ville_depart TEXT NOT NULL`
- `ville_arrivee TEXT NOT NULL`
- `duree_estimee INTERVAL NULL`
- `type_route TEXT NULL` (ex. simple, nocturne)
- `est_actif BOOLEAN NOT NULL DEFAULT TRUE`
- `cree_le TIMESTAMPTZ NOT NULL`
- `modifie_le TIMESTAMPTZ NULL`
- `supprime_logiquement BOOLEAN NOT NULL DEFAULT FALSE`

### `transport_plus_voyages`

- `id_voyage UUID PRIMARY KEY`
- `id_agence UUID NOT NULL REFERENCES transport_plus_agences(id_agence)`
- `id_bus UUID NOT NULL REFERENCES transport_plus_buses(id_bus)`
- `id_route UUID NOT NULL REFERENCES transport_plus_routes(id_route)`
- `date_depart DATE NOT NULL`
- `heure_depart TIME NOT NULL`
- `tarif_base INTEGER NOT NULL`
- `frais_transport_plus INTEGER NOT NULL DEFAULT 0`
- `nombre_places_vendables INTEGER NULL`
- `statut TEXT NOT NULL DEFAULT 'SCHEDULED'`
- `est_annule BOOLEAN NOT NULL DEFAULT FALSE`
- `cree_le TIMESTAMPTZ NOT NULL`
- `modifie_le TIMESTAMPTZ NULL`
- `supprime_logiquement BOOLEAN NOT NULL DEFAULT FALSE`

### `transport_plus_bus_sieges`

- `id_siege UUID PRIMARY KEY`
- `id_bus UUID NOT NULL REFERENCES transport_plus_buses(id_bus)`
- `numero_siege TEXT NOT NULL`
- `rang INTEGER NULL`
- `colonne TEXT NULL`
- `type_siege TEXT NULL`
- `est_actif BOOLEAN NOT NULL DEFAULT TRUE`
- `cree_le TIMESTAMPTZ NOT NULL`
- `modifie_le TIMESTAMPTZ NULL`
- `supprime_logiquement BOOLEAN NOT NULL DEFAULT FALSE`

### `transport_plus_blocages_sieges`

- `id_blocage UUID PRIMARY KEY`
- `id_voyage UUID NOT NULL REFERENCES transport_plus_voyages(id_voyage)`
- `id_siege UUID NOT NULL REFERENCES transport_plus_bus_sieges(id_siege)`
- `id_utilisateur TEXT NULL` (référence éventuelle vers l'utilisateur voyageur)
- `date_debut TIMESTAMPTZ NOT NULL`
- `date_expiration TIMESTAMPTZ NOT NULL`
- `statut TEXT NOT NULL DEFAULT 'EN_ATTENTE'`
- `cree_le TIMESTAMPTZ NOT NULL`
- `modifie_le TIMESTAMPTZ NULL`

### `transport_plus_billets`

- `id_billet UUID PRIMARY KEY`
- `id_voyage UUID NOT NULL REFERENCES transport_plus_voyages(id_voyage)`
- `id_utilisateur TEXT NOT NULL` (référence à l'utilisateur client)
- `id_agence UUID NOT NULL REFERENCES transport_plus_agences(id_agence)`
- `id_route UUID NOT NULL REFERENCES transport_plus_routes(id_route)`
- `id_bus UUID NOT NULL REFERENCES transport_plus_buses(id_bus)`
- `id_siege UUID NOT NULL REFERENCES transport_plus_bus_sieges(id_siege)`
- `code_qr TEXT NOT NULL UNIQUE`
- `numero_reservation TEXT NULL`
- `prix_base INTEGER NOT NULL`
- `frais INTEGER NOT NULL`
- `total_paye INTEGER NOT NULL`
- `statut_ticket TEXT NOT NULL DEFAULT 'PAYE'`
- `statut_paiement TEXT NOT NULL DEFAULT 'EN_ATTENTE'`
- `date_reservation TIMESTAMPTZ NOT NULL`
- `date_embarquation TIMESTAMPTZ NULL`
- `date_annulation TIMESTAMPTZ NULL`
- `date_remboursement TIMESTAMPTZ NULL`
- `est_cache_hors_ligne BOOLEAN NOT NULL DEFAULT FALSE`
- `cree_le TIMESTAMPTZ NOT NULL`
- `modifie_le TIMESTAMPTZ NULL`
- `supprime_logiquement BOOLEAN NOT NULL DEFAULT FALSE`

### `transport_plus_paiements`

- `id_paiement UUID PRIMARY KEY`
- `id_billet UUID NOT NULL REFERENCES transport_plus_billets(id_billet)`
- `id_utilisateur TEXT NOT NULL`
- `operateur_mobile TEXT NOT NULL`
- `reference_operateur TEXT NULL`
- `montant INTEGER NOT NULL`
- `statut TEXT NOT NULL` (ex. EN_ATTENTE, CONFIRME, ECHOUE, REMPLACE)
- `date_creation TIMESTAMPTZ NOT NULL`
- `date_validation TIMESTAMPTZ NULL`
- `details_transaction JSONB NULL`
- `cree_le TIMESTAMPTZ NOT NULL`
- `modifie_le TIMESTAMPTZ NULL`

### `transport_plus_validations_emarquement`

- `id_validation UUID PRIMARY KEY`
- `id_billet UUID NOT NULL REFERENCES transport_plus_billets(id_billet)`
- `id_agent TEXT NULL`
- `date_validation TIMESTAMPTZ NOT NULL`
- `source_validation TEXT NOT NULL DEFAULT 'ONLINE'`
- `statut_validation TEXT NOT NULL` (ex. VALIDE, DEJA_UTILISE, ANNULE, PAS_CE_VOYAGE, PAIEMENT_INCONFIRMÉ)
- `donnees_scan JSONB NULL`
- `cree_le TIMESTAMPTZ NOT NULL`

### `transport_plus_transferts_billets`

- `id_transfert UUID PRIMARY KEY`
- `id_billet_original UUID NOT NULL REFERENCES transport_plus_billets(id_billet)`
- `id_billet_nouveau UUID NOT NULL REFERENCES transport_plus_billets(id_billet)`
- `type_transfert TEXT NOT NULL` (ex. MODIFICATION_HORAIRE, CHANGEMENT_DATE)
- `montant_difference INTEGER NULL`
- `statut TEXT NOT NULL` (ex. EN_ATTENTE, CONFIRME, REFUSE)
- `date_demande TIMESTAMPTZ NOT NULL`
- `date_traitement TIMESTAMPTZ NULL`
- `cree_le TIMESTAMPTZ NOT NULL`

## Index recommandés

- `transport_plus_voyages (id_agence, date_depart, heure_depart)`
- `transport_plus_billets (id_voyage, id_utilisateur, statut_ticket, id_siege)`
- `transport_plus_paiements (id_billet, statut)`
- `transport_plus_validations_emarquement (id_billet, date_validation)`

## Notes d’architecture

- Le `voyageur` peut être représenté par un utilisateur existant du système de sécurité. Dans ce modèle, on stocke `id_utilisateur TEXT` pour rester compatible avec l’architecture existante.
- Le module de réservation doit utiliser `transport_plus_blocages_sieges` pour éviter les conflits de sièges et garantir la validité de la réservation temporaire pendant le paiement.
- Le statut du billet est distinct du statut de paiement : cela permet de gérer des cas `EN_ATTENTE`, `CONFIRME`, `ECHOUE`, `REMBOURSE`.
- `transport_plus_validations_emarquement` trace chaque scan, y compris en mode hors-ligne, afin de resynchroniser les validations.

## Suivi fonctionnel

- La vente en ligne crée un `transport_plus_billet` avec `statut_paiement = 'EN_ATTENTE'`.
- Après confirmation Mobile Money, le billet passe à `statut_ticket = 'PAYE'` et `statut_paiement = 'CONFIRME'`.
- Lors du scan, une entrée est ajoutée dans `transport_plus_validations_emarquement` et le billet devient `EMBARQUE`.
- Une annulation génère la mise à jour de `transport_plus_billets` et une entrée de paiement/refund si nécessaire.
- Un transfert crée un nouveau billet et relie les deux en `transport_plus_transferts_billets`.
