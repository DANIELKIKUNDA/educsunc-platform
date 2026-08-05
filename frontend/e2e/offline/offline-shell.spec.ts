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
    try {
      await fetch('/health/live');
    } catch {
      // Les sondes de sante ne doivent jamais entrer dans CacheStorage.
    }
  });
  const cachedApiRequests = await page.evaluate(async () => {
    const requests: string[] = [];
    for (const cacheName of await caches.keys()) {
      const cache = await caches.open(cacheName);
      requests.push(...(await cache.keys()).map((request) => request.url));
    }
    return requests.filter((url) => {
      const path = new URL(url).pathname;
      return path.startsWith('/api/') || path.startsWith('/health/');
    });
  });
  expect(cachedApiRequests).toEqual([]);

  await page.context().setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#app > *').first()).toBeVisible();
});

test('une session deja validee reste ouverte pendant une coupure reseau', async ({ page }) => {
  await page.route('http://localhost:3000/**', (route) => route.abort('internetdisconnected'));
  await page.addInitScript(() => {
    localStorage.setItem('educsync.auth.session', JSON.stringify({
      sessionId: 'offline-session-proof',
      actorCode: 'MANAGER_SYSTEME',
      userId: 'offline-user-proof',
      displayName: 'Nadia Ilunga',
      email: 'nadia@example.test',
      rememberMe: true,
      effectiveProfile: {
        version: 1,
        resolved: true,
        source: 'PROFIL_EFFECTIF',
        actorCodes: ['MANAGER_SYSTEME'],
        roleActif: 'MANAGER_SYSTEME',
        permissionsEffectives: ['referentiel.read'],
        scopes: [{ typeScope: 'PLATEFORME', valeurScope: '*', estLectureSeule: false }],
        restrictions: [],
        modulesEffectifs: [],
        compte: { id: 'offline-user-proof', actif: true },
        session: { id: 'offline-session-proof', actif: true },
        contexte: { governanceLevel: 'PLATEFORME', utilisateurId: 'offline-user-proof' },
        titulariats: { actifs: [], effectifs: [], estTitulaireEffectif: false, source: 'AUCUNE' },
        ownership: { elevesAutorises: [] },
      },
    }));
  });

  await page.goto('/app', { waitUntil: 'domcontentloaded' });
  await expect(page).not.toHaveURL(/connexion|login/);
  await expect(page.getByText('Session hors connexion').first()).toBeVisible();
  await expect(page.getByLabel("Ouvrir l'état de connexion et de synchronisation")).toBeVisible();
});
