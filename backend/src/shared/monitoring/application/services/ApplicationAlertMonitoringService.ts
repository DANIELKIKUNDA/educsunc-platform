import { Alerte, PolitiqueDeclenchementAlerte, SeuilAlerte } from '../../domain';
import type { CreateAlertCommand, ResolveAlertCommand } from '../commands';
import type { AlertDto } from '../dto/output';
import { MonitoringNotFoundException } from '../exceptions';
import { AlertMapper, MonitoringContextMapper } from '../mappers';
import type { MonitoringAlertPort } from '../ports';
import { ValidateCreateAlert } from '../validators';

// Ce fichier declare le service applicatif d alertes.

/** Cette classe centralise la gestion applicative des alertes. */
export class ApplicationAlertMonitoringService {
  constructor(
    private readonly alertPort: MonitoringAlertPort,
    private readonly validateur = new ValidateCreateAlert(),
    private readonly mapper = new MonitoringContextMapper(),
    private readonly politique = new PolitiqueDeclenchementAlerte(),
    private readonly sortie = new AlertMapper(),
  ) {}

  /** Cette methode cree une alerte. */
  public async creer(commande: CreateAlertCommand): Promise<AlertDto> {
    this.validateur.valider(commande);
    const seuil = new SeuilAlerte({
      indicateur: commande.indicateur,
      warning: commande.warning,
      critical: commande.critical,
      unite: commande.unite,
      graviteParDefaut: 'WARNING',
    });
    this.politique.verifier(commande.valeurObservee, seuil);

    const alerte = new Alerte({
      identifiant: commande.alertId,
      indicateur: commande.indicateur,
      gravite: seuil.evaluer(commande.valeurObservee) ?? 'WARNING',
      statut: 'OPEN',
      message: commande.message,
      seuil: seuil.valeur(),
      valeurObservee: commande.valeurObservee,
      contexte: this.mapper.versContexte(commande.contexte).valeur(),
      correlation: this.mapper.versCorrelation(commande.correlationId).valeur(),
      declencheeLe: new Date(),
    });

    await this.alertPort.enregistrerAlerte(alerte);
    return this.sortie.versDto(alerte);
  }

  /** Cette methode resolut une alerte existante. */
  public async resoudre(commande: ResolveAlertCommand): Promise<AlertDto> {
    const existante = await this.alertPort.retrouverAlerte(commande.alertId);
    if (!existante) {
      throw new MonitoringNotFoundException('Cette alerte est introuvable.');
    }

    const resolue = existante.resoudre(commande.resolvedAt ?? new Date());
    await this.alertPort.enregistrerAlerte(resolue);
    return this.sortie.versDto(resolue);
  }
}
