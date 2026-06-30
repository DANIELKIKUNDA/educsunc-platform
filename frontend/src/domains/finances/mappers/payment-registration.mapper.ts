import { activeContextStore } from '../../../shared/session/active-context.store';
import type { StudentDetailApiData } from '../models/payment-history.model';
import type { StudentDueFeesApiData } from '../models/student-financial-situation.model';
import type {
  PaymentRegistrationApiData,
  PaymentRegistrationRequest,
  PaymentRegistrationResultViewModel,
  StudentPaymentObligationViewModel,
  StudentPaymentProfileViewModel,
} from '../models/payment-registration.model';

interface PaymentRegistrationRouteContext {
  classe?: string;
  section?: string;
  anneeScolaire?: string;
}

function construireNomComplet(eleve: StudentDetailApiData): string {
  return [eleve.nom, eleve.postNom, eleve.prenom].filter(Boolean).join(' ');
}

export function mapperStudentPaymentProfile(
  eleve: StudentDetailApiData,
  routeContext?: PaymentRegistrationRouteContext,
): StudentPaymentProfileViewModel {
  return {
    id: eleve.idEleve,
    matricule: eleve.matricule,
    fullName: construireNomComplet(eleve),
    sexe: eleve.sexe,
    classe: routeContext?.classe ?? 'Classe a connecter',
    section: routeContext?.section ?? activeContextStore.state.sectionName,
    anneeScolaire: routeContext?.anneeScolaire ?? activeContextStore.state.schoolYearLabel,
  };
}

export function mapperStudentPaymentObligations(
  fraisExigibles: StudentDueFeesApiData,
): StudentPaymentObligationViewModel[] {
  return fraisExigibles.fraisDisponibles.map((frais, index) => ({
    id: `${frais.typeFrais}-${index + 1}`,
    typeFrais: frais.typeFrais,
    libelle: frais.libelle,
    montantExigible: frais.resteAPayer.montant,
    paiementPartielAutorise: frais.paiementPartielAutorise,
  }));
}

export function mapperPaymentRegistrationResult(
  paiement: PaymentRegistrationApiData,
): PaymentRegistrationResultViewModel {
  return {
    idPaiement: paiement.idPaiement,
    montantTotal: paiement.montantTotal.montant,
    devise: paiement.montantTotal.devise,
    modePaiement: paiement.modePaiement,
    typeFraisDeclare: paiement.typeFraisDeclare,
    statutPaiement: paiement.statutPaiement,
    receipts: paiement.recus.map((recu) => ({
      id: recu.idRecu,
      numeroRecu: recu.numeroRecu,
      libelle: recu.libelle,
      montant: recu.montant.montant,
      devise: recu.montant.devise,
      montantEnLettres: recu.montantEnLettres,
      dateEmission: recu.dateEmission,
    })),
    restitution: paiement.restitution === undefined
      ? undefined
      : {
        idRestitution: paiement.restitution.idRestitution,
        montant: paiement.restitution.montant.montant,
        devise: paiement.restitution.montant.devise,
        raison: paiement.restitution.raison,
      },
  };
}

export function construirePaymentRegistrationRequest(input: {
  idEleve: string;
  typeFraisDeclare: string;
  montant: string;
  modePaiement: 'CASH' | 'MOBILE_MONEY' | 'BANQUE';
}): PaymentRegistrationRequest {
  return {
    idEleve: input.idEleve,
    typeFraisDeclare: input.typeFraisDeclare,
    montant: {
      montant: Number.parseInt(input.montant, 10),
      devise: 'CDF',
    },
    modePaiement: input.modePaiement,
    idempotencyKey: `pf-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  };
}
