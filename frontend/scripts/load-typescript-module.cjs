const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

const frontendRoot = path.resolve(__dirname, '..');
const moduleCache = new Map();

function resolveLocalModule(request, parentFile) {
  const candidate = path.resolve(path.dirname(parentFile), request);
  for (const filePath of [candidate, `${candidate}.ts`, path.join(candidate, 'index.ts')]) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) return filePath;
  }
  return null;
}

function loadFile(filePath) {
  const absolutePath = path.resolve(filePath);
  if (moduleCache.has(absolutePath)) return moduleCache.get(absolutePath).exports;

  const source = fs
    .readFileSync(absolutePath, 'utf8')
    .replaceAll('import.meta.env', '({})');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: absolutePath,
  });
  const module = { exports: {} };
  moduleCache.set(absolutePath, module);

  function localRequire(request) {
    if (request.startsWith('.')) {
      const localModule = resolveLocalModule(request, absolutePath);
      if (localModule) return loadFile(localModule);
    }
    return require(request);
  }

  const context = vm.createContext({
    module,
    exports: module.exports,
    require: localRequire,
    __dirname: path.dirname(absolutePath),
    __filename: absolutePath,
    console,
    process,
    crypto: globalThis.crypto,
    TextEncoder: globalThis.TextEncoder,
    TextDecoder: globalThis.TextDecoder,
    btoa: globalThis.btoa,
    atob: globalThis.atob,
    AbortController: globalThis.AbortController,
    URLSearchParams: globalThis.URLSearchParams,
    fetch: globalThis.fetch,
    Headers: globalThis.Headers,
    Response: globalThis.Response,
    Blob: globalThis.Blob,
    setTimeout,
    clearTimeout,
  });
  new vm.Script(transpiled.outputText, { filename: absolutePath }).runInContext(context);
  return module.exports;
}

function loadTsModule(relativePath) {
  return loadFile(path.resolve(frontendRoot, relativePath));
}

module.exports = { loadTsModule };
