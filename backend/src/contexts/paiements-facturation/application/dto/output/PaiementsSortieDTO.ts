import { Money } from 'contexts/paiements-facturation/domain/value-objects/Money';
import { ModePaiement } from 'contexts/paiements-facturation/domain/value-objects/ModePaiement';
import { StatutPaiement } from 'contexts/paiements-facturation/domain/value-objects/StatutPaiement';
import { TypeFrais } from 'contexts/paiements-facturation/domain/value-objects/TypeFrais';

export interface RepartitionPaiementOutput {
  idRepartition: string;
  idObligation: string;
  montantAffecte: Money;
  ordreAffectation: number;
  origineAffectation: string;
}

export interface RestitutionOutput {
  idRestitution: string;
  montant: Money;
  raison: string;
}

export interface PaiementEnregistreOutput {
  idPaiement: string;
  montantTotal: Money;
  modePaiement: ModePaiement;
  typeFraisDeclare: TypeFrais;
  statutPaiement: StatutPaiement;
  repartitions: RepartitionPaiementOutput[];
  recus: RecuPaiementOutput[];
  restitution?: RestitutionOutput;
}

export interface PaiementHistoriqueOutput {
  idPaiement: string;
  montantTotal: Money;
  modePaiement: ModePaiement;
  typeFraisDeclare: TypeFrais;
  statutPaiement: StatutPaiement;
  creeLe: Date;
}

export interface RecuPaiementOutput {
  idRecu: string;
  numeroRecu: string;
  idPaiement: string;
  idObligation: string;
  libelle: string;
  montant: Money;
  montantEnLettres: string;
  dateEmission: Date;
  statutRecu: string;
}

export interface RecuPaiementOfficielLigneOutput {
  numeroLigne: number;
  typeFrais: string;
  libelle: string;
  montant: Money;
}

export interface RecuPaiementOfficielOutput {
  idRecu: string;
  numeroRecu: string;
  idPaiement: string;
  dateEmission: Date;
  statutRecu: string;
  modePaiement: ModePaiement;
  totalPaye: Money;
  montantEnLettres: string;
  ecole: {
    idEcole: string;
    nom: string;
    sigle?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
    logoUrl?: string;
    cachetUrl?: string;
  };
  contexteScolaire: {
    anneeScolaire?: string;
    classe?: string;
  };
  eleve: {
    idEleve: string;
    code: string;
    nom: string;
    postnom: string;
    prenom?: string;
    sexe: string;
  };
  caissier: {
    idUtilisateur: string;
    nomComplet: string;
    signatureUrl?: string;
  };
  lignes: RecuPaiementOfficielLigneOutput[];
}

export interface RecuPaiementPdfOutput {
  nomFichier: string;
  mimeType: string;
  contenu: Buffer;
}
