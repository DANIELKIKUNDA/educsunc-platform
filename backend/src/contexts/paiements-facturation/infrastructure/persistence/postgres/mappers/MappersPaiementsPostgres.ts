// Ce fichier centralise les conversions PostgreSQL historiques du BC Paiements & Facturation.
// Il reste volontairement present pour conserver la compatibilite des depots et queries existants.

import { AnnulationPaiement } from '../../../../domain/aggregates/AnnulationPaiement';
import { CaisseJour } from '../../../../domain/aggregates/CaisseJour';
import { DetteEleve } from '../../../../domain/aggregates/DetteEleve';
import { Exoneration } from '../../../../domain/aggregates/Exoneration';
import { GrilleTarification } from '../../../../domain/aggregates/GrilleTarification';
import { ObligationFinanciereEleve } from '../../../../domain/aggregates/ObligationFinanciereEleve';
import { Paiement } from '../../../../domain/aggregates/Paiement';
import { ParametresPaiementEcole } from '../../../../domain/aggregates/ParametresPaiementEcole';
import { PlanAnticipationFrais } from '../../../../domain/aggregates/PlanAnticipationFrais';
import { QualificationFinanciereEleve } from '../../../../domain/aggregates/QualificationFinanciereEleve';
import { RecuPaiement } from '../../../../domain/aggregates/RecuPaiement';
import { Restitution } from '../../../../domain/aggregates/Restitution';
import {
  DetteAnnuelle,
  type ProprietesDetteAnnuelle,
} from '../../../../domain/entities/DetteAnnuelle';
import {
  LigneDette,
  type ProprietesLigneDette,
} from '../../../../domain/entities/LigneDette';
import { OperationCaisse } from '../../../../domain/entities/OperationCaisse';
import { OperationInverse } from '../../../../domain/entities/OperationInverse';
import { RepartitionPaiement } from '../../../../domain/entities/RepartitionPaiement';
import { CategorieFraisEtat } from '../../../../domain/value-objects/CategorieFraisEtat';
import { CategorieTechnique } from '../../../../domain/value-objects/CategorieTechnique';
import { CiblePaiement } from '../../../../domain/value-objects/CiblePaiement';
import { ModePaiement } from '../../../../domain/value-objects/ModePaiement';
import { MoisScolaire } from '../../../../domain/value-objects/MoisScolaire';
import { OrigineAffectation } from '../../../../domain/value-objects/OrigineAffectation';
import { OrigineObligation } from '../../../../domain/value-objects/OrigineObligation';
import { PolitiqueArrieres } from '../../../../domain/value-objects/PolitiqueArrieres';
import { ReferenceFrais } from '../../../../domain/value-objects/ReferenceFrais';
import { StatutCaisse } from '../../../../domain/value-objects/StatutCaisse';
import { StatutDette } from '../../../../domain/value-objects/StatutDette';
import { StatutExoneration } from '../../../../domain/value-objects/StatutExoneration';
import { StatutPaiement } from '../../../../domain/value-objects/StatutPaiement';
import { StatutQualificationFinanciereEleve } from '../../../../domain/value-objects/StatutQualificationFinanciereEleve';
import { StatutRecu } from '../../../../domain/value-objects/StatutRecu';
import { TrancheFraisEtat } from '../../../../domain/value-objects/TrancheFraisEtat';
import { CodeQualificationFinanciereEleve } from '../../../../domain/value-objects/CodeQualificationFinanciereEleve';
import { TypeExoneration } from '../../../../domain/value-objects/TypeExoneration';
import { TypeFrais } from '../../../../domain/value-objects/TypeFrais';
import { TypeOperationCaisse } from '../../../../domain/value-objects/TypeOperationCaisse';
import { TypePlanAnticipation } from '../../../../domain/value-objects/TypePlanAnticipation';
import { BaseMapperPostgresPaiementsFacturation } from './BaseMapperPostgresPaiementsFacturation';
import {
  RoleConsultationHistoriquePaiementsDeleguee,
  RoleExonerationDeleguee,
  RolePerceptionDeleguee,
} from '../../../../application/dto/input/ParametresPaiementEntreeDTO';

interface MoneyPersistance {
  montant: number;
  devise: 'CDF' | 'USD';
}

interface PaiementPartielParTypePersistance {
  typeFrais: TypeFrais;
  autorise: boolean;
}

interface PerceptionDelegueeParTypePersistance {
  typeFrais: TypeFrais;
  roles: RolePerceptionDeleguee[];
}

interface TotalParCaissierPersistance {
  idCaissier: string;
  montant: MoneyPersistance;
}

// Cette structure represente la forme persistante d'une grille tarifaire.
export interface PersistanceGrilleTarificationPostgres {
  id: string;
  id_organisation: string | null;
  id_ecole: string;
  id_annee_scolaire: string;
  type_frais: TypeFrais;
  libelle: string;
  montant: number;
  devise: 'CDF' | 'USD';
  section: string | null;
  categorie_frais_etat: CategorieFraisEtat | null;
  categorie_technique: CategorieTechnique | null;
  est_classe_tenasosp: boolean | null;
  est_classe_exetat: boolean | null;
  est_classe_finaliste: boolean | null;
  mois_scolaire: MoisScolaire | null;
  tranche_frais_etat: TrancheFraisEtat | null;
  obligatoire: boolean;
  actif: boolean;
  date_debut_validite: string | null;
  date_fin_validite: string | null;
  cree_par: string;
  cree_le: Date | string;
  modifie_par: string | null;
  modifie_le: Date | string | null;
  version: number;
}

export interface PersistanceParametresPaiementEcolePostgres {
  id: string;
  id_ecole: string;
  paiement_partiel_autorise: boolean;
  paiement_partiel_par_type_frais: PaiementPartielParTypePersistance[] | null;
  perception_deleguee_par_type_frais: PerceptionDelegueeParTypePersistance[] | null;
  consultation_historique_paiements_deleguee: RoleConsultationHistoriquePaiementsDeleguee[] | null;
  exoneration_deleguee: RoleExonerationDeleguee[] | null;
  politique_arrieres: PolitiqueArrieres;
  autoriser_inscription_avec_dette: boolean;
  bloquer_retrait_documents_si_dette: boolean;
  appliquer_famille_nombreuse: boolean;
  nombre_enfants_seuil_famille_nombreuse: number | null;
  modes_paiement_autorises: ModePaiement[];
  mois_obligatoire_inscription: MoisScolaire | null;
  exiger_frais_inscription: boolean;
  actif: boolean;
  version: number;
}

