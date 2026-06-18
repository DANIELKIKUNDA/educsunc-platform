import type { TypeFrais } from '../../domain/value-objects/TypeFrais';

export interface AutorisationRestitutionPaiementPort {
  verifierRestitutionPaiement(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
    typeFrais: TypeFrais;
  }): Promise<void>;
}
