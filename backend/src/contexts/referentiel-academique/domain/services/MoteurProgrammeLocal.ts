import { ProgrammeNiveau, type EtatLocalProgrammeNiveau } from '../aggregates/ProgrammeNiveau';
import { ReferentielProgramme } from '../aggregates/ReferentielProgramme';
import { VersionReferentielProgramme } from '../aggregates/VersionReferentielProgramme';
import { LigneProgrammeNiveau } from '../entities/LigneProgrammeNiveau';
import { LigneReferentielProgramme } from '../entities/LigneReferentielProgramme';
import { ErreurMigrationProgrammeImpossible } from '../exceptions/ErreurMigrationProgrammeImpossible';
import { ErreurProgrammeNiveauInvalide } from '../exceptions/ErreurProgrammeNiveauInvalide';
import { ErreurValidationProgrammeImpossible } from '../exceptions/ErreurValidationProgrammeImpossible';
import { AnneeScolaireId } from '../value-objects/AnneeScolaireId';
import { ClasseAcademiqueId } from '../value-objects/ClasseAcademiqueId';
import { EcoleId } from '../value-objects/EcoleId';
import { LigneProgrammeNiveauId } from '../value-objects/LigneProgrammeNiveauId';
import { PonderationEvaluation } from '../value-objects/PonderationEvaluation';
import { ReferentielCoursId } from '../value-objects/ReferentielCoursId';
import { SourceLigneProgramme } from '../value-objects/SourceLigneProgramme';
import { StatutProgrammeNiveau } from '../value-objects/StatutProgrammeNiveau';

// Cet ajustement decrit une adaptation locale appliquee a une ligne de programme.
export interface AjustementLocalLigneProgramme {
  referentielCoursId: ReferentielCoursId;
  creerSiAbsent?: boolean;
  ordreAffichage?: number;
  obligatoire?: boolean;
  aExamen?: boolean;
  estActifDansEcole?: boolean;
  estCalculable?: boolean;
  obsolete?: boolean;
  sourceLigne?: SourceLigneProgramme;
  ponderation?: PonderationEvaluation;
}

// Ce moteur gere le cycle de vie local d'un programme applique dans une ecole.
export class MoteurProgrammeLocal {
  // Cette methode initialise un programme local depuis son referentiel officiel.
  public initialiserDepuisReferentiel(
    programmeNiveau: ProgrammeNiveau,
    referentielProgramme: ReferentielProgramme,
    versionReferentielProgramme?: VersionReferentielProgramme,
  ): void {
    this.verifierCompatibiliteProgrammeEtReferentiel(programmeNiveau, referentielProgramme);
    const versionSource = versionReferentielProgramme
      ?? referentielProgramme.obtenirVersionActive()
      ?? referentielProgramme.obtenirVersionsReferentielProgramme()[0]
      ?? null;

    if (versionSource === null) {
      throw new ErreurProgrammeNiveauInvalide(
        'Le referentiel officiel doit exposer une version exploitable pour initialiser un programme local.',
      );
    }

    versionSource.verifierCoherenceDesLignes(referentielProgramme.obtenirTypeStructureEvaluation());
    programmeNiveau.initialiserDepuisReferentiel(versionSource.obtenirLignes());
  }

  // Cette methode adapte localement des lignes officielles en respectant le cadre du domaine.
  public adapterLocalement(
    lignesReferentiel: readonly LigneReferentielProgramme[],
    ajustements: readonly AjustementLocalLigneProgramme[] = [],
  ): LigneProgrammeNiveau[] {
    const ajustementsParCours = new Map<string, AjustementLocalLigneProgramme>();

    for (const ajustement of ajustements) {
      ajustementsParCours.set(ajustement.referentielCoursId.obtenirValeur(), ajustement);
    }

    const lignesLocales = lignesReferentiel.map((ligne) => {
      const cleCours = ligne.obtenirReferentielCoursId().obtenirValeur();
      const ajustement = ajustementsParCours.get(cleCours);

      if (ajustement !== undefined) {
        ajustementsParCours.delete(cleCours);
      }

      return new LigneProgrammeNiveau(
        new LigneProgrammeNiveauId(),
        ligne.obtenirReferentielCoursId(),
        ajustement?.ordreAffichage ?? ligne.obtenirOrdreAffichage(),
        ajustement?.obligatoire ?? ligne.estObligatoire(),
        ajustement?.aExamen ?? ligne.aExamenAssocie(),
        ajustement?.estActifDansEcole ?? true,
        ajustement?.estCalculable ?? ligne.estCalculableDansProgramme(),
        ajustement?.obsolete ?? false,
        ajustement?.sourceLigne ?? ligne.obtenirSourceLigne(),
        ajustement?.ponderation ?? ligne.obtenirPonderation(),
      );
    });

    for (const ajustement of ajustementsParCours.values()) {
      if (ajustement.creerSiAbsent !== true) {
        throw new ErreurProgrammeNiveauInvalide(
          "Un ajustement local ne peut pas cibler un cours absent sans creation explicite.",
        );
      }

      lignesLocales.push(this.creerLigneLocaleDepuisAjustement(ajustement));
    }

    return lignesLocales;
  }

