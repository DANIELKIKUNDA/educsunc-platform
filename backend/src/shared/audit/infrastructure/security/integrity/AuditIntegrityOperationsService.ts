import type { AuditReadRepositoryPort } from '../../../application/ports/outbound/AuditReadRepositoryPort';
import { PostgresAuditIntegrityStore } from './PostgresAuditIntegrityStore';

export class AuditIntegrityOperationsService {
  public constructor(
    private readonly lectures: AuditReadRepositoryPort,
    private readonly integrity = new PostgresAuditIntegrityStore(),
    private readonly auditer: (payload: Record<string, unknown>, anomalie: boolean) => Promise<void> = async () => undefined,
  ) {}

  public async verifierEntree(payload: Record<string, unknown>) {
    const texte = (cle: string) => typeof payload[cle] === 'string' ? payload[cle] as string : undefined;
    const entree = await this.lectures.obtenirParId({
      idAuditEntry: texte('idAuditEntry'),
      organisationId: texte('organisationId'),
      ecoleId: texte('ecoleId'),
    });
    if (!entree) throw new Error("Cet evenement n'existe pas ou n'est pas accessible dans votre perimetre.");
    const resultat = await this.integrity.verifier(entree.idAuditEntry);
    await this.auditer(payload, resultat.statut === 'CORRUPTED' || resultat.statut === 'MISSING');
    return resultat;
  }

  public async verifierPlage(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const limite = typeof payload.limite === 'number' ? Math.min(Math.max(payload.limite, 1), 1_000) : 100;
    const texte = (cle: string) => typeof payload[cle] === 'string' ? payload[cle] as string : undefined;
    const page = await this.lectures.rechercher({
      organisationId: texte('organisationId'), ecoleId: texte('ecoleId'),
      dateDebut: texte('dateDebut'), dateFin: texte('dateFin'),
    }, { limite });
    const details = await Promise.all(page.items.map((item) => this.integrity.verifier(item.idAuditEntry)));
    const compteurs = { VALID: 0, CORRUPTED: 0, MISSING: 0, UNKNOWN: 0 };
    for (const detail of details) compteurs[detail.statut] += 1;
    await this.auditer(payload, compteurs.CORRUPTED > 0 || compteurs.MISSING > 0);
    return { compteurs, totalVerifie: details.length, tronque: page.hasNextPage, anomalies: details.filter((detail) => detail.statut !== 'VALID') };
  }
}
