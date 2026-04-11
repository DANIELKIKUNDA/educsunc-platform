import { TransformationNote } from '../../domain/entities/TransformationNote';
import { TransformationNoteSortie } from '../dto/output/TransformationNoteSortie';

// Ce mapper transforme l'entite TransformationNote en DTO de sortie applicatif.
export class TransformationNoteApplicationMapper {
  // Cette methode projette une transformation de note de domaine vers un contrat de sortie stable.
  public static versSortie(transformationNote: TransformationNote): TransformationNoteSortie {
    return {
      idNote: transformationNote.obtenirIdNote(),
      ancienneValeur: transformationNote.obtenirAncienneValeur(),
      nouvelleValeur: transformationNote.obtenirNouvelleValeur(),
      ancienMaximum: transformationNote.obtenirAncienMaximum(),
      nouveauMaximum: transformationNote.obtenirNouveauMaximum(),
      regleAppliquee: transformationNote.obtenirRegleAppliquee(),
      dateTransformation: transformationNote.obtenirDateTransformation().toISOString(),
    };
  }
}
