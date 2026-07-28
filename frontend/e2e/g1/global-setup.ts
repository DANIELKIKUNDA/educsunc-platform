import type { FullConfig } from '@playwright/test';
import { randomBytes } from 'node:crypto';

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

interface SessionTenant {
  readonly organisationId: string;
  readonly ecoleId?: string;
}

interface CertificationTenant extends SessionTenant {
  readonly ecoleId: string;
}

interface OrganisationPayload {
  readonly id?: string;
  readonly code?: string;
}

interface EcolePayload {
  readonly id?: string;
  readonly code?: string;
}

const CERTIFICATION_ORGANISATION_CODE = 'G1-CERTIFICATION';
const CERTIFICATION_ECOLE_CODE = 'G1-ECOLE';
const CERTIFICATION_MODULES = [
  'REFERENTIEL_ACADEMIQUE',
  'SCOLARITE_ELEVES',
  'PAIEMENTS_FACTURATION',
  'BULLETINS_EVALUATIONS',
  'NOTIFICATIONS',
  'AUDIT',
  'MONITORING',
] as const;

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
  const nestedError = payload.error && typeof payload.error === 'object'
    ? payload.error as Record<string, unknown>
    : undefined;
  throw new Error(
    `${code}: HTTP ${response.status}. ${String(
      payload.message
      ?? payload.code
      ?? nestedError?.message
      ?? nestedError?.code
      ?? 'Réponse sans détail métier.',
    )}`,
  );
}

async function ensurePlatformInitialized(
  backendUrl: string,
  initializationRequired: boolean,
): Promise<void> {
  if (!initializationRequired) return;

  const password = `G1!${randomBytes(18).toString('base64url')}a9`;
  const initializationResponse = await fetch(`${backendUrl}/api/auth/initialisation`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      nom: 'Certification',
      postnom: 'G1',
      prenom: 'EduSync',
      email: `g1-${Date.now()}@certification.educsync.test`,
      motDePasse: password,
      confirmationMotDePasse: password,
      seSouvenirDeMoi: false,
      deviceId: 'g1-platform-bootstrap',
    }),
  });
  await assertResponse(initializationResponse, 'G1_INITIALISATION_PLATEFORME_ECHOUEE');

  const statusResponse = await fetch(`${backendUrl}/api/auth/initialisation`);
  await assertResponse(statusResponse, 'G1_INITIALISATION_PLATEFORME_ILLISIBLE');
  const status = await readJson(statusResponse);
  if (status.initialisationRequise === true) {
    throw new Error(
      'G1_INITIALISATION_PLATEFORME_INCOMPLETE: PostgreSQL demande toujours une initialisation.',
    );
  }
}

async function openDeveloperSession(
  backendUrl: string,
  actorCode: G1ActorCode,
  tenant?: SessionTenant,
): Promise<DeveloperSessionPayload> {
  const response = await fetch(`${backendUrl}/api/auth/dev/session`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      actorCode,
      organisationActiveId: tenant?.organisationId,
      ecoleActiveId: tenant?.ecoleId,
      deviceId: `g1-preflight-${actorCode.toLowerCase()}`,
    }),
  });
  await assertResponse(response, `G1_SESSION_DEVELOPPEUR_${actorCode}_INDISPONIBLE`);
  const session = await readJson(response) as unknown as DeveloperSessionPayload;

  if (!session.accessToken || !session.sessionId) {
    throw new Error(
      `G1_SESSION_DEVELOPPEUR_${actorCode}_INCOMPLETE: access token ou session absente.`,
    );
  }
  return session;
}

function authHeaders(session: DeveloperSessionPayload): Record<string, string> {
  return {
    authorization: `Bearer ${session.accessToken}`,
    'x-session-id': String(session.sessionId),
  };
}

