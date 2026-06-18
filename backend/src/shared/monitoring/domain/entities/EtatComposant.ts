import type { NiveauSanteSysteme } from '../enums';
import type { ContexteMonitoringProps } from '../value-objects';

// Ce fichier declare l etat de sante d un composant observe.

/** Cette interface represente la vue serialisable d un composant. */
export interface EtatComposantProps {
  readonly nom: string;
  readonly niveau: NiveauSanteSysteme;
  readonly message: string;
  readonly latenceMillisecondes?: number;
  readonly dernierControleLe: Date;
  readonly contexte: ContexteMonitoringProps;
}

/** Cette classe represente l etat d un composant du systeme. */
export class EtatComposant {
  constructor(private readonly props: EtatComposantProps) {}

  /** Cette methode indique si le composant est critique. */
  public estCritique(): boolean {
    return this.props.niveau === 'CRITICAL';
  }

  /** Cette methode retourne la representation serialisable du composant. */
  public valeur(): EtatComposantProps {
    return { ...this.props, contexte: { ...this.props.contexte } };
  }
}
