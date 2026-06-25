export interface ReceiptSchoolIdentity {
  sigle: string;
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
}

export interface ReceiptStudentIdentity {
  matricule: string;
  nom: string;
  postnom: string;
  prenom: string;
  sexe: string;
  classe: string;
  anneeScolaire: string;
}

export interface ReceiptLineItem {
  id: string;
  numero: number;
  typeFrais: string;
  libelle: string;
  montant: number;
}

export interface OfficialPaymentReceipt {
  id: string;
  numeroRecu: string;
  dateLabel: string;
  heureLabel: string;
  modePaiement: string;
  montantTotal: number;
  montantEnLettres: string;
  caissierNom: string;
  signatureDisponible: boolean;
  cachetDisponible: boolean;
  messageFinal: string;
  school: ReceiptSchoolIdentity;
  student: ReceiptStudentIdentity;
  lines: ReceiptLineItem[];
}

export const officialPaymentReceipt: OfficialPaymentReceipt = {
  id: 'recu-250625-006',
  numeroRecu: 'RC-250625-006',
  dateLabel: '25/06/2026',
  heureLabel: '11:02:14',
  modePaiement: 'Especes (Cash)',
  montantTotal: 150000,
  montantEnLettres: 'Cent cinquante mille francs congolais',
  caissierNom: 'Aline Mbuyi',
  signatureDisponible: true,
  cachetDisponible: true,
  messageFinal: '* CSR vous remercie *',
  school: {
    sigle: 'CSR',
    nom: 'College Saint Raphael',
    adresse: 'Q. Hewa Bora, C/ Kampemba, Lubumbashi - RDC',
    telephone: '+243 812 345 678',
    email: 'contact@csr-school.cd',
  },
  student: {
    matricule: 'ELV-000381',
    nom: 'Mukuta',
    postnom: 'Musenge',
    prenom: 'Josias',
    sexe: 'M',
    classe: '4e H - ELEC',
    anneeScolaire: '2025 - 2026',
  },
  lines: [
    {
      id: 'line-1',
      numero: 1,
      typeFrais: 'Minerval',
      libelle: 'Minerval - Juin',
      montant: 130000,
    },
    {
      id: 'line-2',
      numero: 2,
      typeFrais: 'Frais bulletin',
      libelle: 'Bulletin 2e periode',
      montant: 20000,
    },
  ],
};
