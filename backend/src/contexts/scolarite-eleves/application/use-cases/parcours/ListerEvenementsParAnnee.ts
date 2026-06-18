import { UseCase } from '../../../../../shared/application/UseCase';
import type { AutorisationParcoursElevePort } from '../../ports';
import { EvenementParcours } from '../../../domain/entities/EvenementParcours';
import { DepotAffectationClasse } from '../../../domain/repositories/DepotAffectationClasse';
import { DepotInscriptionScolaire } from '../../../domain/repositories/DepotInscriptionScolaire';
import { DepotParcoursScolaireEleve } from '../../../domain/repositories/DepotParcoursScolaireEleve';
import { EvenementParcoursSortieDTO } from '../../dto/output/EvenementParcoursSortieDTO';
import { EvenementParcoursMapper } from '../../mappers/EvenementParcoursMapper';

interface ResolveurSectionClasseParcours {
  consulterSectionClasse(params: {
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<{
    idSectionScolaire: string;
    sectionCode: string;
    sectionLibelle: string;
  } | null>;
}

// Ce fichier contient le cas d'usage de liste des evenements par annee scolaire.
export interface ListerEvenementsParAnneeEntree {
  idAnneeScolaire: string;
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
}

/** Ce cas d'usage liste les evenements de parcours d'une annee scolaire. */
export class ListerEvenementsParAnnee implements UseCase<ListerEvenementsParAnneeEntree, EvenementParcoursSortieDTO[]> {
  constructor(
    private readonly depotParcours: DepotParcoursScolaireEleve,
    private readonly depotInscription: DepotInscriptionScolaire,
    private readonly depotAffectation: DepotAffectationClasse,
    private readonly sectionClassePedagogiqueAdapter: ResolveurSectionClasseParcours,
    private readonly autorisationParcours?: AutorisationParcoursElevePort,
  ) {}
  /** Execute la liste par annee. */
  public async executer(entree: ListerEvenementsParAnneeEntree): Promise<EvenementParcoursSortieDTO[]> {
    const sectionsAutorisees = await this.autorisationParcours?.listerSectionsLectureAutorisees({
      idUtilisateur: entree.idUtilisateur,
      idOrganisation: entree.idOrganisation,
      idEcole: entree.idEcole,
    }) ?? [];

    const inscriptions = await this.depotInscription.listerParEcoleEtAnnee(
      entree.idEcole,
      entree.idAnneeScolaire,
    );
    const idsElevesAutorises: string[] = [];

    for (const inscription of inscriptions) {
      const affectation = await this.depotAffectation.trouverAffectationActiveParInscription(
        inscription.obtenirId(),
      );

      if (affectation === null) {
        continue;
      }

      const section = await this.sectionClassePedagogiqueAdapter.consulterSectionClasse({
        idOrganisation: entree.idOrganisation,
        idEcole: entree.idEcole,
        idClassePedagogique: affectation.obtenirIdClassePedagogique(),
        idAnneeScolaire: entree.idAnneeScolaire,
      });

      if (
        section === null
        || !sectionsAutorisees.includes(section.idSectionScolaire)
      ) {
        continue;
      }
      idsElevesAutorises.push(inscription.obtenirIdEleve());
    }

    const parcoursAutorises = await this.depotParcours.listerParEleves(idsElevesAutorises);
    const evenements: EvenementParcours[] = parcoursAutorises.flatMap((parcours) =>
      parcours.listerParAnnee(entree.idAnneeScolaire),
    );

    return evenements.map(EvenementParcoursMapper.versSortie);
  }
}
