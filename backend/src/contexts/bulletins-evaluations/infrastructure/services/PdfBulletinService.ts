import type { BulletinPdfGenere } from 'contexts/bulletins-evaluations/application/ports/out/BulletinPdfPort';
import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';
import type { ServiceStockageFichier } from 'shared/infrastructure/storage/FileStorageService';

// Ce fichier porte la generation technique d'un export PDF de bulletin.
export class PdfBulletinService {
  // Ce constructeur injecte un stockage partage pour archiver les exports si necessaire.
  constructor(private readonly stockage?: ServiceStockageFichier) {}

  // Cette methode produit un document simple et stable a partir d'un read model.
  public async genererDepuisReadModel(bulletin: BulletinEleveReadModel): Promise<BulletinPdfGenere> {
    const contenuTexte = [
      'Bulletin scolaire',
      `Eleve: ${bulletin.idEleve}`,
      `Classe: ${bulletin.idClassePedagogique}`,
      `Annee: ${bulletin.idAnneeScolaire}`,
    ].join('\n');
    const contenu = Buffer.from(contenuTexte, 'utf-8');
    const nomFichier = `bulletin-${bulletin.idBulletinEleve}.pdf`;

    if (this.stockage !== undefined) {
      await this.stockage.televerser(`bulletins/${nomFichier}`, contenu);
    }

    return {
      nomFichier,
      contenu,
      mimeType: 'application/pdf',
    };
  }
}
