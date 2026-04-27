// Ce fichier definit un client HTTP abstrait pour les adapters du BC.
export interface ReponseHttpScolarite<TCorps> {
  statut: number;
  corps: TCorps;
}

/**
 * Ce contrat permet aux adapters d'appeler un service externe sans dependance directe.
 */
export interface ClientHttpScolarite {
  get<TCorps>(url: string): Promise<ReponseHttpScolarite<TCorps>>;
  post<TCorps>(url: string, corps: unknown): Promise<ReponseHttpScolarite<TCorps>>;
}
