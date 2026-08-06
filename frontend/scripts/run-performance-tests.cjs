const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const frontendRoot = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(frontendRoot, relativePath), 'utf8');
}

test('les stores metier ne sont plus charges globalement au demarrage', () => {
  const registry = read('src/shared/lifecycle/domain-store-lifecycle.registry.ts');

  assert.doesNotMatch(registry, /eager\s*:\s*true/);
  assert.match(registry, /prepareDomainLifecycleStores/);
  assert.match(registry, /routeDomain/);
});

test('les vues de demarrage et les centres transversaux restent charges a la demande', () => {
  const coreRoutes = read('src/router/routes.ts');
  assert.match(coreRoutes, /component:\s*\(\)\s*=>\s*import\(/);
  assert.doesNotMatch(coreRoutes, /^import\s+.*View\s+from/m);

  for (const domain of ['audit', 'monitoring', 'notifications', 'security']) {
    const routes = read(`src/domains/${domain}/routes.ts`);
    assert.doesNotMatch(routes, /^import\s+ModuleHomeView\s+from/m);
    assert.match(routes, /import\('\.\/views\/ModuleHomeView\.vue'\)/);
  }
});

test('les budgets de bundle bloquent les regressions au lieu de masquer les avertissements', () => {
  const viteConfig = read('vite.config.ts');

  assert.match(viteConfig, /educsync-bundle-budgets/);
  assert.match(viteConfig, /entryJavaScript:\s*350\s*\*\s*KIBIBYTE/);
  assert.match(viteConfig, /asyncJavaScript:\s*180\s*\*\s*KIBIBYTE/);
  assert.match(viteConfig, /stylesheet:\s*120\s*\*\s*KIBIBYTE/);
  assert.doesNotMatch(viteConfig, /chunkSizeWarningLimit/);
});

test('le prechargement respecte les connexions limitees', () => {
  const preloader = read('src/router/route-preloader.ts');

  assert.match(preloader, /navigator\.onLine/);
  assert.match(preloader, /saveData/);
  assert.match(preloader, /slow-2g/);
  assert.match(preloader, /2g/);
});

test('la navigation lente dispose d un retour visuel non instantane', () => {
  const progressStore = read('src/router/navigation-progress.store.ts');
  const progressComponent = read('src/shell/components/RouteProgressBar.vue');

  assert.match(progressStore, /DISPLAY_DELAY_MS\s*=\s*160/);
  assert.match(progressComponent, /role="progressbar"/);
  assert.match(progressComponent, /aria-label="Chargement de la page en cours"/);
});
