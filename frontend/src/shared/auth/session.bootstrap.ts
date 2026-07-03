import { authApi } from './auth.api';
import { sessionStore, type FrontendActorCode } from './session.store';
import { activeContextStore } from '../session/active-context.store';

const STORAGE_KEY = 'educsync.frontend.auth.snapshot';

interface PersistedAuthSnapshot {
  accessToken: string;
  sessionId: string;
  actorCode?: FrontendActorCode;
  userId?: string;
  organisationActiveId?: string;
  ecoleActiveId?: string;
}

function lireSnapshotPersisted(): PersistedAuthSnapshot | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedAuthSnapshot;
    if (
      typeof parsed.accessToken !== 'string'
      || parsed.accessToken.trim().length === 0
      || typeof parsed.sessionId !== 'string'
      || parsed.sessionId.trim().length === 0
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function ecrireSnapshotPersisted(snapshot: PersistedAuthSnapshot): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function supprimerSnapshotPersisted(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

function memoriserSnapshotCourant(): void {
  if (
    sessionStore.state.accessToken === null
    || sessionStore.state.sessionId === null
  ) {
    supprimerSnapshotPersisted();
    return;
  }

  ecrireSnapshotPersisted({
    accessToken: sessionStore.state.accessToken,
    sessionId: sessionStore.state.sessionId,
    actorCode: sessionStore.state.actorCode,
    userId: sessionStore.state.userId,
    organisationActiveId: activeContextStore.state.organizationId,
    ecoleActiveId: activeContextStore.state.schoolId,
  });
}

export async function initializeFrontendSession(): Promise<void> {
  if (sessionStore.state.initialized || sessionStore.state.initializing) {
    return;
  }

  sessionStore.beginInitialization();

  const snapshot = lireSnapshotPersisted();
  if (snapshot === null) {
    sessionStore.completeInitialization('dev');
    return;
  }

  try {
    if (snapshot.actorCode) {
      sessionStore.setActor(snapshot.actorCode);
    }

    sessionStore.setTransportSession({
      accessToken: snapshot.accessToken,
      sessionId: snapshot.sessionId,
    });

    const session = await authApi.obtenirSession({
      accessToken: snapshot.accessToken,
      sessionId: snapshot.sessionId,
    });

    const contexte = await authApi.obtenirContexte({
      accessToken: snapshot.accessToken,
      sessionId: snapshot.sessionId,
      utilisateurId: session.utilisateurId,
      organisationActiveId: snapshot.organisationActiveId ?? session.organisationActiveId,
      ecoleActiveId: snapshot.ecoleActiveId ?? session.ecoleActiveId,
    });

    sessionStore.applyBackendSession({
      accessToken: snapshot.accessToken,
      sessionId: session.sessionId,
      userId: session.utilisateurId,
    });

    activeContextStore.applyResolvedContext({
      organizationId: contexte.organisationActiveId ?? session.organisationActiveId ?? null,
      schoolId: contexte.ecoleActiveId ?? session.ecoleActiveId ?? null,
    });

    memoriserSnapshotCourant();
    sessionStore.completeInitialization('backend');
  } catch {
    supprimerSnapshotPersisted();
    sessionStore.clearBackendSession();
    sessionStore.completeInitialization('dev');
  }
}

export async function changerOrganisationActiveFrontend(organizationId: string): Promise<void> {
  if (
    sessionStore.state.authMode === 'backend'
    && sessionStore.state.accessToken
    && sessionStore.state.sessionId
  ) {
    const contexte = await authApi.changerOrganisationActive({
      accessToken: sessionStore.state.accessToken,
      sessionId: sessionStore.state.sessionId,
      organisationActiveId: organizationId,
    });

    activeContextStore.applyResolvedContext({
      organizationId: contexte.organisationActiveId ?? organizationId,
      schoolId: contexte.ecoleActiveId ?? null,
    });
    memoriserSnapshotCourant();
    return;
  }

  activeContextStore.setOrganization(organizationId);
}

export async function changerEcoleActiveFrontend(schoolId: string): Promise<void> {
  if (
    sessionStore.state.authMode === 'backend'
    && sessionStore.state.accessToken
    && sessionStore.state.sessionId
  ) {
    const contexte = await authApi.changerEcoleActive({
      accessToken: sessionStore.state.accessToken,
      sessionId: sessionStore.state.sessionId,
      ecoleActiveId: schoolId,
    });

    activeContextStore.applyResolvedContext({
      organizationId: contexte.organisationActiveId ?? activeContextStore.state.organizationId,
      schoolId: contexte.ecoleActiveId ?? schoolId,
    });
    memoriserSnapshotCourant();
    return;
  }

  activeContextStore.setSchool(schoolId);
}
