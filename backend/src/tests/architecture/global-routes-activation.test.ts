import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const FICHIER_ROUTES_GLOBALES = join(process.cwd(), 'src', 'app', 'routes', 'index.ts');

test('les routes globales actives et les routes prevues restent distinguees explicitement', () => {
  const contenu = readFileSync(FICHIER_ROUTES_GLOBALES, 'utf8');

  assert.match(
    contenu,
    /const routesActives: readonly RouteGlobale\[] = \[\s*routeAuth,\s*routeAudit,\s*routeConfiguration,\s*routeMonitoring,\s*routeNotifications,\s*routeReferentielAcademique,\s*routeSecurity,\s*routeScolariteEleves,\s*routePaiementsFacturation,\s*routeBulletinsEvaluations,\s*\];/,
  );
  assert.match(contenu, /const routesPrevues: readonly RouteGlobale\[] = \[];/);

  assert.match(contenu, /await serveur\.register\(routeHealth\);/);
  assert.match(contenu, /await serveur\.register\(routeAuth\);/);
  assert.match(contenu, /await serveur\.register\(routeSecurity\);/);
  assert.match(contenu, /await serveur\.register\(routeConfiguration\);/);
  assert.match(contenu, /await enregistrerRouteModule\(serveur, routeAudit, 'AUDIT'\);/);
  assert.match(contenu, /await enregistrerRouteModule\(serveur, routeMonitoring, 'MONITORING'\);/);
  assert.match(contenu, /await enregistrerRouteModule\(serveur, routeNotifications, 'NOTIFICATIONS'\);/);
  assert.match(contenu, /await enregistrerRouteModule\(serveur, routeReferentielAcademique, 'REFERENTIEL_ACADEMIQUE'\);/);
  assert.match(contenu, /await enregistrerRouteModule\(serveur, routeScolariteEleves, 'SCOLARITE_ELEVES'\);/);
  assert.match(contenu, /await enregistrerRouteModule\(serveur, routePaiementsFacturation, 'PAIEMENTS_FACTURATION'\);/);
  assert.match(contenu, /await enregistrerRouteModule\(serveur, routeBulletinsEvaluations, 'BULLETINS_EVALUATIONS'\);/);
});
