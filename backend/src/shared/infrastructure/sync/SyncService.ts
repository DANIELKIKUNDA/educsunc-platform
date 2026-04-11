import { ValidationError } from '../../exceptions/ValidationError';
import type { Journaliseur } from '../logger/Logger';
import { ResolveurConflit } from './ConflictResolver';
import type { DepotJournalSynchronisation } from './SyncLogRepository';

type ContexteSynchronisation = Record<string, any>;
type ResultatSynchronisation = { poussees: number; recues: number };

// Ce service definit la base transverse des operations de synchronisation.
// Les bounded contexts brancheront plus tard leurs donnees et leurs integrations distantes sur cette interface.
export interface ServiceSynchronisation {
  // Cette methode pousse un lot de donnees locales vers une cible distante future.
  pousser(donnees: any[], contexte?: ContexteSynchronisation): Promise<void>;

  // Cette methode tire des donnees distantes vers le systeme local via une implementation future.
  tirer(contexte?: ContexteSynchronisation): Promise<any[]>;

  // Cette methode orchestre un cycle complet de synchronisation locale et distante.
  synchroniser(
    donneesLocales: any[],
    contexte?: ContexteSynchronisation,
  ): Promise<ResultatSynchronisation>;
}

// Cette implementation fournit une base industrielle de synchronisation transverse sans brancher encore d'API reelle.
// Elle journalise les operations, applique les validations techniques et reste extensible pour les integrations futures.
export class ServiceSynchronisationParDefaut implements ServiceSynchronisation {
  private readonly journaliseur: Journaliseur;
  private readonly depotJournalSynchronisation: DepotJournalSynchronisation;
  private readonly resolveurConflit: ResolveurConflit;

  // Ce constructeur injecte les composants techniques partages necessaires a la synchronisation.
  constructor(
    journaliseur: Journaliseur,
    depotJournalSynchronisation: DepotJournalSynchronisation,
    resolveurConflit: ResolveurConflit,
  ) {
    this.journaliseur = journaliseur;
    this.depotJournalSynchronisation = depotJournalSynchronisation;
    this.resolveurConflit = resolveurConflit;
  }

  // Cette methode transforme une erreur inconnue en message exploitable.
  private convertirErreurEnTexte(erreur: unknown): string {
    if (erreur instanceof Error) {
      return erreur.message;
    }

    return 'Erreur technique inconnue.';
  }

  // Cette methode transforme une erreur inconnue en details de journalisation.
  private construireDetailsErreur(erreur: unknown): Record<string, any> {
    if (erreur instanceof Error) {
      return {
        nom: erreur.name,
        message: erreur.message,
        stack: erreur.stack,
      };
    }

    return {
      valeur: erreur,
    };
  }

  // Cette methode construit un contexte de log homogene pour les operations de synchronisation.
  private construireContexteOperation(
    operation: string,
    contexte?: ContexteSynchronisation,
    details?: Record<string, any>,
  ): Record<string, any> {
    return {
      operation,
      resolveurConflit: this.resolveurConflit.constructor.name,
      ...contexte,
      ...details,
    };
  }

  // Cette methode pousse des donnees locales de maniere simulee tout en journalisant correctement le cycle d'execution.
  public async pousser(donnees: any[], contexte?: ContexteSynchronisation): Promise<void> {
    const nomOperation = 'POUSSER';
    const idJournal = await this.depotJournalSynchronisation.enregistrerDebut(
      nomOperation,
      this.construireContexteOperation(nomOperation, contexte, {
        tailleLot: Array.isArray(donnees) ? donnees.length : undefined,
      }),
    );

    try {
      this.journaliseur.info(
        'Debut de la simulation de poussee de synchronisation.',
        this.construireContexteOperation(nomOperation, contexte, {
          idJournal,
        }),
      );

      if (!Array.isArray(donnees)) {
        throw new ValidationError(
          'Les donnees a pousser doivent etre fournies sous forme de tableau.',
          'SYNC_DONNEES_INVALIDES',
          {
            operation: nomOperation,
          },
        );
      }

      await this.depotJournalSynchronisation.enregistrerSucces(idJournal, {
        poussees: donnees.length,
        simulation: true,
      });

      this.journaliseur.info(
        'Poussee de synchronisation simulee avec succes.',
        this.construireContexteOperation(nomOperation, contexte, {
          idJournal,
          poussees: donnees.length,
        }),
      );
    } catch (erreur) {
      const messageErreur = this.convertirErreurEnTexte(erreur);
      const detailsErreur = this.construireDetailsErreur(erreur);

      await this.depotJournalSynchronisation.enregistrerEchec(idJournal, messageErreur, detailsErreur);
      this.journaliseur.erreur(
        'Echec de la poussee de synchronisation.',
        this.construireContexteOperation(nomOperation, contexte, {
          idJournal,
          erreur: detailsErreur,
        }),
      );

      throw erreur;
    }
  }

  // Cette methode tire un lot distant simule et consigne proprement les traces techniques associees.
  public async tirer(contexte?: ContexteSynchronisation): Promise<any[]> {
    const nomOperation = 'TIRER';
    const idJournal = await this.depotJournalSynchronisation.enregistrerDebut(
      nomOperation,
      this.construireContexteOperation(nomOperation, contexte),
    );

    try {
      this.journaliseur.info(
        'Debut de la simulation de recuperation de synchronisation.',
        this.construireContexteOperation(nomOperation, contexte, {
          idJournal,
        }),
      );

      const resultat: any[] = [];

      await this.depotJournalSynchronisation.enregistrerSucces(idJournal, {
        recues: resultat.length,
        simulation: true,
      });

      this.journaliseur.info(
        'Recuperation de synchronisation simulee avec succes.',
        this.construireContexteOperation(nomOperation, contexte, {
          idJournal,
          recues: resultat.length,
        }),
      );

      return resultat;
    } catch (erreur) {
      const messageErreur = this.convertirErreurEnTexte(erreur);
      const detailsErreur = this.construireDetailsErreur(erreur);

      await this.depotJournalSynchronisation.enregistrerEchec(idJournal, messageErreur, detailsErreur);
      this.journaliseur.erreur(
        'Echec de la recuperation de synchronisation.',
        this.construireContexteOperation(nomOperation, contexte, {
          idJournal,
          erreur: detailsErreur,
        }),
      );

      throw erreur;
    }
  }

  // Cette methode orchestre une synchronisation transverse complete sans encore brancher d'appel distant reel.
  public async synchroniser(
    donneesLocales: any[],
    contexte?: ContexteSynchronisation,
  ): Promise<ResultatSynchronisation> {
    await this.pousser(donneesLocales, contexte);
    const donneesRecues = await this.tirer(contexte);

    return {
      poussees: Array.isArray(donneesLocales) ? donneesLocales.length : 0,
      recues: donneesRecues.length,
    };
  }
}
