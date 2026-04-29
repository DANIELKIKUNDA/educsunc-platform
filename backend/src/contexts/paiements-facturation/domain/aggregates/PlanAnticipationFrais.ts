import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { PlanAnticipationCree } from '../events/PlanAnticipationCree';
import { MoisScolaire } from '../value-objects/MoisScolaire';
import { TypePlanAnticipation } from '../value-objects/TypePlanAnticipation';

export interface ProprietesPlanAnticipationFrais {
  idPlanAnticipation: string;
  idEcole: string;
  idAnneeScolaire: string;
  nom: string;
  typePlan: TypePlanAnticipation;
  moisCibles: MoisScolaire[];
  moisSupports: MoisScolaire[];
  obligatoire: boolean;
  actif: boolean;
  dateDebut?: string;
  dateFin?: string;
  version: number;
}

export class PlanAnticipationFrais extends RacineAgregat<string> {
  private idEcole: string;
  private idAnneeScolaire: string;
  private nom: string;
  private typePlan: TypePlanAnticipation;
  private moisCibles: MoisScolaire[];
  private moisSupports: MoisScolaire[];
  private obligatoire: boolean;
  private actif: boolean;
  private dateDebut?: string;
  private dateFin?: string;
  private version: number;

  constructor(proprietes: ProprietesPlanAnticipationFrais) {
    super(PlanAnticipationFrais.validerTexte(proprietes.idPlanAnticipation, 'idPlanAnticipation'));
    this.idEcole = PlanAnticipationFrais.validerTexte(proprietes.idEcole, 'idEcole');
    this.idAnneeScolaire = PlanAnticipationFrais.validerTexte(proprietes.idAnneeScolaire, 'idAnneeScolaire');
    this.nom = PlanAnticipationFrais.validerTexte(proprietes.nom, 'nom');
    this.typePlan = proprietes.typePlan;
    this.moisCibles = [...proprietes.moisCibles];
    this.moisSupports = [...proprietes.moisSupports];
    this.obligatoire = proprietes.obligatoire;
    this.actif = proprietes.actif;
    this.dateDebut = proprietes.dateDebut;
    this.dateFin = proprietes.dateFin;
    this.version = PlanAnticipationFrais.validerVersion(proprietes.version);
    this.verifierCoherence();
  }

  public static creer(proprietes: Omit<ProprietesPlanAnticipationFrais, 'version'>): PlanAnticipationFrais {
    const plan = new PlanAnticipationFrais({
      ...proprietes,
      version: 1,
    });
    plan.ajouterEvenement(new PlanAnticipationCree(plan.obtenirId(), plan.idEcole, plan.idAnneeScolaire));
    return plan;
  }

  public obtenirIdEcole(): string { return this.idEcole; }
  public obtenirIdAnneeScolaire(): string { return this.idAnneeScolaire; }
  public obtenirNom(): string { return this.nom; }
  public obtenirTypePlan(): TypePlanAnticipation { return this.typePlan; }
  public obtenirMoisCibles(): MoisScolaire[] { return [...this.moisCibles]; }
  public obtenirMoisSupports(): MoisScolaire[] { return [...this.moisSupports]; }
  public obtenirObligatoire(): boolean { return this.obligatoire; }
  public obtenirActif(): boolean { return this.actif; }
  public obtenirDateDebut(): string | undefined { return this.dateDebut; }
  public obtenirDateFin(): string | undefined { return this.dateFin; }
  public obtenirVersion(): number { return this.version; }

  public activer(): void {
    this.actif = true;
    this.version += 1;
  }

  public desactiver(): void {
    this.actif = false;
    this.version += 1;
  }

  public verifierCoherence(): void {
    if (this.moisCibles.length === 0 || this.moisSupports.length === 0) {
      throw new Error('Un plan d anticipation doit definir au moins un mois cible et un mois support.');
    }
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static validerVersion(version: number): number {
    if (!Number.isInteger(version) || version <= 0) {
      throw new Error('La version du plan d anticipation doit etre un entier positif.');
    }
    return version;
  }
}
