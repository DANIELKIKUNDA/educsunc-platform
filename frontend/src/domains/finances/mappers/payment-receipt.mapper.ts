import type {
  PaymentReceiptApiData,
  PaymentReceiptViewModel,
} from '../models/payment-receipt.model';

function formaterDate(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat('fr-FR').format(date);
}

export function mapperPaymentReceiptViewModel(recu: PaymentReceiptApiData): PaymentReceiptViewModel {
  return {
    id: recu.idRecu,
    numeroRecu: recu.numeroRecu,
    dateLabel: formaterDate(recu.dateEmission),
    heureLabel: recu.heureEmission,
    modePaiement: recu.modePaiement,
    montantTotal: recu.totalPaye.montant,
    devise: recu.totalPaye.devise,
    montantEnLettres: recu.montantEnLettres,
    caissierNom: recu.caissier.nomComplet,
    signatureDisponible: Boolean(recu.caissier.signatureUrl),
    signatureUrl: recu.caissier.signatureUrl,
    cachetDisponible: Boolean(recu.ecole.cachetUrl),
    messageFinal: `* ${(recu.ecole.sigle ?? recu.ecole.nom).trim()} vous remercie *`,
    school: {
      sigle: recu.ecole.sigle ?? 'ECOLE',
      nom: recu.ecole.nom,
      adresse: recu.ecole.adresse ?? 'Adresse non renseignee',
      telephone: recu.ecole.telephone ?? 'Telephone non renseigne',
      email: recu.ecole.email ?? 'Email non renseigne',
      logoUrl: recu.ecole.logoUrl,
      cachetUrl: recu.ecole.cachetUrl,
    },
    student: {
      matricule: recu.eleve.code,
      nom: recu.eleve.nom,
      postnom: recu.eleve.postnom,
      prenom: recu.eleve.prenom ?? '',
      sexe: recu.eleve.sexe,
      classe: recu.contexteScolaire.classe ?? 'Classe a connecter',
      anneeScolaire: recu.contexteScolaire.anneeScolaire ?? 'Annee a connecter',
    },
    lines: recu.lignes.map((ligne) => ({
      id: `${recu.idRecu}-${ligne.numeroLigne}`,
      numero: ligne.numeroLigne,
      typeFrais: ligne.typeFrais,
      libelle: ligne.libelle,
      montant: ligne.montant.montant,
      devise: ligne.montant.devise,
    })),
  };
}
