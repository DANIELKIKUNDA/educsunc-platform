import pino, { type Logger as InstancePino } from 'pino';

import { configurationApplication } from '../../../config/app.config';
import type { Journaliseur } from './Logger';

// Cette classe fournit une implementation technique du logger basee sur Pino.
// Elle peut etre remplacee plus tard par une autre solution sans impacter les autres couches.
export class JournaliseurPino implements Journaliseur {
  public readonly instance: InstancePino;
  private contexteGlobal: Record<string, any> = {};

  // Le constructeur initialise l'instance interne de Pino ou reutilise une instance fournie.
  constructor(instance?: InstancePino) {
    this.instance =
      instance ??
      pino({
        level: configurationApplication.environnement === 'production' ? 'info' : 'debug',
        base: null,
        messageKey: 'message',
        formatters: {
          // Ce formateur remplace le niveau natif par une cle metier plus explicite.
          level(niveau) {
            return { niveau };
          },
          // Ce formateur evite l'ajout automatique de champs techniques non souhaites.
          bindings() {
            return {};
          },
        },
        timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
      });

    this.ajouterContexteGlobal({
      service: configurationApplication.nomApplication,
      environnement: configurationApplication.environnement,
    });
  }

  // Cette methode normalise le contexte pour garder des logs coherents.
  private normaliserContexte(contexte?: any): Record<string, unknown> {
    if (contexte === null || contexte === undefined) {
      return {};
    }

    if (contexte instanceof Error) {
      return {
        nom: contexte.name,
        message: contexte.message,
        stack: contexte.stack,
      };
    }

    if (typeof contexte === 'object' && !Array.isArray(contexte)) {
      return contexte as Record<string, unknown>;
    }

    return {
      valeur: contexte,
    };
  }

  // Cette methode fusionne le contexte global avec le contexte courant.
  private fusionnerContextes(contexte?: any): Record<string, unknown> {
    const contexteNormalise = this.normaliserContexte(contexte);
    const contexteFusionne: Record<string, unknown> = {
      ...this.contexteGlobal,
      ...contexteNormalise,
    };

    if ('requestId' in contexteNormalise && contexteNormalise.requestId !== undefined) {
      contexteFusionne.requestId = contexteNormalise.requestId;
    }

    return contexteFusionne;
  }

  // Cette methode construit une entree de log standardisee.
  private construireEntreeJournal(contexte?: any): { contexte: Record<string, unknown> } {
    return {
      contexte: this.fusionnerContextes(contexte),
    };
  }

  // Cette methode ecrit un message informatif.
  public info(message: string, contexte?: any): void {
    this.instance.info(this.construireEntreeJournal(contexte), message);
  }

  // Cette methode ecrit un avertissement.
  public avertir(message: string, contexte?: any): void {
    this.instance.warn(this.construireEntreeJournal(contexte), message);
  }

  // Cette methode ecrit une erreur.
  public erreur(message: string, contexte?: any): void {
    this.instance.error(this.construireEntreeJournal(contexte), message);
  }

  // Cette methode ecrit un message de debug.
  public debug(message: string, contexte?: any): void {
    this.instance.debug(this.construireEntreeJournal(contexte), message);
  }

  // Cette methode ajoute un contexte global qui sera fusionne avec les futurs logs.
  public ajouterContexteGlobal(contexte: Record<string, any>): void {
    this.contexteGlobal = {
      ...this.contexteGlobal,
      ...contexte,
    };
  }

  // Cette methode conserve la compatibilite avec le socle technique existant.
  public error(message: string, contexte?: any): void {
    this.erreur(message, contexte);
  }
}

export { JournaliseurPino as PinoLogger };
