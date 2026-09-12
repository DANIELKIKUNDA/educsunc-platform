# Platform Experience — consolidation P1 à P10

## Cible
Expérience Plateforme premium, permission-driven et adaptative pour MANAGER_SYSTEME, OPERATEUR_SYSTEME et SUPPORT_SYSTEME.

## P1 — architecture
Navigation structurée Pilotage / Opérations / Gouvernance / Système. Le rôle choisit la composition; les permissions effectives restent l'autorité.

## P2 — compte
`/app/moi/preferences` est l'entrée personnelle. L'ancienne route Configuration redirige vers Mon compte. Configuration reste l'autorité des politiques; Mon compte porte les préférences personnelles.

## P3 — navigation
Sidebar desktop ouverte/compacte avec persistance locale et tooltips accessibles. Mobile: quatre destinations permission-aware + Plus vers le drawer complet.

## P4 — topbar
Recherche moderne avec Ctrl/Cmd+K, état vide, cloche Notifications uniquement si accessible, suppression des faux compteurs et de la messagerie décorative.

## P5/P6/P7 — dashboards
Un cockpit commun, composé selon Manager/Opérateur/Support. KPI uniquement depuis les données réellement chargées. Priorités structurelles, recherche d'accès rapides et portefeuille compact. Aucun KPI fictif.

## P8 — adaptatif/accessibilité
Safe areas, navigation mobile dédiée, cibles tactiles, reduced motion, contraste renforcé, breakpoints laptop/tablette/mobile.

## P9 — tests
Quality gate structurel fourni. La certification navigateur doit être rejouée avec Node 24 et les dépendances du projet.

## P10 — verdict
Le paquet est consolidé côté code. La certification officielle reste conditionnée à `npm ci`, `vue-tsc`, tests frontend et E2E dans l'environnement Codex/CI.
