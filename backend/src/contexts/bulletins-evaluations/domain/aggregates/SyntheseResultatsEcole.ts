import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { LigneSyntheseResultatsClasse } from '../entities/LigneSyntheseResultatsClasse';
import { StatistiquesProclamationClasseProps } from '../entities/StatistiquesProclamationClasse';
import { TotauxSyntheseEcole } from '../entities/TotauxSyntheseEcole';
import { SyntheseResultatsEcoleInitialisee } from '../events/SyntheseResultatsEcoleInitialisee';
import { SyntheseResultatsEcoleGeneree } from '../events/SyntheseResultatsEcoleGeneree';
import { TotauxSyntheseEcoleCalcules } from '../events/TotauxSyntheseEcoleCalcules';
import { ErreurSyntheseResultatsIncoherente } from '../exceptions/ErreurSyntheseResultatsIncoherente';
import { CodeColonneBulletin } from '../value-objects/CodeColonneBulletin';
import { TypeSyntheseResultats } from '../value-objects/TypeSyntheseResultats';

// Cet agregat produit la synthese globale des resultats d'une ecole.
export class SyntheseResultatsEcole extends RacineAgregat<string> {
  private idEcole: string;
  private idAnneeScolaire: string;
  private codeColonne: CodeColonneBulletin;
  private typeSynthese: TypeSyntheseResultats;
  private dateGeneration: Date;
  private genereePar: string;
  private version: number;
  private lignesSyntheseResultatsClasse: LigneSyntheseResultatsClasse[];
  private totauxSyntheseEcole?: TotauxSyntheseEcole;

  // Ce constructeur initialise ou reconstitue une synthese globale d'ecole.
  constructor(params: {
    idSyntheseResultatsEcole: string;
    idEcole: string;
    idAnneeScolaire: string;
    codeColonne: CodeColonneBulletin;
    typeSynthese: TypeSyntheseResultats;
    dateGeneration: Date;
    genereePar: string;
    version?: number;
    lignesSyntheseResultatsClasse?: LigneSyntheseResultatsClasse[];
    totauxSyntheseEcole?: TotauxSyntheseEcole;
  }) {
    super(params.idSyntheseResultatsEcole);
    this.idEcole = params.idEcole;
    this.idAnneeScolaire = params.idAnneeScolaire;
    this.codeColonne = params.codeColonne;
    this.typeSynthese = params.typeSynthese;
    this.dateGeneration = params.dateGeneration;
    this.genereePar = params.genereePar;
    this.version = params.version ?? 1;
    this.lignesSyntheseResultatsClasse = [...(params.lignesSyntheseResultatsClasse ?? [])];
    this.totauxSyntheseEcole = params.totauxSyntheseEcole;
  }

  // Cette methode cree une synthese vide et unique avant sa consolidation officielle.
  public static initialiser(params: {
    idSyntheseResultatsEcole: string;
    idEcole: string;
    idAnneeScolaire: string;
    codeColonne: CodeColonneBulletin;
    typeSynthese: TypeSyntheseResultats;
    creePar: string;
    creeLe?: Date;
  }): SyntheseResultatsEcole {
    const synthese = new SyntheseResultatsEcole({
      idSyntheseResultatsEcole: params.idSyntheseResultatsEcole,
      idEcole: params.idEcole,
      idAnneeScolaire: params.idAnneeScolaire,
      codeColonne: params.codeColonne,
      typeSynthese: params.typeSynthese,
      dateGeneration: params.creeLe ?? new Date(),
      genereePar: params.creePar,
      lignesSyntheseResultatsClasse: [],
    });

    synthese.ajouterEvenement(
      new SyntheseResultatsEcoleInitialisee(
        synthese.obtenirId(),
        synthese.obtenirIdEcole(),
      ),
    );

    return synthese;
  }

  // Cette methode expose les lignes consolidees par classe.
  public obtenirLignesSyntheseResultatsClasse(): LigneSyntheseResultatsClasse[] {
    return [...this.lignesSyntheseResultatsClasse];
  }

  // Cette methode expose l'ecole rattachee a la synthese.
  public obtenirIdEcole(): string {
    return this.idEcole;
  }

  // Cette methode expose l'annee scolaire rattachee a la synthese.
  public obtenirIdAnneeScolaire(): string {
    return this.idAnneeScolaire;
  }

  // Cette methode expose la colonne de bulletin retenue pour la synthese.
  public obtenirCodeColonne(): CodeColonneBulletin {
    return this.codeColonne;
  }

  // Cette methode expose le type de synthese calcule.
  public obtenirTypeSynthese(): TypeSyntheseResultats {
    return this.typeSynthese;
  }

  // Cette methode expose la date de generation de la synthese.
  public obtenirDateGeneration(): Date {
    return this.dateGeneration;
  }

  // Cette methode expose l'utilisateur qui a genere la synthese.
  public obtenirGenereePar(): string {
    return this.genereePar;
  }

  // Cette methode expose les totaux agreges de l'ecole.
  public obtenirTotauxSyntheseEcole(): TotauxSyntheseEcole | undefined {
    return this.totauxSyntheseEcole;
  }

