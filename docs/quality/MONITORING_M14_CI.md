# Monitoring M14 — CI, qualité et sécurité

## Verdict

**M14 implémenté. Certification GitHub Actions restante.**

## Contrat CI Monitoring

La workflow `.github/workflows/ci.yml` couvre explicitement :

- Node.js 24 ;
- PostgreSQL 16 ;
- tests backend Monitoring ;
- tests frontend Monitoring ;
- tests frontend Monitoring realtime ;
- E2E Monitoring Playwright ;
- typecheck backend strict ;
- builds backend/frontend ;
- ESLint backend/frontend ;
- audit des dépendances ;
- Semgrep ;
- Gitleaks ;
- Trivy ;
- performance k6 sur schedule/workflow_dispatch.

Le pipeline transverse `verify:code` inclut également les suites Monitoring afin qu'une exécution locale/officielle de la qualité du code ne puisse plus les omettre.

## Non-régression

`scripts/quality/verify-monitoring-ci.mjs` échoue si une obligation Monitoring critique disparaît de la CI ou du pipeline `verify:code`.

Contrôles exécutés dans l'environnement de travail :

- `node scripts/quality/verify-monitoring-ci.mjs` → PASS, 19 contrôles ;
- `node --check scripts/quality/run-verification.mjs` → PASS ;
- `node --check scripts/quality/verify-monitoring-ci.mjs` → PASS ;
- `node scripts/quality/verify-ci-pinning.mjs` → PASS.

## Ce qui reste à certifier dans le dépôt réel

La certification M14 exige une exécution réelle GitHub Actions après intégration : Node 24, `npm ci`, PostgreSQL, Playwright, Semgrep, Gitleaks, Trivy et k6. Une réussite statique locale ne remplace pas cette exécution.

Aucun contrôle n'a été supprimé, neutralisé ou rendu moins strict pour obtenir un résultat vert.
