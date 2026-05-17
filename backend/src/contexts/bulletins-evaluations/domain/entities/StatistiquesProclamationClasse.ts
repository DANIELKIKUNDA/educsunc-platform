import { ErreurStatistiquesProclamationInvalides } from '../exceptions/ErreurStatistiquesProclamationInvalides';

// Cette classe porte les statistiques detaillees d'une proclamation de classe.
export class StatistiquesProclamationClasse {
  private inscritsGarcons: number;
  private inscritsFilles: number;
  private inscritsTotal: number;
  private participantsGarcons: number;
  private participantsFilles: number;
  private participantsTotal: number;
  private classesGarcons: number;
  private classesFilles: number;
  private classesTotal: number;
  private nonClassesGarcons: number;
  private nonClassesFilles: number;
  private nonClassesTotal: number;
  private abandonsGarcons: number;
  private abandonsFilles: number;
  private abandonsTotal: number;
  private reussitesGarcons: number;
  private reussitesFilles: number;
  private reussitesTotal: number;
  private echecsGarcons: number;
  private echecsFilles: number;
  private echecsTotal: number;
  private tauxParticipation: number;
  private tauxReussite: number;
  private tauxEchec: number;
  private tauxAbandon: number;

  // Ce constructeur initialise toutes les statistiques deja calculees.
  constructor(params: StatistiquesProclamationClasseProps) {
    this.inscritsGarcons = params.inscritsGarcons;
    this.inscritsFilles = params.inscritsFilles;
    this.inscritsTotal = params.inscritsTotal;
    this.participantsGarcons = params.participantsGarcons;
    this.participantsFilles = params.participantsFilles;
    this.participantsTotal = params.participantsTotal;
    this.classesGarcons = params.classesGarcons;
    this.classesFilles = params.classesFilles;
    this.classesTotal = params.classesTotal;
    this.nonClassesGarcons = params.nonClassesGarcons;
    this.nonClassesFilles = params.nonClassesFilles;
    this.nonClassesTotal = params.nonClassesTotal;
    this.abandonsGarcons = params.abandonsGarcons;
    this.abandonsFilles = params.abandonsFilles;
    this.abandonsTotal = params.abandonsTotal;
    this.reussitesGarcons = params.reussitesGarcons;
    this.reussitesFilles = params.reussitesFilles;
    this.reussitesTotal = params.reussitesTotal;
    this.echecsGarcons = params.echecsGarcons;
    this.echecsFilles = params.echecsFilles;
    this.echecsTotal = params.echecsTotal;
    this.tauxParticipation = params.tauxParticipation;
    this.tauxReussite = params.tauxReussite;
    this.tauxEchec = params.tauxEchec;
    this.tauxAbandon = params.tauxAbandon;
    this.verifierCoherence();
  }

  // Cette methode expose une vue complete des statistiques pour lecture ou mapping.
  public obtenirValeurs(): StatistiquesProclamationClasseProps {
    return {
      inscritsGarcons: this.inscritsGarcons,
      inscritsFilles: this.inscritsFilles,
      inscritsTotal: this.inscritsTotal,
      participantsGarcons: this.participantsGarcons,
      participantsFilles: this.participantsFilles,
      participantsTotal: this.participantsTotal,
      classesGarcons: this.classesGarcons,
      classesFilles: this.classesFilles,
      classesTotal: this.classesTotal,
      nonClassesGarcons: this.nonClassesGarcons,
      nonClassesFilles: this.nonClassesFilles,
      nonClassesTotal: this.nonClassesTotal,
      abandonsGarcons: this.abandonsGarcons,
      abandonsFilles: this.abandonsFilles,
      abandonsTotal: this.abandonsTotal,
      reussitesGarcons: this.reussitesGarcons,
      reussitesFilles: this.reussitesFilles,
      reussitesTotal: this.reussitesTotal,
      echecsGarcons: this.echecsGarcons,
      echecsFilles: this.echecsFilles,
      echecsTotal: this.echecsTotal,
      tauxParticipation: this.tauxParticipation,
      tauxReussite: this.tauxReussite,
      tauxEchec: this.tauxEchec,
      tauxAbandon: this.tauxAbandon,
    };
  }

  // Cette methode verifie la coherence des comptes et des totaux.
  private verifierCoherence(): void {
    const valeurs = Object.values(this.obtenirValeurs());
    if (valeurs.some((valeur) => !Number.isFinite(valeur) || valeur < 0)) {
      throw new ErreurStatistiquesProclamationInvalides('Les statistiques doivent etre numeriques et positives.');
    }

    if (this.inscritsGarcons + this.inscritsFilles !== this.inscritsTotal) {
      throw new ErreurStatistiquesProclamationInvalides('Le total des inscrits est incoherent.');
    }

    if (this.participantsGarcons + this.participantsFilles !== this.participantsTotal) {
      throw new ErreurStatistiquesProclamationInvalides('Le total des participants est incoherent.');
    }

    if (this.classesGarcons + this.classesFilles !== this.classesTotal) {
      throw new ErreurStatistiquesProclamationInvalides('Le total des classes est incoherent.');
    }

    if (this.nonClassesGarcons + this.nonClassesFilles !== this.nonClassesTotal) {
      throw new ErreurStatistiquesProclamationInvalides('Le total des non classes est incoherent.');
    }

    if (this.abandonsGarcons + this.abandonsFilles !== this.abandonsTotal) {
      throw new ErreurStatistiquesProclamationInvalides('Le total des abandons est incoherent.');
    }

    if (this.reussitesGarcons + this.reussitesFilles !== this.reussitesTotal) {
      throw new ErreurStatistiquesProclamationInvalides('Le total des reussites est incoherent.');
    }

    if (this.echecsGarcons + this.echecsFilles !== this.echecsTotal) {
      throw new ErreurStatistiquesProclamationInvalides('Le total des echecs est incoherent.');
    }
  }
}

// Cette structure rend les statistiques reutilisables dans la synthese ecole.
export interface StatistiquesProclamationClasseProps {
  inscritsGarcons: number;
  inscritsFilles: number;
  inscritsTotal: number;
  participantsGarcons: number;
  participantsFilles: number;
  participantsTotal: number;
  classesGarcons: number;
  classesFilles: number;
  classesTotal: number;
  nonClassesGarcons: number;
  nonClassesFilles: number;
  nonClassesTotal: number;
  abandonsGarcons: number;
  abandonsFilles: number;
  abandonsTotal: number;
  reussitesGarcons: number;
  reussitesFilles: number;
  reussitesTotal: number;
  echecsGarcons: number;
  echecsFilles: number;
  echecsTotal: number;
  tauxParticipation: number;
  tauxReussite: number;
  tauxEchec: number;
  tauxAbandon: number;
}
