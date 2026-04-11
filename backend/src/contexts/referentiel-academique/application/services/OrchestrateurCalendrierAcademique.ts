import { ConsulterCalendrierAcademiqueEntree } from '../dto/input/ConsulterCalendrierAcademiqueEntree';
import { CreerCalendrierAcademiqueEntree } from '../dto/input/CreerCalendrierAcademiqueEntree';
import { ModifierPeriodeCalendrierEntree } from '../dto/input/ModifierPeriodeCalendrierEntree';
import { ValiderCalendrierAcademiqueEntree } from '../dto/input/ValiderCalendrierAcademiqueEntree';
import { VerrouillerCalendrierAcademiqueEntree } from '../dto/input/VerrouillerCalendrierAcademiqueEntree';
import {
  ConsulterCalendrierAcademique,
  SortieConsulterCalendrierAcademique,
} from '../use-cases/calendriers/ConsulterCalendrierAcademique';
import {
  CreerCalendrierAcademique,
  SortieCreerCalendrierAcademique,
} from '../use-cases/calendriers/CreerCalendrierAcademique';
import {
  ModifierPeriodeCalendrier,
  SortieModifierPeriodeCalendrier,
} from '../use-cases/calendriers/ModifierPeriodeCalendrier';
import {
  SortieValiderCalendrierAcademique,
  ValiderCalendrierAcademique,
} from '../use-cases/calendriers/ValiderCalendrierAcademique';
import {
  SortieVerrouillerCalendrierAcademique,
  VerrouillerCalendrierAcademique,
} from '../use-cases/calendriers/VerrouillerCalendrierAcademique';

// Ce service applicatif regroupe les operations de gestion du calendrier academique.
export class OrchestrateurCalendrierAcademique {
  private readonly casUsageCreerCalendrierAcademique: CreerCalendrierAcademique;
  private readonly casUsageModifierPeriodeCalendrier: ModifierPeriodeCalendrier;
  private readonly casUsageValiderCalendrierAcademique: ValiderCalendrierAcademique;
  private readonly casUsageVerrouillerCalendrierAcademique: VerrouillerCalendrierAcademique;
  private readonly casUsageConsulterCalendrierAcademique: ConsulterCalendrierAcademique;

  // Ce constructeur injecte les cas d'usage reutilises pendant le cycle de vie d'un calendrier academique.
  constructor(
    casUsageCreerCalendrierAcademique: CreerCalendrierAcademique,
    casUsageModifierPeriodeCalendrier: ModifierPeriodeCalendrier,
    casUsageValiderCalendrierAcademique: ValiderCalendrierAcademique,
    casUsageVerrouillerCalendrierAcademique: VerrouillerCalendrierAcademique,
    casUsageConsulterCalendrierAcademique: ConsulterCalendrierAcademique,
  ) {
    this.casUsageCreerCalendrierAcademique = casUsageCreerCalendrierAcademique;
    this.casUsageModifierPeriodeCalendrier = casUsageModifierPeriodeCalendrier;
    this.casUsageValiderCalendrierAcademique = casUsageValiderCalendrierAcademique;
    this.casUsageVerrouillerCalendrierAcademique = casUsageVerrouillerCalendrierAcademique;
    this.casUsageConsulterCalendrierAcademique = casUsageConsulterCalendrierAcademique;
  }

  // Cette methode orchestre la creation d'un calendrier academique.
  public creerCalendrierAcademique(
    entree: CreerCalendrierAcademiqueEntree,
  ): Promise<SortieCreerCalendrierAcademique> {
    return this.casUsageCreerCalendrierAcademique.executer(entree);
  }

  // Cette methode orchestre la modification d'une periode de calendrier.
  public modifierPeriodeCalendrier(
    entree: ModifierPeriodeCalendrierEntree,
  ): Promise<SortieModifierPeriodeCalendrier> {
    return this.casUsageModifierPeriodeCalendrier.executer(entree);
  }

  // Cette methode orchestre la validation d'un calendrier academique.
  public validerCalendrierAcademique(
    entree: ValiderCalendrierAcademiqueEntree,
  ): Promise<SortieValiderCalendrierAcademique> {
    return this.casUsageValiderCalendrierAcademique.executer(entree);
  }

  // Cette methode orchestre le verrouillage d'un calendrier academique.
  public verrouillerCalendrierAcademique(
    entree: VerrouillerCalendrierAcademiqueEntree,
  ): Promise<SortieVerrouillerCalendrierAcademique> {
    return this.casUsageVerrouillerCalendrierAcademique.executer(entree);
  }

  // Cette methode orchestre la consultation d'un calendrier academique.
  public consulterCalendrierAcademique(
    entree: ConsulterCalendrierAcademiqueEntree,
  ): Promise<SortieConsulterCalendrierAcademique> {
    return this.casUsageConsulterCalendrierAcademique.executer(entree);
  }
}
