import { authApi, type BackendLoginApiData } from './auth.api';
import { authEntryMode } from './auth-entry-mode';
import { registerAuthRecoveryHandler } from './auth-recovery';
import { sessionStore, type FrontendActorCode } from './session.store';
import { activeContextStore } from '../session/active-context.store';

const PERSISTENT_STORAGE_KEY = 'educsync.auth.session';
const TRANSIENT_STORAGE_KEY = 'educsync.auth.session-current-tab';
const DEVICE_STORAGE_KEY = 'educsync.auth.device-id';
const AUTH_CHANNEL_NAME = 'educsync-auth-events';

interface PersistedAuthSnapshot {
  sessionId: string;
  actorCode: FrontendActorCode;
  userId: string;
  displayName: string;
  email: string;
  rememberMe: boolean;
  organisationActiveId?: string;
  ecoleActiveId?: string;
}

let refreshInFlight: Promise<boolean> | null = null;
let initializationInFlight: Promise<void> | null = null;
let authChannel: BroadcastChannel | null = null;

function getStorage(rememberMe: boolean): Storage | null {
  if (typeof window === 'undefined') return null;
  return rememberMe ? window.localStorage : window.sessionStorage;
}

function readSnapshot(): PersistedAuthSnapshot | null {
  if (typeof window === 'undefined') return null;
  const candidates = [
    window.sessionStorage.getItem(TRANSIENT_STORAGE_KEY),
    window.localStorage.getItem(PERSISTENT_STORAGE_KEY),
  ];
  for (const raw of candidates) {
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as PersistedAuthSnapshot;
      if (parsed.sessionId && parsed.userId && parsed.actorCode) return parsed;
    } catch {
      // Une valeur locale alteree est simplement ignoree; elle ne prouve jamais une identite.
    }
  }
  return null;
}

function writeSnapshot(snapshot: PersistedAuthSnapshot): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PERSISTENT_STORAGE_KEY);
  window.sessionStorage.removeItem(TRANSIENT_STORAGE_KEY);
  const storage = getStorage(snapshot.rememberMe);
  storage?.setItem(
    snapshot.rememberMe ? PERSISTENT_STORAGE_KEY : TRANSIENT_STORAGE_KEY,
    JSON.stringify(snapshot),
  );
}

function clearSnapshot(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PERSISTENT_STORAGE_KEY);
  window.sessionStorage.removeItem(TRANSIENT_STORAGE_KEY);
}

function getDeviceId(): string {
  if (typeof window === 'undefined') return 'educsync-browser';
  const existing = window.localStorage.getItem(DEVICE_STORAGE_KEY);
  if (existing) return existing;
  const generated = globalThis.crypto?.randomUUID?.() ?? `browser-${Date.now()}`;
  window.localStorage.setItem(DEVICE_STORAGE_KEY, generated);
  return generated;
}

function isKnownActor(actorCode: string | undefined): actorCode is FrontendActorCode {
  return Boolean(actorCode && sessionStore.actorProfiles.some((profile) => profile.code === actorCode));
}

function decodeActorFromAccessToken(accessToken: string): string | undefined {
  try {
    const encoded = accessToken.split('.')[1];
    if (!encoded) return undefined;
    const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(normalized)) as Record<string, unknown>;
    return typeof payload.roleActif === 'string' ? payload.roleActif : undefined;
  } catch {
    return undefined;
  }
}

function applyGovernanceContext(
  actorCode: FrontendActorCode,
  organisationActiveId?: string,
  ecoleActiveId?: string,
): void {
  const profile = sessionStore.actorProfiles.find((candidate) => candidate.code === actorCode);
  const level = profile?.governanceLevels[0] ?? 'ECOLE';
  activeContextStore.setGovernanceLevel(level);
  activeContextStore.applyResolvedContext({
    organizationId: level === 'PLATEFORME' ? null : organisationActiveId ?? null,
    schoolId: level === 'ECOLE' ? ecoleActiveId ?? null : null,
  });
}

function snapshotFromState(rememberMe: boolean): PersistedAuthSnapshot {
  return {
    sessionId: sessionStore.state.sessionId ?? '',
    actorCode: sessionStore.state.actorCode,
    userId: sessionStore.state.userId,
    displayName: sessionStore.state.displayName,
    email: sessionStore.state.email,
    rememberMe,
    organisationActiveId: activeContextStore.state.organizationId || undefined,
    ecoleActiveId: activeContextStore.state.schoolId || undefined,
  };
}

