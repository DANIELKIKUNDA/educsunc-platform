import {
  AudienceTempsReel,
  CanalTempsReel,
  ContexteTempsReel,
  EvenementDiffusable,
  PayloadTempsReel,
  RealtimeId,
  ValeurUtilisateur,
  type EvenementTempsReel,
} from '../../domain';
import type { PublierEvenementTempsReelCommand } from '../commands';
import type { EvenementTempsReelDto } from '../dto/output';

export class EvenementTempsReelApplicationMapper {
  public versDomaine(commande: PublierEvenementTempsReelCommand): EvenementTempsReel {
    const { EvenementTempsReel } = require('../../domain') as typeof import('../../domain');
    return new EvenementTempsReel(
      new RealtimeId(commande.evenementId),
      commande.type,
      new EvenementDiffusable({
        nom: commande.type,
        visible: commande.visible,
        impacteInterface: commande.impacteInterface,
        necessiteReaction: commande.necessiteReaction,
        priorite: commande.priorite,
        typeDiffusion: commande.typeDiffusion,
        valeurUtilisateur: new ValeurUtilisateur(
          commande.utileImmediatement,
          commande.raisonValeurUtilisateur,
        ),
      }),
      new AudienceTempsReel({
        organisationId: commande.organisationId,
        ecoleId: commande.ecoleId,
        utilisateurIds: commande.utilisateurIds,
        permissionsRequises: commande.permissionsRequises,
      }),
      new CanalTempsReel(commande.canal),
      new ContexteTempsReel(commande.contexte),
      new PayloadTempsReel(commande.payload),
    );
  }

  public versDto(evenement: EvenementTempsReel): EvenementTempsReelDto {
    return {
      id: evenement.id.value,
      type: evenement.type,
      canal: evenement.canal.nom,
      diffusable: evenement.peutEtreDiffuse(),
    };
  }
}
