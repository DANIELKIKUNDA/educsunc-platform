import { expect, test } from '@playwright/test';

test('le shell de production est servi hors ligne sans mettre les API en cache', async ({ page }) => {
  await page.goto('/login');
  const serviceWorker = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return {
      scope: registration.scope,
      scriptUrl: registration.active?.scriptURL ?? '',
    };
  });
  expect(serviceWorker.scope).toBe('http://127.0.0.1:4187/');
  expect(serviceWorker.scriptUrl).toContain('/sw.js');

  // Le premier chargement installe le worker; le suivant lui permet de mettre en cache
  // les actifs Vite hashes qu'il controle desormais.
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('#app > *').first()).toBeVisible();

  await page.evaluate(async () => {
    try {
      await fetch('/api/d1-7-cache-probe');
    } catch {
      // Seule l'absence dans CacheStorage est certifiee ici.
    }
  });
  const cachedApiRequests = await page.evaluate(async () => {
    const requests: string[] = [];
    for (const cacheName of await caches.keys()) {
      const cache = await caches.open(cacheName);
      requests.push(...(await cache.keys()).map((request) => request.url));
    }
    return requests.filter((url) => new URL(url).pathname.startsWith('/api/'));
  });
  expect(cachedApiRequests).toEqual([]);

  await page.context().setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#app > *').first()).toBeVisible();
});
