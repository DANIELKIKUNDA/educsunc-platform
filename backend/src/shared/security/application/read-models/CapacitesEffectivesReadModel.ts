import type { TitulariatReadModel } from './TitulariatReadModel';

export interface CapacitesEffectivesReadModel {
  permissions: readonly string[];
  restrictions: readonly string[];
  titulariatsActifs: readonly TitulariatReadModel[];
  estTitulaireEffectif: boolean;
  sourceTitulariatEffectif: 'AUCUNE' | 'AFFECTATION_TITULARIAT' | 'RESPONSABILITE_CLASSE';
}
