import type { CapacitesEffectivesReadModel, TitulariatReadModel } from '../read-models';

export class CapacitesEffectivesMapper {
  public static depuisCalcul(params: {
    permissions: readonly string[];
    restrictions: readonly string[];
    titulariatsActifs: readonly TitulariatReadModel[];
    estTitulaireEffectif: boolean;
    sourceTitulariatEffectif: 'AUCUNE' | 'AFFECTATION_TITULARIAT' | 'RESPONSABILITE_CLASSE';
  }): CapacitesEffectivesReadModel {
    return {
      permissions: [...params.permissions],
      restrictions: [...params.restrictions],
      titulariatsActifs: params.titulariatsActifs.map((titulariat) => ({ ...titulariat })),
      estTitulaireEffectif: params.estTitulaireEffectif,
      sourceTitulariatEffectif: params.sourceTitulariatEffectif,
    };
  }
}
