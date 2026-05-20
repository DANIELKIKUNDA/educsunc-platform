import { ContexteActifAuth } from '../../domain';
import { ContexteActifOutput } from '../dto/output';
import { ContexteActifReadModel } from '../read-models';

// Ce mapper transforme un contexte actif domaine ou de lecture vers un DTO.
export class ContexteActifMapper {
  public static depuisDomaine(contexte: ContexteActifAuth): ContexteActifOutput {
    return {
      organisationActiveId: contexte.obtenirOrganisationActiveId(),
      ecoleActiveId: contexte.obtenirEcoleActiveId(),
    };
  }

  public static depuisLecture(contexte: ContexteActifReadModel): ContexteActifOutput {
    return {
      organisationActiveId: contexte.organisationActiveId,
      ecoleActiveId: contexte.ecoleActiveId,
    };
  }
}
