import {
  MoteurCapacitesEffectives,
  PolicyTitulariatEffectifParSection,
  ScopeAcces,
  TypeScope,
  type AffectationTitulariat,
  type AffectationUtilisateur,
  type Role,
} from '../../../security/domain';
import type {
  AffectationTitulariatRepositoryPort,
  AffectationUtilisateurRepositoryPort,
  OwnershipParentPort,
  ResponsabiliteClassePedagogiquePort,
  RoleRepositoryPort,
} from '../ports';
import { CapacitesEffectivesMapper, ScopeMapper, TitulariatMapper } from '../mappers';
import type {
  CapacitesEffectivesReadModel,
  ResponsabiliteClassePedagogiqueReadModel,
  TitulariatEffectifReadModel,
} from '../read-models';

export class SecurityCapacitesEffectivesService {
  constructor(
    private readonly roleRepositoryPort: RoleRepositoryPort,
    private readonly affectationUtilisateurRepositoryPort: AffectationUtilisateurRepositoryPort,
    private readonly affectationTitulariatRepositoryPort: AffectationTitulariatRepositoryPort,
    private readonly moteurCapacitesEffectives: MoteurCapacitesEffectives,
    private readonly responsabiliteClassePedagogiquePort?: ResponsabiliteClassePedagogiquePort,
    private readonly ownershipParentPort?: OwnershipParentPort,
  ) {}

  public async calculerPourUtilisateur(params: {
    idUtilisateur: string;
    idOrganisationActive?: string;
    idEcoleActive?: string;
    idClasse?: string;
    idAnneeScolaire?: string;
    acteurCodePrefere?: string;
  }): Promise<CapacitesEffectivesReadModel> {
    const affectations = (
      await this.affectationUtilisateurRepositoryPort.listerActivesParUtilisateur(
        params.idUtilisateur,
      )
    ).filter((affectation) => this.affectationCouvreContexte(affectation, params));
    const candidats = (
      await Promise.all(
        affectations.map(async (affectation) => ({
          affectation,
          role: await this.roleRepositoryPort.trouverParId(affectation.obtenirIdRole()),
        })),
      )
    ).filter(
      (candidat): candidat is { affectation: AffectationUtilisateur; role: Role } =>
        candidat.role !== null && candidat.role.obtenirEstActif(),
    );
    const actorCodes = Array.from(
      new Set(candidats.map(({ role }) => role.obtenirCodeRole().obtenirValeur())),
    );
    const acteurCodeActif = this.resoudreActeurActif(actorCodes, params);
    const candidatsActifs = acteurCodeActif
      ? candidats.filter(
          ({ role }) => role.obtenirCodeRole().obtenirValeur() === acteurCodeActif,
        )
      : [];
    const roles = candidatsActifs.map((candidat) => candidat.role);
    const scopes = this.construireScopesContextualises(candidatsActifs, params);

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
    const titulariats = params.idEcoleActive
      ? (
          await this.affectationTitulariatRepositoryPort.listerActifsParUtilisateur(
            params.idUtilisateur,
          )
        ).filter((titulariat) =>
          titulariat.estActifDansScope({
            idOrganisation: params.idOrganisationActive,
            idEcole: params.idEcoleActive,
          }),
        )
      : [];
    const responsabilitesActives =
      acteurCodeActif === 'ENSEIGNANT'
      && params.idEcoleActive
      && this.responsabiliteClassePedagogiquePort?.listerActivesParUtilisateur
        ? await this.responsabiliteClassePedagogiquePort.listerActivesParUtilisateur({
            idOrganisation: params.idOrganisationActive,
            idEcole: params.idEcoleActive,
            idUtilisateur: params.idUtilisateur,
          })
        : [];
    const titulariatsEffectifs = this.resoudreTitulariatsEffectifs({
      responsabilites: responsabilitesActives,
      titulariats,
      idUtilisateur: params.idUtilisateur,
      idOrganisation: params.idOrganisationActive,
      idEcole: params.idEcoleActive,
    });
    const titulariatEffectifCible = params.idClasse && params.idAnneeScolaire
      ? titulariatsEffectifs.find(
          (titulariat) =>
            titulariat.idClasse === params.idClasse
            && titulariat.idAnneeScolaire === params.idAnneeScolaire,
        )
      : undefined;
    const titulariatEffectifFinal = titulariatEffectifCible !== undefined;
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
    const estTitulaireEffectif = params.idClasse && params.idAnneeScolaire
      ? this.moteurCapacitesEffectives.aTitulariatEffectif(titulariatEffectifFinal)
      : titulariatsEffectifs.length > 0;
    const elevesAutorises =
      acteurCodeActif === 'PARENT'
      && params.idEcoleActive
      && this.ownershipParentPort
        ? await this.ownershipParentPort.listerElevesAutorises({
            idUtilisateur: params.idUtilisateur,
            idEcole: params.idEcoleActive,
          })
        : [];

    return CapacitesEffectivesMapper.depuisCalcul({
      actorCodes,
      acteurCodeActif,
      permissions,
      scopes: scopes.map((scope) => ScopeMapper.depuisDomaine(scope)),
      restrictions,
      titulariatsActifs: titulariats.map((titulariat) => TitulariatMapper.depuisDomaine(titulariat)),
      titulariatsEffectifs,
      estTitulaireEffectif,
      sourceTitulariatEffectif:
        titulariatEffectifCible?.source
        ?? titulariatsEffectifs[0]?.source
        ?? 'AUCUNE',
      elevesAutorises,
    });
  }

