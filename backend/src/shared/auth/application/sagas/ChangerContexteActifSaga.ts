import { ContexteActifOutput } from '../dto/output';
import { ContexteActifApplicationService } from '../services/ContexteActifApplicationService';
import { TransactionManagerPort } from '../ports/transaction/TransactionManagerPort';
import { AuditAuthApplicationService } from '../services/AuditAuthApplicationService';
import { SessionApplicationService } from '../services/SessionApplicationService';

// Cette saga orchestre les changements de contexte actif utilisateur.
export class ChangerContexteActifSaga {
  constructor(
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly contexteActifApplicationService: ContexteActifApplicationService,
    private readonly sessionApplicationService: SessionApplicationService,
    private readonly auditAuthApplicationService?: AuditAuthApplicationService,
  ) {}

  // Cette methode change l'organisation active dans une transaction applicative.
  public async changerOrganisationActive(
    idSessionUtilisateur: string,
    idUtilisateur: string,
    organisationActiveId: string,
  ): Promise<ContexteActifOutput> {
    const resultat = await this.transactionManagerPort.executerDansTransaction(async () => {
      const sortie = await this.contexteActifApplicationService.changerOrganisationActive(idUtilisateur, organisationActiveId);
      const session = await this.sessionApplicationService.synchroniserContexteActif(
        idSessionUtilisateur,
        sortie,
      );
      await this.auditAuthApplicationService?.publierAuditSecurite({
        action: 'AUTH_CONTEXT_CHANGED',
        utilisateurId: idUtilisateur,
        succes: true,
        details: {
          organisationActiveId: sortie.organisationActiveId,
          ecoleActiveId: sortie.ecoleActiveId,
          actionTimestamp: new Date().toISOString(),
        },
      });
      return { sortie, session };
    });
    await this.sessionApplicationService.actualiserCacheSession(resultat.session);
    return resultat.sortie;
  }

  // Cette methode change l'ecole active dans une transaction applicative.
  public async changerEcoleActive(
    idSessionUtilisateur: string,
    idUtilisateur: string,
    ecoleActiveId: string,
  ): Promise<ContexteActifOutput> {
    const resultat = await this.transactionManagerPort.executerDansTransaction(async () => {
      const sortie = await this.contexteActifApplicationService.changerEcoleActive(idUtilisateur, ecoleActiveId);
      const session = await this.sessionApplicationService.synchroniserContexteActif(
        idSessionUtilisateur,
        sortie,
      );
      await this.auditAuthApplicationService?.publierAuditSecurite({
        action: 'AUTH_CONTEXT_CHANGED',
        utilisateurId: idUtilisateur,
        succes: true,
        details: {
          organisationActiveId: sortie.organisationActiveId,
          ecoleActiveId: sortie.ecoleActiveId,
          actionTimestamp: new Date().toISOString(),
        },
      });
      return { sortie, session };
    });
    await this.sessionApplicationService.actualiserCacheSession(resultat.session);
    return resultat.sortie;
  }

  // Cette methode revient au niveau plateforme et purge organisation/ecole de la session.
  public async activerPlateforme(
    idSessionUtilisateur: string,
    idUtilisateur: string,
  ): Promise<ContexteActifOutput> {
    const resultat = await this.transactionManagerPort.executerDansTransaction(async () => {
      const sortie = await this.contexteActifApplicationService.viderContexteActif(idUtilisateur);
      const session = await this.sessionApplicationService.synchroniserContexteActif(
        idSessionUtilisateur,
        sortie,
      );
      await this.auditAuthApplicationService?.publierAuditSecurite({
        action: 'AUTH_CONTEXT_CHANGED',
        utilisateurId: idUtilisateur,
        succes: true,
        details: {
          sessionId: idSessionUtilisateur,
          niveauActif: 'PLATEFORME',
          actionTimestamp: new Date().toISOString(),
        },
      });
      return { sortie, session };
    });
    await this.sessionApplicationService.actualiserCacheSession(resultat.session);
    return resultat.sortie;
  }
}
