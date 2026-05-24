import type { AffectationTitulariat, ScopeAcces } from 'shared/security/domain';

// Ce contrat represente le contexte runtime partage par tout le backend pour une requete.
export interface RequestContext {
  requestId: string;
  correlationId?: string;
  utilisateurId?: string;
  sessionId?: string;
  roleActif?: string;
  organisationActiveId?: string;
  ecoleActiveId?: string;
  permissions: string[];
  scopes: ScopeAcces[];
  restrictions: string[];
  titulariats: AffectationTitulariat[];
  modeOffline: boolean;
  deviceId?: string;
  appVersion?: string;
  plateforme?: string;
  syncId?: string;
  adresseIp?: string;
  userAgent?: string;
}
