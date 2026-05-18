import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { EleveAbandonProclamation } from '../entities/EleveAbandonProclamation';
import { EleveNonClasseProclamation } from '../entities/EleveNonClasseProclamation';
import { HistoriqueGenerationProclamation } from '../entities/HistoriqueGenerationProclamation';
import { LigneProclamationClasse } from '../entities/LigneProclamationClasse';
import { SnapshotResultatBulletin } from '../entities/SnapshotResultatBulletin';
import { StatistiquesProclamationClasse } from '../entities/StatistiquesProclamationClasse';
import { AbandonsProclamationDetectes } from '../events/AbandonsProclamationDetectes';
import { ColonneProclameeVerrouillee } from '../events/ColonneProclameeVerrouillee';
import { NonClassesProclamationDetectes } from '../events/NonClassesProclamationDetectes';
import { ProclamationClasseGeneree } from '../events/ProclamationClasseGeneree';
import { StatistiquesProclamationCalculees } from '../events/StatistiquesProclamationCalculees';
import { ErreurProclamationIncoherente } from '../exceptions/ErreurProclamationIncoherente';
import { CodeColonneBulletin } from '../value-objects/CodeColonneBulletin';
import { EtatProclamation } from '../value-objects/EtatProclamation';
import { SexeEleve } from '../value-objects/SexeEleve';
import { StatutProclamationEleve } from '../value-objects/StatutProclamationEleve';
import { TypeProclamation } from '../value-objects/TypeProclamation';

// Cet agregat produit la liste officielle de proclamation d'une classe.
export class ProclamationClasse extends RacineAgregat<string> {
  private idEcole: string;
  private idClassePedagogique: string;
  private idAnneeScolaire: string;
  private codeColonne: CodeColonneBulletin;
  private typeProclamation: TypeProclamation;
  private dateGeneration: Date;
  private genereePar: string;
  private versionReferentielProgramme: string;
  private version: number;
  private lignesProclamation: LigneProclamationClasse[];
  private statistiquesProclamation?: StatistiquesProclamationClasse;
  private elevesNonClasses: EleveNonClasseProclamation[];
  private elevesAbandon: EleveAbandonProclamation[];
  private historiqueGeneration: HistoriqueGenerationProclamation[];
  private etatProclamation: EtatProclamation;
  private snapshotsResultats: SnapshotResultatBulletin[];

  // Ce constructeur initialise ou reconstitue une proclamation de classe.
  constructor(params: {
    idProclamationClasse: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
    codeColonne: CodeColonneBulletin;
    typeProclamation: TypeProclamation;
    dateGeneration: Date;
    genereePar: string;
    versionReferentielProgramme: string;
    version?: number;
    lignesProclamation?: LigneProclamationClasse[];
    statistiquesProclamation?: StatistiquesProclamationClasse;
    elevesNonClasses?: EleveNonClasseProclamation[];
    elevesAbandon?: EleveAbandonProclamation[];
    historiqueGeneration?: HistoriqueGenerationProclamation[];
    etatProclamation?: EtatProclamation;
    snapshotsResultats?: SnapshotResultatBulletin[];
  }) {
    super(params.idProclamationClasse);
    this.idEcole = params.idEcole;
    this.idClassePedagogique = params.idClassePedagogique;
    this.idAnneeScolaire = params.idAnneeScolaire;
    this.codeColonne = params.codeColonne;
    this.typeProclamation = params.typeProclamation;
    this.dateGeneration = params.dateGeneration;
    this.genereePar = params.genereePar;
    this.versionReferentielProgramme = params.versionReferentielProgramme;
    this.version = params.version ?? 1;
    this.lignesProclamation = [...(params.lignesProclamation ?? [])];
    this.statistiquesProclamation = params.statistiquesProclamation;
    this.elevesNonClasses = [...(params.elevesNonClasses ?? [])];
    this.elevesAbandon = [...(params.elevesAbandon ?? [])];
    this.historiqueGeneration = [...(params.historiqueGeneration ?? [])];
    this.etatProclamation = params.etatProclamation ?? EtatProclamation.BROUILLON;
    this.snapshotsResultats = [...(params.snapshotsResultats ?? [])];
  }

  // Cette methode expose les lignes classees de la proclamation.
  public obtenirLignesProclamation(): LigneProclamationClasse[] {
    return [...this.lignesProclamation];
  }

  // Cette methode expose l'ecole rattachee a la proclamation.
  public obtenirIdEcole(): string {
    return this.idEcole;
  }

