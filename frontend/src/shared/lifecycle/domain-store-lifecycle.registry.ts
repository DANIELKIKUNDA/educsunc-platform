import type { FrontendStoreScope } from './frontend-lifecycle.coordinator';
import { frontendLifecycle } from './frontend-lifecycle.runtime';

interface ResettableStore {
  reinitialiser(): void;
}

type DomainStoreModule = Record<string, unknown>;
type DomainStoreLoader = () => Promise<DomainStoreModule>;

const domainStoreModules = import.meta.glob<DomainStoreModule>(
  '../../domains/**/stores/*.store.ts',
);
const registeredStoreFiles = new Set<string>();
const domainLoading = new Map<string, Promise<void>>();

const scopedInstanceStoreFiles = new Set([
  'configuration-center.store.ts',
  'configuration-modules.store.ts',
  'monitoring.store.ts',
  'notifications.store.ts',
]);

function isResettableStore(value: unknown): value is ResettableStore {
  return (
    typeof value === 'object'
    && value !== null
    && 'reinitialiser' in value
    && typeof value.reinitialiser === 'function'
  );
}

function storeScope(path: string): FrontendStoreScope {
  if (
    path.includes('/plateforme/')
    || path.includes('/security/')
    || path.endsWith('/platform-audit.store.ts')
    || path.endsWith('/school-administration.store.ts')
  ) {
    return 'platform';
  }
  if (
    path.endsWith('/organization-audit.store.ts')
    || path.endsWith('/organization-governance.store.ts')
  ) {
    return 'organization';
  }
  if (path.endsWith('/school-technical-audit.store.ts')) {
    return 'school';
  }
  return 'school-year';
}

function resolveStore(moduleExports: DomainStoreModule): ResettableStore | null {
  for (const [exportName, exportedValue] of Object.entries(moduleExports)) {
    if (
      /^use.+Store$/.test(exportName)
      && typeof exportedValue === 'function'
    ) {
      const store = (exportedValue as () => unknown)();
      return isResettableStore(store) ? store : null;
    }
    if (isResettableStore(exportedValue)) {
      return exportedValue;
    }
  }
  return null;
}

let initialized = false;

export function initializeDomainStoreLifecycleRegistry(): void {
  if (initialized) {
    return;
  }
  initialized = true;
}

const ROUTE_DOMAIN_NAMES = new Set([
  'academique',
  'administration-ecole',
  'audit',
  'configuration',
  'finances',
  'monitoring',
  'notifications',
  'organisation',
  'pedagogique',
  'plateforme',
  'scolarite',
  'security',
]);

function routeDomain(path: string): string | null {
  const segment = path.split('/').filter(Boolean)[1];
  return segment && ROUTE_DOMAIN_NAMES.has(segment) ? segment : null;
}

async function registerDomainStores(domain: string): Promise<void> {
  const matchingLoaders = Object.entries(domainStoreModules).filter(([path]) =>
    path.includes(`/domains/${domain}/stores/`),
  ) as Array<[string, DomainStoreLoader]>;

  await Promise.all(matchingLoaders.map(async ([path, loadModule]) => {
    if (registeredStoreFiles.has(path)) return;
    const fileName = path.split('/').at(-1) ?? path;
    if (scopedInstanceStoreFiles.has(fileName)) {
      registeredStoreFiles.add(path);
      return;
    }

    const moduleExports = await loadModule();
    const store = resolveStore(moduleExports);
    if (!store) {
      registeredStoreFiles.add(path);
      return;
    }

    frontendLifecycle.registerStore({
      id: path,
      scope: storeScope(path),
      reset: store.reinitialiser,
    });
    registeredStoreFiles.add(path);
  }));
}

export function prepareDomainLifecycleStores(path: string): Promise<void> {
  if (!initialized) initializeDomainStoreLifecycleRegistry();
  const domain = routeDomain(path);
  if (!domain) return Promise.resolve();

  const existing = domainLoading.get(domain);
  if (existing) return existing;
  const loading = registerDomainStores(domain).finally(() => domainLoading.delete(domain));
  domainLoading.set(domain, loading);
  return loading;
}
