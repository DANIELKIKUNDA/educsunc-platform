import type { TitulariatReadModel } from './TitulariatReadModel';
import type { TitulariatEffectifReadModel } from './TitulariatEffectifReadModel';
import type { ScopeUtilisateurOutput } from '../dto/output';

export interface CapacitesEffectivesReadModel {
  actorCodes: readonly string[];
  acteurCodeActif?: string;
  permissions: readonly string[];
  scopes: readonly ScopeUtilisateurOutput[];
  restrictions: readonly string[];
  titulariatsActifs: readonly TitulariatReadModel[];
  titulariatsEffectifs: readonly TitulariatEffectifReadModel[];
  estTitulaireEffectif: boolean;
  sourceTitulariatEffectif: 'AUCUNE' | 'AFFECTATION_TITULARIAT' | 'RESPONSABILITE_CLASSE';
  elevesAutorises: readonly string[];
}
