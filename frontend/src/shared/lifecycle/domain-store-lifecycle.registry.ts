import type { FrontendStoreScope } from './frontend-lifecycle.coordinator';
import { frontendLifecycle } from './frontend-lifecycle.runtime';

interface ResettableStore {
  reinitialiser(): void;
}

type DomainStoreModule = Record<string, unknown>;

const domainStoreModules = import.meta.glob<DomainStoreModule>(
  '../../domains/**/stores/*.store.ts',
  { eager: true },
);

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

  for (const [path, moduleExports] of Object.entries(domainStoreModules)) {
    const fileName = path.split('/').at(-1) ?? path;
    if (scopedInstanceStoreFiles.has(fileName)) {
      continue;
    }

    const store = resolveStore(moduleExports);
    if (!store) {
      continue;
    }

    frontendLifecycle.registerStore({
      id: path,
      scope: storeScope(path),
      reset: store.reinitialiser,
    });
  }
}