async function ensureCertificationTenant(
  backendUrl: string,
): Promise<CertificationTenant> {
  const manager = await openDeveloperSession(backendUrl, 'MANAGER_SYSTEME');
  const headers = authHeaders(manager);
  const organisationsResponse = await fetch(
    `${backendUrl}/api/organisations?page=1&taillePage=100`,
    { headers },
  );
  await assertResponse(organisationsResponse, 'G1_LISTE_ORGANISATIONS_INDISPONIBLE');
  const organisationsPayload = await readJson(organisationsResponse);
  const organisations = Array.isArray(organisationsPayload.donnees)
    ? organisationsPayload.donnees as OrganisationPayload[]
    : [];
  let organisation = organisations.find(
    (candidate) => candidate.code === CERTIFICATION_ORGANISATION_CODE,
  );

  if (!organisation?.id) {
    const creationResponse = await fetch(`${backendUrl}/api/organisations`, {
      method: 'POST',
      headers: {
        ...headers,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        code: CERTIFICATION_ORGANISATION_CODE,
        nom: 'Organisation Certification G1',
        typeOrganisation: 'RESEAU',
        description: 'Tenant reel reserve a la certification automatisee G1.',
      }),
    });
    await assertResponse(creationResponse, 'G1_CREATION_ORGANISATION_ECHOUEE');
    const creation = await readJson(creationResponse);
    organisation = creation.donnee as OrganisationPayload | undefined;
  }

  if (!organisation?.id) {
    throw new Error('G1_ORGANISATION_REELLE_ABSENTE: identifiant non retourne.');
  }

  const ecolesResponse = await fetch(
    `${backendUrl}/api/organisations/${organisation.id}/ecoles?page=1&taillePage=100`,
    {
      headers: {
        ...headers,
        'x-lecture-organisation': 'true',
      },
    },
  );
  await assertResponse(ecolesResponse, 'G1_LISTE_ECOLES_INDISPONIBLE');
  const ecolesPayload = await readJson(ecolesResponse);
  const ecoles = Array.isArray(ecolesPayload.donnees)
    ? ecolesPayload.donnees as EcolePayload[]
    : [];
  let ecole = ecoles.find((candidate) => candidate.code === CERTIFICATION_ECOLE_CODE);

  if (!ecole?.id) {
    const creationResponse = await fetch(`${backendUrl}/api/ecoles`, {
      method: 'POST',
      headers: {
        ...headers,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        idOrganisation: organisation.id,
        code: CERTIFICATION_ECOLE_CODE,
        nom: 'Ecole Certification G1',
        modeExploitation: 'SYNC',
      }),
    });
    await assertResponse(creationResponse, 'G1_CREATION_ECOLE_ECHOUEE');
    const creation = await readJson(creationResponse);
    ecole = creation.donnee as EcolePayload | undefined;
  }

  if (!ecole?.id) {
    throw new Error('G1_ECOLE_REELLE_ABSENTE: identifiant non retourne.');
  }

  const modulesOrganisationResponse = await fetch(
    `${backendUrl}/api/v1/configuration/modules/organisations/${organisation.id}`,
    {
      method: 'PUT',
      headers: {
        ...headers,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ modules: CERTIFICATION_MODULES }),
    },
  );
  await assertResponse(
    modulesOrganisationResponse,
    'G1_MODULES_ORGANISATION_INDISPONIBLES',
  );

  const modulesEcoleResponse = await fetch(
    `${backendUrl}/api/v1/configuration/modules/ecoles/${ecole.id}`,
    {
      method: 'PUT',
      headers: {
        ...headers,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        organisationId: organisation.id,
        modules: CERTIFICATION_MODULES,
      }),
    },
  );
  await assertResponse(modulesEcoleResponse, 'G1_MODULES_ECOLE_INDISPONIBLES');

  await fetch(`${backendUrl}/api/auth/logout`, {
    method: 'POST',
    headers: {
      ...headers,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ sessionId: manager.sessionId }),
  }).catch(() => undefined);

  return {
    organisationId: organisation.id,
    ecoleId: ecole.id,
  };
}

async function verifyDeveloperActor(
  backendUrl: string,
  actorCode: G1ActorCode,
  tenant: CertificationTenant,
): Promise<void> {
  const actorLevel = actorCode === 'MANAGER_SYSTEME' || actorCode === 'SUPPORT_SYSTEME'
    ? 'PLATEFORME'
    : actorCode === 'PROMOTEUR_ORGANISATION' || actorCode === 'ADMIN_SYSTEME_ORGANISATION'
      ? 'ORGANISATION'
      : 'ECOLE';
  const session = await openDeveloperSession(
    backendUrl,
    actorCode,
    actorLevel === 'PLATEFORME'
      ? undefined
      : {
          organisationId: tenant.organisationId,
          ecoleId: actorLevel === 'ECOLE' ? tenant.ecoleId : undefined,
        },
  );
  const headers = authHeaders(session);
  const profileResponse = await fetch(`${backendUrl}/api/auth/profil`, {
    headers,
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
      || profile.contexte.organisationId !== tenant.organisationId
      || profile.contexte.ecoleId !== tenant.ecoleId
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
      ...headers,
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
  await ensurePlatformInitialized(
    backendUrl,
    initialization.initialisationRequise === true,
  );
  const tenant = await ensureCertificationTenant(backendUrl);
  process.env.EDUCSYN_G1_ORGANISATION_ID = tenant.organisationId;
  process.env.EDUCSYN_G1_ECOLE_ID = tenant.ecoleId;

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
    await verifyDeveloperActor(backendUrl, actorCode, tenant);
  }
}
