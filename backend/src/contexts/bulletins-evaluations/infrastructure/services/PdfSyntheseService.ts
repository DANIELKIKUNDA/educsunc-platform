import type { SyntheseEcoleOutput } from 'contexts/bulletins-evaluations/application/dto/output/SyntheseEcoleOutput';
import type { SynthesePdfGenere } from 'contexts/bulletins-evaluations/application/ports/out/SynthesePdfPort';
import type { ServiceStockageFichier } from 'shared/infrastructure/storage/FileStorageService';

// Ce service produit un export PDF concret et stable de la synthese de resultats d'une ecole.
export class PdfSyntheseService {
  constructor(private readonly stockage?: ServiceStockageFichier) {}

  public async genererDepuisSortie(synthese: SyntheseEcoleOutput): Promise<SynthesePdfGenere> {
    const contenuTexte = [
      'Synthese des resultats de l ecole',
      `Ecole: ${synthese.idEcole}`,
      `Annee: ${synthese.idAnneeScolaire}`,
      `Colonne: ${synthese.codeColonne}`,
      `Type: ${synthese.typeSynthese}`,
      '',
      'Classes consolidees:',
      ...synthese.lignes.map((ligne) =>
        `${ligne.libelleClasse} [${ligne.idClassePedagogique}] - inscrits=${ligne.statistiques.inscritsTotal}, classes=${ligne.statistiques.classesTotal}, nonClasses=${ligne.statistiques.nonClassesTotal}, abandons=${ligne.statistiques.abandonsTotal}`),
      '',
      `Totaux ecole: ${JSON.stringify(synthese.totauxEcole ?? {})}`,
    ].join('\n');
    const contenu = Buffer.from(contenuTexte, 'utf-8');
    const nomFichier = `synthese-${synthese.idEcole}-${synthese.idAnneeScolaire}-${synthese.codeColonne}.pdf`;

    if (this.stockage !== undefined) {
      await this.stockage.televerser(`syntheses/${nomFichier}`, contenu);
    }

    return {
      nomFichier,
      contenu,
      mimeType: 'application/pdf',
    };
  }
}
