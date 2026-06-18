// Ce fichier declare les types techniques de reload.

/** Cette interface represente le resultat technique d un rechargement runtime. */
export interface ResultatReloadConfiguration {
  readonly configurationId: string;
  readonly type: 'RUNTIME' | 'MODULE';
  readonly force: boolean;
  readonly executeLe: Date;
  readonly succes: boolean;
}
