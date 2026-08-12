import type { ActionAuditScolarite, AuditPort } from '../../application/ports/AuditPort';
import { CanonicalAuditProducer } from '../../../../shared/audit/infrastructure/producers';
import type { CanonicalAuditProducerInput } from '../../../../shared/audit/infrastructure/producers';

const ACTIONS_SCOLARITE: Record<string, CanonicalAuditProducerInput['action']> = {
  ELEVE_INSCRIT: 'ELEVE_INSCRIT',
  ABANDON_DECLARE: 'ABANDON_DECLARE',
  TRANSFERT_ENREGISTRE: 'TRANSFERT_ENREGISTRE',
};

// Cet adaptateur raccorde les mutations Scolarite documentees au registre Audit canonique.
export class AuditAdapter implements AuditPort {
  constructor(private readonly producteur = new CanonicalAuditProducer()) {}

  public async journaliserAction(input: ActionAuditScolarite): Promise<void> {
    const action = ACTIONS_SCOLARITE[input.action];
    if (!action) return;
    await this.producteur.produire({
      action,
      resultat: 'SUCCESS',
      acteur: { id: input.idUtilisateur },
      tenant: {
        scope: 'ECOLE',
        organisationId: input.idOrganisation,
        ecoleId: input.idEcole,
      },
      ressource: {
        type: input.action === 'ELEVE_INSCRIT' ? 'INSCRIPTION' : 'ELEVE',
        id: input.referenceMetier,
        libelle: input.action,
      },
      contexte: { correlationId: input.referenceMetier, source: 'HTTP_API' },
      nouvelEtat: { action: input.action },
      metadata: { actionSource: input.action },
      idempotencyKey: `SCOLARITE:${action}:${input.referenceMetier ?? input.idUtilisateur}`,
    });
  }
}
