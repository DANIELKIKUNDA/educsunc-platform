const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const frontendRoot = path.resolve(__dirname, '..');
const sourceRoot = path.join(frontendRoot, 'src');

function read(relativePath) {
  return fs.readFileSync(path.join(frontendRoot, relativePath), 'utf8');
}

function listFiles(directory, predicate) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(entryPath, predicate));
    } else if (predicate(entryPath)) {
      files.push(entryPath);
    }
  }
  return files;
}

function loadDataCache() {
  const filePath = path.join(sourceRoot, 'shared/http/frontend-data-cache.ts');
  const source = fs.readFileSync(filePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filePath,
  });
  const module = { exports: {} };
  const context = vm.createContext({
    module,
    exports: module.exports,
    require,
    structuredClone,
  });
  new vm.Script(transpiled.outputText, { filename: filePath }).runInContext(context);
  return module.exports.FrontendDataCache;
}

const FrontendDataCache = loadDataCache();

test('le cache expire et restitue une copie independante', () => {
  let maintenant = 1_000;
  const cache = new FrontendDataCache(() => maintenant);
  const valeur = { modules: ['FINANCES'] };

  cache.enregistrer('catalogue', valeur, 100);
  valeur.modules.push('AUDIT');

  const premiereLecture = cache.lire('catalogue');
  assert.equal(premiereLecture.trouvee, true);
  assert.deepEqual(premiereLecture.valeur, { modules: ['FINANCES'] });

  premiereLecture.valeur.modules.push('SECURITE');
  assert.deepEqual(cache.lire('catalogue').valeur, { modules: ['FINANCES'] });

  maintenant = 1_100;
  const lectureExpiree = cache.lire('catalogue');
  assert.equal(lectureExpiree.trouvee, false);
  assert.equal(lectureExpiree.valeur, undefined);
  assert.equal(cache.taille, 0);
});

test('le cache ignore les durees invalides et peut etre purge atomiquement', () => {
  const cache = new FrontendDataCache(() => 1_000);
  cache.enregistrer('invalide', { valeur: 1 }, 0);
  assert.equal(cache.taille, 0);

  cache.enregistrer('a', { valeur: 1 }, 100);
  cache.enregistrer('b', { valeur: 2 }, 100);
  assert.equal(cache.taille, 2);
  cache.vider();
  assert.equal(cache.taille, 0);
});

test('un seul point entree Fetch existe dans le code applicatif', () => {
  const sourceFiles = listFiles(
    sourceRoot,
    (filePath) => filePath.endsWith('.ts') || filePath.endsWith('.vue'),
  );
  const directFetchFiles = sourceFiles
    .filter((filePath) => /\bfetch\s*\(/.test(fs.readFileSync(filePath, 'utf8')))
    .map((filePath) => path.relative(frontendRoot, filePath).replaceAll('\\', '/'));

  assert.deepEqual(directFetchFiles, ['src/shared/http/api.client.ts']);
});

test('les domaines importent le client HTTP canonique', () => {
  const sourceFiles = listFiles(
    sourceRoot,
    (filePath) => filePath.endsWith('.ts') || filePath.endsWith('.vue'),
  );
  const legacyImports = sourceFiles
    .filter((filePath) => fs.readFileSync(filePath, 'utf8').includes('services/api'))
    .map((filePath) => path.relative(frontendRoot, filePath));

  assert.deepEqual(legacyImports, []);
  assert.equal(fs.existsSync(path.join(sourceRoot, 'services/api.ts')), false);
});

test('le client isole le cache par revision et contexte puis le purge', () => {
  const source = read('src/shared/http/api.client.ts');

  for (const marqueur of [
    'frontendLifecycle.revision',
    "'x-user-id'",
    "'x-organisation-id'",
    "'x-tenant-id'",
    "'x-ecole-id'",
    "id: 'shared-http-data-cache'",
    "scope: 'context'",
    'cacheDonnees.vider()',
  ]) {
    assert.equal(source.includes(marqueur), true, `${marqueur} doit rester present.`);
  }
});

test('les telechargements utilisent le meme transport securise', () => {
  const clientSource = read('src/shared/http/api.client.ts');
  const financesSource = read('src/domains/finances/services/finances.api.ts');

  assert.equal(clientSource.includes('async telecharger'), true);
  assert.equal(clientSource.includes("credentials: 'include'"), true);
  assert.equal(clientSource.includes('signal: requestScope.signal'), true);
  assert.equal(financesSource.includes('clientApi.telecharger'), true);
  assert.equal(/\bfetch\s*\(/.test(financesSource), false);
});

test('le cache de donnees reste explicite et limite a une lecture stable', () => {
  const configurationSource = read('src/domains/configuration/services/configuration.api.ts');
  const otherServiceFiles = listFiles(
    path.join(sourceRoot, 'domains'),
    (filePath) => filePath.endsWith('.api.ts')
      && !filePath.endsWith('configuration.api.ts'),
  );

  assert.equal(configurationSource.includes("cle: 'catalogue-modules-plateforme'"), true);
  assert.equal(configurationSource.includes('dureeMs: 60_000'), true);
  for (const filePath of otherServiceFiles) {
    assert.equal(
      fs.readFileSync(filePath, 'utf8').includes('cacheDonnees:'),
      false,
      `Le cache ne doit pas etre generalise sans preuve: ${filePath}`,
    );
  }
});

test('D1.4 ne force ni Pinia ni TanStack Query', () => {
  const manifest = JSON.parse(read('package.json'));
  const dependencies = {
    ...manifest.dependencies,
    ...manifest.devDependencies,
  };

  assert.equal(dependencies.pinia, undefined);
  assert.equal(dependencies['@tanstack/vue-query'], undefined);
});
