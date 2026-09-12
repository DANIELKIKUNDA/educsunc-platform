const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const frontendRoot = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(frontendRoot, relativePath), 'utf8');
}

test('les centres Notifications, Audit et Monitoring n utilisent plus les anciens hubs generiques', () => {
  const routeFiles = [
    'src/domains/notifications/routes.ts',
    'src/domains/audit/routes.ts',
    'src/domains/monitoring/routes.ts',
  ].map(read);

  routeFiles.forEach((source) => assert.doesNotMatch(source, /views\/ModuleHomeView\.vue/));

  [
    'src/domains/notifications/views/ModuleHomeView.vue',
    'src/domains/audit/views/ModuleHomeView.vue',
    'src/domains/monitoring/views/ModuleHomeView.vue',
  ].forEach((relativePath) => {
    assert.equal(fs.existsSync(path.join(frontendRoot, relativePath)), false);
  });
});

test('Monitoring ouvre directement le cockpit consolide depuis le menu', () => {
  const routes = read('src/domains/monitoring/routes.ts');
  assert.match(routes, /name: 'monitoring-home',[\s\S]*MonitoringOverviewView\.vue/);
  assert.match(routes, /name: 'monitoring-home',[\s\S]*mode: 'dashboard'/);
  assert.match(routes, /name: 'monitoring-home',[\s\S]*showBack: false/);
});

test('Audit redirige vers la premiere lecture reellement autorisee', () => {
  const routes = read('src/domains/audit/routes.ts');
  const viewModel = read('src/domains/audit/viewmodels/useAuditEntryViewModel.ts');
  assert.match(routes, /AuditEntryView\.vue/);
  assert.match(viewModel, /doctrine\.canAccessPage\(page\.code\)/);
  assert.match(viewModel, /router\.replace\(routePath\)/);
});

test('Notifications redirige par niveau et garde un accueil Plateforme humain', () => {
  const routes = read('src/domains/notifications/routes.ts');
  const view = read('src/domains/notifications/views/NotificationsEntryView.vue');
  const viewModel = read('src/domains/notifications/viewmodels/useNotificationsEntryViewModel.ts');
  assert.match(routes, /NotificationsEntryView\.vue/);
  assert.match(viewModel, /ORGANISATION:[\s\S]*\/app\/notifications\/organisation/);
  assert.match(viewModel, /ECOLE:[\s\S]*\/app\/notifications\/ecole/);
  assert.match(viewModel, /router\.replace\(routePath\)/);
  assert.doesNotMatch(view, /NOTIF-HOME|Pages visibles|Contexte notification actif/);
  assert.doesNotMatch(view, /backend|payload|UUID|API/i);
});