export interface PersistanceObligationFinancierePostgres {
  id: string;
  id_ecole: string;
  id_eleve: string;
  id_annee_scolaire: string;
  id_inscription_scolaire: string | null;
  type_frais: TypeFrais;
  reference_frais: string;
  libelle: string;
  montant_initial: number;
  devise: 'CDF' | 'USD';
  montant_paye: number;
  montant_exonere: number;
  solde: number;
  statut: StatutDette;
  origine_creation: OrigineObligation;
  origine_paiement: OrigineAffectation | null;
  id_grille_tarification: string | null;
  cree_le: Date | string;
  cree_par: string | null;
  version: number;
}

export interface PersistanceRepartitionPaiementPostgres {
  id: string;
  id_paiement: string;
  id_obligation: string;
  montant: number;
  devise: 'CDF' | 'USD';
  ordre_affectation: number;
  origine_affectation: OrigineAffectation;
}

export interface PersistancePaiementPostgres {
  id: string;
  id_ecole: string;
  id_eleve: string;
  montant_total: number;
  devise: 'CDF' | 'USD';
  mode_paiement: ModePaiement;
  type_frais_declare: TypeFrais;
  cible_paiement: CiblePaiement;
  statut_paiement: StatutPaiement;
  cree_par: string;
  cree_le: Date | string;
  idempotency_key: string;
  version: number;
}

export interface PersistanceRecuPaiementPostgres {
  id: string;
  numero_recu: string;
  id_paiement: string;
  id_obligation: string;
  id_ecole: string;
  id_eleve: string;
  type_frais: TypeFrais;
  reference_frais: string;
  libelle: string;
  montant: number;
  devise: 'CDF' | 'USD';
  montant_lettres: string;
  mode_paiement: ModePaiement;
  id_caissier: string;
  date_emission: Date | string;
  statut_recu: StatutRecu;
}

export interface PersistanceOperationCaissePostgres {
  id: string;
  id_paiement: string | null;
  id_restitution: string | null;
  id_annulation: string | null;
  type_operation: TypeOperationCaisse;
  montant: number;
  devise: 'CDF' | 'USD';
  mode_paiement: ModePaiement;
  id_caissier: string;
  date_operation: Date | string;
}

export interface PersistanceCaisseJourPostgres {
  id: string;
  id_ecole: string;
  date_caisse: string;
  statut: StatutCaisse;
  total_encaisse: number;
  total_cash: number;
  total_mobile_money: number;
  total_par_caissier: TotalParCaissierPersistance[] | null;
  total_fonds_anticipes: number;
  total_fonds_consommes: number;
  disponible_reel: number;
  ouverte_par: string;
  ouverte_le: Date | string;
  cloturee_par: string | null;
  cloturee_le: Date | string | null;
  version: number;
}

export interface PersistanceExonerationPostgres {
  id: string;
  id_ecole: string;
  id_eleve: string;
  id_obligation: string;
  type_exoneration: TypeExoneration;
  montant_exonere: number;
  devise: 'CDF' | 'USD';
  pourcentage: number | null;
  raison: string;
  valide_par: string;
  validee_le: Date | string;
  statut: StatutExoneration;
}

export interface PersistanceQualificationFinanciereElevePostgres {
  id: string;
  id_organisation: string | null;
  id_ecole: string;
  id_eleve: string;
  code_qualification: CodeQualificationFinanciereEleve;
  actif: boolean;
  date_debut_effet: string | null;
  date_fin_effet: string | null;
  details: Record<string, unknown> | null;
  raison: string | null;
  cree_par: string;
  cree_le: Date | string;
  version: number;
}

export interface PersistancePlanAnticipationFraisPostgres {
  id: string;
  id_ecole: string;
  id_annee_scolaire: string;
  nom: string;
  type_plan: TypePlanAnticipation;
  mois_cibles: MoisScolaire[];
  mois_supports: MoisScolaire[];
  obligatoire: boolean;
  actif: boolean;
  date_debut: string | null;
  date_fin: string | null;
  version: number;
}

export interface PersistanceRestitutionPostgres {
  id: string;
  id_paiement: string;
  id_ecole: string;
  id_eleve: string;
  montant: number;
  devise: 'CDF' | 'USD';
  raison: 'EXCEDENT';
  effectue_par: string;
  effectue_le: Date | string;
}

export interface PersistanceOperationInversePostgres {
  id_operation_origine: string;
  id_operation_inverse: string;
  type_operation: TypeOperationCaisse;
  montant: number;
  devise: 'CDF' | 'USD';
  mode_paiement: ModePaiement;
  cree_le: Date | string;
}

export interface PersistanceAnnulationPaiementPostgres {
  id: string;
  id_paiement: string;
  id_ecole: string;
  raison: string;
  annule_par: string;
  annule_le: Date | string;
}

export interface PersistanceLigneDettePostgres {
  id_obligation: string;
  type_frais: TypeFrais;
  reference_frais: string;
  libelle: string;
  montant_du_historique: MoneyPersistance;
  montant_paye: MoneyPersistance;
  montant_exonere: MoneyPersistance;
  solde: MoneyPersistance;
  statut: StatutDette;
}

export interface PersistanceDetteAnnuellePostgres {
  id_annee_scolaire: string;
  statut_annee: 'ACTIVE' | 'CLOTUREE';
  lignes: PersistanceLigneDettePostgres[];
  total_du: MoneyPersistance;
  total_paye: MoneyPersistance;
  total_exonere: MoneyPersistance;
  solde_restant: MoneyPersistance;
}

export interface PersistanceDetteElevePostgres {
  id: string;
  id_eleve: string;
  id_ecole: string;
  dettes_par_annee: PersistanceDetteAnnuellePostgres[];
  total_arrieres: MoneyPersistance;
  total_annee_active: MoneyPersistance;
  total_global: MoneyPersistance;
}

