import { activeContextStore } from '../../../shared/session/active-context.store';
import type { StudentDetailApiData } from '../models/payment-history.model';
import type { StudentDebtApiData } from '../models/student-financial-situation.model';
import type {
  StudentArrearRow,
  StudentArrearsApiData,
  StudentArrearsProfile,
  StudentArrearsViewModel,
} from '../models/student-arrears.model';

interface RouteContext {
  classe?: string;
  section?: string;
}

function construireNomComplet(eleve: StudentDetailApiData): string {
  return [eleve.nom, eleve.postNom, eleve.prenom].filter(Boolean).join(' ');
}

function construirePeriode(idAnneeScolaire: string, referenceFrais: string): string {
  const referenceNettoyee = referenceFrais.trim();
  return referenceNettoyee.length > 0 ? referenceNettoyee : `Arriere - ${idAnneeScolaire}`;
}

export function mapperStudentArrearsViewModel(
  eleve: StudentDetailApiData,
  arrieres: StudentArrearsApiData,
  dette: StudentDebtApiData,
  routeContext?: RouteContext,
): StudentArrearsViewModel {
  const rows: StudentArrearRow[] = dette.dettesParAnnee.flatMap((annee) =>
    annee.statutAnnee !== 'CLOTUREE'
      ? []
      : annee.lignes
        .filter((ligne) => ligne.solde.montant > 0)
        .map((ligne) => ({
          id: ligne.idObligation,
          typeFrais: ligne.typeFrais,
          libelle: ligne.libelle,
          periode: construirePeriode(annee.idAnneeScolaire, ligne.referenceFrais),
          montantInitial: ligne.montantDuHistorique.montant,
          montantPaye: ligne.montantPaye.montant,
          montantRestant: ligne.solde.montant,
        })),
  );

  const profile: StudentArrearsProfile = {
    id: eleve.idEleve,
    eleve: construireNomComplet(eleve),
    matricule: eleve.matricule,
    classe: routeContext?.classe ?? 'Classe a connecter',
    section: routeContext?.section ?? activeContextStore.state.sectionName,
    totalArrieres: arrieres.totalArrieres.montant,
    nombreLignes: rows.length,
  };

  return {
    profile,
    rows,
  };
}
