import type { PrioriteRealtime, TypeDiffusionRealtime } from '../enums';
import { ValeurUtilisateur } from './ValeurUtilisateur';

export interface EvenementDiffusableProps {
  readonly nom: string;
  readonly visible: boolean;
  readonly impacteInterface: boolean;
  readonly necessiteReaction: boolean;
  readonly priorite: PrioriteRealtime;
  readonly typeDiffusion: TypeDiffusionRealtime;
  readonly valeurUtilisateur: ValeurUtilisateur;
}

export class EvenementDiffusable {
  public readonly nom: string;
  public readonly visible: boolean;
  public readonly impacteInterface: boolean;
  public readonly necessiteReaction: boolean;
  public readonly priorite: PrioriteRealtime;
  public readonly typeDiffusion: TypeDiffusionRealtime;
  public readonly valeurUtilisateur: ValeurUtilisateur;

  public constructor(props: EvenementDiffusableProps) {
    this.nom = props.nom;
    this.visible = props.visible;
    this.impacteInterface = props.impacteInterface;
    this.necessiteReaction = props.necessiteReaction;
    this.priorite = props.priorite;
    this.typeDiffusion = props.typeDiffusion;
    this.valeurUtilisateur = props.valeurUtilisateur;
  }

  public estAutorise(): boolean {
    return (
      this.visible &&
      this.impacteInterface &&
      this.valeurUtilisateur.autoriseDiffusion()
    );
  }
}