function applyLoginResult(
  result: BackendLoginApiData,
  rememberMe: boolean,
  options?: { actorCode?: FrontendActorCode; developer?: boolean },
): void {
  const actorCandidate = options?.actorCode ?? result.acteurCode ?? decodeActorFromAccessToken(result.accessToken);
  if (!isKnownActor(actorCandidate)) {
    throw new Error("Le profil de travail associe a ce compte n'est pas disponible.");
  }

  sessionStore.applyBackendSession({
    accessToken: result.accessToken,
    sessionId: result.sessionId,
    userId: result.utilisateur.idUtilisateur,
    actorCode: actorCandidate,
    displayName: result.utilisateur.nomComplet,
    email: result.utilisateur.email,
    developer: options?.developer,
    permissions: result.permissions,
  });
  applyGovernanceContext(actorCandidate, result.organisationActiveId, result.ecoleActiveId);
  writeSnapshot(snapshotFromState(rememberMe));
  authChannel?.postMessage({ type: 'authenticated' });
}

async function validateRestoredSession(
  accessToken: string,
  snapshot: PersistedAuthSnapshot,
): Promise<void> {
  const session = await authApi.obtenirSession({ accessToken, sessionId: snapshot.sessionId });
  const profile = await authApi.obtenirProfil({ accessToken, sessionId: snapshot.sessionId });
  if (!isKnownActor(profile.acteurCode)) {
    throw new Error("Le profil de travail actif n'est pas reconnu.");
  }
  const context = await authApi.obtenirContexte({
    accessToken,
    sessionId: session.sessionId,
    utilisateurId: session.utilisateurId,
    organisationActiveId: snapshot.organisationActiveId ?? session.organisationActiveId,
    ecoleActiveId: snapshot.ecoleActiveId ?? session.ecoleActiveId,
  });
  sessionStore.applyBackendSession({
    accessToken,
    sessionId: session.sessionId,
    userId: session.utilisateurId,
    actorCode: profile.acteurCode,
    displayName: snapshot.displayName,
    email: snapshot.email,
    developer: authEntryMode === 'developer' && snapshot.email.startsWith('dev.'),
    permissions: profile.permissions,
  });
  applyGovernanceContext(
    profile.acteurCode,
    context.organisationActiveId ?? session.organisationActiveId,
    context.ecoleActiveId ?? session.ecoleActiveId,
  );
  writeSnapshot({ ...snapshot, actorCode: profile.acteurCode, sessionId: session.sessionId });
}

