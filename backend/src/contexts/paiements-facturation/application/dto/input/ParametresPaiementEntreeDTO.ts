import { ModePaiement } from 'contexts/paiements-facturation/domain/value-objects/ModePaiement';
import { MoisScolaire } from 'contexts/paiements-facturation/domain/value-objects/MoisScolaire';
import { PolitiqueArrieres } from 'contexts/paiements-facturation/domain/value-objects/PolitiqueArrieres';
import { TypeFrais } from 'contexts/paiements-facturation/domain/value-objects/TypeFrais';

export type RolePerceptionDeleguee =
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE';

export type RoleConsultationHistoriquePaiementsDeleguee =
  | 'TITULAIRE'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_ETUDES'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE';

export type RoleExonerationDeleguee = 'SECRETAIRE';

export interface ConfigurerParametresPaiementEcoleInput {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  roleActif?: string;
  paiementPartielAutorise: boolean;
  paiementPartielParTypeFrais?: Record<TypeFrais, boolean>;
  perceptionDelegueeParTypeFrais?: Partial<Record<TypeFrais, RolePerceptionDeleguee[]>>;
  consultationHistoriquePaiementsDeleguee?: RoleConsultationHistoriquePaiementsDeleguee[];
  exonerationDeleguee?: RoleExonerationDeleguee[];
  politiqueArrieres: PolitiqueArrieres;
  autoriserInscriptionAvecDette: boolean;
  bloquerRetraitDocumentsSiDette: boolean;
  appliquerFamilleNombreuse: boolean;
  nombreEnfantsSeuilFamilleNombreuse?: number;
  modesPaiementAutorises: ModePaiement[];
  moisObligatoireInscription?: MoisScolaire;
  exigerFraisInscription: boolean;
}

export interface ConsulterParametresPaiementEcoleInput {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  roleActif?: string;
}
