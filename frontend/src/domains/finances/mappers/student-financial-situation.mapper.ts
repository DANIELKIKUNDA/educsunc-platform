import { activeContextStore } from '../../../shared/session/active-context.store';
import type { StudentDetailApiData } from '../models/payment-history.model';
import type {
  StudentDebtApiData,
  StudentDebtObligation,
  StudentDueFeesApiData,
  StudentFinancialSituationProfile,
  StudentFinancialSituationViewModel,
} from '../models/student-financial-situation.model';

interface RouteContext {
  anneeScolaire?: string;
  classe?: string;
  section?: string;
}

function construireNomComplet(eleve: StudentDetailApiData): string {
  return [eleve.nom, eleve.postNom, eleve.prenom].filter(Boolean).join(' ');
}

function construirePeriode(idAnneeScolaire: string, statutAnnee: 'ACTIVE' | 'CLOTUREE', referenceFrais: string): string {
  if (referenceFrais.trim().length > 0) {
    return referenceFrais;
  }

  return statutAnnee === 'ACTIVE'
    ? `Annee active - ${idAnneeScolaire}`
    : `Arriere - ${idAnneeScolaire}`;
}

function construireCleExigible(typeFrais: string, libelle: string): string {
  return `${typeFrais}::${libelle}`.toLowerCase();
}

export function mapperStudentFinancialSituationViewModel(
  eleve: StudentDetailApiData,
  dette: StudentDebtApiData,
  fraisExigibles: StudentDueFeesApiData,
  routeContext?: RouteContext,
): StudentFinancialSituationViewModel {
  const exigencesActives = new Set(
    fraisExigibles.fraisDisponibles.map((frais) => construireCleExigible(frais.typeFrais, frais.libelle)),
  );

  const obligations = dette.dettesParAnnee.flatMap((annee) =>
    annee.lignes.map((ligne): StudentDebtObligation => {
      const cleExigible = construireCleExigible(ligne.typeFrais, ligne.libelle);
      const estExigible = exigencesActives.has(cleExigible);
      const estArriere = !estExigible && annee.statutAnnee !== 'ACTIVE' && ligne.solde.montant > 0;

      return {
        id: ligne.idObligation,
        typeFrais: ligne.typeFrais,
        libelle: ligne.libelle,
        periode: construirePeriode(annee.idAnneeScolaire, annee.statutAnnee, ligne.referenceFrais),
        montantAttendu: ligne.montantDuHistorique.montant,
        montantPaye: ligne.montantPaye.montant,
        reste: ligne.solde.montant,
        statut: ligne.statut as StudentDebtObligation['statut'],
        segment: estExigible ? 'EXIGIBLE' : estArriere ? 'ARRIERE' : 'SOLDE',
      };
    }),
  );

  const profile: StudentFinancialSituationProfile = {
    id: eleve.idEleve,
    matricule: eleve.matricule,
    fullName: construireNomComplet(eleve),
    classe: routeContext?.classe ?? 'Classe a connecter',
    section: routeContext?.section ?? activeContextStore.state.sectionName,
    anneeScolaire: routeContext?.anneeScolaire ?? activeContextStore.state.schoolYearLabel,
    totalDette: dette.totalGlobal.montant,
    totalExigible: fraisExigibles.fraisDisponibles.reduce(
      (total, frais) => total + frais.resteAPayer.montant,
      0,
    ),
    totalArrieres: dette.totalArrieres.montant,
    obligations,
  };

  return {
    profile,
    exigibleObligations: obligations.filter((obligation) => obligation.segment === 'EXIGIBLE'),
  };
}