// Cette classe regroupe les conversions domaine <-> persistance du BC Paiements.
export class MappersPaiementsPostgres extends BaseMapperPostgresPaiementsFacturation {
  // Cette methode convertit les parametres de paiement vers la ligne PostgreSQL.
  public static versPersistanceParametres(
    parametres: ParametresPaiementEcole,
  ): PersistanceParametresPaiementEcolePostgres {
    return {
      id: parametres.obtenirId(),
      id_ecole: parametres.obtenirIdEcole(),
      paiement_partiel_autorise: parametres.obtenirPaiementPartielAutorise(),
      paiement_partiel_par_type_frais:
        this.versPersistancePaiementPartielParType(
          parametres.obtenirPaiementPartielParTypeFrais(),
        ),
      perception_deleguee_par_type_frais:
        this.versPersistancePerceptionDelegueeParType(
          parametres.obtenirPerceptionDelegueeParTypeFrais(),
        ),
      consultation_historique_paiements_deleguee:
        parametres.obtenirConsultationHistoriquePaiementsDeleguee() ?? null,
      exoneration_deleguee: parametres.obtenirExonerationDeleguee() ?? null,
      politique_arrieres: parametres.obtenirPolitiqueArrieres(),
      autoriser_inscription_avec_dette:
        parametres.obtenirAutoriserInscriptionAvecDette(),
      bloquer_retrait_documents_si_dette:
        parametres.obtenirBloquerRetraitDocumentsSiDette(),
      appliquer_famille_nombreuse:
        parametres.obtenirAppliquerFamilleNombreuse(),
      nombre_enfants_seuil_famille_nombreuse:
        parametres.obtenirNombreEnfantsSeuilFamilleNombreuse() ?? null,
      modes_paiement_autorises: parametres.obtenirModesPaiementAutorises(),
      mois_obligatoire_inscription:
        parametres.obtenirMoisObligatoireInscription() ?? null,
      exiger_frais_inscription: parametres.obtenirExigerFraisInscription(),
      actif: parametres.obtenirActif(),
      version: parametres.obtenirVersion(),
    };
  }

  // Cette methode reconstruit l'agregat de parametres depuis PostgreSQL.
  public static depuisPersistanceParametres(
    ligne: PersistanceParametresPaiementEcolePostgres,
  ): ParametresPaiementEcole {
    return new ParametresPaiementEcole({
      idParametresPaiementEcole: ligne.id,
      idEcole: ligne.id_ecole,
      paiementPartielAutorise: ligne.paiement_partiel_autorise,
      paiementPartielParTypeFrais: this.depuisPersistancePaiementPartielParType(
        ligne.paiement_partiel_par_type_frais,
      ),
      perceptionDelegueeParTypeFrais:
        this.depuisPersistancePerceptionDelegueeParType(
          ligne.perception_deleguee_par_type_frais,
        ),
      consultationHistoriquePaiementsDeleguee:
        ligne.consultation_historique_paiements_deleguee ?? undefined,
      exonerationDeleguee: ligne.exoneration_deleguee ?? undefined,
      politiqueArrieres: ligne.politique_arrieres,
      autoriserInscriptionAvecDette: ligne.autoriser_inscription_avec_dette,
      bloquerRetraitDocumentsSiDette:
        ligne.bloquer_retrait_documents_si_dette,
      appliquerFamilleNombreuse: ligne.appliquer_famille_nombreuse,
      nombreEnfantsSeuilFamilleNombreuse:
        ligne.nombre_enfants_seuil_famille_nombreuse ?? undefined,
      modesPaiementAutorises: ligne.modes_paiement_autorises,
      moisObligatoireInscription:
        ligne.mois_obligatoire_inscription ?? undefined,
      exigerFraisInscription: ligne.exiger_frais_inscription,
      actif: ligne.actif,
      version: ligne.version,
    });
  }

  // Cette methode convertit la grille de tarification vers la persistance.
  public static versPersistanceGrille(
    grille: GrilleTarification,
  ): PersistanceGrilleTarificationPostgres {
    const montant = this.versPersistanceMoney(grille.obtenirMontant());

    return {
      id: grille.obtenirId(),
      id_organisation: grille.obtenirIdOrganisation() ?? null,
      id_ecole: grille.obtenirIdEcole(),
      id_annee_scolaire: grille.obtenirIdAnneeScolaire(),
      type_frais: grille.obtenirTypeFrais(),
      libelle: grille.obtenirLibelle(),
      montant: montant.montant,
      devise: montant.devise,
      section: grille.obtenirSection() ?? null,
      categorie_frais_etat: grille.obtenirCategorieFraisEtat() ?? null,
      categorie_technique: grille.obtenirCategorieTechnique() ?? null,
      est_classe_tenasosp: grille.obtenirEstClasseTENASOSP() ?? null,
      est_classe_exetat: grille.obtenirEstClasseEXETAT() ?? null,
      est_classe_finaliste: grille.obtenirEstClasseFinaliste() ?? null,
      mois_scolaire: grille.obtenirMoisScolaire() ?? null,
      tranche_frais_etat: grille.obtenirTrancheFraisEtat() ?? null,
      obligatoire: grille.obtenirObligatoire(),
      actif: grille.obtenirActif(),
      date_debut_validite: grille.obtenirDateDebutValidite() ?? null,
      date_fin_validite: grille.obtenirDateFinValidite() ?? null,
      cree_par: grille.obtenirCreePar(),
      cree_le: grille.obtenirCreeLe(),
      modifie_par: grille.obtenirModifiePar() ?? null,
      modifie_le: grille.obtenirModifieLe() ?? null,
      version: grille.obtenirVersion(),
    };
  }

