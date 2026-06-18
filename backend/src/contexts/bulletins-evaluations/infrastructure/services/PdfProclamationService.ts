import type { ProclamationClasseOutput } from 'contexts/bulletins-evaluations/application/dto/output/ProclamationClasseOutput';
import type { ProclamationPdfGenere } from 'contexts/bulletins-evaluations/application/ports/out/ProclamationPdfPort';
import type { ServiceStockageFichier } from 'shared/infrastructure/storage/FileStorageService';

// Ce service produit un export PDF concret et stable de la proclamation.
export class PdfProclamationService {
  constructor(private readonly stockage?: ServiceStockageFichier) {}

  public async genererDepuisSortie(proclamation: ProclamationClasseOutput): Promise<ProclamationPdfGenere> {
    const contenuTexte = [
      'Proclamation des resultats',
      `Classe: ${proclamation.idClassePedagogique}`,
      `Annee: ${proclamation.idAnneeScolaire}`,
      `Colonne: ${proclamation.codeColonne}`,
      `Type: ${proclamation.typeProclamation}`,
      '',
      'Eleves classes:',
      ...proclamation.lignes.map((ligne) =>
        [
          `${ligne.rang ?? '-'} - ${ligne.nomComplet} [${ligne.idEleve}]`,
          `sexe=${ligne.sexe}`,
          `total=${ligne.totalObtenu ?? '-'}`,
          `maximum=${ligne.maximumGeneral ?? '-'}`,
          `pourcentage=${ligne.pourcentage ?? '-'}`,
          `statut=${ligne.statutProclamation}`,
          `observation=${ligne.observation ?? ''}`,
        ].join(' | ')),
      '',
      'Eleves non classes:',
      ...(proclamation.nonClasses.length === 0
        ? ['Aucun']
        : proclamation.nonClasses.map((eleve) =>
            [
              `${eleve.nomComplet} [${eleve.idEleve}]`,
              `sexe=${eleve.sexe}`,
              `motifs=${eleve.motifs.join(', ') || 'aucun'}`,
              `coursManquants=${eleve.coursManquants.join(', ') || 'aucun'}`,
              `colonnesManquantes=${eleve.colonnesManquantes.join(', ') || 'aucune'}`,
            ].join(' | '))),
      '',
      'Eleves abandons:',
      ...(proclamation.abandons.length === 0
        ? ['Aucun']
        : proclamation.abandons.map((eleve) =>
            [
              `${eleve.nomComplet} [${eleve.idEleve}]`,
              `sexe=${eleve.sexe}`,
              `dateAbandon=${eleve.dateAbandon?.toISOString() ?? '-'}`,
              `motif=${eleve.motifAbandon ?? '-'}`,
            ].join(' | '))),
      '',
      `Statistiques: ${JSON.stringify(proclamation.statistiques ?? {})}`,
    ].join('\n');
    const contenu = Buffer.from(contenuTexte, 'utf-8');
    const nomFichier = `proclamation-${proclamation.idClassePedagogique}-${proclamation.idAnneeScolaire}-${proclamation.codeColonne}.pdf`;

    if (this.stockage !== undefined) {
      await this.stockage.televerser(`proclamations/${nomFichier}`, contenu);
    }

    return {
      nomFichier,
      contenu,
      mimeType: 'application/pdf',
    };
  }
}