  // Cette methode expose l'annee scolaire rattachee a la proclamation.
  public obtenirIdAnneeScolaire(): string {
    return this.idAnneeScolaire;
  }

  // Cette methode expose la colonne de bulletin utilisee pour la proclamation.
  public obtenirCodeColonne(): CodeColonneBulletin {
    return this.codeColonne;
  }

  // Cette methode expose le type metier de proclamation.
  public obtenirTypeProclamation(): TypeProclamation {
    return this.typeProclamation;
  }

  // Cette methode expose la date de generation courante.
  public obtenirDateGeneration(): Date {
    return this.dateGeneration;
  }

  // Cette methode expose l'utilisateur ayant genere la proclamation.
  public obtenirGenereePar(): string {
    return this.genereePar;
  }

  // Cette methode expose la version du programme de reference.
  public obtenirVersionReferentielProgramme(): string {
    return this.versionReferentielProgramme;
  }

  // Cette methode expose l'etat de cycle de vie de la proclamation.
  public obtenirEtatProclamation(): EtatProclamation {
    return this.etatProclamation;
  }

  // Cette methode expose les snapshots attaches a la proclamation.
  public obtenirSnapshotsResultats(): SnapshotResultatBulletin[] {
    return [...this.snapshotsResultats];
  }

  // Cette methode expose les eleves declares non classes.
  public obtenirElevesNonClasses(): EleveNonClasseProclamation[] {
    return [...this.elevesNonClasses];
  }

  // Cette methode expose les eleves abandon.
  public obtenirElevesAbandon(): EleveAbandonProclamation[] {
    return [...this.elevesAbandon];
  }

  // Cette methode expose les statistiques de proclamation.
  public obtenirStatistiquesProclamation(): StatistiquesProclamationClasse | undefined {
    return this.statistiquesProclamation;
  }

  // Cette methode genere ou remplace la proclamation complete.
  public generer(params: {
    lignesProclamation: LigneProclamationClasse[];
    elevesNonClasses: EleveNonClasseProclamation[];
    elevesAbandon: EleveAbandonProclamation[];
    historiqueGeneration: HistoriqueGenerationProclamation;
  }): void {
    this.lignesProclamation = [...params.lignesProclamation].sort((a, b) => (a.obtenirRang() ?? Number.MAX_SAFE_INTEGER) - (b.obtenirRang() ?? Number.MAX_SAFE_INTEGER));
    this.elevesNonClasses = [...params.elevesNonClasses];
    this.elevesAbandon = [...params.elevesAbandon];
    this.historiqueGeneration.push(params.historiqueGeneration);
    this.dateGeneration = params.historiqueGeneration.obtenirDateGeneration();
    this.genereePar = params.historiqueGeneration.obtenirGenereePar();
    this.etatProclamation = EtatProclamation.GENEREE;
    this.version += 1;
    this.verifierCoherenceTotaux();
    this.ajouterEvenement(new ProclamationClasseGeneree(this.obtenirId(), this.idClassePedagogique));
    if (this.elevesNonClasses.length > 0) {
      this.ajouterEvenement(new NonClassesProclamationDetectes(this.obtenirId()));
    }
    if (this.elevesAbandon.length > 0) {
      this.ajouterEvenement(new AbandonsProclamationDetectes(this.obtenirId()));
    }
  }

