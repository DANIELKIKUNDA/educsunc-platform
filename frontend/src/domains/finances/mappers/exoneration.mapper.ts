import type {
  ExonerationApiData,
  ExonerationResultViewModel,
} from '../models/exoneration.model';

export function mapperExonerationResultViewModel(
  donnees: ExonerationApiData,
): ExonerationResultViewModel {
  return {
    idExoneration: donnees.idExoneration,
    idObligation: donnees.idObligation,
    montantExonere: donnees.montantExonere.montant,
    raison: donnees.raison,
    statut: donnees.statut,
  };
}
