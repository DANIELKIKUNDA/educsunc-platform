# Notifications — N12 consolidation finale

Date: 2026-08-13

## Corrections réellement appliquées pendant la consolidation

- Autorité tenant HTTP: suppression des fallbacks `x-organisation-id` / `x-ecole-id`; organisation, école et acteur viennent de la session authentifiée.
- Erreurs 500: les détails internes ne sont plus renvoyés au client.
- Providers: EMAIL et SMS échouent fermés sans transport réel; aucun UUID de faux succès.
- IN_APP: utilise l'identifiant durable de notification, sans fournisseur externe simulé.
- PUSH: provider vendor-neutral ajouté avec port injectable compatible Web Push / FCM / APNs; sans transport configuré il reste explicitement indisponible.
- BullMQ: le runtime HTTP utilise désormais les files BullMQ partagées pour dispatch/retry/replay/escalade; aucune nouvelle infrastructure de queue.
- Monitoring des queues: lecture des snapshots BullMQ partagés.
- PostgreSQL: migration et repository durable de l'agrégat Notification ajoutés; codec de réhydratation par prototypes domaine; projection mémoire conservée temporairement pour compatibilité du read-side historique.
- Realtime: aucun WebSocket/SSE Notifications parallèle n'est instancié en production; `DiffuseurTempsReelNotification` relaie via `shared/realtime`; capacité annoncée `SHARED_REALTIME`.
- Frontend: suppression des previews JSON brutes des vues Notifications et remplacement par une présentation structurée responsive.
- Tests providers: attentes corrigées pour refuser les faux succès; tests de sécurité production ajoutés.

## Push

Aucune dépendance fournisseur n'a été ajoutée. Le provider Push est prêt à recevoir un transport officiel injecté. Le choix Web Push, FCM ou APNs reste une décision de déploiement. Tant qu'aucun transport n'est configuré, le canal est `INDISPONIBLE` et ne produit aucun faux succès.

## Point restant pour l'intégration Codex

Le read-side de listes/archives/monitoring utilise encore la projection mémoire historique dans ce paquet. L'agrégat principal est durable PostgreSQL, mais Codex doit finaliser/valider la projection PostgreSQL complète avant certification multi-instance/redémarrage des écrans de lecture.

La doctrine `modules.enabled` du BC Configuration indique explicitement qu'aucun module n'est actif implicitement pour une école. L'intégration automatique des événements Notifications doit être certifiée avec cette résolution effective par école dans l'environnement officiel; aucune activation globale implicite n'a été ajoutée ici.

## Contrôles exécutés ici

`node scripts/quality/verify-notifications-consolidation.mjs` : 12/12 PASS.

`npm ci` backend n'a pas pu être exécuté dans ce runtime de travail. La certification TypeScript/Node 24, PostgreSQL, Redis/BullMQ, Playwright, k6 et CI GitHub reste donc à réaliser dans l'environnement officiel.

## Verdict

`NOTIFICATIONS — PRÊT POUR INTÉGRATION, CERTIFICATION OFFICIELLE RESTANTE`

Ne pas prononcer `NOTIFICATIONS — CERTIFIÉ` avant validation complète dans le dépôt officiel.
