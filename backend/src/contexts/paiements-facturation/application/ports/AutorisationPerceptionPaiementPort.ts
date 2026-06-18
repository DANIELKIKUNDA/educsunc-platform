import type { TypeFrais } from '../../domain/value-objects/TypeFrais';

export interface AutorisationPerceptionPaiementPort {
  verifierPerceptionPaiement(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
    typeFrais: TypeFrais;
  }): Promise<void>;
}
