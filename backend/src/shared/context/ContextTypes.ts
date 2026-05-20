import type { AffectationTitulariat, ScopeAcces } from 'shared/security/domain';

// Ce type decrit les donnees injectees par AUTH dans le contexte de requete.
export interface EnrichissementAuthContext {
  utilisateurId: string;
  sessionId?: string;
  roleActif?: string;
  organisationActiveId?: string;
  ecoleActiveId?: string;
  modeOffline?: boolean;
  deviceId?: string;
}

// Ce type decrit les donnees injectees par SECURITY dans le contexte de requete.
export interface EnrichissementSecurityContext {
  roleActif?: string;
  permissions?: readonly string[];
  scopes?: readonly ScopeAcces[];
  restrictions?: readonly string[];
  titulariats?: readonly AffectationTitulariat[];
}