  // Cette methode valide un programme local et retourne son etat consolide.
  public validerProgramme(
    programmeNiveau: ProgrammeNiveau,
    referentielProgramme: ReferentielProgramme,
    validePar?: string,
  ): EtatLocalProgrammeNiveau {
    this.verifierCompatibiliteProgrammeEtReferentiel(programmeNiveau, referentielProgramme);

    try {
      programmeNiveau.verifierCoherenceLocale(
        referentielProgramme.obtenirTypeStructureEvaluation(),
      );
      programmeNiveau.valider(validePar);
    } catch (erreur) {
      const message = erreur instanceof Error
        ? erreur.message
        : 'La validation du programme local a echoue.';

      throw new ErreurValidationProgrammeImpossible(message);
    }

    return programmeNiveau.produireEtatLocal();
  }

  // Cette methode verifie qu'un seul programme local valide existe par tuple ecole, annee et classe.
  public verifierUniciteProgrammeActif(
    programmes: readonly ProgrammeNiveau[],
    ecoleId: EcoleId,
    anneeScolaireId: AnneeScolaireId,
    classeAcademiqueId: ClasseAcademiqueId,
  ): void {
    const programmesValides = programmes.filter(
      (programme) =>
        programme.obtenirStatut() === StatutProgrammeNiveau.VALIDE
        && programme.obtenirEcoleId().estEgal(ecoleId)
        && programme.obtenirAnneeScolaireId().estEgal(anneeScolaireId)
        && programme.obtenirClasseAcademiqueId().estEgal(classeAcademiqueId),
    );

    if (programmesValides.length > 1) {
      throw new ErreurProgrammeNiveauInvalide(
        'Un seul programme local valide est autorise pour une meme ecole, annee et classe academique.',
      );
    }
  }

  // Cette methode retourne l'etat local deja consolide par l'agregat ProgrammeNiveau.
  public produireEtatLocal(programmeNiveau: ProgrammeNiveau): EtatLocalProgrammeNiveau {
    return programmeNiveau.produireEtatLocal();
  }

  // Cette methode prepare une migration locale vers un nouveau referentiel officiel.
  public migrerVersNouvelleVersion(
    programmeNiveau: ProgrammeNiveau,
    referentielProgramme: ReferentielProgramme,
    lignesLocales: readonly LigneProgrammeNiveau[],
  ): void {
    try {
      programmeNiveau.migrerVersNouvelleVersion(
        referentielProgramme.obtenirId(),
        programmeNiveau.obtenirVersionReferentielProgrammeId(),
        [...lignesLocales],
      );
    } catch (erreur) {
      const message = erreur instanceof Error
        ? erreur.message
        : 'La migration du programme local a echoue.';

      throw new ErreurMigrationProgrammeImpossible(message);
    }
  }

  private verifierCompatibiliteProgrammeEtReferentiel(
    programmeNiveau: ProgrammeNiveau,
    referentielProgramme: ReferentielProgramme,
  ): void {
    if (!programmeNiveau.obtenirReferentielProgrammeId().estEgal(referentielProgramme.obtenirId())) {
      throw new ErreurProgrammeNiveauInvalide(
        'Le programme local doit etre rattache au referentiel officiel attendu.',
      );
    }

    if (
      !programmeNiveau
        .obtenirClasseAcademiqueId()
        .estEgal(referentielProgramme.obtenirClasseAcademiqueId())
    ) {
      throw new ErreurProgrammeNiveauInvalide(
        'Le programme local et le referentiel officiel doivent viser la meme classe academique.',
      );
    }
  }

  private creerLigneLocaleDepuisAjustement(
    ajustement: AjustementLocalLigneProgramme,
  ): LigneProgrammeNiveau {
    if (
      ajustement.ordreAffichage === undefined
      || ajustement.obligatoire === undefined
      || ajustement.aExamen === undefined
      || ajustement.estCalculable === undefined
      || ajustement.ponderation === undefined
    ) {
      throw new ErreurProgrammeNiveauInvalide(
        'Une ligne locale creee hors referentiel doit fournir ordre, obligation, examen, calcul et ponderation.',
      );
    }

    return new LigneProgrammeNiveau(
      new LigneProgrammeNiveauId(),
      ajustement.referentielCoursId,
      ajustement.ordreAffichage,
      ajustement.obligatoire,
      ajustement.aExamen,
      ajustement.estActifDansEcole ?? true,
      ajustement.estCalculable,
      ajustement.obsolete ?? false,
      ajustement.sourceLigne ?? SourceLigneProgramme.AJOUT_ETAT,
      ajustement.ponderation,
    );
  }
}
