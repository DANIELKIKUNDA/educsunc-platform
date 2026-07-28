import { expect, type Page, type Response } from '@playwright/test';

export type G1ActorCode =
  | 'MANAGER_SYSTEME'
  | 'SUPPORT_SYSTEME'
  | 'PROMOTEUR_ORGANISATION'
  | 'ADMIN_SYSTEME_ORGANISATION'
  | 'ADMINISTRATEUR_ECOLE'
  | 'ADMIN_SYSTEME_ECOLE'
  | 'PREFET_ETUDES'
  | 'SECRETAIRE'
  | 'CAISSIER'
  | 'ENSEIGNANT'
  | 'PARENT';

export interface G1EffectiveProfile {
  readonly acteurCodeActif: G1ActorCode;
  readonly permissionsEffectives: readonly string[];
  readonly contexte: {
    readonly governanceLevel: 'PLATEFORME' | 'ORGANISATION' | 'ECOLE';
    readonly organisationId: string | null;
    readonly ecoleId: string | null;
  };
}

interface G1DeveloperSession {
  readonly sessionId: string;
  readonly utilisateur: {
    readonly idUtilisateur: string;
    readonly nomComplet: string;
    readonly email: string;
  };
}

const actorLabels: Record<G1ActorCode, RegExp> = {
  MANAGER_SYSTEME: /Manager syst[eè]me/i,
  SUPPORT_SYSTEME: /Support syst[eè]me/i,
  PROMOTEUR_ORGANISATION: /Promoteur/i,
  ADMIN_SYSTEME_ORGANISATION: /Admin syst[eè]me organisation/i,
  ADMINISTRATEUR_ECOLE: /Administrateur [eé]cole/i,
  ADMIN_SYSTEME_ECOLE: /Admin syst[eè]me [eé]cole/i,
  PREFET_ETUDES: /Pr[eé]fet des [eé]tudes/i,
  SECRETAIRE: /Secr[eé]taire/i,
  CAISSIER: /Caissier/i,
  ENSEIGNANT: /Enseignant/i,
  PARENT: /Parent/i,
};

function actorGovernanceLevel(
  actorCode: G1ActorCode,
): G1EffectiveProfile['contexte']['governanceLevel'] {
  if (actorCode === 'MANAGER_SYSTEME' || actorCode === 'SUPPORT_SYSTEME') {
    return 'PLATEFORME';
  }
  if (
    actorCode === 'PROMOTEUR_ORGANISATION'
    || actorCode === 'ADMIN_SYSTEME_ORGANISATION'
  ) {
    return 'ORGANISATION';
  }
  return 'ECOLE';
}

function isResponsePath(response: Response, method: string, pathname: string): boolean {
  const url = new URL(response.url());
  return response.request().method() === method && url.pathname === pathname;
}

async function responseError(response: Response): Promise<string> {
  const body = await response.text().catch(() => '');
  return body.replace(/\s+/g, ' ').slice(0, 600);
}

