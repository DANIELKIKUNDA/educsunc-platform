import { DtoCommandeCreationNotification } from '../dto';

// Ce fichier transforme un evenement d'integration en intention de notification.

/** Cette classe convertit un evenement externe en DTO de creation de notification. */
export class MappeurEvenementVersIntentionNotification {
  /** Cette methode fabrique un DTO de creation a partir d'un evenement deja normalise. */
  public static convertir(entree: Readonly<Record<string, unknown>>): DtoCommandeCreationNotification {
    return {
      idempotencyKey: entree.idempotencyKey as string | undefined,
      type: entree.type as DtoCommandeCreationNotification['type'],
      priorite: (entree.priorite as DtoCommandeCreationNotification['priorite']) ?? 'NORMAL',
      portee: entree.portee as DtoCommandeCreationNotification['portee'],
      temporalite: (entree.temporalite as DtoCommandeCreationNotification['temporalite']) ?? 'IMMEDIATE',
      visibilite: (entree.visibilite as DtoCommandeCreationNotification['visibilite']) ?? 'PRIVATE',
      source: entree.source as DtoCommandeCreationNotification['source'],
      strategieLivraison: (entree.strategieLivraison as DtoCommandeCreationNotification['strategieLivraison']) ?? 'SINGLE_CHANNEL',
      canaux: (entree.canaux as DtoCommandeCreationNotification['canaux']) ?? ['IN_APP'],
      organisationId: entree.organisationId as string | undefined,
      ecoleId: entree.ecoleId as string | undefined,
      utilisateurId: entree.utilisateurId as string | undefined,
      acteurId: entree.acteurId as string | undefined,
      correlationId: entree.correlationId as string | undefined,
      requestId: entree.requestId as string | undefined,
      titre: entree.titre as string | undefined,
      message: String(entree.message ?? ''),
      placeholders: (entree.placeholders as Record<string, string> | undefined) ?? {},
      codeModele: entree.codeModele as string | undefined,
      versionModele: entree.versionModele as number | undefined,
      datePlanification: entree.datePlanification as string | undefined,
      dateExpiration: entree.dateExpiration as string | undefined,
      metadonnees: (entree.metadonnees as Record<string, unknown> | undefined) ?? {},
      destinataires: (entree.destinataires as DtoCommandeCreationNotification['destinataires']) ?? [],
    };
  }
}
