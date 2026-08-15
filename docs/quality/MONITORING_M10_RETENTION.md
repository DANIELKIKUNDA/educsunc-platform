# M10 — Retention Monitoring

## Statut

Implementation fermee. Certification d'integration Node 24/PostgreSQL/Loki/Prometheus restante.

## Proprietaires des donnees

- Metriques temporelles : Prometheus. Le backend Monitoring ne les duplique ni ne les purge dans PostgreSQL.
- Logs : Loki. La configuration versionnee conserve actuellement `retention_period: 168h` (7 jours) et le compactor a la retention activee.
- Alertes, incidents et timeline : PostgreSQL, conservation sans purge automatique par M10. Aucune suppression silencieuse.
- Capacity/Saturation : PostgreSQL, conservation sans purge automatique par M10.
- Diagnostics : PostgreSQL. Purge desactivee par defaut; activable uniquement par `MONITORING_RETENTION_DIAGNOSTICS_DAYS` (1..3650).
- Traces : PostgreSQL. Purge desactivee par defaut; activable uniquement par `MONITORING_RETENTION_TRACES_DAYS` (1..3650).

## Doctrine de securite

Aucune duree diagnostics/traces n'a ete inventee. Sans valeur explicite, aucune ligne n'est supprimee. Le service de retention est transactionnel et retourne un rapport exact des suppressions. Le scheduler ne lance pas de purge automatiquement : l'orchestrateur d'exploitation doit demander explicitement l'execution.

## Certification restante

1. Node 24 et dependances officielles.
2. PostgreSQL reel : seed de donnees anciennes/recentes, execution, verification des bornes et rollback sur erreur.
3. Prometheus : verifier la politique de retention effective du serveur/deploiement officiel (non imposee par EduSync si geree hors depot).
4. Loki : demarrer la pile et verifier effectivement la retention 168h et le compactor.
5. Executer `npm --prefix backend run test:monitoring` et la CI officielle.
