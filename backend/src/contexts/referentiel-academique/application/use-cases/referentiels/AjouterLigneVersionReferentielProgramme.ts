import { UseCase } from '../../../../../shared/application/UseCase';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotMigrationReferentielProgramme } from '../../../domain/repositories/DepotMigrationReferentielProgramme';
import { DepotReferentielProgramme } from '../../../domain/repositories/DepotReferentielProgramme';
import { LigneReferentielProgramme } from '../../../domain/entities/LigneReferentielProgramme';
import { LigneReferentielProgrammeId } from '../../../domain/value-objects/LigneReferentielProgrammeId';
import { PonderationEvaluation, ProprietesPonderationEvaluation } from '../../../domain/value-objects/PonderationEvaluation';
import { ReferentielCoursId } from '../../../domain/value-objects/ReferentielCoursId';
import { SourceLigneProgramme } from '../../../domain/value-objects/SourceLigneProgramme';
import { AjouterLigneVersionReferentielProgrammeEntree } from '../../dto/input/AjouterLigneVersionReferentielProgrammeEntree';
import { VersionReferentielProgrammeSortie } from '../../dto/output/VersionReferentielProgrammeSortie';
import { VersionReferentielProgrammeApplicationMapper } from '../../mappers/VersionReferentielProgrammeApplicationMapper';
import {
  ServiceJournalAuditReferentielAcademique,
  ServiceJournalAuditReferentielAcademiqueSansEffet,
} from '../../services/ServiceJournalAuditReferentielAcademique';
import { SupportEditionVersionReferentiel } from './SupportEditionVersionReferentiel';

export interface SortieAjouterLigneVersionReferentielProgramme {
  versionReferentielProgramme: VersionReferentielProgrammeSortie;
}

// Ce cas d'usage orchestre l'ajout d'une ligne dans une version de travail officielle.
export class AjouterLigneVersionReferentielProgramme
  implements
    UseCase<
      AjouterLigneVersionReferentielProgrammeEntree,
      SortieAjouterLigneVersionReferentielProgramme
    >
{
  private readonly depotReferentielProgramme: DepotReferentielProgramme;
  private readonly supportEdition: SupportEditionVersionReferentiel;
  private readonly policyAudit: PolicyAudit;
  private readonly serviceJournalAudit: ServiceJournalAuditReferentielAcademique;

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
    entree: AjouterLigneVersionReferentielProgrammeEntree,
  ): Promise<SortieAjouterLigneVersionReferentielProgramme> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageAjout = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'AJOUTER_LIGNE_VERSION_REFERENTIEL_PROGRAMME',
      entreeValidee.ajouteePar,
      horodatageAjout,
    );

    const contexte = await this.supportEdition.chargerVersionEditable(
      entreeValidee.idVersionReferentielProgramme,
    );

    try {
      contexte.versionReferentielProgramme.ajouterLigne(
        new LigneReferentielProgramme(
          new LigneReferentielProgrammeId(),
          new ReferentielCoursId(entreeValidee.idReferentielCours),
          entreeValidee.ordreAffichage,
          entreeValidee.obligatoire,
          entreeValidee.aExamen,
          entreeValidee.estCalculable,
          entreeValidee.sourceLigne ?? SourceLigneProgramme.OFFICIEL,
          new PonderationEvaluation(entreeValidee.ponderation),
          entreeValidee.domaine,
          entreeValidee.sousDomaine,
        ),
        contexte.referentielProgramme.obtenirTypeStructureEvaluation(),
      );
    } catch (erreur) {
      throw this.supportEdition.convertirErreurEdition(erreur);
    }

    await this.depotReferentielProgramme.sauvegarder(contexte.referentielProgramme);
    await this.serviceJournalAudit.journaliser({
      action: 'AJOUTER_LIGNE_VERSION_REFERENTIEL_PROGRAMME',
      acteur: entreeValidee.ajouteePar,
      typeRessource: 'VersionReferentielProgramme',
      idRessource: contexte.idVersionReferentielProgramme.obtenirValeur(),
      details: {
        idReferentielProgramme: contexte.referentielProgramme.obtenirId().obtenirValeur(),
        idReferentielCours: entreeValidee.idReferentielCours,
        ordreAffichage: entreeValidee.ordreAffichage,
      },
      creeLe: horodatageAjout,
    });

    return {
      versionReferentielProgramme: VersionReferentielProgrammeApplicationMapper.versSortie(
        contexte.versionReferentielProgramme,
      ),
    };
  }

  private validerEntree(
    entree: AjouterLigneVersionReferentielProgrammeEntree,
  ): AjouterLigneVersionReferentielProgrammeEntree {
    if (entree === null || entree === undefined) {
      throw this.supportEdition.convertirErreurEdition(
        new Error(
          "L'entree du cas d'usage AjouterLigneVersionReferentielProgramme est obligatoire.",
        ),
      );
    }

    return {
      idVersionReferentielProgramme: this.supportEdition.validerTexteObligatoire(
        entree.idVersionReferentielProgramme,
        'idVersionReferentielProgramme',
      ),
      idReferentielCours: this.supportEdition.validerTexteObligatoire(
        entree.idReferentielCours,
        'idReferentielCours',
      ),
      ordreAffichage: this.validerEntierPositif(entree.ordreAffichage, 'ordreAffichage'),
      obligatoire: this.validerBooleen(entree.obligatoire, 'obligatoire'),
      aExamen: this.validerBooleen(entree.aExamen, 'aExamen'),
      estCalculable: this.validerBooleen(entree.estCalculable, 'estCalculable'),
      sourceLigne: this.validerSourceLigne(entree.sourceLigne),
      ponderation: this.validerPonderation(entree.ponderation),
      domaine: this.supportEdition.validerTexteOptionnel(entree.domaine),
      sousDomaine: this.supportEdition.validerTexteOptionnel(entree.sousDomaine),
      ajouteePar: this.supportEdition.validerTexteObligatoire(entree.ajouteePar, 'ajouteePar'),
    };
  }

  private validerBooleen(valeur: boolean, nomChamp: string): boolean {
    if (typeof valeur !== 'boolean') {
      throw this.supportEdition.convertirErreurEdition(
        new Error(`Le champ "${nomChamp}" doit etre un booleen.`),
      );
    }

    return valeur;
  }

  private validerEntierPositif(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw this.supportEdition.convertirErreurEdition(
        new Error(`Le champ "${nomChamp}" doit etre un entier strictement positif.`),
      );
    }

    return valeur;
  }

  private validerSourceLigne(valeur?: SourceLigneProgramme): SourceLigneProgramme | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    if (!Object.values(SourceLigneProgramme).includes(valeur)) {
      throw this.supportEdition.convertirErreurEdition(
        new Error('La source de ligne est invalide.'),
      );
    }

    return valeur;
  }

  private validerPonderation(
    valeur: ProprietesPonderationEvaluation,
  ): ProprietesPonderationEvaluation {
    if (typeof valeur !== 'object' || valeur === null) {
      throw this.supportEdition.convertirErreurEdition(
        new Error('La ponderation de ligne est obligatoire.'),
      );
    }

    return valeur;
  }
}
