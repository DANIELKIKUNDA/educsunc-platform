# Monitoring M12 — E2E

## Statut
M12 est implémenté. La certification navigateur officielle reste à exécuter sous Node 24 avec les dépendances et infrastructures du dépôt.

## Couverture Playwright dédiée
`npm --prefix frontend run test:e2e:monitoring`

La suite couvre :
- MANAGER_SYSTEME : cockpit et écrans Monitoring ;
- OPERATEUR_SYSTEME : cockpit et écrans opérationnels ;
- SUPPORT_SYSTEME : lecture autorisée, mutations absentes ;
- acteur ECOLE : URL Monitoring refusée et aucun appel `/api/monitoring` déclenché ;
- erreur réseau : le cockpit reste monté et affiche un état d'erreur contenu.

Les écrans couverts incluent dashboard, health, alertes, incidents, diagnostics, capacity/saturation et traces. Le realtime est couvert séparément par les tests M7 ; les pannes d'infrastructure sont couvertes par M8 et doivent être rejouées dans l'environnement réel.

## Certification restante
Sous Node 24 : installer les dépendances, démarrer PostgreSQL/Redis/BullMQ, puis exécuter `npm --prefix frontend run test:e2e:monitoring`. Conserver trace/screenshot/video Playwright en cas d'échec. Aucun résultat vert n'est revendiqué sans cette exécution.
