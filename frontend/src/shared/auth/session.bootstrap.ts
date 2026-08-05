import {
  authApi,
  type BackendEffectiveProfileApiData,
  type BackendLoginApiData,
} from './auth.api';
import { authEntryMode } from './auth-entry-mode';
import { registerAuthRecoveryHandler } from './auth-recovery';
import {
  sessionStore,
  type FrontendActorCode,
  type FrontendGovernanceLevel,
} from './session.store';
import { activeContextStore } from '../session/active-context.store';
import { ApiError } from '../http/api.client';
import type { EffectiveProfilePayloadV1 } from '../permissions/effective-profile.types';

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
  /** Projection d'affichage uniquement; elle ne contient aucun secret ni jeton. */
  effectiveProfile?: EffectiveProfilePayloadV1;
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
  governanceLevel?: FrontendGovernanceLevel,
): void {
  const profile = sessionStore.actorProfiles.find((candidate) => candidate.code === actorCode);
  const level = governanceLevel ?? profile?.governanceLevels[0] ?? 'ECOLE';
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
    effectiveProfile: JSON.parse(
      JSON.stringify(sessionStore.state.effectiveProfile),
    ) as EffectiveProfilePayloadV1,
  };
}

function isTemporaryConnectivityFailure(error: unknown): boolean {
  return error instanceof ApiError
    && (
      error.status === 0
      || error.status === 429
      || error.status >= 500
      || error.code === 'NETWORK_ERROR'
      || error.code === 'REQUEST_CANCELLED'
    );
}

function restoreOfflineSnapshot(snapshot: PersistedAuthSnapshot | null): boolean {
  if (!snapshot?.effectiveProfile || !isKnownActor(snapshot.actorCode)) return false;
  sessionStore.applyOfflineSession({
    sessionId: snapshot.sessionId,
    userId: snapshot.userId,
    actorCode: snapshot.actorCode,
    displayName: snapshot.displayName,
    email: snapshot.email,
    effectiveProfile: snapshot.effectiveProfile,
  });
  const context = snapshot.effectiveProfile.contexte;
  applyGovernanceContext(
    snapshot.actorCode,
    context?.organisationId ?? context?.idOrganisation ?? snapshot.organisationActiveId,
    context?.ecoleId ?? context?.idEcole ?? snapshot.ecoleActiveId,
    context?.governanceLevel ?? context?.niveauGouvernance ?? context?.niveau,
  );
  return true;
}

function applyEffectiveProjection(profile: BackendEffectiveProfileApiData): FrontendActorCode {
  const actorCandidate = profile.acteurCodeActif ?? profile.roleActif ?? profile.acteurCode;
  if (!isKnownActor(actorCandidate)) {
    throw new Error("Le profil de travail actif n'est pas reconnu.");
  }

  sessionStore.applyEffectiveProfile(profile);
  applyGovernanceContext(
    actorCandidate,
    profile.contexte?.organisationId ?? profile.contexte?.idOrganisation,
    profile.contexte?.ecoleId ?? profile.contexte?.idEcole,
    profile.contexte?.governanceLevel
      ?? profile.contexte?.niveauGouvernance
      ?? profile.contexte?.niveau,
  );
  return actorCandidate;
}

async function applyLoginResult(
  result: BackendLoginApiData,
  rememberMe: boolean,
  options?: { actorCode?: FrontendActorCode; developer?: boolean },
): Promise<void> {
  const effectiveProfile = await authApi.obtenirProfil({
    accessToken: result.accessToken,
    sessionId: result.sessionId,
  });
  const actorCandidate =
    effectiveProfile.acteurCodeActif
    ?? options?.actorCode
    ?? result.acteurCode
    ?? decodeActorFromAccessToken(result.accessToken);
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
  applyEffectiveProjection(effectiveProfile);
  writeSnapshot(snapshotFromState(rememberMe));
  authChannel?.postMessage({ type: 'authenticated' });
}

