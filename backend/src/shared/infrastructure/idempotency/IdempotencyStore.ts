// Cette commande decrit les donnees techniques necessaires a l'enregistrement d'une cle d'idempotence.
export interface CommandeEnregistrementIdempotence {
  readonly cle: string;
  readonly statut: string;
  readonly operation?: string | null;
  readonly empreinteRequete?: string | null;
  readonly resultat?: Record<string, unknown> | null;
  readonly expireLe?: Date | null;
}

// Cette interface represente une cle d'idempotence materialisee en stockage.
export interface EnregistrementIdempotence {
  readonly cle: string;
  readonly statut: string;
  readonly operation: string | null;
  readonly empreinteRequete: string | null;
  readonly resultat: Record<string, unknown> | null;
  readonly expireLe: Date | null;
  readonly creeLe: Date;
}

// Ce contrat abstrait le stockage technique des cles d'idempotence partagees.
export interface IdempotencyStore {
  // Cette methode indique si une cle non expiree existe deja.
  existe(cle: string, dateReference?: Date): Promise<boolean>;

  // Cette methode retourne un enregistrement d'idempotence non expire s'il existe.
  obtenir(cle: string, dateReference?: Date): Promise<EnregistrementIdempotence | null>;

  // Cette methode reserve une cle simple avec des valeurs techniques par defaut.
  enregistrer(cle: string): Promise<void>;

  // Cette methode enregistre une cle avec son contexte technique complet.
  enregistrer(commande: CommandeEnregistrementIdempotence): Promise<void>;

  // Cette methode memorise le resultat final d'une cle deja connue.
  marquerResultat(
    cle: string,
    statut: string,
    resultat?: Record<string, unknown> | null,
  ): Promise<void>;

  // Cette methode supprime les cles expirees et retourne le nombre de lignes supprimees.
  supprimerExpirees(dateReference?: Date): Promise<number>;
}
