import { EnregistrementArchiveNotification, EnregistrementForensicNotification } from '../storage';
import { ChargeLivraisonNotification } from '../providers';
import {
  ContexteSecuriteNotification,
  ResultatControleSecuriteNotification,
} from './TypesSecuriteNotification';

// Ce fichier protege l'isolation tenant runtime du moteur Notifications.

/** Cette classe applique les controles techniques d'isolation tenant et contexte securite. */
export class GardeIsolationTenantNotification {
  /** Cette methode verifie qu'une charge provider respecte le contexte tenant courant. */
  public verifierChargeProvider(
    contexte: ContexteSecuriteNotification,
    charge: ChargeLivraisonNotification,
  ): ResultatControleSecuriteNotification {
    if (
      contexte.organisationId &&
      charge.organisationId &&
      contexte.organisationId !== charge.organisationId
    ) {
      return this.refus('La charge provider depasse le tenant courant.');
    }

    if (contexte.ecoleId && charge.ecoleId && contexte.ecoleId !== charge.ecoleId) {
      return this.refus('La charge provider depasse l ecole courante.');
    }

    return this.autorisation();
  }

  /** Cette methode verifie qu'une archive respecte le contexte tenant courant. */
  public verifierArchive(
    contexte: ContexteSecuriteNotification,
    archive: EnregistrementArchiveNotification,
  ): ResultatControleSecuriteNotification {
    if (
      contexte.organisationId &&
      archive.organisationId &&
      contexte.organisationId !== archive.organisationId
    ) {
      return this.refus('L archive demandee appartient a un autre tenant.');
    }

    if (contexte.ecoleId && archive.ecoleId && contexte.ecoleId !== archive.ecoleId) {
      return this.refus('L archive demandee appartient a une autre ecole.');
    }

    return this.autorisation();
  }

  /** Cette methode verifie qu'une vue forensic respecte le contexte tenant courant. */
  public verifierForensic(
    contexte: ContexteSecuriteNotification,
    vue: EnregistrementForensicNotification,
  ): ResultatControleSecuriteNotification {
    if (contexte.organisationId && vue.organisationId && contexte.organisationId !== vue.organisationId) {
      return this.refus('La vue forensic demandee appartient a un autre tenant.');
    }

    if (contexte.ecoleId && vue.ecoleId && contexte.ecoleId !== vue.ecoleId) {
      return this.refus('La vue forensic demandee appartient a une autre ecole.');
    }

    return this.autorisation();
  }

  /** Cette methode verifie la presence minimale du contexte de securite runtime. */
  public verifierContexte(contexte: ContexteSecuriteNotification): ResultatControleSecuriteNotification {
    if (!contexte.correlationId || !contexte.requestId) {
      return this.refus('Le contexte securite doit contenir correlationId et requestId.');
    }

    return this.autorisation();
  }

  /** Cette methode construit un resultat d'autorisation positive. */
  private autorisation(): ResultatControleSecuriteNotification {
    return {
      autorise: true,
      verifieLe: new Date(),
    };
  }

  /** Cette methode construit un resultat de refus securise. */
  private refus(raison: string): ResultatControleSecuriteNotification {
    return {
      autorise: false,
      raison,
      verifieLe: new Date(),
    };
  }
}