async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const snapshot = readSnapshot();
    if (!snapshot) return false;
    try {
      const refreshed = await authApi.rafraichir({
        sessionId: snapshot.sessionId,
        seSouvenirDeMoi: snapshot.rememberMe,
      });
      await validateRestoredSession(refreshed.accessToken, snapshot);
      return true;
    } catch {
      clearSnapshot();
      sessionStore.clearBackendSession('revoked');
      authChannel?.postMessage({ type: 'terminated' });
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

async function openDeveloperSessionForCurrentActor(): Promise<void> {
  if (sessionStore.state.isAuthenticated && sessionStore.state.accessToken && sessionStore.state.sessionId) {
    await authApi.deconnecter({
      accessToken: sessionStore.state.accessToken,
      sessionId: sessionStore.state.sessionId,
    }).catch(() => undefined);
  }
  clearSnapshot();
  const actorCode = sessionStore.state.actorCode;
  const profile = sessionStore.actorProfiles.find((candidate) => candidate.code === actorCode);
  const organizationId = profile?.governanceLevels.includes('PLATEFORME')
    ? undefined
    : activeContextStore.state.organizationId || undefined;
  const schoolId = profile?.governanceLevels.includes('ECOLE')
    ? activeContextStore.state.schoolId || undefined
    : undefined;
  const result = await authApi.ouvrirSessionDeveloppeur({
    actorCode,
    organisationActiveId: organizationId,
    ecoleActiveId: schoolId,
    deviceId: getDeviceId(),
  });
  applyLoginResult(result, false, { actorCode, developer: true });
}

function installMultiTabSync(): void {
  if (typeof window === 'undefined' || authChannel) return;
  if ('BroadcastChannel' in window) {
    authChannel = new BroadcastChannel(AUTH_CHANNEL_NAME);
    authChannel.addEventListener('message', (event: MessageEvent<{ type?: string }>) => {
      if (event.data?.type === 'terminated') {
        clearSnapshot();
        sessionStore.clearBackendSession('revoked');
        window.location.assign('/connexion?raison=session');
      }
      if (event.data?.type === 'authenticated' && !sessionStore.state.isAuthenticated) {
        void refreshSession().then((restored) => {
          if (restored) window.location.assign('/app');
        });
      }
    });
  }
}

async function performFrontendSessionInitialization(): Promise<void> {
  sessionStore.beginInitialization();
  installMultiTabSync();
  registerAuthRecoveryHandler(refreshSession);

  try {
    const status = await authApi.obtenirEtatInitialisation();
    sessionStore.setInitializationRequired(status.initialisationRequise);
    if (status.initialisationRequise) {
      clearSnapshot();
      sessionStore.clearBackendSession();
      sessionStore.completeInitialization('none');
      return;
    }

    if (await refreshSession()) {
      sessionStore.completeInitialization(sessionStore.state.authMode);
      return;
    }

    if (authEntryMode === 'developer') {
      await openDeveloperSessionForCurrentActor();
      sessionStore.completeInitialization('dev');
      return;
    }

    sessionStore.clearBackendSession();
    sessionStore.completeInitialization('none');
  } catch {
    sessionStore.clearBackendSession();
    sessionStore.completeInitialization('none');
  }
}

export function initializeFrontendSession(): Promise<void> {
  if (sessionStore.state.initialized) return Promise.resolve();
  if (initializationInFlight) return initializationInFlight;
  initializationInFlight = performFrontendSessionInitialization().finally(() => {
    initializationInFlight = null;
  });
  return initializationInFlight;
}

export async function connecterUtilisateur(params: {
  email: string;
  motDePasse: string;
  seSouvenirDeMoi: boolean;
}): Promise<void> {
  const result = await authApi.connecter({ ...params, deviceId: getDeviceId() });
  applyLoginResult(result, params.seSouvenirDeMoi);
}

export async function initialiserPremierManager(params: {
  nom: string;
  postnom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  confirmationMotDePasse: string;
  seSouvenirDeMoi: boolean;
}): Promise<void> {
  const result = await authApi.initialiserPlateforme({ ...params, deviceId: getDeviceId() });
  sessionStore.setInitializationRequired(false);
  applyLoginResult(result, params.seSouvenirDeMoi, { actorCode: 'MANAGER_SYSTEME' });
}

export async function deconnecterUtilisateur(): Promise<void> {
  const { accessToken, sessionId } = sessionStore.state;
  if (accessToken && sessionId) {
    await authApi.deconnecter({ accessToken, sessionId }).catch(() => undefined);
  }
  clearSnapshot();
  sessionStore.clearBackendSession('logout');
  authChannel?.postMessage({ type: 'terminated' });
}

export async function ouvrirSessionDeveloppeurActeurSelectionne(): Promise<void> {
  if (authEntryMode !== 'developer') throw new Error('Le mode developpeur est desactive.');
  await openDeveloperSessionForCurrentActor();
  sessionStore.completeInitialization('dev');
}

export async function changerOrganisationActiveFrontend(organizationId: string): Promise<void> {
  if (!sessionStore.state.accessToken || !sessionStore.state.sessionId) return;
  const context = await authApi.changerOrganisationActive({
    accessToken: sessionStore.state.accessToken,
    sessionId: sessionStore.state.sessionId,
    organisationActiveId: organizationId,
  });
  activeContextStore.applyResolvedContext({
    organizationId: context.organisationActiveId ?? organizationId,
    schoolId: context.ecoleActiveId ?? null,
  });
  const snapshot = readSnapshot();
  if (snapshot) writeSnapshot({ ...snapshot, organisationActiveId: organizationId, ecoleActiveId: undefined });
}

export async function changerEcoleActiveFrontend(schoolId: string): Promise<void> {
  if (!sessionStore.state.accessToken || !sessionStore.state.sessionId) return;
  const context = await authApi.changerEcoleActive({
    accessToken: sessionStore.state.accessToken,
    sessionId: sessionStore.state.sessionId,
    ecoleActiveId: schoolId,
  });
  activeContextStore.applyResolvedContext({
    organizationId: context.organisationActiveId ?? activeContextStore.state.organizationId,
    schoolId: context.ecoleActiveId ?? schoolId,
  });
  const snapshot = readSnapshot();
  if (snapshot) writeSnapshot({ ...snapshot, ecoleActiveId: schoolId });
}
