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
  inclureOrganisationActive?: boolean;
  inclureEcoleActive?: boolean;
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
    organisationId: prefererValeur(activeContextStore.state.organizationId),
    ecoleId: prefererValeur(activeContextStore.state.schoolId),
    utilisateurId: prefererValeur(sessionStore.state.userId),
  };
}

export function lireContexteApiPlateformeGlobal(): SharedApiContext {
  const contexte = lireContexteApiActif();

  return {
    organisationId: null,
    ecoleId: null,
    utilisateurId: contexte.utilisateurId,
  };
}

export function lireContexteApiGouvernancePlateforme(): SharedApiContext {
  return lireContexteApiPlateformeGlobal();
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
  const organisationId = prefererValeur(
    options?.organisationId,
    options?.inclureOrganisationActive === false ? null : contexte.organisationId,
  );
  const ecoleId = prefererValeur(
    options?.ecoleId,
    options?.inclureEcoleActive === false ? null : contexte.ecoleId,
  );

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