  // Cette methode reconstruit la grille de tarification depuis une ligne PostgreSQL.
  public static depuisPersistanceGrille(
    ligne: PersistanceGrilleTarificationPostgres,
  ): GrilleTarification {
    return new GrilleTarification({
      idGrilleTarification: ligne.id,
      idOrganisation: ligne.id_organisation ?? undefined,
      idEcole: ligne.id_ecole,
      idAnneeScolaire: ligne.id_annee_scolaire,
      typeFrais: ligne.type_frais,
      libelle: ligne.libelle,
      montant: this.versMoney(ligne.montant, ligne.devise, 'montant', 'devise'),
      section: ligne.section ?? undefined,
      categorieFraisEtat: ligne.categorie_frais_etat ?? undefined,
      categorieTechnique: ligne.categorie_technique ?? undefined,
      estClasseTENASOSP: ligne.est_classe_tenasosp ?? undefined,
      estClasseEXETAT: ligne.est_classe_exetat ?? undefined,
      estClasseFinaliste: ligne.est_classe_finaliste ?? undefined,
      moisScolaire: ligne.mois_scolaire ?? undefined,
      trancheFraisEtat: ligne.tranche_frais_etat ?? undefined,
      obligatoire: ligne.obligatoire,
      actif: ligne.actif,
      dateDebutValidite: ligne.date_debut_validite ?? undefined,
      dateFinValidite: ligne.date_fin_validite ?? undefined,
      creePar: ligne.cree_par,
      creeLe: this.versDate(ligne.cree_le, 'cree_le'),
      modifiePar: ligne.modifie_par ?? undefined,
      modifieLe: this.versDateOptionnelle(ligne.modifie_le, 'modifie_le'),
      version: ligne.version,
    });
  }

  // Cette methode convertit une obligation financiere vers PostgreSQL.
  public static versPersistanceObligation(
    obligation: ObligationFinanciereEleve,
  ): PersistanceObligationFinancierePostgres {
    const montantInitial = this.versPersistanceMoney(
      obligation.obtenirMontantDuHistorique(),
    );

    return {
      id: obligation.obtenirId(),
      id_ecole: obligation.obtenirIdEcole(),
      id_eleve: obligation.obtenirIdEleve(),
      id_annee_scolaire: obligation.obtenirIdAnneeScolaire(),
      id_inscription_scolaire: obligation.obtenirIdInscriptionScolaire() ?? null,
      type_frais: obligation.obtenirTypeFrais(),
      reference_frais: obligation.obtenirReferenceFrais().obtenirValeur(),
      libelle: obligation.obtenirLibelle(),
      montant_initial: montantInitial.montant,
      devise: montantInitial.devise,
      montant_paye: obligation.obtenirMontantPaye().obtenirMontant(),
      montant_exonere: obligation.obtenirMontantExonere().obtenirMontant(),
      solde: obligation.obtenirSolde().obtenirMontant(),
      statut: obligation.obtenirStatut(),
      origine_creation: obligation.obtenirOrigineCreation(),
      origine_paiement: obligation.obtenirOriginePaiement() ?? null,
      id_grille_tarification: obligation.obtenirIdGrilleTarification() ?? null,
      cree_le: obligation.obtenirCreeLe(),
      cree_par: obligation.obtenirCreePar() ?? null,
      version: obligation.obtenirVersion(),
    };
  }

  // Cette methode reconstruit une obligation financiere depuis PostgreSQL.
  public static depuisPersistanceObligation(
    ligne: PersistanceObligationFinancierePostgres,
  ): ObligationFinanciereEleve {
    const montantHistorique = this.versMoney(
      ligne.montant_initial,
      ligne.devise,
      'montant_initial',
      'devise',
    );

    return new ObligationFinanciereEleve({
      idObligation: ligne.id,
      idEcole: ligne.id_ecole,
      idEleve: ligne.id_eleve,
      idAnneeScolaire: ligne.id_annee_scolaire,
      idInscriptionScolaire: ligne.id_inscription_scolaire ?? undefined,
      typeFrais: ligne.type_frais,
      referenceFrais: new ReferenceFrais(ligne.reference_frais),
      libelle: ligne.libelle,
      montantDuHistorique: montantHistorique,
      montantPaye: this.versMoney(
        ligne.montant_paye,
        ligne.devise,
        'montant_paye',
        'devise',
      ),
      montantExonere: this.versMoney(
        ligne.montant_exonere,
        ligne.devise,
        'montant_exonere',
        'devise',
      ),
      solde: this.versMoney(ligne.solde, ligne.devise, 'solde', 'devise'),
      statut: ligne.statut,
      origineCreation: ligne.origine_creation,
      originePaiement: ligne.origine_paiement ?? undefined,
      idGrilleTarification: ligne.id_grille_tarification ?? undefined,
      creeLe: this.versDate(ligne.cree_le, 'cree_le'),
      creePar: ligne.cree_par ?? undefined,
      version: ligne.version,
    });
  }

  // Cette methode convertit une repartition de paiement vers PostgreSQL.
  public static versPersistanceRepartition(
    repartition: RepartitionPaiement,
  ): PersistanceRepartitionPaiementPostgres {
    const montant = this.versPersistanceMoney(repartition.obtenirMontantAffecte());

    return {
      id: repartition.obtenirIdRepartition(),
      id_paiement: repartition.obtenirIdPaiement(),
      id_obligation: repartition.obtenirIdObligation(),
      montant: montant.montant,
      devise: montant.devise,
      ordre_affectation: repartition.obtenirOrdreAffectation(),
      origine_affectation: repartition.obtenirOrigineAffectation(),
    };
  }

  // Cette methode reconstruit une repartition depuis PostgreSQL.
  public static depuisPersistanceRepartition(
    ligne: PersistanceRepartitionPaiementPostgres,
  ): RepartitionPaiement {
    return new RepartitionPaiement({
      idRepartition: ligne.id,
      idPaiement: ligne.id_paiement,
      idObligation: ligne.id_obligation,
      montantAffecte: this.versMoney(ligne.montant, ligne.devise, 'montant', 'devise'),
      ordreAffectation: ligne.ordre_affectation,
      origineAffectation: ligne.origine_affectation,
    });
  }

