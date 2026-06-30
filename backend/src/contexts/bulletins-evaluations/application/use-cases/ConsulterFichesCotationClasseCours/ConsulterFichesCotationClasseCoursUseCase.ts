import type { DepotFicheCotationEleveCours } from '../../../domain/repositories/DepotFicheCotationEleveCours';
import type { ConsulterFichesCotationClasseCoursInput } from '../../dto/input/ConsulterFichesCotationClasseCoursInput';
import type { FicheCotationOutput } from '../../dto/output/FicheCotationOutput';
import type { AutorisationEncodageCotesPort } from '../../ports/out/AutorisationEncodageCotesPort';
import type { ScolariteElevesPort } from '../../ports/out/ScolariteElevesPort';
import { ServiceProjectionLecture } from '../../services/ServiceProjectionLecture';

// Ce use case ouvre la vraie lecture de travail des fiches de cotation d'une classe pour un cours donne.
export class ConsulterFichesCotationClasseCoursUseCase {
  constructor(
    private readonly depotFicheCotation: DepotFicheCotationEleveCours,
    private readonly autorisationEncodageCotesPort?: AutorisationEncodageCotesPort,
    private readonly scolariteElevesPort?: ScolariteElevesPort,
    private readonly serviceProjectionLecture = new ServiceProjectionLecture(),
  ) {}

  public async executer(input: ConsulterFichesCotationClasseCoursInput): Promise<FicheCotationOutput[]> {
    await this.autorisationEncodageCotesPort?.verifierConsultationFichesClasseCours({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idClassePedagogique: input.idClassePedagogique,
      idReferentielCours: input.idReferentielCours,
      idAnneeScolaire: input.idAnneeScolaire,
    });

    const fiches = await this.depotFicheCotation.listerParClasseEtCours(
      input.idClassePedagogique,
      input.idReferentielCours,
      input.idAnneeScolaire,
    );

    return Promise.all(fiches.map(async (fiche) => {
      const projection = this.serviceProjectionLecture.projeterFiche(fiche);
      const eleve = await this.scolariteElevesPort?.consulterEleve(fiche.obtenirIdEleve());

      if (eleve === null || eleve === undefined) {
        return projection;
      }

      return {
        ...projection,
        identiteEleve: {
          nomComplet: eleve.nomComplet,
          sexe: eleve.sexe,
          matricule: eleve.matricule,
          nom: eleve.nom,
          postNom: eleve.postNom,
          prenom: eleve.prenom,
        },
      } satisfies FicheCotationOutput;
    }));
  }
}
