import { InfrastructureError } from '../../exceptions/InfrastructureError';
import type { ServiceStockageFichier } from './FileStorageService';

type ConfigurationStockageS3 = {
  bucket: string;
  region?: string;
};

// Cette classe prepare un futur adaptateur S3 sans masquer l'absence d'implementation reelle.
// Un placeholder explicite est preferable a un faux comportement silencieux en environnement de production.
export class StockageS3 implements ServiceStockageFichier {
  private readonly configuration: ConfigurationStockageS3;

  // Ce constructeur conserve la configuration necessaire pour un branchement S3 ulterieur.
  constructor(configuration: ConfigurationStockageS3) {
    this.configuration = configuration;
  }

  // Cette methode signale explicitement qu'aucune integration S3 reelle n'est encore branchee.
  private leverErreurNonBranchee(operation: string): never {
    throw new InfrastructureError(
      `L'operation S3 "${operation}" n'est pas encore branchee dans l'infrastructure.`,
      'S3_NON_BRANCHE',
      {
        bucket: this.configuration.bucket,
        region: this.configuration.region,
        operation,
      },
    );
  }

  // Cette methode representera plus tard le televersement vers un bucket S3 reel.
  public async televerser(_chemin: string, _contenu: Buffer | string): Promise<string> {
    return this.leverErreurNonBranchee('televerser');
  }

  // Cette methode representera plus tard le telechargement depuis un bucket S3 reel.
  public async telecharger(_chemin: string): Promise<Buffer | string | null> {
    return this.leverErreurNonBranchee('telecharger');
  }

  // Cette methode representera plus tard la suppression d'un objet dans un bucket S3 reel.
  public async supprimer(_chemin: string): Promise<void> {
    this.leverErreurNonBranchee('supprimer');
  }
}

export { StockageS3 as S3Storage };