async function validateRestoredSession(
  accessToken: string,
  snapshot: PersistedAuthSnapshot,
): Promise<void> {
  const session = await authApi.obtenirSession({ accessToken, sessionId: snapshot.sessionId });
  const profile = await authApi.obtenirProfil({ accessToken, sessionId: snapshot.sessionId });
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
    actorCode: profile.acteurCodeActif,
    displayName: snapshot.displayName,
    email: snapshot.email,
    developer: authEntryMode === 'developer' && snapshot.email.startsWith('dev.'),
    permissions: profile.permissionsEffectives,
  });
  applyEffectiveProjection({
    ...profile,
    contexte: {
      ...profile.contexte,
      organisationId:
        profile.contexte?.organisationId
        ?? context.organisationActiveId
        ?? session.organisationActiveId,
      ecoleId:
        profile.contexte?.ecoleId
        ?? context.ecoleActiveId
        ?? session.ecoleActiveId,
    },
  });
  writeSnapshot(snapshotFromState(snapshot.rememberMe));
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
    } catch (error) {
      if (isTemporaryConnectivityFailure(error) && restoreOfflineSnapshot(snapshot)) {
        return false;
      }
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

async function openDeveloperSessionForCurrentActor(
  actorCode = sessionStore.state.actorCode,
): Promise<void> {
  const ancienneSession = sessionStore.state.accessToken && sessionStore.state.sessionId
    ? {
        accessToken: sessionStore.state.accessToken,
        sessionId: sessionStore.state.sessionId,
      }
    : null;
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
  await applyLoginResult(result, false, { actorCode, developer: true });
  if (ancienneSession && ancienneSession.sessionId !== result.sessionId) {
    await authApi.deconnecter(ancienneSession).catch(() => undefined);
  }
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
      if (event.data?.type === 'capabilities-changed' && sessionStore.state.isAuthenticated) {
        sessionStore.invalidateEffectiveProfile();
        void rechargerProfilEffectifFrontend().catch(() => undefined);
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

    if (sessionStore.state.isOfflineSession) {
      sessionStore.completeInitialization('offline');
      return;
    }

    if (authEntryMode === 'developer') {
      await openDeveloperSessionForCurrentActor();
      sessionStore.completeInitialization('dev');
      return;
    }

    sessionStore.clearBackendSession();
    sessionStore.completeInitialization('none');
  } catch (error) {
    if (isTemporaryConnectivityFailure(error) && restoreOfflineSnapshot(readSnapshot())) {
      sessionStore.completeInitialization('offline');
      return;
    }
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
  await applyLoginResult(result, params.seSouvenirDeMoi);
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
  await applyLoginResult(result, params.seSouvenirDeMoi, { actorCode: 'MANAGER_SYSTEME' });
}

export async function deconnecterUtilisateur(): Promise<void> {
  const { accessToken, sessionId } = sessionStore.state;
  if (accessToken && sessionId) {
    await authApi.deconnecter({ accessToken, sessionId }).catch(() => undefined);
  }
  clearSnapshot();
  sessionStore.clearBackendSession('logout');
  activeContextStore.clear();
  authChannel?.postMessage({ type: 'terminated' });
}

export async function reprendreSessionEnLigne(): Promise<boolean> {
  if (!sessionStore.state.isOfflineSession) {
    return sessionStore.state.isAuthenticated;
  }
  const restored = await refreshSession();
  if (restored) sessionStore.completeInitialization(sessionStore.state.authMode);
  return restored;
}

export async function ouvrirSessionDeveloppeurActeurSelectionne(
  actorCode?: FrontendActorCode,
): Promise<void> {
  if (authEntryMode !== 'developer') throw new Error('Le mode developpeur est desactive.');
  await openDeveloperSessionForCurrentActor(actorCode);
  sessionStore.completeInitialization('dev');
}

async function rechargerProjectionApresChangementContexte(
  context: {
    organisationActiveId?: string;
    ecoleActiveId?: string;
  },
): Promise<void> {
  if (!sessionStore.state.accessToken || !sessionStore.state.sessionId) {
    return;
  }
  const profile = await authApi.obtenirProfil({
    accessToken: sessionStore.state.accessToken,
    sessionId: sessionStore.state.sessionId,
  }).catch((error) => {
    sessionStore.invalidateEffectiveProfile();
    throw error;
  });
  applyEffectiveProjection({
    ...profile,
    contexte: {
      ...profile.contexte,
      organisationId: context.organisationActiveId,
      ecoleId: context.ecoleActiveId,
    },
  });
  const snapshot = readSnapshot();
  if (snapshot) writeSnapshot(snapshotFromState(snapshot.rememberMe));
}

export async function rechargerProfilEffectifFrontend(): Promise<void> {
  if (!sessionStore.state.accessToken || !sessionStore.state.sessionId) {
    sessionStore.invalidateEffectiveProfile();
    return;
  }
  const profile = await authApi.obtenirProfil({
    accessToken: sessionStore.state.accessToken,
    sessionId: sessionStore.state.sessionId,
  });
  applyEffectiveProjection(profile);
  const snapshot = readSnapshot();
  if (snapshot) writeSnapshot(snapshotFromState(snapshot.rememberMe));
}

export async function notifierChangementCapacitesFrontend(): Promise<void> {
  sessionStore.invalidateEffectiveProfile();
  authChannel?.postMessage({ type: 'capabilities-changed' });
  await rechargerProfilEffectifFrontend();
}

export async function activerContextePlateformeFrontend(): Promise<void> {
  if (!sessionStore.state.accessToken || !sessionStore.state.sessionId) return;
  sessionStore.invalidateEffectiveProfile();
  try {
    const context = await authApi.activerContextePlateforme({
      accessToken: sessionStore.state.accessToken,
      sessionId: sessionStore.state.sessionId,
    });
    await rechargerProjectionApresChangementContexte(context);
  } catch (error) {
    await rechargerProfilEffectifFrontend().catch(() => undefined);
    throw error;
  }
  const snapshot = readSnapshot();
  if (snapshot) {
    writeSnapshot(snapshotFromState(snapshot.rememberMe));
  }
}

export async function changerOrganisationActiveFrontend(organizationId: string): Promise<void> {
  if (!sessionStore.state.accessToken || !sessionStore.state.sessionId) return;
  sessionStore.invalidateEffectiveProfile();
  try {
    const context = await authApi.changerOrganisationActive({
      accessToken: sessionStore.state.accessToken,
      sessionId: sessionStore.state.sessionId,
      organisationActiveId: organizationId,
    });
    await rechargerProjectionApresChangementContexte({
      organisationActiveId: context.organisationActiveId ?? organizationId,
      ecoleActiveId: context.ecoleActiveId,
    });
  } catch (error) {
    await rechargerProfilEffectifFrontend().catch(() => undefined);
    throw error;
  }
  const snapshot = readSnapshot();
  if (snapshot) writeSnapshot(snapshotFromState(snapshot.rememberMe));
}

export async function changerEcoleActiveFrontend(schoolId: string): Promise<void> {
  if (!sessionStore.state.accessToken || !sessionStore.state.sessionId) return;
  sessionStore.invalidateEffectiveProfile();
  try {
    const context = await authApi.changerEcoleActive({
      accessToken: sessionStore.state.accessToken,
      sessionId: sessionStore.state.sessionId,
      ecoleActiveId: schoolId,
    });
    await rechargerProjectionApresChangementContexte({
      organisationActiveId:
        context.organisationActiveId
        ?? activeContextStore.state.organizationId,
      ecoleActiveId: context.ecoleActiveId ?? schoolId,
    });
  } catch (error) {
    await rechargerProfilEffectifFrontend().catch(() => undefined);
    throw error;
  }
  const snapshot = readSnapshot();
  if (snapshot) writeSnapshot(snapshotFromState(snapshot.rememberMe));
}
