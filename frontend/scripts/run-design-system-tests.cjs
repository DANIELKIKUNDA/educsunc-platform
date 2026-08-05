const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const frontendRoot = path.resolve(__dirname, '..');
const repositoryRoot = path.resolve(frontendRoot, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

test('D1.6 conserve une pile UI unique et legere', () => {
  const manifest = JSON.parse(read('frontend/package.json'));
  const dependencies = { ...manifest.dependencies, ...manifest.devDependencies };

  assert.ok(dependencies['lucide-vue-next'], 'Lucide doit rester la bibliotheque d icones officielle.');
  for (const forbidden of ['primevue', 'tailwindcss', 'vue-sonner', 'sweetalert2']) {
    assert.equal(dependencies[forbidden], undefined, `${forbidden} ne doit pas creer une seconde pile UI.`);
  }
});

test('D1.6 expose et charge les jetons semantiques officiels', () => {
  const variables = read('frontend/src/styles/variables.css');
  const designSystem = read('frontend/src/styles/design-system.css');
  const main = read('frontend/src/main.ts');

  for (const token of [
    '--ui-primary', '--ui-text-strong', '--ui-surface', '--ui-border', '--ui-focus',
    '--ui-radius-lg', '--ui-control-height', '--ui-shadow-lg', '--ui-z-modal', '--ui-z-toast',
  ]) {
    assert.match(variables, new RegExp(token));
  }

  assert.match(main, /styles\/design-system\.css/);
  assert.match(designSystem, /:focus-visible/);
  assert.match(designSystem, /prefers-reduced-motion:\s*reduce/);
  assert.match(designSystem, /\.ui-button--primary/);
  assert.match(designSystem, /\.ui-field-control/);
  assert.match(designSystem, /\.ui-table-shell/);
});

test('D1.6 securise les dialogues et leur empilement', () => {
  const modal = read('frontend/src/components/communs/ModalShell.vue');
  const configurationModal = read('frontend/src/domains/configuration/components/ConfigurationCenterModal.vue');
  const modalStack = read('frontend/src/shared/ui/modal-stack.ts');

  assert.match(modal, /aria-modal="true"/);
  assert.match(modal, /handleKeydown/);
  assert.match(modal, /findFocusableElements/);
  assert.match(modal, /acquireBodyScrollLock/);
  assert.match(configurationModal, /acquireBodyScrollLock/);
  assert.match(modalStack, /activeLocks/);
  assert.match(modalStack, /originalOverflow/);
});

test('D1.6 rend les notifications accessibles et actionnables', () => {
  const stack = read('frontend/src/shared/ui/ToastStack.vue');
  const service = read('frontend/src/services/notifications.service.ts');

  assert.match(stack, /role="notification\.type === 'danger' \? 'alert' : 'status'"/);
  assert.match(stack, /aria-live/);
  assert.match(stack, /notification\.actions/);
  assert.match(service, /MAX_NOTIFICATIONS_VISIBLES/);
  assert.match(service, /executerAction/);
  assert.match(service, /notification\.duree \?\? 5000/);
});

test('D1.6 interdit les dialogues natifs dans le code applicatif', () => {
  const sourceRoot = path.join(frontendRoot, 'src');
  const offending = walk(sourceRoot)
    .filter((file) => /\.(?:ts|vue)$/.test(file))
    .filter((file) => /(?:window|globalThis)\.(?:alert|confirm|prompt)\s*\(/.test(fs.readFileSync(file, 'utf8')));

  assert.deepEqual(offending.map((file) => path.relative(frontendRoot, file)), []);
});

test('D1.6 documente les choix pour les composants futurs', () => {
  const documentation = read('docs/quality/d1-6-design-system-premium.md');

  assert.match(documentation, /Lucide/);
  assert.match(documentation, /ModalShell/);
  assert.match(documentation, /ToastStack/);
  assert.match(documentation, /composants futurs/i);
});
