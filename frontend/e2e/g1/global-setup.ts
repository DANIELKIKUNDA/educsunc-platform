import type { FullConfig } from '@playwright/test';

type G1ActorCode =
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

interface DeveloperSessionPayload {
  accessToken?: string;
  sessionId?: string;
}

interface EffectiveProfilePayload {
  acteurCodeActif?: string;
  permissionsEffectives?: readonly string[];
  contexte?: {
    governanceLevel?: string;
    organisationId?: string | null;
    ecoleId?: string | null;
  };
}

function backendUrlFrom(config: FullConfig): string {
  const configured = process.env.EDUCSYN_BACKEND_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

  const frontendProject = config.projects[0];
  const baseUrl = String(frontendProject?.use?.baseURL ?? 'http://127.0.0.1:4174');
  return baseUrl.replace(/:\d+$/, ':3000').replace(/\/$/, '');
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  return response.json().catch(() => ({})) as Promise<Record<string, unknown>>;
}

async function assertResponse(response: Response, code: string): Promise<void> {
  if (response.ok) return;
  const payload = await readJson(response);
  throw new Error(
    `${code}: HTTP ${response.status}. ${String(payload.message ?? payload.code ?? 'Réponse sans détail métier.')}`,
  );
}

async function verifyDeveloperActor(
  backendUrl: string,
  actorCode: G1ActorCode,
): Promise<void> {
  const sessionResponse = await fetch(`${backendUrl}/api/auth/dev/session`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      actorCode,
      deviceId: `g1-preflight-${actorCode.toLowerCase()}`,
    }),
  });
  await assertResponse(sessionResponse, `G1_SESSION_DEVELOPPEUR_${actorCode}_INDISPONIBLE`);
  const session = await readJson(sessionResponse) as unknown as DeveloperSessionPayload;

  if (!session.accessToken || !session.sessionId) {
    throw new Error(
      `G1_SESSION_DEVELOPPEUR_${actorCode}_INCOMPLETE: access token ou session absente.`,
    );
  }

  const authHeaders = {
    authorization: `Bearer ${session.accessToken}`,
    'x-session-id': session.sessionId,
  };
  const profileResponse = await fetch(`${backendUrl}/api/auth/profil`, {
    headers: authHeaders,
  });
  await assertResponse(profileResponse, `G1_PROFIL_EFFECTIF_${actorCode}_INDISPONIBLE`);
  const profile = await readJson(profileResponse) as unknown as EffectiveProfilePayload;

  if (profile.acteurCodeActif !== actorCode) {
    throw new Error(
      `G1_PROFIL_EFFECTIF_${actorCode}_INCOHERENT: acteur actif reçu ${profile.acteurCodeActif ?? 'aucun'}.`,
    );
  }

  if (actorCode === 'MANAGER_SYSTEME') {
    if (
      profile.contexte?.governanceLevel !== 'PLATEFORME'
      || profile.contexte.ecoleId
    ) {
      throw new Error(
        'G1_FIXTURE_MANAGER_PLATEFORME_INCOHERENTE: le Manager système doit ouvrir un contexte Plateforme sans école.',
      );
    }
    if (!profile.permissionsEffectives?.includes('audit.read')) {
      throw new Error(
        'G1_FIXTURE_MANAGER_AUDIT_ABSENTE: la permission effective audit.read est requise.',
      );
    }
  }

  if (actorCode === 'CAISSIER') {
    if (
      profile.contexte?.governanceLevel !== 'ECOLE'
      || !profile.contexte.organisationId
      || !profile.contexte.ecoleId
    ) {
      throw new Error(
        'G1_FIXTURE_CAISSIER_ECOLE_ABSENTE: la session développeur CAISSIER doit fournir une organisation et une école réelles.',
      );
    }
    if (!profile.permissionsEffectives?.includes('audit.finance.read')) {
      throw new Error(
        'G1_FIXTURE_CAISSIER_AUDIT_FINANCE_ABSENTE: la permission effective audit.finance.read est requise.',
      );
    }
  }

  await fetch(`${backendUrl}/api/auth/logout`, {
    method: 'POST',
    headers: {
      ...authHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ sessionId: session.sessionId }),
  }).catch(() => undefined);
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  const backendUrl = backendUrlFrom(config);
  const initializationResponse = await fetch(
    `${backendUrl}/api/auth/initialisation`,
  ).catch((error) => {
    throw new Error(
      `G1_BACKEND_INDISPONIBLE: ${error instanceof Error ? error.message : String(error)}`,
    );
  });
  await assertResponse(initializationResponse, 'G1_INITIALISATION_ILLISIBLE');
  const initialization = await readJson(initializationResponse);

  if (initialization.initialisationRequise === true) {
    throw new Error(
      'G1_BASE_NON_INITIALISEE: initialisez la plateforme avant la certification E2E G1.',
    );
  }

  for (const actorCode of [
    'MANAGER_SYSTEME',
    'SUPPORT_SYSTEME',
    'PROMOTEUR_ORGANISATION',
    'ADMIN_SYSTEME_ORGANISATION',
    'ADMINISTRATEUR_ECOLE',
    'ADMIN_SYSTEME_ECOLE',
    'PREFET_ETUDES',
    'SECRETAIRE',
    'CAISSIER',
    'ENSEIGNANT',
    'PARENT',
  ] as const) {
    await verifyDeveloperActor(backendUrl, actorCode);
  }
}
