# Handoff Codex — Notifications

Intégrer ce paquet comme un merge fonctionnel sur la branche Notifications officielle; ne pas écraser les travaux plus récents du dépôt.

Priorités de certification:
1. Node 24 + npm ci.
2. typecheck/build backend et frontend.
3. migrations PostgreSQL Notifications et test de réhydratation après redémarrage.
4. finaliser/valider le read-side PostgreSQL (listes, archives, monitoring, dead-letter) afin qu'il ne dépende plus de la projection mémoire en production.
5. valider `modules.allowed ∩ modules.enabled` avant toute notification automatique d'école.
6. Redis/BullMQ réels: dispatch, retry, replay, escalade, worker mort, backlog, recovery.
7. configurer un transport Push officiel seulement si la stratégie produit le décide; sinon conserver `INDISPONIBLE`.
8. configurer Email/SMS uniquement avec secrets externes; aucun secret dans Git.
9. valider shared/realtime et le fallback frontend.
10. tests rôles École/Organisation/Plateforme, isolation tenant et acteurs interdits.
11. Playwright, performance, sécurité et GitHub Actions jusqu'au vert.

Le quality gate local `scripts/quality/verify-notifications-consolidation.mjs` doit rester vert.
