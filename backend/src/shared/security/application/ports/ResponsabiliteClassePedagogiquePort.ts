import type { ResponsabiliteClassePedagogiqueReadModel } from '../read-models/ResponsabiliteClassePedagogiqueReadModel';

export interface ResponsabiliteClassePedagogiquePort {
  consulterActiveParClasseEtAnnee(params: {
    idOrganisation?: string;
    idEcole?: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<ResponsabiliteClassePedagogiqueReadModel | null>;

  listerActivesParUtilisateur?(params: {
    idOrganisation?: string;
    idEcole: string;
    idUtilisateur: string;
  }): Promise<readonly ResponsabiliteClassePedagogiqueReadModel[]>;
}
