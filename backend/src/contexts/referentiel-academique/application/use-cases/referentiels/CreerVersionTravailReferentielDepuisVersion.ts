import { UseCase } from '../../../../../shared/application/UseCase';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotMigrationReferentielProgramme } from '../../../domain/repositories/DepotMigrationReferentielProgramme';
import { DepotReferentielProgramme } from '../../../domain/repositories/DepotReferentielProgramme';
import { SourceReferentiel } from '../../../domain/value-objects/SourceReferentiel';
import { VersionReferentielProgrammeId } from '../../../domain/value-objects/VersionReferentielProgrammeId';
import { CreerVersionTravailReferentielDepuisVersionEntree } from '../../dto/input/CreerVersionTravailReferentielDepuisVersionEntree';
import { VersionReferentielProgrammeSortie } from '../../dto/output/VersionReferentielProgrammeSortie';
import { VersionReferentielProgrammeApplicationMapper } from '../../mappers/VersionReferentielProgrammeApplicationMapper';
import {
  ServiceJournalAuditReferentielAcademique,
  ServiceJournalAuditReferentielAcademiqueSansEffet,
} from '../../services/ServiceJournalAuditReferentielAcademique';
import { SupportEditionVersionReferentiel } from './SupportEditionVersionReferentiel';

export interface SortieCreerVersionTravailReferentielDepuisVersion {
  versionReferentielProgramme: VersionReferentielProgrammeSortie;
}

// Ce cas d'usage orchestre la creation d'une nouvelle version de travail depuis une version existante.
export class CreerVersionTravailReferentielDepuisVersion
  implements
    UseCase<
      CreerVersionTravailReferentielDepuisVersionEntree,
      SortieCreerVersionTravailReferentielDepuisVersion
    >
{
  private readonly depotReferentielProgramme: DepotReferentielProgramme;
  private readonly policyAudit: PolicyAudit;
  private readonly serviceJournalAudit: ServiceJournalAuditReferentielAcademique;
  private readonly supportEdition: SupportEditionVersionReferentiel;

  constructor(
    depotReferentielProgramme: DepotReferentielProgramme,
    depotMigrationReferentielProgramme?: DepotMigrationReferentielProgramme,
    policyAudit: PolicyAudit = new PolicyAudit(),
    serviceJournalAudit: ServiceJournalAuditReferentielAcademique =
      new ServiceJournalAuditReferentielAcademiqueSansEffet(),
  ) {
    this.depotReferentielProgramme = depotReferentielProgramme;
    this.supportEdition = new SupportEditionVersionReferentiel(
      depotReferentielProgramme,
      depotMigrationReferentielProgramme,
    );
    this.policyAudit = policyAudit;
    this.serviceJournalAudit = serviceJournalAudit;
  }

  public async executer(
    entree: CreerVersionTravailReferentielDepuisVersionEntree,
  ): Promise<SortieCreerVersionTravailReferentielDepuisVersion> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageCreation = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'CREER_VERSION_TRAVAIL_REFERENTIEL',
      entreeValidee.creePar,
      horodatageCreation,
    );

    const idVersionSource = new VersionReferentielProgrammeId(entreeValidee.idVersionSource);
    const referentielProgramme = await this.depotReferentielProgramme.trouverParIdVersion(idVersionSource);

    if (referentielProgramme === null) {
      throw this.supportEdition.convertirErreurEdition(
        new Error("La version source de referentiel est introuvable."),
      );
    }

    const versionSource = referentielProgramme.trouverVersionParId(idVersionSource);

    if (versionSource === null) {
      throw this.supportEdition.convertirErreurEdition(
        new Error("La version source de referentiel n'appartient a aucun referentiel charge."),
      );
    }

    const versionTravail = referentielProgramme.creerVersionTravailDepuisVersion(
      idVersionSource,
      {
        idVersionReferentielProgramme: new VersionReferentielProgrammeId(),
        codeVersion: entreeValidee.codeVersion,
        anneeReference: entreeValidee.anneeReference,
        datePublication: entreeValidee.datePublication,
        sourceImport: entreeValidee.sourceImport,
        motifPublication: entreeValidee.motifPublication,
        creeLe: horodatageCreation,
      },
    );

    await this.depotReferentielProgramme.sauvegarder(referentielProgramme);
    await this.serviceJournalAudit.journaliser({
      action: 'CREER_VERSION_TRAVAIL_REFERENTIEL',
      acteur: entreeValidee.creePar,
      typeRessource: 'VersionReferentielProgramme',
      idRessource: versionTravail.obtenirId().obtenirValeur(),
      details: {
        idReferentielProgramme: referentielProgramme.obtenirId().obtenirValeur(),
        idVersionSource: versionSource.obtenirId().obtenirValeur(),
        codeVersion: versionTravail.obtenirCodeVersion(),
      },
      creeLe: horodatageCreation,
    });

    return {
      versionReferentielProgramme: VersionReferentielProgrammeApplicationMapper.versSortie(
        versionTravail,
      ),
    };
  }

  private validerEntree(
    entree: CreerVersionTravailReferentielDepuisVersionEntree,
  ): CreerVersionTravailReferentielDepuisVersionEntree {
    if (entree === null || entree === undefined) {
      throw this.supportEdition.convertirErreurEdition(
        new Error(
          "L'entree du cas d'usage CreerVersionTravailReferentielDepuisVersion est obligatoire.",
        ),
      );
    }

    return {
      idVersionSource: this.supportEdition.validerTexteObligatoire(
        entree.idVersionSource,
        'idVersionSource',
      ),
      codeVersion: this.supportEdition.validerTexteObligatoire(entree.codeVersion, 'codeVersion'),
      anneeReference: this.supportEdition.validerTexteObligatoire(
        entree.anneeReference,
        'anneeReference',
      ),
      datePublication: this.validerDate(entree.datePublication, 'datePublication'),
      sourceImport: this.validerSourceImport(entree.sourceImport),
      motifPublication: this.supportEdition.validerTexteOptionnel(entree.motifPublication),
      creePar: this.supportEdition.validerTexteObligatoire(entree.creePar, 'creePar'),
    };
  }

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw this.supportEdition.convertirErreurEdition(
        new Error(`Le champ "${nomChamp}" doit etre une date valide.`),
      );
    }

    return new Date(valeur.getTime());
  }

  private validerSourceImport(valeur?: SourceReferentiel): SourceReferentiel | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    if (!Object.values(SourceReferentiel).includes(valeur)) {
      throw this.supportEdition.convertirErreurEdition(
        new Error("La source d'import de la version est invalide."),
      );
    }

    return valeur;
  }
}
