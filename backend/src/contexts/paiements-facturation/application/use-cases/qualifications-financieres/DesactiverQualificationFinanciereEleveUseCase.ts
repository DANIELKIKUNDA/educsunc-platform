import type { DesactiverQualificationFinanciereEleveInput } from '../../dto/input/QualificationsFinancieresEntreeDTO';
import type { QualificationFinanciereEleveOutput } from '../../dto/output/QualificationsFinancieresSortieDTO';
import type { AutorisationQualificationFinanciereElevePort } from '../../ports/AutorisationQualificationFinanciereElevePort';
import { versQualificationFinanciereEleveOutput } from '../../mappers/QualificationFinanciereEleveApplicationMapper';
import type { DepotQualificationFinanciereEleve } from '../../../domain/repositories/DepotQualificationFinanciereEleve';

export class DesactiverQualificationFinanciereEleveUseCase {
  constructor(
    private readonly depotQualification: DepotQualificationFinanciereEleve,
    private readonly autorisationQualification: AutorisationQualificationFinanciereElevePort,
  ) {}

  public async executer(input: DesactiverQualificationFinanciereEleveInput): Promise<QualificationFinanciereEleveOutput> {
    const qualification = await this.depotQualification.trouverParId(input.idQualification);
    if (qualification === null) {
      throw new Error('La qualification financiere a desactiver est introuvable.');
    }

    await this.autorisationQualification.verifierGestionQualification({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idEleve: qualification.obtenirIdEleve(),
    });

    if (qualification.obtenirIdEcole() !== input.idEcole) {
      throw new Error("La qualification financiere a desactiver n appartient pas au perimetre demande.");
    }

    qualification.desactiver(input.raison, input.dateFinEffet);
    await this.depotQualification.sauvegarder(qualification);
    return versQualificationFinanciereEleveOutput(qualification);
  }
}
