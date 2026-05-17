import type { SexeEleve } from 'contexts/bulletins-evaluations/domain/value-objects/SexeEleve';

// Ce port lit les informations d'eleve, d'inscription et d'abandon depuis le BC scolarite-eleves.
export interface ScolariteElevesPort {
  consulterEleve(idEleve: string): Promise<EleveBulletinDTO | null>;
  consulterInscription(idInscriptionScolaire: string): Promise<InscriptionBulletinDTO | null>;
  consulterClassePedagogique(idClassePedagogique: string): Promise<ClassePedagogiqueBulletinDTO | null>;
  verifierAbandon(idEleve: string, idAnneeScolaire: string): Promise<AbandonEleveDTO | null>;
}

export interface EleveBulletinDTO {
  idEleve: string;
  nomComplet: string;
  sexe: SexeEleve;
  idEcole: string;
}

export interface InscriptionBulletinDTO {
  idInscriptionScolaire: string;
  idEleve: string;
  idClassePedagogique: string;
  idAnneeScolaire: string;
}

export interface ClassePedagogiqueBulletinDTO {
  idClassePedagogique: string;
  libelleClasse: string;
  idEcole: string;
}

export interface AbandonEleveDTO {
  idEleve: string;
  dateAbandon?: Date;
  motifAbandon?: string;
}
