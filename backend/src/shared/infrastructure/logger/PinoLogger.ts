import pino, { type Logger as InstancePino, type LoggerOptions } from 'pino';

import { configurationApplication } from '../../../config/app.config';
import type { Journaliseur } from './Logger';

const nomChampSensible = /(authorization|cookie|motdepasse|password|secret|token)/iu;

function masquerValeursSensibles(
  valeur: unknown,
  profondeur = 0,
  referencesVisitees = new WeakSet<object>(),
): unknown {
  if (valeur === null || typeof valeur !== 'object') {
    return valeur;
  }
  if (valeur instanceof Date) {
    return valeur.toISOString();
  }
  if (valeur instanceof Error) {
    return {
      nom: valeur.name,
      message: valeur.message,
      stack: valeur.stack,
    };
  }
  if (referencesVisitees.has(valeur)) {
    return '[REFERENCE_CIRCULAIRE]';
  }
  if (profondeur >= 8) {
    return '[PROFONDEUR_LIMITEE]';
  }

  referencesVisitees.add(valeur);
  if (Array.isArray(valeur)) {
    return valeur.map((element) =>
      masquerValeursSensibles(element, profondeur + 1, referencesVisitees));
  }

  const resultat: Record<string, unknown> = {};
  for (const [nom, contenu] of Object.entries(valeur)) {
    resultat[nom] = nomChampSensible.test(nom)
      ? '[MASQUE]'
      : masquerValeursSensibles(contenu, profondeur + 1, referencesVisitees);
  }

  return resultat;
}

export function creerConfigurationPino(): LoggerOptions {
  return {
    level: configurationApplication.niveauJournalisation,
    base: {
      service: configurationApplication.nomApplication,
      environnement: configurationApplication.environnement,
    },
    messageKey: 'message',
    redact: {
      censor: '[MASQUE]',
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'headers.authorization',
        'headers.cookie',
        'authorization',
        'cookie',
        'password',
        'motDePasse',
        'token',
        'accessToken',
        'refreshToken',
        'contexte.authorization',
        'contexte.cookie',
        'contexte.password',
        'contexte.motDePasse',
        'contexte.token',
        'contexte.accessToken',
        'contexte.refreshToken',
        'contexte.headers.authorization',
        'contexte.headers.cookie',
      ],
    },
    formatters: {
      level(niveau) {
        return { niveau };
      },
      bindings(bindings) {
        return bindings;
      },
    },
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  };
}

// Cette classe fournit une implementation technique du logger basee sur Pino.
// Elle peut etre remplacee plus tard par une autre solution sans impacter les autres couches.
export class JournaliseurPino implements Journaliseur {
  public readonly instance: InstancePino;
  private contexteGlobal: Record<string, any> = {};

  // Le constructeur initialise l'instance interne de Pino ou reutilise une instance fournie.
  constructor(instance?: InstancePino) {
    this.instance = instance ?? pino(creerConfigurationPino());

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
      return masquerValeursSensibles({
        nom: contexte.name,
        message: contexte.message,
        stack: contexte.stack,
      }) as Record<string, unknown>;
    }

    if (typeof contexte === 'object' && !Array.isArray(contexte)) {
      return masquerValeursSensibles(contexte) as Record<string, unknown>;
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