  // Cette methode genere la synthese a partir des proclamations de l'ecole.
  public genererDepuisProclamations(lignes: LigneSyntheseResultatsClasse[]): void {
    if (lignes.length === 0) {
      throw new ErreurSyntheseResultatsIncoherente('Une synthese d ecole doit contenir au moins une classe.');
    }

    this.lignesSyntheseResultatsClasse = [...lignes];
    this.dateGeneration = new Date();
    this.version += 1;
    this.ajouterEvenement(new SyntheseResultatsEcoleGeneree(this.obtenirId(), this.idEcole));
  }

  // Cette methode calcule les totaux globaux a partir des lignes classe.
  public calculerTotauxEcole(): void {
    if (this.lignesSyntheseResultatsClasse.length === 0) {
      throw new ErreurSyntheseResultatsIncoherente('Impossible de calculer des totaux sans lignes de synthese.');
    }

    const accumulation = this.lignesSyntheseResultatsClasse.reduce<StatistiquesProclamationClasseProps>((somme, ligne) => {
      const valeurs = ligne.obtenirStatistiques().obtenirValeurs();
      return {
        inscritsGarcons: somme.inscritsGarcons + valeurs.inscritsGarcons,
        inscritsFilles: somme.inscritsFilles + valeurs.inscritsFilles,
        inscritsTotal: somme.inscritsTotal + valeurs.inscritsTotal,
        participantsGarcons: somme.participantsGarcons + valeurs.participantsGarcons,
        participantsFilles: somme.participantsFilles + valeurs.participantsFilles,
        participantsTotal: somme.participantsTotal + valeurs.participantsTotal,
        classesGarcons: somme.classesGarcons + valeurs.classesGarcons,
        classesFilles: somme.classesFilles + valeurs.classesFilles,
        classesTotal: somme.classesTotal + valeurs.classesTotal,
        nonClassesGarcons: somme.nonClassesGarcons + valeurs.nonClassesGarcons,
        nonClassesFilles: somme.nonClassesFilles + valeurs.nonClassesFilles,
        nonClassesTotal: somme.nonClassesTotal + valeurs.nonClassesTotal,
        abandonsGarcons: somme.abandonsGarcons + valeurs.abandonsGarcons,
        abandonsFilles: somme.abandonsFilles + valeurs.abandonsFilles,
        abandonsTotal: somme.abandonsTotal + valeurs.abandonsTotal,
        reussitesGarcons: somme.reussitesGarcons + valeurs.reussitesGarcons,
        reussitesFilles: somme.reussitesFilles + valeurs.reussitesFilles,
        reussitesTotal: somme.reussitesTotal + valeurs.reussitesTotal,
        echecsGarcons: somme.echecsGarcons + valeurs.echecsGarcons,
        echecsFilles: somme.echecsFilles + valeurs.echecsFilles,
        echecsTotal: somme.echecsTotal + valeurs.echecsTotal,
        tauxParticipation: 0,
        tauxReussite: 0,
        tauxEchec: 0,
        tauxAbandon: 0,
      };
    }, initialiserStatistiquesVides());

    accumulation.tauxParticipation = calculerTaux(accumulation.participantsTotal, accumulation.inscritsTotal);
    accumulation.tauxReussite = calculerTaux(accumulation.reussitesTotal, accumulation.participantsTotal);
    accumulation.tauxEchec = calculerTaux(accumulation.echecsTotal, accumulation.participantsTotal);
    accumulation.tauxAbandon = calculerTaux(accumulation.abandonsTotal, accumulation.inscritsTotal);
    this.totauxSyntheseEcole = new TotauxSyntheseEcole(accumulation);
    this.ajouterEvenement(new TotauxSyntheseEcoleCalcules(this.obtenirId()));
  }

  // Cette methode expose les classes pour lesquelles des resultats ont ete consolides.
  public listerClassesAvecResultats(): LigneSyntheseResultatsClasse[] {
    return this.obtenirLignesSyntheseResultatsClasse();
  }
}

// Cette fonction fournit un accumulateur vide et coherent pour les statistiques globales.
function initialiserStatistiquesVides(): StatistiquesProclamationClasseProps {
  return {
    inscritsGarcons: 0,
    inscritsFilles: 0,
    inscritsTotal: 0,
    participantsGarcons: 0,
    participantsFilles: 0,
    participantsTotal: 0,
    classesGarcons: 0,
    classesFilles: 0,
    classesTotal: 0,
    nonClassesGarcons: 0,
    nonClassesFilles: 0,
    nonClassesTotal: 0,
    abandonsGarcons: 0,
    abandonsFilles: 0,
    abandonsTotal: 0,
    reussitesGarcons: 0,
    reussitesFilles: 0,
    reussitesTotal: 0,
    echecsGarcons: 0,
    echecsFilles: 0,
    echecsTotal: 0,
    tauxParticipation: 0,
    tauxReussite: 0,
    tauxEchec: 0,
    tauxAbandon: 0,
  };
}

// Cette fonction calcule un taux a deux decimales.
function calculerTaux(partie: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Number(((partie / total) * 100).toFixed(2));
}
