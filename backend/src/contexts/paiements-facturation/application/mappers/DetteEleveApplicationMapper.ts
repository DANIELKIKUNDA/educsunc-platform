import { DetteEleve } from '../../domain/aggregates/DetteEleve';
import { DetteEleveOutput } from '../dto/output/DettesSortieDTO';

export const versDetteEleveOutput = (dette: DetteEleve): DetteEleveOutput => ({
  idEleve: dette.obtenirIdEleve(),
  totalArrieres: dette.obtenirTotalArrieres(),
  totalAnneeActive: dette.obtenirTotalAnneeActive(),
  totalGlobal: dette.obtenirTotalGlobal(),
  dettesParAnnee: dette.obtenirDettesParAnnee().map((detteAnnuelle) => ({
    idAnneeScolaire: detteAnnuelle.obtenirIdAnneeScolaire(),
    statutAnnee: detteAnnuelle.obtenirStatutAnnee(),
    lignes: detteAnnuelle.obtenirLignes().map((ligne) => ({
      idObligation: ligne.obtenirIdObligation(),
      typeFrais: ligne.obtenirTypeFrais(),
      referenceFrais: ligne.obtenirReferenceFrais().obtenirValeur(),
      libelle: ligne.obtenirLibelle(),
      montantDuHistorique: ligne.obtenirMontantDuHistorique(),
      montantPaye: ligne.obtenirMontantPaye(),
      montantExonere: ligne.obtenirMontantExonere(),
      solde: ligne.obtenirSolde(),
      statut: ligne.obtenirStatut(),
    })),
    totalDu: detteAnnuelle.obtenirTotalDu(),
    totalPaye: detteAnnuelle.obtenirTotalPaye(),
    totalExonere: detteAnnuelle.obtenirTotalExonere(),
    soldeRestant: detteAnnuelle.obtenirSoldeRestant(),
  })),
});
