# Handoff Codex — intégration finale Monitoring EduSync

## Mission

Intégrer le contenu de ce paquet dans le dépôt EduSync réel sans écraser les travaux Audit L2–L6, puis réaliser la certification officielle que l'environnement de production exige.

## État transmis

M1 à M15 sont fermés **côté implémentation**. Le paquet est volontairement déclaré :

**MONITORING — PRÊT POUR INTÉGRATION, CERTIFICATION OFFICIELLE RESTANTE**

Lire d'abord :

- `docs/quality/MONITORING_HANDOFF_NEXT_DISCUSSION.md`
- `docs/quality/MONITORING_PREMIUM_PROGRESS.md`
- `docs/quality/MONITORING_M15_FINAL_REVIEW.md`
- les rapports `MONITORING_M5`, `M10`, `M11`, `M12`, `M13`, `M14`.

## Discipline d'intégration

1. comparer le paquet au HEAD réel et préserver Audit L2–L6 ;
2. ne pas réinventer les rôles, workflows MON-01..MON-17 ou contrats SCR-MON-001..009 ;
3. résoudre les conflits par comparaison avec les documents officiels ;
4. utiliser Node 24 ;
5. installer les dépendances officielles via lockfiles ;
6. appliquer/tester les migrations PostgreSQL Monitoring ;
7. raccorder et tester Redis/BullMQ réels ;
8. exécuter les tests Monitoring backend/frontend/E2E/performance ;
9. exécuter typecheck/build/lint et contrôles sécurité ;
10. tester les scénarios de panne M8 ;
11. exécuter `git diff --check` ;
12. pousser uniquement lorsque les changements sont cohérents ;
13. obtenir une CI GitHub Actions verte sans supprimer ni neutraliser de test.

## Points non certifiés dans l'environnement de préparation

- backend TypeScript complet (tsx absent) ;
- build/typecheck complets (node_modules absents) ;
- PostgreSQL réel + migrations sur DB officielle ;
- Redis réel ;
- BullMQ/workers réels ;
- Prometheus/Grafana/Loki/Uptime Kuma en environnement intégré ;
- Playwright navigateur ;
- k6 sous charge réelle ;
- GitHub Actions ;
- Node 24 ;
- `git diff --check` dans le dépôt réel.

Ne pas considérer ces éléments comme échoués : ils sont **à exécuter et certifier**. Corriger toute incompatibilité révélée par l'intégration, sans réduire les contrôles.
