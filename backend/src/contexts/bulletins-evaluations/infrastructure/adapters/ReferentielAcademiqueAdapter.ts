import { ContexteTenant } from 'shared/tenancy/TenantContext';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { TypeStructureEvaluation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';
import type {
  CodeColonneBulletin as CodeColonneBulletinType,
} from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import type {
  CoursProgrammeDTO,
  CoursReferentielDTO,
  ProgrammeNiveauDTO,
  ReferenceProgrammeNiveauDTO,
  ReferentielAcademiquePort,
} from 'contexts/bulletins-evaluations/application/ports/out/ReferentielAcademiquePort';
import {
  DepotAnneeScolairePostgres,
  DepotEcolePostgres,
  DepotProgrammeNiveauPostgres,
  DepotReferentielCoursPostgres,
  DepotReferentielProgrammePostgres,
  creerInfrastructurePostgresReferentielAcademique,
} from 'contexts/referentiel-academique/infrastructure/persistence/postgres';
import { AnneeScolaireId } from 'contexts/referentiel-academique/domain/value-objects/AnneeScolaireId';
import { EcoleId } from 'contexts/referentiel-academique/domain/value-objects/EcoleId';
import { ContexteExecutionTenantReferentielAcademique } from 'contexts/referentiel-academique/infrastructure/tenancy/ContexteExecutionTenantReferentielAcademique';
import { ProgrammeNiveauId } from 'contexts/referentiel-academique/domain/value-objects/ProgrammeNiveauId';
import { ReferentielCoursId } from 'contexts/referentiel-academique/domain/value-objects/ReferentielCoursId';
import { ClasseAcademiqueId } from 'contexts/referentiel-academique/domain/value-objects/ClasseAcademiqueId';
import { DepotClasseAcademiquePostgres } from 'contexts/referentiel-academique/infrastructure/persistence/postgres';

interface LigneProgrammeLecture {
  idReferentielCours: string;
  ordreAffichage: number;
  estCalculable: boolean;
  aExamen: boolean;
  domaine?: string;
  sousDomaine?: string;
}

interface ProgrammeNiveauLecture {
  idProgrammeNiveau: string;
  idClasseAcademique: string;
  typeStructureEvaluation: TypeStructureEvaluation;
  versionReferentielProgramme: string;
  statutProgrammeNiveau: 'BROUILLON' | 'VALIDE' | 'ARCHIVE';
  estClasseEXETAT: boolean;
  estClasseFinaliste: boolean;
  lignes: readonly LigneProgrammeLecture[];
}

interface EcoleLecture {
  id: string;
  code: string;
  nom: string;
  sigle?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  provinceEducationnelle?: string;
  ville?: string;
  communeOuTerritoire?: string;
}

interface AnneeScolaireLecture {
  id: string;
  code: string;
  libelle: string;
}

export interface ReferentielAcademiqueLectureRepository {
  consulterProgrammeNiveau(
    referenceProgramme: ReferenceProgrammeNiveauDTO,
  ): Promise<ProgrammeNiveauLecture | null>;
  consulterCours(idReferentielCours: string): Promise<CoursReferentielDTO | null>;
  consulterEcole(idEcole: string): Promise<EcoleLecture | null>;
  consulterAnneeScolaire(idAnneeScolaire: string): Promise<AnneeScolaireLecture | null>;
  fermer?(): Promise<void>;
}

class ReferentielAcademiquePostgresLectureRepository
  implements ReferentielAcademiqueLectureRepository
{
  private readonly contexteExecutionTenant = new ContexteExecutionTenantReferentielAcademique();
  private readonly infrastructure = creerInfrastructurePostgresReferentielAcademique(
    undefined,
    undefined,
    this.contexteExecutionTenant,
  );
  private readonly depotProgrammeNiveau = new DepotProgrammeNiveauPostgres(
    this.infrastructure.clientLecture,
    this.infrastructure.uniteDeTravail,
    this.contexteExecutionTenant,
  );
  private readonly depotClasseAcademique = new DepotClasseAcademiquePostgres(
    this.infrastructure.clientLecture,
    this.infrastructure.uniteDeTravail,
    this.contexteExecutionTenant,
  );
  private readonly depotEcole = new DepotEcolePostgres(
    this.infrastructure.clientLecture,
    this.infrastructure.uniteDeTravail,
    this.contexteExecutionTenant,
  );
  private readonly depotAnneeScolaire = new DepotAnneeScolairePostgres(
    this.infrastructure.clientLecture,
    this.infrastructure.uniteDeTravail,
    this.contexteExecutionTenant,
  );
  private readonly depotReferentielCours = new DepotReferentielCoursPostgres(
    this.infrastructure.clientLecture,
    this.infrastructure.uniteDeTravail,
    this.contexteExecutionTenant,
  );
  private readonly depotReferentielProgramme = new DepotReferentielProgrammePostgres(
    this.infrastructure.clientLecture,
    this.infrastructure.uniteDeTravail,
    this.contexteExecutionTenant,
  );
  private estFerme = false;

  public async consulterProgrammeNiveau(
    referenceProgramme: ReferenceProgrammeNiveauDTO,
  ): Promise<ProgrammeNiveauLecture | null> {
    const contexteTenant = new ContexteTenant();
    contexteTenant.definirTenant(referenceProgramme.idEcole);

    return this.contexteExecutionTenant.executerAvecContexte(contexteTenant, async () => {
      const programmeNiveau = await this.depotProgrammeNiveau.trouverParId(
        new ProgrammeNiveauId(referenceProgramme.idProgrammeNiveau),
      );

      if (programmeNiveau === null) {
        return null;
      }

      const referentielProgramme = await this.depotReferentielProgramme.trouverParId(
        programmeNiveau.obtenirReferentielProgrammeId(),
      );

      if (referentielProgramme === null) {
        throw new Error(
          `Le referentiel programme source du programme niveau "${referenceProgramme.idProgrammeNiveau}" est introuvable.`,
        );
      }

      const classeAcademique = await this.depotClasseAcademique.trouverParId(
        programmeNiveau.obtenirClasseAcademiqueId(),
      );

      if (classeAcademique === null) {
        throw new Error(
          `La classe academique source du programme niveau "${referenceProgramme.idProgrammeNiveau}" est introuvable.`,
        );
      }

      const versionReference = referentielProgramme.trouverVersionParId(
        programmeNiveau.obtenirVersionReferentielProgrammeId(),
      ) ?? referentielProgramme.obtenirVersionActive();
      const classificationParCours = new Map(
        (versionReference?.obtenirLignes() ?? []).map((ligne) => ([
          ligne.obtenirReferentielCoursId().obtenirValeur(),
          {
            domaine: ligne.obtenirDomaine(),
            sousDomaine: ligne.obtenirSousDomaine(),
          },
        ])),
      );

      return {
        idProgrammeNiveau: programmeNiveau.obtenirId().obtenirValeur(),
        idClasseAcademique: programmeNiveau.obtenirClasseAcademiqueId().obtenirValeur(),
        typeStructureEvaluation: referentielProgramme.obtenirTypeStructureEvaluation() as TypeStructureEvaluation,
        versionReferentielProgramme: programmeNiveau.obtenirVersionReferentielProgrammeId().obtenirValeur(),
        statutProgrammeNiveau: programmeNiveau.obtenirStatut(),
        estClasseEXETAT: classeAcademique.estClasseEXETAT(),
        estClasseFinaliste: classeAcademique.estClasseFinaliste(),
        lignes: programmeNiveau.obtenirLignes()
          .map((ligne) => ({
            idReferentielCours: ligne.obtenirReferentielCoursId().obtenirValeur(),
            ordreAffichage: ligne.obtenirOrdreAffichage(),
            estCalculable: ligne.estCalculableDansProgramme(),
            aExamen: ligne.aExamenAssocie(),
            domaine: classificationParCours.get(ligne.obtenirReferentielCoursId().obtenirValeur())?.domaine,
            sousDomaine: classificationParCours.get(ligne.obtenirReferentielCoursId().obtenirValeur())?.sousDomaine,
          }))
          .sort((a, b) => a.ordreAffichage - b.ordreAffichage),
      };
    });
  }

  public async consulterCours(idReferentielCours: string): Promise<CoursReferentielDTO | null> {
    const cours = await this.depotReferentielCours.trouverParId(
      new ReferentielCoursId(idReferentielCours),
    );

    if (cours === null) {
      return null;
    }

    return {
      idReferentielCours: cours.obtenirId().obtenirValeur(),
      codeCours: cours.obtenirCode(),
      libelleCours: cours.obtenirLibelle(),
      estCalculable: true,
      aExamen: true,
    };
  }

  public async consulterEcole(idEcole: string): Promise<EcoleLecture | null> {
    const ecole = await this.depotEcole.trouverParId(new EcoleId(idEcole));

    if (ecole === null) {
      return null;
    }

    return {
      id: ecole.obtenirId().obtenirValeur(),
      code: ecole.obtenirCode(),
      nom: ecole.obtenirNom(),
      sigle: ecole.obtenirSigle() ?? undefined,
      adresse: ecole.obtenirAdresse() ?? undefined,
      telephone: ecole.obtenirTelephone() ?? undefined,
      email: ecole.obtenirEmail() ?? undefined,
      provinceEducationnelle: ecole.obtenirProvinceEducationnelle() ?? undefined,
      ville: ecole.obtenirVille() ?? undefined,
      communeOuTerritoire: ecole.obtenirCommuneOuTerritoire() ?? undefined,
    };
  }

  public async consulterAnneeScolaire(idAnneeScolaire: string): Promise<AnneeScolaireLecture | null> {
    const anneeScolaire = await this.depotAnneeScolaire.trouverParId(
      new AnneeScolaireId(idAnneeScolaire),
    );

    if (anneeScolaire === null) {
      return null;
    }

    return {
      id: anneeScolaire.obtenirId().obtenirValeur(),
      code: anneeScolaire.obtenirCode(),
      libelle: anneeScolaire.obtenirLibelle(),
    };
  }

  public async fermer(): Promise<void> {
    if (this.estFerme) {
      return;
    }

    this.estFerme = true;
    await this.infrastructure.pool.end();
  }
}

// Ce fichier isole la lecture du BC Referentiel Academique depuis l'infrastructure bulletins.
export class ReferentielAcademiqueAdapter implements ReferentielAcademiquePort {
  constructor(
    private readonly repository: ReferentielAcademiqueLectureRepository =
      new ReferentielAcademiquePostgresLectureRepository(),
  ) {}

  public async consulterCours(idReferentielCours: string): Promise<CoursReferentielDTO | null> {
    return this.repository.consulterCours(idReferentielCours);
  }

  public async consulterProgrammeNiveau(
    referenceProgramme: ReferenceProgrammeNiveauDTO,
  ): Promise<ProgrammeNiveauDTO | null> {
    const programme = await this.repository.consulterProgrammeNiveau(referenceProgramme);

    if (programme === null) {
      return null;
    }

    return {
      idProgrammeNiveau: programme.idProgrammeNiveau,
      idClasseAcademique: programme.idClasseAcademique,
      typeStructureEvaluation: programme.typeStructureEvaluation,
      versionReferentielProgramme: programme.versionReferentielProgramme,
      statutProgrammeNiveau: programme.statutProgrammeNiveau,
      estClasseEXETAT: programme.estClasseEXETAT,
      estClasseFinaliste: programme.estClasseFinaliste,
    };
  }

  public async listerCoursProgramme(
    referenceProgramme: ReferenceProgrammeNiveauDTO,
  ): Promise<CoursProgrammeDTO[]> {
    const programme = await this.repository.consulterProgrammeNiveau(referenceProgramme);

    if (programme === null) {
      return [];
    }

    const cours = await Promise.all(programme.lignes.map(async (ligne) => {
      const coursReferentiel = await this.repository.consulterCours(ligne.idReferentielCours);

      if (coursReferentiel === null) {
        throw new Error(
          `Le cours "${ligne.idReferentielCours}" reference par le programme niveau "${referenceProgramme.idProgrammeNiveau}" est introuvable.`,
        );
      }

      return {
        idReferentielCours: coursReferentiel.idReferentielCours,
        codeCours: coursReferentiel.codeCours,
        libelleCours: coursReferentiel.libelleCours,
        ordreAffichage: ligne.ordreAffichage,
        estCalculable: ligne.estCalculable,
        aExamen: ligne.aExamen,
        domaine: ligne.domaine,
        sousDomaine: ligne.sousDomaine,
      };
    }));

    return cours.sort((a, b) => a.ordreAffichage - b.ordreAffichage);
  }

  public async listerColonnesAutorisees(
    typeStructureEvaluation: TypeStructureEvaluation,
  ): Promise<CodeColonneBulletinType[]> {
    return determinerColonnesAutorisees(typeStructureEvaluation);
  }

  public async consulterEcole(idEcole: string) {
    return await this.repository.consulterEcole(idEcole);
  }

  public async consulterAnneeScolaire(idAnneeScolaire: string) {
    return await this.repository.consulterAnneeScolaire(idAnneeScolaire);
  }

  public async fermer(): Promise<void> {
    await this.repository.fermer?.();
  }
}

function determinerColonnesAutorisees(
  typeStructureEvaluation: TypeStructureEvaluation,
): CodeColonneBulletinType[] {
  if (typeStructureEvaluation === TypeStructureEvaluation.SEMESTRIEL) {
    return [
      CodeColonneBulletin.P1,
      CodeColonneBulletin.P2,
      CodeColonneBulletin.EX1,
      CodeColonneBulletin.TOTAL_S1,
      CodeColonneBulletin.P3,
      CodeColonneBulletin.P4,
      CodeColonneBulletin.EX2,
      CodeColonneBulletin.TOTAL_S2,
      CodeColonneBulletin.TOTAL_GENERAL,
    ];
  }

  return [
    CodeColonneBulletin.P1,
    CodeColonneBulletin.P2,
    CodeColonneBulletin.EX1,
    CodeColonneBulletin.TOTAL_T1,
    CodeColonneBulletin.P3,
    CodeColonneBulletin.P4,
    CodeColonneBulletin.EX2,
    CodeColonneBulletin.TOTAL_T2,
    CodeColonneBulletin.P5,
    CodeColonneBulletin.P6,
    CodeColonneBulletin.EX3,
    CodeColonneBulletin.TOTAL_T3,
    CodeColonneBulletin.TOTAL_GENERAL,
  ];
}