  private resoudreTitulariatsEffectifs(params: {
    responsabilites: readonly ResponsabiliteClassePedagogiqueReadModel[];
    titulariats: readonly AffectationTitulariat[];
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole?: string;
  }): TitulariatEffectifReadModel[] {
    const effectifs: TitulariatEffectifReadModel[] = [];

    for (const responsabilite of params.responsabilites) {
      if (
        !responsabilite.active
        || responsabilite.idUtilisateurEnseignant !== params.idUtilisateur
        || (params.idOrganisation
          && responsabilite.idOrganisation !== params.idOrganisation)
        || (params.idEcole && responsabilite.idEcole !== params.idEcole)
      ) {
        continue;
      }

      const sectionAuto = PolicyTitulariatEffectifParSection.estSectionAutoTitulariat(
        responsabilite.sectionCode,
        responsabilite.sectionLibelle,
      );
      const titulariatExplicite = params.titulariats.some((titulariat) =>
        titulariat.obtenirIdUtilisateur() === params.idUtilisateur
        && titulariat.obtenirIdOrganisation() === responsabilite.idOrganisation
        && titulariat.obtenirIdEcole() === responsabilite.idEcole
        && titulariat.obtenirIdClasse() === responsabilite.idClassePedagogique
        && titulariat.obtenirIdAnneeScolaire() === responsabilite.idAnneeScolaire
        && titulariat.obtenirEstActif(),
      );
      if (!sectionAuto && !titulariatExplicite) {
        continue;
      }

      effectifs.push({
        idOrganisation: responsabilite.idOrganisation,
        idEcole: responsabilite.idEcole,
        idClasse: responsabilite.idClassePedagogique,
        idAnneeScolaire: responsabilite.idAnneeScolaire,
        idSectionScolaire: responsabilite.idSectionScolaire,
        source: sectionAuto ? 'RESPONSABILITE_CLASSE' : 'AFFECTATION_TITULARIAT',
      });
    }

    return effectifs;
  }

  private affectationCouvreContexte(
    affectation: AffectationUtilisateur,
    contexte: {
      idOrganisationActive?: string;
      idEcoleActive?: string;
    },
  ): boolean {
    const niveau = affectation.obtenirNiveauAcces().obtenirValeur();
    if (niveau === 'PLATEFORME') {
      return true;
    }

    if (niveau === 'ORGANISATION') {
      return Boolean(
        contexte.idOrganisationActive
        && affectation.obtenirIdOrganisation() === contexte.idOrganisationActive,
      );
    }

    return Boolean(
      contexte.idOrganisationActive
      && contexte.idEcoleActive
      && affectation.obtenirIdOrganisation() === contexte.idOrganisationActive
      && affectation.obtenirIdEcole() === contexte.idEcoleActive,
    );
  }

  private resoudreActeurActif(
    actorCodes: readonly string[],
    contexte: {
      idOrganisationActive?: string;
      idEcoleActive?: string;
      acteurCodePrefere?: string;
    },
  ): string | undefined {
    const prefere = contexte.acteurCodePrefere?.trim();
    if (prefere) {
      return actorCodes.includes(prefere) ? prefere : undefined;
    }

    // Les appels historiques qui ne portent pas encore l'acteur actif restent
    // compatibles uniquement lorsqu'un seul rôle couvre le contexte. Avec
    // plusieurs rôles, choisir implicitement reviendrait à élever les droits.
    return actorCodes.length === 1 ? actorCodes[0] : undefined;
  }

  private construireScopesContextualises(
    candidats: readonly { affectation: AffectationUtilisateur; role: Role }[],
    contexte: {
      idOrganisationActive?: string;
      idEcoleActive?: string;
    },
  ): ScopeAcces[] {
    const scopes = candidats.flatMap(({ affectation, role }) => {
      const scopesAffectation = [...affectation.obtenirScopes()];
      if (role.obtenirNiveauAcces().obtenirValeur() === 'PLATEFORME') {
        scopesAffectation.push(ScopeAcces.creer(new TypeScope('PLATEFORME'), 'system'));
      }
      if (affectation.obtenirIdOrganisation()) {
        scopesAffectation.push(
          ScopeAcces.creer(
            new TypeScope('ORGANISATION'),
            affectation.obtenirIdOrganisation() as string,
          ),
        );
      }
      if (affectation.obtenirIdEcole()) {
        scopesAffectation.push(
          ScopeAcces.creer(new TypeScope('ECOLE'), affectation.obtenirIdEcole() as string),
        );
      }
      if (affectation.obtenirIdSection()) {
        scopesAffectation.push(
          ScopeAcces.creer(new TypeScope('SECTION'), affectation.obtenirIdSection() as string),
        );
      }
      return scopesAffectation;
    });

    const uniques = new Map<string, ScopeAcces>();
    for (const scope of scopes) {
      const type = scope.obtenirTypeScope().obtenirValeur();
      const valeur = scope.obtenirValeurScope();
      if (type === 'ORGANISATION' && contexte.idOrganisationActive !== valeur) {
        continue;
      }
      if (type === 'ECOLE' && contexte.idEcoleActive !== valeur) {
        continue;
      }
      const cle = `${type}:${valeur}:${scope.obtenirEstLectureSeule()}`;
      uniques.set(cle, scope);
    }
    return [...uniques.values()];
  }
}
