import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';
import type { ClassementClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/ClassementClasseReadModel';
import type { ProclamationClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/ProclamationClasseReadModel';
import type { SyntheseEcoleOutput } from 'contexts/bulletins-evaluations/application/dto/output/SyntheseEcoleOutput';
import {
  ProjectionBulletinService,
  ProjectionClassementService,
  ProjectionProclamationService,
  ProjectionSyntheseService,
} from '../services';

// Ce fichier centralise la projection documentaire du BC vers ses differents read models.
export class BulletinProjectionAdapter {
  // Ce constructeur injecte les services de projection specialises sans les coupler au domaine.
  constructor(
    private readonly projectionBulletinService: ProjectionBulletinService,
    private readonly projectionClassementService: ProjectionClassementService,
    private readonly projectionProclamationService: ProjectionProclamationService,
    private readonly projectionSyntheseService: ProjectionSyntheseService,
  ) {}

  // Cette methode materialise un bulletin.
  public projeterBulletin(bulletin: BulletinEleveReadModel): BulletinEleveReadModel {
    return this.projectionBulletinService.construireProjection(bulletin);
  }

  // Cette methode materialise un classement.
  public projeterClassement(classement: ClassementClasseReadModel): ClassementClasseReadModel {
    return this.projectionClassementService.construireProjection(classement);
  }

  // Cette methode materialise une proclamation.
  public projeterProclamation(proclamation: ProclamationClasseReadModel): ProclamationClasseReadModel {
    return this.projectionProclamationService.construireProjection(proclamation);
  }

  // Cette methode materialise une synthese d'ecole.
  public projeterSynthese(synthese: SyntheseEcoleOutput): SyntheseEcoleOutput {
    return this.projectionSyntheseService.construireProjection(synthese);
  }
}
