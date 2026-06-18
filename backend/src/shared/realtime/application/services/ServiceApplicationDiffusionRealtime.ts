import type {
  PortRepositoryEvenementRealtime,
} from '../../domain';
import { ServiceEvaluationDiffusionRealtime, ServiceTransformationMessageRealtime } from '../../domain';
import type { PublierEvenementTempsReelCommand } from '../commands';
import type { EvenementTempsReelDto, MessageTempsReelDto } from '../dto/output';
import { ExceptionDiffusionRealtimeRefusee } from '../exceptions';
import { EvenementTempsReelApplicationMapper, MessageTempsReelApplicationMapper } from '../mappers';
import type {
  PortAudienceRealtime,
  PortAuthRealtime,
  PortDiffusionRealtime,
  PortObservabiliteRealtime,
  PortSecurityRealtime,
} from '../ports';
import { ValidateurEvenementTempsReel } from '../validators';

export class ServiceApplicationDiffusionRealtime {
  constructor(
    private readonly repository: PortRepositoryEvenementRealtime,
    private readonly portDiffusion: PortDiffusionRealtime,
    private readonly portAudience: PortAudienceRealtime,
    private readonly portAuth: PortAuthRealtime,
    private readonly portSecurity: PortSecurityRealtime,
    private readonly portObservabilite: PortObservabiliteRealtime,
    private readonly validateur = new ValidateurEvenementTempsReel(),
    private readonly mapperEvenement = new EvenementTempsReelApplicationMapper(),
    private readonly mapperMessage = new MessageTempsReelApplicationMapper(),
    private readonly evaluation = new ServiceEvaluationDiffusionRealtime(),
    private readonly transformation = new ServiceTransformationMessageRealtime(),
  ) {}

  public async publier(commande: PublierEvenementTempsReelCommand): Promise<EvenementTempsReelDto> {
    this.validateur.valider(commande);
    const evenement = this.mapperEvenement.versDomaine(commande);
    const contexteValide = await this.portAuth.validerContexte(evenement.contexte);
    const audienceAutorisee = await this.portSecurity.autoriserAudience(
      evenement.audience,
      evenement.contexte,
    );
    if (!contexteValide || !audienceAutorisee || !this.evaluation.evaluer(evenement)) {
      throw new ExceptionDiffusionRealtimeRefusee();
    }
    await this.repository.sauvegarder(evenement);
    return this.mapperEvenement.versDto(evenement);
  }

  public async diffuser(commande: PublierEvenementTempsReelCommand): Promise<MessageTempsReelDto> {
    const evenement = this.mapperEvenement.versDomaine(commande);
    if (!this.evaluation.evaluer(evenement)) {
      throw new ExceptionDiffusionRealtimeRefusee();
    }
    const destinataires = await this.portAudience.resoudre(evenement.audience);
    const message = this.transformation.transformer(evenement);
    await this.portDiffusion.diffuser(message, destinataires);
    await this.portObservabilite.enregistrerSignal({
      type: message.type,
      canal: message.canal.nom,
      audience: destinataires.length,
    });
    return this.mapperMessage.versDto(message);
  }

  public async verifier(commande: PublierEvenementTempsReelCommand): Promise<boolean> {
    const evenement = this.mapperEvenement.versDomaine(commande);
    return this.evaluation.evaluer(evenement);
  }
}