  // Cette methode convertit un paiement complet vers sa ligne PostgreSQL.
  public static versPersistancePaiement(
    paiement: Paiement,
  ): PersistancePaiementPostgres {
    const montant = this.versPersistanceMoney(paiement.obtenirMontantTotal());

    return {
      id: paiement.obtenirId(),
      id_ecole: paiement.obtenirIdEcole(),
      id_eleve: paiement.obtenirIdEleve(),
      montant_total: montant.montant,
      devise: montant.devise,
      mode_paiement: paiement.obtenirModePaiement(),
      type_frais_declare: paiement.obtenirTypeFraisDeclare(),
      cible_paiement: paiement.obtenirCiblePaiement(),
      statut_paiement: paiement.obtenirStatutPaiement(),
      cree_par: paiement.obtenirCreePar(),
      cree_le: paiement.obtenirCreeLe(),
      idempotency_key: paiement.obtenirIdempotencyKey(),
      version: paiement.obtenirVersion(),
    };
  }

  // Cette methode reconstruit un paiement avec ses repartitions.
  public static depuisPersistancePaiement(
    ligne: PersistancePaiementPostgres,
    repartitions: RepartitionPaiement[],
  ): Paiement {
    return new Paiement({
      idPaiement: ligne.id,
      idEcole: ligne.id_ecole,
      idEleve: ligne.id_eleve,
      montantTotal: this.versMoney(
        ligne.montant_total,
        ligne.devise,
        'montant_total',
        'devise',
      ),
      modePaiement: ligne.mode_paiement,
      typeFraisDeclare: ligne.type_frais_declare,
      ciblePaiement: ligne.cible_paiement,
      statutPaiement: ligne.statut_paiement,
      repartitions,
      creePar: ligne.cree_par,
      creeLe: this.versDate(ligne.cree_le, 'cree_le'),
      idempotencyKey: ligne.idempotency_key,
      version: ligne.version,
    });
  }

  // Cette methode convertit un recu vers la persistance.
  public static versPersistanceRecu(
    recu: RecuPaiement,
  ): PersistanceRecuPaiementPostgres {
    const montant = this.versPersistanceMoney(recu.obtenirMontant());

    return {
      id: recu.obtenirId(),
      numero_recu: recu.obtenirNumeroRecu(),
      id_paiement: recu.obtenirIdPaiement(),
      id_obligation: recu.obtenirIdObligation(),
      id_ecole: recu.obtenirIdEcole(),
      id_eleve: recu.obtenirIdEleve(),
      type_frais: recu.obtenirTypeFrais(),
      reference_frais: recu.obtenirReferenceFrais().obtenirValeur(),
      libelle: recu.obtenirLibelle(),
      montant: montant.montant,
      devise: montant.devise,
      montant_lettres: recu.obtenirMontantEnLettres(),
      mode_paiement: recu.obtenirModePaiement(),
      id_caissier: recu.obtenirIdCaissier(),
      date_emission: recu.obtenirDateEmission(),
      statut_recu: recu.obtenirStatutRecu(),
    };
  }

  // Cette methode reconstruit un recu a partir de PostgreSQL.
  public static depuisPersistanceRecu(
    ligne: PersistanceRecuPaiementPostgres,
  ): RecuPaiement {
    return new RecuPaiement({
      idRecu: ligne.id,
      numeroRecu: ligne.numero_recu,
      idPaiement: ligne.id_paiement,
      idObligation: ligne.id_obligation,
      idEcole: ligne.id_ecole,
      idEleve: ligne.id_eleve,
      typeFrais: ligne.type_frais,
      referenceFrais: new ReferenceFrais(ligne.reference_frais),
      libelle: ligne.libelle,
      montant: this.versMoney(ligne.montant, ligne.devise, 'montant', 'devise'),
      montantEnLettres: ligne.montant_lettres,
      modePaiement: ligne.mode_paiement,
      idCaissier: ligne.id_caissier,
      dateEmission: this.versDate(ligne.date_emission, 'date_emission'),
      statutRecu: ligne.statut_recu,
    });
  }

  // Cette methode convertit une operation de caisse vers la persistance.
  public static versPersistanceOperationCaisse(
    operation: OperationCaisse,
  ): PersistanceOperationCaissePostgres {
    const montant = this.versPersistanceMoney(operation.obtenirMontant());

    return {
      id: operation.obtenirIdOperation(),
      id_paiement: operation.obtenirIdPaiement() ?? null,
      id_restitution: operation.obtenirIdRestitution() ?? null,
      id_annulation: operation.obtenirIdAnnulation() ?? null,
      type_operation: operation.obtenirTypeOperation(),
      montant: montant.montant,
      devise: montant.devise,
      mode_paiement: operation.obtenirModePaiement(),
      id_caissier: operation.obtenirIdCaissier(),
      date_operation: operation.obtenirDateOperation(),
    };
  }

  // Cette methode reconstruit une operation de caisse.
  public static depuisPersistanceOperationCaisse(
    ligne: PersistanceOperationCaissePostgres,
  ): OperationCaisse {
    return new OperationCaisse({
      idOperation: ligne.id,
      idPaiement: ligne.id_paiement ?? undefined,
      idRestitution: ligne.id_restitution ?? undefined,
      idAnnulation: ligne.id_annulation ?? undefined,
      typeOperation: ligne.type_operation,
      montant: this.versMoney(ligne.montant, ligne.devise, 'montant', 'devise'),
      modePaiement: ligne.mode_paiement,
      idCaissier: ligne.id_caissier,
      dateOperation: this.versDate(ligne.date_operation, 'date_operation'),
    });
  }

  // Cette methode convertit une caisse journaliere vers PostgreSQL.
  public static versPersistanceCaisse(
    caisse: CaisseJour,
  ): PersistanceCaisseJourPostgres {
    return {
      id: caisse.obtenirId(),
      id_ecole: caisse.obtenirIdEcole(),
      date_caisse: caisse.obtenirDateCaisse(),
      statut: caisse.obtenirStatut(),
      total_encaisse: caisse.obtenirTotalEncaisse().obtenirMontant(),
      total_cash: caisse.obtenirTotalCash().obtenirMontant(),
      total_mobile_money: caisse.obtenirTotalMobileMoney().obtenirMontant(),
      total_par_caissier: Array.from(caisse.obtenirTotalParCaissier().entries()).map(
        ([idCaissier, montant]) => ({
          idCaissier,
          montant: this.versPersistanceMoney(montant),
        }),
      ),
      total_fonds_anticipes: caisse.obtenirTotalFondsAnticipes().obtenirMontant(),
      total_fonds_consommes: caisse.obtenirTotalFondsConsommes().obtenirMontant(),
      disponible_reel: caisse.obtenirDisponibleReel().obtenirMontant(),
      ouverte_par: caisse.obtenirOuvertePar(),
      ouverte_le: caisse.obtenirOuverteLe(),
      cloturee_par: caisse.obtenirClotureePar() ?? null,
      cloturee_le: caisse.obtenirClotureeLe() ?? null,
      version: caisse.obtenirVersion(),
    };
  }

