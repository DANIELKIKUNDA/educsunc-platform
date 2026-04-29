import { Exoneration } from '../../domain/aggregates/Exoneration';
import { ExonerationOutput } from '../dto/output/ExonerationsSortieDTO';

export const versExonerationOutput = (exoneration: Exoneration): ExonerationOutput => ({
  idExoneration: exoneration.obtenirId(),
  idObligation: exoneration.obtenirIdObligation(),
  montantExonere: exoneration.obtenirMontantExonere(),
  raison: exoneration.obtenirRaison(),
  statut: exoneration.obtenirStatut(),
});