export async function openRealDeveloperSession(
  page: Page,
  actorCode: G1ActorCode,
): Promise<G1EffectiveProfile> {
  const backendUrl = (process.env.EDUCSYN_BACKEND_URL ?? 'http://127.0.0.1:3000')
    .replace(/\/$/, '');
  const governanceLevel = actorGovernanceLevel(actorCode);
  const organisationActiveId = governanceLevel === 'PLATEFORME'
    ? undefined
    : process.env.EDUCSYN_G1_ORGANISATION_ID;
  const ecoleActiveId = governanceLevel === 'ECOLE'
    ? process.env.EDUCSYN_G1_ECOLE_ID
    : undefined;
  if (
    governanceLevel !== 'PLATEFORME'
    && (!organisationActiveId || (governanceLevel === 'ECOLE' && !ecoleActiveId))
  ) {
    throw new Error(
      `G1_TENANT_REEL_${actorCode}_ABSENT: le precontrole doit fournir le contexte reel.`,
    );
  }
  const developerSessionResponse = await page.request.post(
    `${backendUrl}/api/auth/dev/session`,
    {
      data: {
        actorCode,
        organisationActiveId,
        ecoleActiveId,
        deviceId: `g1-browser-${actorCode.toLowerCase()}`,
      },
    },
  );
  expect(
    developerSessionResponse.ok(),
    `La vraie session développeur ${actorCode} doit être ouverte. ${
      (await developerSessionResponse.text()).replace(/\s+/g, ' ').slice(0, 600)
    }`,
  ).toBeTruthy();
  const developerSession = await developerSessionResponse.json() as G1DeveloperSession;

  await page.addInitScript((session) => {
    window.localStorage.removeItem('educsync.auth.session');
    window.localStorage.removeItem('educsync.frontend.active-context');
    window.sessionStorage.removeItem('educsync.auth.session-current-tab');
    window.localStorage.setItem(
      'educsync.auth.session',
      JSON.stringify({
        sessionId: session.sessionId,
        actorCode: session.actorCode,
        userId: session.userId,
        displayName: session.displayName,
        email: session.email,
        rememberMe: true,
      }),
    );
  }, {
    sessionId: developerSession.sessionId,
    actorCode,
    userId: developerSession.utilisateur.idUtilisateur,
    displayName: developerSession.utilisateur.nomComplet,
    email: developerSession.utilisateur.email,
  });

  const profileResponse = page.waitForResponse((response) =>
    isResponsePath(response, 'GET', '/api/auth/profil'));

  await page.goto('/app', { waitUntil: 'domcontentloaded' });
  const profile = await profileResponse;
  expect(
    profile.ok(),
    `Le profil effectif ${actorCode} doit être relu. ${await responseError(profile)}`,
  ).toBeTruthy();

  const payload = await profile.json() as G1EffectiveProfile;
  expect(payload.acteurCodeActif).toBe(actorCode);
  await expect(page.locator('.erp-user-menu__summary')).toContainText(actorLabels[actorCode]);
  await expect(page.locator('.erp-user-menu__switch select')).toHaveValue(actorCode);
  await expect(page.locator('.erp-shell')).toBeVisible();

  return payload;
}

export function observeRequests(
  page: Page,
  predicate: (url: URL, method: string) => boolean,
): Array<{ url: URL; headers: Record<string, string>; method: string }> {
  const observed: Array<{ url: URL; headers: Record<string, string>; method: string }> = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!predicate(url, request.method())) return;
    observed.push({
      url,
      method: request.method(),
      headers: request.headers(),
    });
  });
  return observed;
}

export async function installForbiddenTextProbe(
  page: Page,
  forbiddenTexts: readonly string[],
): Promise<void> {
  await page.addInitScript((texts) => {
    const state = { seen: [] as string[] };
    Object.defineProperty(window, '__g1ForbiddenTextProbe', {
      configurable: true,
      value: state,
    });

    const inspect = () => {
      const visibleText = document.body?.innerText ?? '';
      for (const text of texts) {
        if (visibleText.includes(text) && !state.seen.includes(text)) {
          state.seen.push(text);
        }
      }
    };

    document.addEventListener('DOMContentLoaded', () => {
      inspect();
      new MutationObserver(inspect).observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
      const deadline = Date.now() + 10_000;
      const inspectFrame = () => {
        inspect();
        if (Date.now() < deadline) requestAnimationFrame(inspectFrame);
      };
      requestAnimationFrame(inspectFrame);
    }, { once: true });
  }, forbiddenTexts);
}

export async function expectNoForbiddenTextFlash(page: Page): Promise<void> {
  const seen = await page.evaluate(() => (
    window as Window & { __g1ForbiddenTextProbe?: { seen: string[] } }
  ).__g1ForbiddenTextProbe?.seen ?? []);
  expect(seen, 'Aucun contenu interdit ne doit apparaître, même transitoirement.').toEqual([]);
}

export async function expectTextContinuouslyAbsent(
  page: Page,
  text: string,
  durationMs = 800,
): Promise<void> {
  const deadline = Date.now() + durationMs;
  while (Date.now() < deadline) {
    const visible = await page.getByText(text, { exact: true }).first()
      .isVisible()
      .catch(() => false);
    expect(visible, `"${text}" ne doit pas réapparaître pendant la transition.`).toBeFalsy();
    await page.waitForTimeout(25);
  }
}

export async function assertResponsesSuccessful(
  responses: readonly Response[],
  label: string,
): Promise<void> {
  for (const response of responses) {
    expect(
      response.ok(),
      `${label}: ${response.request().method()} ${response.url()} a répondu HTTP ${response.status()}. ${await responseError(response)}`,
    ).toBeTruthy();
  }
}