  // Cette methode reconstruit une caisse avec ses operations.
  public static depuisPersistanceCaisse(
    ligne: PersistanceCaisseJourPostgres,
    operations: OperationCaisse[],
  ): CaisseJour {
    const devise = 'CDF';

    return new CaisseJour({
      idCaisseJour: ligne.id,
      idEcole: ligne.id_ecole,
      dateCaisse: ligne.date_caisse,
      statut: ligne.statut,
      operations,
      totalEncaisse: this.versMoney(ligne.total_encaisse, devise, 'total_encaisse', 'devise'),
      totalCash: this.versMoney(ligne.total_cash, devise, 'total_cash', 'devise'),
      totalMobileMoney: this.versMoney(
        ligne.total_mobile_money,
        devise,
        'total_mobile_money',
        'devise',
      ),
      totalParCaissier: new Map(
        (ligne.total_par_caissier ?? []).map((element) => [
          element.idCaissier,
          this.versMoney(
            element.montant.montant,
            element.montant.devise,
            'total_par_caissier',
            'devise',
          ),
        ]),
      ),
      totalFondsAnticipes: this.versMoney(
        ligne.total_fonds_anticipes,
        devise,
        'total_fonds_anticipes',
        'devise',
      ),
      totalFondsConsommes: this.versMoney(
        ligne.total_fonds_consommes,
        devise,
        'total_fonds_consommes',
        'devise',
      ),
      disponibleReel: this.versMoney(
        ligne.disponible_reel,
        devise,
        'disponible_reel',
        'devise',
      ),
      ouvertePar: ligne.ouverte_par,
      ouverteLe: this.versDate(ligne.ouverte_le, 'ouverte_le'),
      clotureePar: ligne.cloturee_par ?? undefined,
      clotureeLe: this.versDateOptionnelle(ligne.cloturee_le, 'cloturee_le'),
      version: ligne.version,
    });
  }

  // Cette methode convertit une exoneration vers PostgreSQL.
  public static versPersistanceExoneration(
    exoneration: Exoneration,
  ): PersistanceExonerationPostgres {
    const montant = this.versPersistanceMoney(exoneration.obtenirMontantExonere());

    return {
      id: exoneration.obtenirId(),
      id_ecole: exoneration.obtenirIdEcole(),
      id_eleve: exoneration.obtenirIdEleve(),
      id_obligation: exoneration.obtenirIdObligation(),
      type_exoneration: exoneration.obtenirTypeExoneration(),
      montant_exonere: montant.montant,
      devise: montant.devise,
      pourcentage: exoneration.obtenirPourcentage() ?? null,
      raison: exoneration.obtenirRaison(),
      valide_par: exoneration.obtenirValidePar(),
      validee_le: exoneration.obtenirValideeLe(),
      statut: exoneration.obtenirStatut(),
    };
  }

  // Cette methode reconstruit une exoneration.
  public static depuisPersistanceExoneration(
    ligne: PersistanceExonerationPostgres,
  ): Exoneration {
    return new Exoneration({
      idExoneration: ligne.id,
      idEcole: ligne.id_ecole,
      idEleve: ligne.id_eleve,
      idObligation: ligne.id_obligation,
      typeExoneration: ligne.type_exoneration,
      montantExonere: this.versMoney(
        ligne.montant_exonere,
        ligne.devise,
        'montant_exonere',
        'devise',
      ),
      pourcentage: ligne.pourcentage ?? undefined,
      raison: ligne.raison,
      validePar: ligne.valide_par,
      valideeLe: this.versDate(ligne.validee_le, 'validee_le'),
      statut: ligne.statut,
    });
  }

  public static versPersistanceQualificationFinanciereEleve(
    qualification: QualificationFinanciereEleve,
  ): PersistanceQualificationFinanciereElevePostgres {
    return {
      id: qualification.obtenirId(),
      id_organisation: qualification.obtenirIdOrganisation() ?? null,
      id_ecole: qualification.obtenirIdEcole(),
      id_eleve: qualification.obtenirIdEleve(),
      code_qualification: qualification.obtenirCodeQualification(),
      actif: qualification.obtenirStatut() === StatutQualificationFinanciereEleve.ACTIVE,
      date_debut_effet: qualification.obtenirDateDebutEffet() ?? null,
      date_fin_effet: qualification.obtenirDateFinEffet() ?? null,
      details: qualification.obtenirDetails() ?? null,
      raison: qualification.obtenirRaison() ?? null,
      cree_par: qualification.obtenirCreePar(),
      cree_le: qualification.obtenirCreeLe(),
      version: qualification.obtenirVersion(),
    };
  }

  public static depuisPersistanceQualificationFinanciereEleve(
    ligne: PersistanceQualificationFinanciereElevePostgres,
  ): QualificationFinanciereEleve {
    return new QualificationFinanciereEleve({
      idQualification: ligne.id,
      idOrganisation: ligne.id_organisation ?? undefined,
      idEcole: ligne.id_ecole,
      idEleve: ligne.id_eleve,
      codeQualification: ligne.code_qualification,
      statut: ligne.actif
        ? StatutQualificationFinanciereEleve.ACTIVE
        : StatutQualificationFinanciereEleve.DESACTIVEE,
      raison: ligne.raison ?? undefined,
      details: ligne.details ?? undefined,
      dateDebutEffet: ligne.date_debut_effet ?? undefined,
      dateFinEffet: ligne.date_fin_effet ?? undefined,
      creePar: ligne.cree_par,
      creeLe: this.versDate(ligne.cree_le, 'cree_le'),
      version: ligne.version,
    });
  }

