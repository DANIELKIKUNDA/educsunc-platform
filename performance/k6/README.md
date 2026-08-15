# Baseline k6 EduSync

La campagne utilise exclusivement une instance backend et un schema PostgreSQL isoles.
Elle ne doit jamais viser une base normale ou un environnement de production sans
autorisation explicite.

Commande officielle :

```text
npm run verify:performance
```

La baseline couvre l authentification, la sante, une liste paginee, les lectures
de deux organisations, les indicateurs et une ecriture utilisateur restauree en
fin de campagne. Les rapports p50, p95, p99, debit et erreurs sont ecrits dans
`artifacts/quality/performance`.

Les parcours eleves et paiements exigent des comptes et donnees metier dedies.
Ils seront ajoutes au meme harnais lorsque leur seed de performance deterministe
sera disponible ; aucune donnee artificielle n est injectee dans la base normale.

## Monitoring

M13 ajoute `monitoring-baseline.js`, execute par le meme `npm run verify:performance`
apres la baseline generale. La campagne mesure le cockpit Monitoring (`state`,
`dashboard`, `observability`, `health`) avec un rapport separe
`monitoring-k6-summary.json`.
