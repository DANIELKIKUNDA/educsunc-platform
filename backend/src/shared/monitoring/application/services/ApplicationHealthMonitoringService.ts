import { InstantaneSante, ServiceCalculEtatSysteme } from '../../domain';
import type { MonitoringHealthPort } from '../ports';
import { MonitoringContextMapper, SystemStateMapper } from '../mappers';
import { ValidateMonitoringContext } from '../validators';
import type { HealthSnapshotDto, MonitoringContextInputDto, SystemStateDto } from '../dto';

// Ce fichier declare le service applicatif de sante.

/** Cette classe centralise la collecte applicative de sante. */
export class ApplicationHealthMonitoringService {
  constructor(
    private readonly healthPort: MonitoringHealthPort,
    private readonly validateur = new ValidateMonitoringContext(),
    private readonly mapper = new MonitoringContextMapper(),
    private readonly calculEtat = new ServiceCalculEtatSysteme(),
    private readonly sortie = new SystemStateMapper(),
  ) {}

  /** Cette methode calcule l etat systeme courant. */
  public async calculerEtat(contexte: MonitoringContextInputDto): Promise<SystemStateDto> {
    this.validateur.valider(contexte);
    const composants = await this.healthPort.collecterComposants(contexte);
    const dependances = await this.healthPort.collecterDependances(contexte);
    const runtime = await this.healthPort.collecterRuntime(contexte);
    const etat = this.calculEtat.calculer(this.mapper.versContexte(contexte), composants, dependances, runtime);
    return this.sortie.versDto(etat);
  }

  /** Cette methode produit un snapshot de sante. */
  public async produireSnapshot(contexte: MonitoringContextInputDto): Promise<HealthSnapshotDto> {
    this.validateur.valider(contexte);
    const composants = await this.healthPort.collecterComposants(contexte);
    const dependances = await this.healthPort.collecterDependances(contexte);
    const runtime = await this.healthPort.collecterRuntime(contexte);
    const etat = this.calculEtat.calculer(this.mapper.versContexte(contexte), composants, dependances, runtime);
    return this.sortie.versSnapshotDto(new InstantaneSante(etat));
  }
}