  // Cette methode convertit un plan d'anticipation vers PostgreSQL.
  public static versPersistancePlan(
    plan: PlanAnticipationFrais,
  ): PersistancePlanAnticipationFraisPostgres {
    return {
      id: plan.obtenirId(),
      id_ecole: plan.obtenirIdEcole(),
      id_annee_scolaire: plan.obtenirIdAnneeScolaire(),
      nom: plan.obtenirNom(),
      type_plan: plan.obtenirTypePlan(),
      mois_cibles: plan.obtenirMoisCibles(),
      mois_supports: plan.obtenirMoisSupports(),
      obligatoire: plan.obtenirObligatoire(),
      actif: plan.obtenirActif(),
      date_debut: plan.obtenirDateDebut() ?? null,
      date_fin: plan.obtenirDateFin() ?? null,
      version: plan.obtenirVersion(),
    };
  }

  // Cette methode reconstruit un plan d'anticipation depuis PostgreSQL.
  public static depuisPersistancePlan(
    ligne: PersistancePlanAnticipationFraisPostgres,
  ): PlanAnticipationFrais {
    return new PlanAnticipationFrais({
      idPlanAnticipation: ligne.id,
      idEcole: ligne.id_ecole,
      idAnneeScolaire: ligne.id_annee_scolaire,
      nom: ligne.nom,
      typePlan: ligne.type_plan,
      moisCibles: ligne.mois_cibles,
      moisSupports: ligne.mois_supports,
      obligatoire: ligne.obligatoire,
      actif: ligne.actif,
      dateDebut: ligne.date_debut ?? undefined,
      dateFin: ligne.date_fin ?? undefined,
      version: ligne.version,
    });
  }

  // Cette methode convertit une restitution vers PostgreSQL.
  public static versPersistanceRestitution(
    restitution: Restitution,
  ): PersistanceRestitutionPostgres {
    const montant = this.versPersistanceMoney(restitution.obtenirMontant());

    return {
      id: restitution.obtenirId(),
      id_paiement: restitution.obtenirIdPaiement(),
      id_ecole: restitution.obtenirIdEcole(),
      id_eleve: restitution.obtenirIdEleve(),
      montant: montant.montant,
      devise: montant.devise,
      raison: restitution.obtenirRaison(),
      effectue_par: restitution.obtenirEffectuePar(),
      effectue_le: restitution.obtenirEffectueLe(),
    };
  }

  // Cette methode reconstruit une restitution depuis PostgreSQL.
  public static depuisPersistanceRestitution(
    ligne: PersistanceRestitutionPostgres,
  ): Restitution {
    return new Restitution({
      idRestitution: ligne.id,
      idPaiement: ligne.id_paiement,
      idEcole: ligne.id_ecole,
      idEleve: ligne.id_eleve,
      montant: this.versMoney(ligne.montant, ligne.devise, 'montant', 'devise'),
      raison: ligne.raison,
      effectuePar: ligne.effectue_par,
      effectueLe: this.versDate(ligne.effectue_le, 'effectue_le'),
    });
  }

  // Cette methode convertit une operation inverse vers PostgreSQL.
  public static versPersistanceOperationInverse(
    operation: OperationInverse,
  ): PersistanceOperationInversePostgres {
    const montant = this.versPersistanceMoney(operation.obtenirMontant());

    return {
      id_operation_origine: operation.obtenirIdOperationOrigine(),
      id_operation_inverse: operation.obtenirIdOperationInverse(),
      type_operation: operation.obtenirTypeOperation(),
      montant: montant.montant,
      devise: montant.devise,
      mode_paiement: operation.obtenirModePaiement(),
      cree_le: operation.obtenirCreeLe(),
    };
  }

  // Cette methode reconstruit une operation inverse.
  public static depuisPersistanceOperationInverse(
    ligne: PersistanceOperationInversePostgres,
  ): OperationInverse {
    return new OperationInverse({
      idOperationOrigine: ligne.id_operation_origine,
      idOperationInverse: ligne.id_operation_inverse,
      typeOperation: ligne.type_operation,
      montant: this.versMoney(ligne.montant, ligne.devise, 'montant', 'devise'),
      modePaiement: ligne.mode_paiement,
      creeLe: this.versDate(ligne.cree_le, 'cree_le'),
    });
  }

  // Cette methode convertit une annulation vers PostgreSQL.
  public static versPersistanceAnnulation(
    annulation: AnnulationPaiement,
  ): PersistanceAnnulationPaiementPostgres {
    return {
      id: annulation.obtenirId(),
      id_paiement: annulation.obtenirIdPaiement(),
      id_ecole: annulation.obtenirIdEcole(),
      raison: annulation.obtenirRaison(),
      annule_par: annulation.obtenirAnnulePar(),
      annule_le: annulation.obtenirAnnuleLe(),
    };
  }

  // Cette methode reconstruit une annulation avec ses operations inverses.
  public static depuisPersistanceAnnulation(
    ligne: PersistanceAnnulationPaiementPostgres,
    operationsInverses: OperationInverse[],
  ): AnnulationPaiement {
    return new AnnulationPaiement({
      idAnnulation: ligne.id,
      idPaiement: ligne.id_paiement,
      idEcole: ligne.id_ecole,
      raison: ligne.raison,
      annulePar: ligne.annule_par,
      annuleLe: this.versDate(ligne.annule_le, 'annule_le'),
      operationsInverses,
    });
  }

  // Cette methode convertit la dette consolidee d'un eleve vers la persistance.
  public static versPersistanceDette(dette: DetteEleve): PersistanceDetteElevePostgres {
    return {
      id: dette.obtenirId(),
      id_eleve: dette.obtenirIdEleve(),
      id_ecole: dette.obtenirIdEcole(),
      dettes_par_annee: dette.obtenirDettesParAnnee().map((detteAnnuelle) =>
        this.versPersistanceDetteAnnuelle(detteAnnuelle)),
      total_arrieres: this.versPersistanceMoney(dette.obtenirTotalArrieres()),
      total_annee_active: this.versPersistanceMoney(
        dette.obtenirTotalAnneeActive(),
      ),
      total_global: this.versPersistanceMoney(dette.obtenirTotalGlobal()),
    };
  }

