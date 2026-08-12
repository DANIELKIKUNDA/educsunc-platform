import type {
  AuditBulletinInput,
  AuditPort,
} from 'contexts/bulletins-evaluations/application/ports/out/AuditPort';
import {
  CanonicalAuditProducer,
  type CanonicalAuditProducerInput,
} from 'shared/audit/infrastructure/producers';

const ACTIONS_BULLETIN: Record<string, {
  action: CanonicalAuditProducerInput['action'];
  typeRessource: CanonicalAuditProducerInput['ressource']['type'];
}> = {
  ENCODER_COTE: { action: 'COTE_ENCODEE', typeRessource: 'FICHE_COTATION' },
  MODIFIER_COTE: { action: 'COTE_MODIFIEE', typeRessource: 'FICHE_COTATION' },
  VIDER_COTE: { action: 'COTE_MODIFIEE', typeRessource: 'FICHE_COTATION' },
  GENERER_BULLETIN: { action: 'BULLETIN_GENERE', typeRessource: 'BULLETIN' },
  GENERER_PROCLAMATION: { action: 'PROCLAMATION_GENEREE', typeRessource: 'PROCLAMATION' },
};

// Cet adaptateur raccorde les operations pedagogiques documentees a l'outbox Audit.
export class BulletinAuditAdapter implements AuditPort {
  constructor(private readonly producteur = new CanonicalAuditProducer()) {}

  public async journaliser(input: AuditBulletinInput): Promise<void> {
    const mapping = ACTIONS_BULLETIN[input.action];
    if (!mapping || !input.idOrganisation) return;

    await this.producteur.produire({
      action: mapping.action,
      resultat: 'SUCCESS',
      acteur: { id: input.idUtilisateur },
      tenant: {
        scope: 'ECOLE',
        organisationId: input.idOrganisation,
        ecoleId: input.idEcole,
      },
      ressource: {
        type: mapping.typeRessource,
        id: input.referenceMetier,
        libelle: input.action,
      },
      contexte: {
        correlationId: input.referenceMetier,
        source: 'HTTP_API',
      },
      nouvelEtat: input.details,
      metadata: { ...input.details, actionSource: input.action },
      idempotencyKey: `BULLETINS:${mapping.action}:${input.referenceMetier}:${input.operationId ?? this.cleOperation(input)}`,
    });
  }

  private cleOperation(input: AuditBulletinInput): string {
    const details = input.details ?? {};
    return [details.codeColonne, details.typeGeneration, input.idUtilisateur].filter(Boolean).join(':') || 'OPERATION';
  }
}
