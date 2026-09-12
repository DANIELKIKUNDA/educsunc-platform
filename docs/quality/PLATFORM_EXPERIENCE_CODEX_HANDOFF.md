# Handoff Codex — Platform Experience

Branche cible recommandée: `feature/platform-experience`.

1. Intégrer ce paquet sans écraser les changements plus récents de Monitoring/Notifications/Audit.
2. Conserver `effective-access` comme autorité. Aucun dashboard, menu ou raccourci ne doit accorder une permission.
3. Installer avec Node 24 et le lockfile officiel; exécuter `npm ci` dans le frontend.
4. Exécuter `npm run certify:platform-experience`, `npm run test`, puis les suites Playwright existantes pertinentes.
5. Vérifier MANAGER_SYSTEME, OPERATEUR_SYSTEME, SUPPORT_SYSTEME sur desktop, tablette et mobile.
6. Après intégration Notifications, raccorder le badge non-lu réel à la cloche; ne jamais remettre un compteur fictif.
7. Après intégration Monitoring, enrichir les dashboards uniquement avec des métriques réelles et permission-aware; ne pas inventer de KPI.
8. Résoudre tout conflit selon la doctrine la plus récente et pousser jusqu'à CI verte.

Points de certification environnementale: `vue-tsc`, Vite build, Playwright/navigateurs, APIs backend réelles et intégration des branches parallèles.
