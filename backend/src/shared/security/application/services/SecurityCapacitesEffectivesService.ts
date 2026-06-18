import { MoteurCapacitesEffectives, PolicyTitulariatEffectifParSection } from '../../../security/domain';
import type {
  AffectationTitulariatRepositoryPort,
  AffectationUtilisateurRepositoryPort,
  ResponsabiliteClassePedagogiquePort,
  RoleRepositoryPort,
} from '../ports';
import { CapacitesEffectivesMapper, TitulariatMapper } from '../mappers';
import type { CapacitesEffectivesReadModel } from '../read-models';

export class SecurityCapacitesEffectivesService {
  constructor(
    private readonly roleRepositoryPort: RoleRepositoryPort,
    private readonly affectationUtilisateurRepositoryPort: AffectationUtilisateurRepositoryPort,
    private readonly affectationTitulariatRepositoryPort: AffectationTitulariatRepositoryPort,
    private readonly moteurCapacitesEffectives: MoteurCapacitesEffectives,
    private readonly responsabiliteClassePedagogiquePort?: ResponsabiliteClassePedagogiquePort,
  ) {}

  public async calculerPourUtilisateur(params: {
    idUtilisateur: string;
    idOrganisationActive?: string;
    idEcoleActive?: string;
    idClasse?: string;
    idAnneeScolaire?: string;
  }): Promise<CapacitesEffectivesReadModel> {
    const affectations = await this.affectationUtilisateurRepositoryPort.listerActivesParUtilisateur(
      params.idUtilisateur,
    );
    const roles = (
      await Promise.all(
        affectations.map((affectation) =>
          this.roleRepositoryPort.trouverParId(affectation.obtenirIdRole()),
        ),
      )
    ).filter((role): role is NonNullable<typeof role> => role !== null);

    const permissionsBase = Array.from(
      new Set(
        roles.flatMap((role) =>
          role
            .obtenirPermissions()
            .map((permission) => permission.obtenirPermission().obtenirValeur()),
        ),
      ),
    );
    const restrictions = Array.from(
      new Set(
        roles.flatMap((role) =>
          role
            .obtenirRestrictions()
            .map((restriction) => restriction.obtenirCodeRestriction().obtenirValeur()),
        ),
      ),
    );
    const titulariats = await this.affectationTitulariatRepositoryPort.listerActifsParUtilisateur(
      params.idUtilisateur,
    );
    const responsabiliteClassePedagogique =
      params.idClasse && params.idAnneeScolaire && this.responsabiliteClassePedagogiquePort
        ? await this.responsabiliteClassePedagogiquePort.consulterActiveParClasseEtAnnee({
            idOrganisation: params.idOrganisationActive,
            idEcole: params.idEcoleActive,
            idClassePedagogique: params.idClasse,
            idAnneeScolaire: params.idAnneeScolaire,
          })
        : null;
    const titulariatEffectifParResponsabilite =
      params.idClasse !== undefined
      && params.idAnneeScolaire !== undefined
      && PolicyTitulariatEffectifParSection.estTitulariatEffectif({
        responsabiliteClassePedagogique,
        idUtilisateur: params.idUtilisateur,
        idOrganisation: params.idOrganisationActive,
        idEcole: params.idEcoleActive,
        idClasse: params.idClasse,
        idAnneeScolaire: params.idAnneeScolaire,
      });
    const titulariatActifDansScope = this.moteurCapacitesEffectives.possedeTitulariatActifDansScope(
      titulariats,
      {
        idOrganisation: params.idOrganisationActive,
        idEcole: params.idEcoleActive,
        idClasse: params.idClasse,
        idAnneeScolaire: params.idAnneeScolaire,
      },
    );
    const responsabiliteValideHorsSectionAuto =
      responsabiliteClassePedagogique !== null
      && responsabiliteClassePedagogique.active
      && responsabiliteClassePedagogique.idUtilisateurEnseignant === params.idUtilisateur
      && responsabiliteClassePedagogique.idClassePedagogique === params.idClasse
      && responsabiliteClassePedagogique.idAnneeScolaire === params.idAnneeScolaire
      && (!params.idOrganisationActive
        || responsabiliteClassePedagogique.idOrganisation === params.idOrganisationActive)
      && (!params.idEcoleActive
        || responsabiliteClassePedagogique.idEcole === params.idEcoleActive)
      && !PolicyTitulariatEffectifParSection.estSectionAutoTitulariat(
        responsabiliteClassePedagogique.sectionCode,
        responsabiliteClassePedagogique.sectionLibelle,
      );
    const titulariatEffectifFinal =
      titulariatEffectifParResponsabilite
      || (responsabiliteValideHorsSectionAuto && titulariatActifDansScope);
    const permissions = this.moteurCapacitesEffectives.calculerPermissionsEffectives({
      permissionsBase,
      titulariats,
      titulariatEffectifFinal,
      contexte: {
        idOrganisation: params.idOrganisationActive,
        idEcole: params.idEcoleActive,
        idClasse: params.idClasse,
        idAnneeScolaire: params.idAnneeScolaire,
      },
    });
    const estTitulaireEffectif = this.moteurCapacitesEffectives.aTitulariatEffectif(
      titulariatEffectifFinal,
    );

    return CapacitesEffectivesMapper.depuisCalcul({
      permissions,
      restrictions,
      titulariatsActifs: titulariats.map((titulariat) => TitulariatMapper.depuisDomaine(titulariat)),
      estTitulaireEffectif,
      sourceTitulariatEffectif:
        titulariatEffectifParResponsabilite
          ? 'RESPONSABILITE_CLASSE'
          : titulariatEffectifFinal
            ? 'AFFECTATION_TITULARIAT'
            : 'AUCUNE',
    });
  }
}
