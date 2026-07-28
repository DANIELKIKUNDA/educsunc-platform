import type { AffectationTitulariat, ScopeAcces } from 'shared/security/domain';

export interface TitulariatEffectifContext {
  idOrganisation: string;
  idEcole: string;
  idClasse: string;
  idAnneeScolaire: string;
  idSectionScolaire: string;
  source: 'AFFECTATION_TITULARIAT' | 'RESPONSABILITE_CLASSE';
}

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
  actorCodes?: readonly string[];
  roleActif?: string;
  permissions?: readonly string[];
  scopes?: readonly ScopeAcces[];
  restrictions?: readonly string[];
  titulariats?: readonly AffectationTitulariat[];
  titulariatsEffectifs?: readonly TitulariatEffectifContext[];
  estTitulaireEffectif?: boolean;
  sourceTitulariatEffectif?: 'AUCUNE' | 'AFFECTATION_TITULARIAT' | 'RESPONSABILITE_CLASSE';
  elevesAutorises?: readonly string[];
}
