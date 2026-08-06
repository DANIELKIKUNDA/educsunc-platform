import { expect, test } from '@playwright/test';
import {
  assertResponsesSuccessful,
  expectNoForbiddenTextFlash,
  expectTextContinuouslyAbsent,
  installForbiddenTextProbe,
  observeRequests,
  openRealDeveloperSession,
} from './helpers/g1-session';

const PLATFORM_AUDIT_PATHS = [
  '/api/v1/audit',
  '/api/v1/audit/history',
  '/api/v1/audit/timeline',
] as const;

const SCHOOL_FINANCE_AUDIT_PATHS = [
  '/api/v1/ecole/audit/administratif-financier',
  '/api/v1/ecole/audit/administratif-financier/history',
  '/api/v1/ecole/audit/administratif-financier/timeline',
] as const;

test.describe('G1 - gouvernance globale des accès frontend', () => {
  const additionalActorMatrix = [
    ['PROMOTEUR_ORGANISATION', 'ORGANISATION'],
    ['ADMIN_SYSTEME_ORGANISATION', 'ORGANISATION'],
    ['ADMINISTRATEUR_ECOLE', 'ECOLE'],
    ['ADMIN_SYSTEME_ECOLE', 'ECOLE'],
    ['PREFET_ETUDES', 'ECOLE'],
    ['SECRETAIRE', 'ECOLE'],
    ['ENSEIGNANT', 'ECOLE'],
    ['PARENT', 'ECOLE'],
  ] as const;

  for (const [actorCode, governanceLevel] of additionalActorMatrix) {
    test(`${actorCode} reçoit uniquement son profil et son niveau effectifs`, async ({ page }) => {
      const profile = await openRealDeveloperSession(page, actorCode);

      expect(profile.acteurCodeActif).toBe(actorCode);
      expect(profile.contexte.governanceLevel).toBe(governanceLevel);
      await expect(page.locator('.erp-shell')).toBeVisible();
    });
  }

  test('MANAGER_SYSTEME consulte l audit plateforme sans contexte école', async ({ page }) => {
    const profile = await openRealDeveloperSession(page, 'MANAGER_SYSTEME');
    expect(profile.contexte.governanceLevel).toBe('PLATEFORME');
    expect(profile.contexte.ecoleId).toBeNull();

    const auditRequests = observeRequests(
      page,
      (url, method) => method === 'GET' && PLATFORM_AUDIT_PATHS.includes(
        url.pathname as (typeof PLATFORM_AUDIT_PATHS)[number],
      ),
    );
    const responses = PLATFORM_AUDIT_PATHS.map((pathname) =>
      page.waitForResponse((response) =>
        response.request().method() === 'GET'
        && new URL(response.url()).pathname === pathname));

    await page.goto('/app/audit/plateforme', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/app\/audit\/plateforme$/);
    await expect(page.getByRole('heading', { name: 'Audit plateforme' })).toBeVisible();
    await assertResponsesSuccessful(await Promise.all(responses), 'Audit plateforme');

    expect(auditRequests).toHaveLength(PLATFORM_AUDIT_PATHS.length);
    for (const request of auditRequests) {
      expect(request.headers.authorization).toMatch(/^Bearer /);
      expect(request.headers['x-session-id']).toBeTruthy();
      expect(request.headers['x-organisation-id']).toBeUndefined();
      expect(request.headers['x-tenant-id']).toBeUndefined();
      expect(request.headers['x-ecole-id']).toBeUndefined();
    }
  });

  test('SUPPORT_SYSTEME ne voit ni menu ni action interdits et une URL directe est refusée', async ({ page }) => {
    await openRealDeveloperSession(page, 'SUPPORT_SYSTEME');
    await page.goto('/app/audit/plateforme', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Audit plateforme' })).toBeVisible();

    const sidebar = page.locator('.erp-sidebar');
    await expect(
      sidebar.locator('.erp-sidebar__module-copy strong').filter({ hasText: /^Plateforme$/ }),
    ).toHaveCount(0);
    await expect(
      sidebar.locator('.erp-sidebar__module-copy strong').filter({ hasText: /^Organisation$/ }),
    ).toHaveCount(0);

    const globalSearch = page.locator('.erp-topbar__search input');
    await globalSearch.fill('Publier une version officielle');
    await expect(page.locator('.erp-topbar__search-results')).toHaveCount(0);

    const forbiddenApiCalls = observeRequests(
      page,
      (url) => url.pathname.startsWith('/api/organisations'),
    );
    await installForbiddenTextProbe(page, ['Registre des organisations']);
    await page.goto('/app/organisation/ecoles', { waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveURL(/\/app\/organisation\/ecoles$/);
    await expect(page.getByRole('heading', { name: 'Registre des organisations' })).toHaveCount(0);
    await expectNoForbiddenTextFlash(page);
    expect(forbiddenApiCalls).toHaveLength(0);
  });

  test('CAISSIER ouvre uniquement l audit financier de son école', async ({ page }) => {
    const profile = await openRealDeveloperSession(page, 'CAISSIER');
    expect(profile.contexte.governanceLevel).toBe('ECOLE');
    expect(profile.contexte.organisationId).toBeTruthy();
    expect(profile.contexte.ecoleId).toBeTruthy();
    expect(profile.permissionsEffectives).toContain('audit.finance.read');

    const responses = SCHOOL_FINANCE_AUDIT_PATHS.map((pathname) =>
      page.waitForResponse((response) =>
        response.request().method() === 'GET'
        && new URL(response.url()).pathname === pathname));
    const auditRequests = observeRequests(
      page,
      (url, method) => method === 'GET' && SCHOOL_FINANCE_AUDIT_PATHS.includes(
        url.pathname as (typeof SCHOOL_FINANCE_AUDIT_PATHS)[number],
      ),
    );

    await page.goto('/app/audit/ecole/administratif-financier', {
      waitUntil: 'domcontentloaded',
    });
    await expect(page).toHaveURL(/\/app\/audit\/ecole\/administratif-financier$/);
    await expect(
      page.getByRole('heading', { name: 'Audit administratif et financier' }),
    ).toBeVisible();
    await assertResponsesSuccessful(await Promise.all(responses), 'Audit financier école');

    expect(auditRequests).toHaveLength(SCHOOL_FINANCE_AUDIT_PATHS.length);
    for (const request of auditRequests) {
      expect(request.headers.authorization).toMatch(/^Bearer /);
      expect(request.headers['x-organisation-id']).toBe(profile.contexte.organisationId);
      expect(request.headers['x-tenant-id']).toBe(profile.contexte.ecoleId);
      expect(request.headers['x-ecole-id']).toBe(profile.contexte.ecoleId);
    }

    const sidebar = page.locator('.erp-sidebar');
    const financialAuditLink = sidebar.getByRole(
      'link',
      { name: 'Audit administratif et financier' },
    );
    if (await financialAuditLink.count() === 0) {
      await sidebar.getByRole('button', { name: /Audit/i }).click();
    }
    await expect(financialAuditLink).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Audit plateforme' })).toHaveCount(0);
    await expect(sidebar.getByRole('link', { name: 'Audit technique ecole' })).toHaveCount(0);
    await expect(
      sidebar.getByRole('link', { name: /Audit pedagogique/i }),
    ).toHaveCount(0);

    const forbiddenPlatformCalls = observeRequests(
      page,
      (url, method) => method === 'GET' && PLATFORM_AUDIT_PATHS.includes(
        url.pathname as (typeof PLATFORM_AUDIT_PATHS)[number],
      ),
    );
    await installForbiddenTextProbe(page, ['Audit plateforme']);
    await page.goto('/app/audit/plateforme', { waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveURL(/\/app\/audit\/plateforme$/);
    await expect(page.getByRole('heading', { name: 'Audit plateforme' })).toHaveCount(0);
    await expectNoForbiddenTextFlash(page);
    expect(forbiddenPlatformCalls).toHaveLength(0);
  });

  test('le changement Plateforme vers Organisation est confirmé sans flash interdit', async ({ page }) => {
    await openRealDeveloperSession(page, 'MANAGER_SYSTEME');

    const organizationsResponse = page.waitForResponse((response) =>
      response.request().method() === 'GET'
      && new URL(response.url()).pathname === '/api/organisations');
    await page.goto('/app/organisation/ecoles', { waitUntil: 'domcontentloaded' });
    const organizations = await organizationsResponse;
    expect(organizations.ok(), 'La fixture doit exposer au moins une organisation réelle.').toBeTruthy();

    const organizationSelect = page.locator(
      '.context-strip__field--wide select',
    ).first();
    await expect.poll(async () =>
      organizationSelect.locator('option:not([disabled])').count()).toBeGreaterThan(0);
    const organizationId = await organizationSelect
      .locator('option:not([disabled])')
      .first()
      .getAttribute('value');
    if (!organizationId) {
      throw new Error(
        'G1_FIXTURE_ORGANISATION_ABSENTE: créez une organisation réelle pour certifier le changement de contexte.',
      );
    }

    const contextResponse = page.waitForResponse((response) =>
      response.request().method() === 'PUT'
      && new URL(response.url()).pathname === '/api/auth/contexte/organisation-active');
    const profileResponse = page.waitForResponse((response) =>
      response.request().method() === 'GET'
      && new URL(response.url()).pathname === '/api/auth/profil');
    await organizationSelect.selectOption(organizationId);
    const [contextChange, effectiveProfile] = await Promise.all([
      contextResponse,
      profileResponse,
    ]);
    await assertResponsesSuccessful(
      [contextChange, effectiveProfile],
      'Activation du contexte organisation',
    );

    await expect(page.locator('.context-strip__field').first().locator('select'))
      .toHaveValue('ORGANISATION');
    await expectTextContinuouslyAbsent(page, 'Référentiel officiel');
    await expectTextContinuouslyAbsent(page, 'Audit plateforme');

    const levelSelect = page.locator('.context-strip__field').first().locator('select');
    const platformContextResponse = page.waitForResponse((response) =>
      response.request().method() === 'PUT'
      && new URL(response.url()).pathname === '/api/auth/contexte/plateforme-active');
    const platformProfileResponse = page.waitForResponse((response) =>
      response.request().method() === 'GET'
      && new URL(response.url()).pathname === '/api/auth/profil');
    await levelSelect.selectOption('PLATEFORME');
    await assertResponsesSuccessful(
      await Promise.all([platformContextResponse, platformProfileResponse]),
      'Retour au contexte plateforme',
    );
    await expect(levelSelect).toHaveValue('PLATEFORME');
  });

  test('la déconnexion purge la session et quitte immédiatement le shell', async ({ page }) => {
    await openRealDeveloperSession(page, 'MANAGER_SYSTEME');

    await page.locator('.erp-user-menu__summary').click();
    const logoutResponse = page.waitForResponse((response) =>
      response.request().method() === 'POST'
      && new URL(response.url()).pathname === '/api/auth/logout');
    await page.getByRole('button', { name: 'Se déconnecter' }).click();
    expect((await logoutResponse).ok()).toBeTruthy();

    await expect(page).toHaveURL(/\/connexion$/);
    await expect(page.locator('.erp-shell')).toHaveCount(0);
  });
});