  // Cette methode reconstruit la dette consolidee d'un eleve.
  public static depuisPersistanceDette(
    ligne: PersistanceDetteElevePostgres,
  ): DetteEleve {
    return new DetteEleve({
      idDetteEleve: ligne.id,
      idEleve: ligne.id_eleve,
      idEcole: ligne.id_ecole,
      dettesParAnnee: ligne.dettes_par_annee.map((detteAnnuelle) =>
        this.depuisPersistanceDetteAnnuelle(detteAnnuelle)),
      totalArrieres: this.depuisPersistanceMoneySimple(ligne.total_arrieres),
      totalAnneeActive: this.depuisPersistanceMoneySimple(ligne.total_annee_active),
      totalGlobal: this.depuisPersistanceMoneySimple(ligne.total_global),
    });
  }

  // Cette methode convertit une dette annuelle.
  private static versPersistanceDetteAnnuelle(
    dette: DetteAnnuelle,
  ): PersistanceDetteAnnuellePostgres {
    return {
      id_annee_scolaire: dette.obtenirIdAnneeScolaire(),
      statut_annee: dette.obtenirStatutAnnee(),
      lignes: dette.obtenirLignes().map((ligne) =>
        this.versPersistanceLigneDette(ligne)),
      total_du: this.versPersistanceMoney(dette.obtenirTotalDu()),
      total_paye: this.versPersistanceMoney(dette.obtenirTotalPaye()),
      total_exonere: this.versPersistanceMoney(dette.obtenirTotalExonere()),
      solde_restant: this.versPersistanceMoney(dette.obtenirSoldeRestant()),
    };
  }

  // Cette methode reconstruit une dette annuelle.
  private static depuisPersistanceDetteAnnuelle(
    ligne: PersistanceDetteAnnuellePostgres,
  ): DetteAnnuelle {
    const proprietes: ProprietesDetteAnnuelle = {
      idAnneeScolaire: ligne.id_annee_scolaire,
      statutAnnee: ligne.statut_annee,
      lignes: ligne.lignes.map((ligneDette) =>
        this.depuisPersistanceLigneDette(ligneDette)),
      totalDu: this.depuisPersistanceMoneySimple(ligne.total_du),
      totalPaye: this.depuisPersistanceMoneySimple(ligne.total_paye),
      totalExonere: this.depuisPersistanceMoneySimple(ligne.total_exonere),
      soldeRestant: this.depuisPersistanceMoneySimple(ligne.solde_restant),
    };

    return new DetteAnnuelle(proprietes);
  }

  // Cette methode convertit une ligne de dette vers la persistance.
  private static versPersistanceLigneDette(
    ligne: LigneDette,
  ): PersistanceLigneDettePostgres {
    return {
      id_obligation: ligne.obtenirIdObligation(),
      type_frais: ligne.obtenirTypeFrais(),
      reference_frais: ligne.obtenirReferenceFrais().obtenirValeur(),
      libelle: ligne.obtenirLibelle(),
      montant_du_historique: this.versPersistanceMoney(
        ligne.obtenirMontantDuHistorique(),
      ),
      montant_paye: this.versPersistanceMoney(ligne.obtenirMontantPaye()),
      montant_exonere: this.versPersistanceMoney(ligne.obtenirMontantExonere()),
      solde: this.versPersistanceMoney(ligne.obtenirSolde()),
      statut: ligne.obtenirStatut(),
    };
  }

  // Cette methode reconstruit une ligne de dette depuis PostgreSQL.
  private static depuisPersistanceLigneDette(
    ligne: PersistanceLigneDettePostgres,
  ): LigneDette {
    const proprietes: ProprietesLigneDette = {
      idObligation: ligne.id_obligation,
      typeFrais: ligne.type_frais,
      referenceFrais: new ReferenceFrais(ligne.reference_frais),
      libelle: ligne.libelle,
      montantDuHistorique: this.depuisPersistanceMoneySimple(
        ligne.montant_du_historique,
      ),
      montantPaye: this.depuisPersistanceMoneySimple(ligne.montant_paye),
      montantExonere: this.depuisPersistanceMoneySimple(ligne.montant_exonere),
      solde: this.depuisPersistanceMoneySimple(ligne.solde),
      statut: ligne.statut,
    };

    return new LigneDette(proprietes);
  }

  // Cette methode convertit la regle de paiement partiel vers un format serialisable.
  private static versPersistancePaiementPartielParType(
    regles?: Map<TypeFrais, boolean>,
  ): PaiementPartielParTypePersistance[] | null {
    if (regles === undefined) {
      return null;
    }

    return Array.from(regles.entries()).map(([typeFrais, autorise]) => ({
      typeFrais,
      autorise,
    }));
  }

  // Cette methode reconstruit la regle de paiement partiel depuis PostgreSQL.
  private static depuisPersistancePaiementPartielParType(
    regles: PaiementPartielParTypePersistance[] | null,
  ): Map<TypeFrais, boolean> | undefined {
    if (regles === null) {
      return undefined;
    }

    return new Map(regles.map((regle) => [regle.typeFrais, regle.autorise]));
  }

  // Cette methode convertit la delegation de perception vers un format serialisable.
  private static versPersistancePerceptionDelegueeParType(
    regles?: Map<TypeFrais, RolePerceptionDeleguee[]>,
  ): PerceptionDelegueeParTypePersistance[] | null {
    if (regles === undefined) {
      return null;
    }

    return Array.from(regles.entries()).map(([typeFrais, roles]) => ({
      typeFrais,
      roles: [...roles],
    }));
  }

  // Cette methode reconstruit la delegation de perception depuis PostgreSQL.
  private static depuisPersistancePerceptionDelegueeParType(
    regles: PerceptionDelegueeParTypePersistance[] | null,
  ): Map<TypeFrais, RolePerceptionDeleguee[]> | undefined {
    if (regles === null) {
      return undefined;
    }

    return new Map(regles.map((regle) => [regle.typeFrais, [...regle.roles]]));
  }

  // Cette methode reconstruit un objet Money simple present dans les vues JSON.
  private static depuisPersistanceMoneySimple(valeur: MoneyPersistance) {
    return this.versMoney(valeur.montant, valeur.devise, 'montant', 'devise');
  }
}