  // Cette methode recalcule uniquement les statistiques a partir des listes actuelles.
  public calculerStatistiques(): void {
    const compter = (sexe: SexeEleve, statut: StatutProclamationEleve): number =>
      this.lignesProclamation.filter(
        (ligne) => ligne.obtenirSexe() === sexe && ligne.obtenirStatutProclamation() === statut,
      ).length;

    const classesGarcons = compter(SexeEleve.M, StatutProclamationEleve.CLASSE);
    const classesFilles = compter(SexeEleve.F, StatutProclamationEleve.CLASSE);
    const nonClassesGarcons = this.elevesNonClasses.filter((eleve) => eleve.obtenirSexe() === SexeEleve.M).length;
    const nonClassesFilles = this.elevesNonClasses.filter((eleve) => eleve.obtenirSexe() === SexeEleve.F).length;
    const abandonsGarcons = this.elevesAbandon.filter((eleve) => eleve.obtenirSexe() === SexeEleve.M).length;
    const abandonsFilles = this.elevesAbandon.filter((eleve) => eleve.obtenirSexe() === SexeEleve.F).length;
    const inscritsGarcons = classesGarcons + nonClassesGarcons + abandonsGarcons;
    const inscritsFilles = classesFilles + nonClassesFilles + abandonsFilles;
    const participantsGarcons = classesGarcons + nonClassesGarcons;
    const participantsFilles = classesFilles + nonClassesFilles;
    const reussitesGarcons = classesGarcons;
    const reussitesFilles = classesFilles;
    const echecsGarcons = 0;
    const echecsFilles = 0;
    const participantsTotal = participantsGarcons + participantsFilles;
    const inscritsTotal = inscritsGarcons + inscritsFilles;
    const classesTotal = classesGarcons + classesFilles;
    const nonClassesTotal = nonClassesGarcons + nonClassesFilles;
    const abandonsTotal = abandonsGarcons + abandonsFilles;

    this.statistiquesProclamation = new StatistiquesProclamationClasse({
      inscritsGarcons,
      inscritsFilles,
      inscritsTotal,
      participantsGarcons,
      participantsFilles,
      participantsTotal,
      classesGarcons,
      classesFilles,
      classesTotal,
      nonClassesGarcons,
      nonClassesFilles,
      nonClassesTotal,
      abandonsGarcons,
      abandonsFilles,
      abandonsTotal,
      reussitesGarcons,
      reussitesFilles,
      reussitesTotal: reussitesGarcons + reussitesFilles,
      echecsGarcons,
      echecsFilles,
      echecsTotal: echecsGarcons + echecsFilles,
      tauxParticipation: calculerTaux(participantsTotal, inscritsTotal),
      tauxReussite: calculerTaux(classesTotal, participantsTotal),
      tauxEchec: calculerTaux(echecsGarcons + echecsFilles, participantsTotal),
      tauxAbandon: calculerTaux(abandonsTotal, inscritsTotal),
    });

    this.ajouterEvenement(new StatistiquesProclamationCalculees(this.obtenirId()));
  }

  // Cette methode expose une vue simple des eleves classes.
  public listerClasses(): LigneProclamationClasse[] {
    return this.obtenirLignesProclamation();
  }

  // Cette methode expose les non classes deja detectes.
  public listerNonClasses(): EleveNonClasseProclamation[] {
    return this.obtenirElevesNonClasses();
  }

  // Cette methode expose les abandons deja detectes.
  public listerAbandons(): EleveAbandonProclamation[] {
    return this.obtenirElevesAbandon();
  }

  // Cette methode ajoute explicitement une generation supplementaire a l'historique.
  public ajouterHistoriqueGeneration(historique: HistoriqueGenerationProclamation): void {
    this.historiqueGeneration.push(historique);
  }

  // Cette methode valide officiellement la proclamation.
  public valider(): void {
    this.etatProclamation = EtatProclamation.VALIDEE;
    this.version += 1;
  }

  // Cette methode verrouille la proclamation pour bloquer les modifications normales.
  public verrouiller(verrouillePar: string): void {
    this.etatProclamation = EtatProclamation.VERROUILLEE;
    this.version += 1;
    this.ajouterEvenement(
      new ColonneProclameeVerrouillee(
        this.idClassePedagogique,
        this.idAnneeScolaire,
        this.codeColonne,
        new Date(),
        verrouillePar,
      ),
    );
  }

  // Cette methode annule la proclamation avec justification.
  public annuler(justification?: string): void {
    if (
      this.etatProclamation === EtatProclamation.VALIDEE
      && (justification ?? '').trim().length === 0
    ) {
      throw new ErreurProclamationIncoherente(
        "Une proclamation validee exige une justification pour etre annulee.",
      );
    }

    this.etatProclamation = EtatProclamation.ANNULEE;
    this.version += 1;
  }

  // Cette methode ajoute un snapshot produit lors d'une validation ou d'un archivage.
  public ajouterSnapshot(snapshot: SnapshotResultatBulletin): void {
    this.snapshotsResultats.push(snapshot);
  }

  // Cette methode s'assure que les effectifs ventiles restent coherents.
  private verifierCoherenceTotaux(): void {
    const effectifTotal = this.lignesProclamation.length + this.elevesNonClasses.length + this.elevesAbandon.length;
    if (effectifTotal === 0) {
      throw new ErreurProclamationIncoherente('Une proclamation ne peut pas etre vide.');
    }
  }
}

// Cette fonction calcule un taux en pourcentage avec deux decimales.
function calculerTaux(partie: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Number(((partie / total) * 100).toFixed(2));
}
