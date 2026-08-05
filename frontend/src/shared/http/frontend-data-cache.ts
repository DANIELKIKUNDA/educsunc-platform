export interface LectureCacheFrontend<T> {
  trouvee: boolean;
  valeur?: T;
}

interface EntreeCacheFrontend<T> {
  expireLe: number;
  valeur: T;
}

function cloner<T>(valeur: T): T {
  return typeof structuredClone === 'function' ? structuredClone(valeur) : valeur;
}

/** Cache memoire volontairement court, vide a chaque transition de contexte. */
export class FrontendDataCache {
  private readonly entrees = new Map<string, EntreeCacheFrontend<unknown>>();

  public constructor(private readonly maintenant: () => number = Date.now) {}

  public lire<T>(cle: string): LectureCacheFrontend<T> {
    const entree = this.entrees.get(cle);
    if (!entree) {
      return { trouvee: false };
    }
    if (entree.expireLe <= this.maintenant()) {
      this.entrees.delete(cle);
      return { trouvee: false };
    }
    return {
      trouvee: true,
      valeur: cloner(entree.valeur as T),
    };
  }

  public enregistrer<T>(cle: string, valeur: T, dureeMs: number): void {
    if (!Number.isFinite(dureeMs) || dureeMs <= 0) {
      return;
    }
    this.entrees.set(cle, {
      expireLe: this.maintenant() + dureeMs,
      valeur: cloner(valeur),
    });
  }

  public vider(): void {
    this.entrees.clear();
  }

  public get taille(): number {
    return this.entrees.size;
  }
}
