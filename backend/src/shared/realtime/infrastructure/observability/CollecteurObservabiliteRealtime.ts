import type { PortObservabiliteRealtime } from '../../application';
import { CompteursRealtime } from './CompteursRealtime';

const signaux: Array<{ type: string; canal: string; audience: number }> = [];

export class CollecteurObservabiliteRealtime implements PortObservabiliteRealtime {
  private readonly compteurs = new CompteursRealtime();

  public async enregistrerSignal(signal: {
    readonly type: string;
    readonly canal: string;
    readonly audience: number;
  }): Promise<void> {
    signaux.push({ ...signal });
    this.compteurs.incrementerMessages(signal.audience);
  }

  public lireSignaux() {
    return [...signaux];
  }

  public lireCompteurs() {
    return this.compteurs.snapshot();
  }
}
