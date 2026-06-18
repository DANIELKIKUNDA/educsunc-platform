import type { AutorisationPerceptionPaiementPort } from '../../contexts/paiements-facturation/application/ports/AutorisationPerceptionPaiementPort';
import type { AutorisationRestitutionPaiementPort } from '../../contexts/paiements-facturation/application/ports/AutorisationRestitutionPaiementPort';
import type { TypeFrais } from '../../contexts/paiements-facturation/domain/value-objects/TypeFrais';
import { AutorisationPerceptionPaiementAdapter } from './AutorisationPerceptionPaiementAdapter';

// Cette classe aligne la restitution sur la meme doctrine d'acteurs et de perimetre que la perception.
export class AutorisationRestitutionPaiementAdapter
  implements AutorisationRestitutionPaiementPort
{
  constructor(
    private readonly autorisationPerceptionPaiement: AutorisationPerceptionPaiementPort & {
      fermer?: () => Promise<void>;
    } = new AutorisationPerceptionPaiementAdapter(),
  ) {}

  public async verifierRestitutionPaiement(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
    typeFrais: TypeFrais;
  }): Promise<void> {
    await this.autorisationPerceptionPaiement.verifierPerceptionPaiement(params);
  }

  public async fermer(): Promise<void> {
    await this.autorisationPerceptionPaiement.fermer?.();
  }
}
