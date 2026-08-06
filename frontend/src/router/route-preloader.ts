import type { RouteLocationRaw, Router } from 'vue-router';

type NetworkAwareNavigator = Navigator & {
  connection?: {
    effectiveType?: string;
    saveData?: boolean;
  };
};

const loadedRoutes = new Set<string>();
const loadingRoutes = new Map<string, Promise<void>>();

function allowsIntentPreloading(): boolean {
  if (!navigator.onLine) return false;
  const connection = (navigator as NetworkAwareNavigator).connection;
  if (connection?.saveData) return false;
  return connection?.effectiveType !== 'slow-2g' && connection?.effectiveType !== '2g';
}

export function preloadRouteOnIntent(router: Router, destination: RouteLocationRaw): void {
  if (!allowsIntentPreloading()) return;

  const resolved = router.resolve(destination);
  const routeKey = resolved.fullPath;
  if (loadedRoutes.has(routeKey) || loadingRoutes.has(routeKey)) return;

  const loaders = resolved.matched.flatMap((record) =>
    Object.values(record.components ?? {})
      .filter((component): component is () => Promise<unknown> => typeof component === 'function'),
  );
  if (loaders.length === 0) return;

  const loading = Promise.all(loaders.map((loader) => loader()))
    .then(() => {
      loadedRoutes.add(routeKey);
    })
    .catch(() => {
      // La navigation normale garde la responsabilite d'afficher une erreur exploitable.
    })
    .finally(() => {
      loadingRoutes.delete(routeKey);
    });

  loadingRoutes.set(routeKey, loading);
}
