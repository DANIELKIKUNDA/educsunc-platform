import { EtatComposant, EtatDependance, EtatRuntime } from '../entities';
import type { NiveauSanteSysteme } from '../enums';
import { ContexteMonitoring } from '../value-objects';

// Ce fichier declare l agregat racine d etat systeme.

/** Cette interface represente la vue serialisable de l etat systeme. */
export interface EtatSystemeDetails {
  readonly contexte: ReturnType<ContexteMonitoring['valeur']>;
  readonly niveau: NiveauSanteSysteme;
  readonly composants: readonly ReturnType<EtatComposant['valeur']>[];
  readonly dependances: readonly ReturnType<EtatDependance['valeur']>[];
  readonly runtime: ReturnType<EtatRuntime['valeur']>;
}

/** Cette classe represente l etat global consolide du systeme. */
export class EtatSysteme {
  constructor(
    private readonly contexte: ContexteMonitoring,
    private readonly composants: readonly EtatComposant[],
    private readonly dependances: readonly EtatDependance[],
    private readonly runtime: EtatRuntime,
  ) {}

  /** Cette methode calcule le niveau global du systeme. */
  public niveau(): NiveauSanteSysteme {
    if (
      this.composants.some((composant) => composant.estCritique())
      || this.dependances.some((dependance) => dependance.valeur().niveau === 'CRITICAL')
      || this.runtime.valeur().niveau === 'CRITICAL'
    ) {
      return 'CRITICAL';
    }

    if (
      this.composants.some((composant) => composant.valeur().niveau === 'DEGRADED')
      || this.dependances.some((dependance) => dependance.valeur().niveau === 'DEGRADED')
      || this.runtime.valeur().niveau === 'DEGRADED'
    ) {
      return 'DEGRADED';
    }

    return 'HEALTHY';
  }

  /** Cette methode retourne la vue serialisable de l etat systeme. */
  public details(): EtatSystemeDetails {
    return {
      contexte: this.contexte.valeur(),
      niveau: this.niveau(),
      composants: this.composants.map((composant) => composant.valeur()),
      dependances: this.dependances.map((dependance) => dependance.valeur()),
      runtime: this.runtime.valeur(),
    };
  }
}
