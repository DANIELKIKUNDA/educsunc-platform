import type {
  CapacitesEffectivesReadModel,
  TitulariatEffectifReadModel,
  TitulariatReadModel,
} from '../read-models';
import type { ScopeUtilisateurOutput } from '../dto/output';

export class CapacitesEffectivesMapper {
  public static depuisCalcul(params: {
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
  }): CapacitesEffectivesReadModel {
    return {
      actorCodes: [...params.actorCodes],
      acteurCodeActif: params.acteurCodeActif,
      permissions: [...params.permissions],
      scopes: params.scopes.map((scope) => ({ ...scope })),
      restrictions: [...params.restrictions],
      titulariatsActifs: params.titulariatsActifs.map((titulariat) => ({ ...titulariat })),
      titulariatsEffectifs: params.titulariatsEffectifs.map((titulariat) => ({ ...titulariat })),
      estTitulaireEffectif: params.estTitulaireEffectif,
      sourceTitulariatEffectif: params.sourceTitulariatEffectif,
      elevesAutorises: [...params.elevesAutorises],
    };
  }
}
