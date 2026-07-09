import { sessionStore } from '../auth/session.store';
import { activeContextStore } from './active-context.store';

export interface SharedApiContext {
  organisationId: string | null;
  ecoleId: string | null;
  utilisateurId: string | null;
}

interface PilotageHeaderOptions {
  organisationId?: string;
  ecoleId?: string;
  lectureOrganisationnelle?: boolean;
}

function lireVariableEnvironnement(nom: string): string | null {
  const valeur = import.meta.env[nom];
  if (typeof valeur !== 'string') {
    return null;
  }

  const nettoyee = valeur.trim();
  return nettoyee.length > 0 ? nettoyee : null;
}

function prefererValeur(...valeurs: Array<string | null | undefined>): string | null {
  for (const valeur of valeurs) {
    if (typeof valeur === 'string' && valeur.trim().length > 0) {
      return valeur;
    }
  }

  return null;
}

export function lireContexteApiActif(): SharedApiContext {
  return {
    organisationId: prefererValeur(
      activeContextStore.state.organizationId,
      lireVariableEnvironnement('VITE_REFERENTIEL_ORGANISATION_ID'),
    ),
    ecoleId: prefererValeur(
      activeContextStore.state.schoolId,
      lireVariableEnvironnement('VITE_REFERENTIEL_ECOLE_ID'),
    ),
    utilisateurId: prefererValeur(
      sessionStore.state.userId,
      lireVariableEnvironnement('VITE_REFERENTIEL_UTILISATEUR_ID'),
    ),
  };
}

export function lireContexteApiPlateformeGlobal(): SharedApiContext {
  const contexte = lireContexteApiActif();

  return {
    organisationId: contexte.organisationId,
    ecoleId: null,
    utilisateurId: contexte.utilisateurId,
  };
}

export function lireEntetesAuthentificationActive(): Record<string, string> {
  const entetes: Record<string, string> = {};

  if (sessionStore.state.accessToken) {
    entetes.authorization = `Bearer ${sessionStore.state.accessToken}`;
  }

  if (sessionStore.state.sessionId) {
    entetes['x-session-id'] = sessionStore.state.sessionId;
  }

  return entetes;
}

export function construireEntetesContexteActif(
  contexte: SharedApiContext,
  options?: { includeSchoolHeader?: boolean },
): Record<string, string> {
  if (
    contexte.organisationId === null
    || contexte.ecoleId === null
    || contexte.utilisateurId === null
  ) {
    throw new Error(
      'Le contexte frontend actif est incomplet. Verifiez le shell, la session active ou les variables VITE_REFERENTIEL_* de secours.',
    );
  }

  return {
    'x-organisation-id': contexte.organisationId,
    'x-tenant-id': contexte.ecoleId,
    ...(options?.includeSchoolHeader ? { 'x-ecole-id': contexte.ecoleId } : {}),
    'x-user-id': contexte.utilisateurId,
    'x-role-actif': sessionStore.state.actorCode,
  };
}

export function construireEntetesPilotageActif(
  contexte: SharedApiContext,
  options?: PilotageHeaderOptions,
): Record<string, string> {
  const organisationId = prefererValeur(options?.organisationId, contexte.organisationId);
  const ecoleId = prefererValeur(options?.ecoleId, contexte.ecoleId);

  if (contexte.utilisateurId === null) {
    throw new Error(
      'Le contexte frontend actif ne porte pas encore un utilisateur exploitable pour le pilotage.',
    );
  }

  return {
    ...(organisationId ? { 'x-organisation-id': organisationId } : {}),
    ...(ecoleId ? { 'x-tenant-id': ecoleId, 'x-ecole-id': ecoleId } : {}),
    ...(options?.lectureOrganisationnelle ? { 'x-lecture-organisation': 'true' } : {}),
    'x-user-id': contexte.utilisateurId,
    'x-role-actif': sessionStore.state.actorCode,
  };
}
