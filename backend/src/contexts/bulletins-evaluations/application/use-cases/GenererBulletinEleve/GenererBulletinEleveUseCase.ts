import { BlocApplicationConduite } from '../../../domain/entities/BlocApplicationConduite';
import { LigneBulletinEleve } from '../../../domain/entities/LigneBulletinEleve';
import type { BulletinEleve } from '../../../domain/aggregates/BulletinEleve';
import type { DepotFicheCotationEleveCours } from '../../../domain/repositories/DepotFicheCotationEleveCours';
import type { DepotBulletinEleve } from '../../../domain/repositories/DepotBulletinEleve';
import type { DepotResultatBulletinEleve } from '../../../domain/repositories/DepotResultatBulletinEleve';
import type { GenererBulletinEleveInput } from '../../dto/input/GenererBulletinEleveInput';
import type { BulletinEleveOutput } from '../../dto/output/BulletinEleveOutput';
import { GenerationBulletinException } from '../../exceptions/GenerationBulletinException';
import type { BulletinPdfPort } from '../../ports/out/BulletinPdfPort';
import type { AutorisationGenerationBulletinPort } from '../../ports/out/AutorisationGenerationBulletinPort';
import type { CacheBulletinPort } from '../../ports/out/CacheBulletinPort';
import type { EventBusPort } from '../../ports/out/EventBusPort';
import type { ReferentielAcademiquePort } from '../../ports/out/ReferentielAcademiquePort';
import type { TransactionManagerPort } from '../../ports/out/TransactionManagerPort';
import { ErreurProgrammeNonValide } from '../../exceptions/ErreurProgrammeNonValide';
import { ServiceAuditBulletin } from '../../services/ServiceAuditBulletin';
import { ServiceCacheBulletin } from '../../services/ServiceCacheBulletin';
import { ServiceGenerationBulletin } from '../../services/ServiceGenerationBulletin';
import { ServiceProjectionLecture } from '../../services/ServiceProjectionLecture';
import { estColonneTotalBulletin } from '../../../domain/value-objects/CodeColonneBulletin';

// Ce use case orchestre la generation applicative d'un bulletin eleve.
export class GenererBulletinEleveUseCase {
  constructor(
    private readonly depotBulletin: DepotBulletinEleve,
    private readonly depotResultat: DepotResultatBulletinEleve,
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly referentielAcademiquePort: ReferentielAcademiquePort,
    private readonly autorisationGenerationBulletinPort: AutorisationGenerationBulletinPort,
    private readonly serviceGenerationBulletin = new ServiceGenerationBulletin(),
    private readonly serviceProjectionLecture = new ServiceProjectionLecture(),
    private readonly serviceAuditBulletin = new ServiceAuditBulletin(),
    private readonly serviceCacheBulletin = new ServiceCacheBulletin(),
    private readonly bulletinPdfPort?: BulletinPdfPort,
    cachePort?: CacheBulletinPort,
    private readonly eventBusPort?: EventBusPort,
    private readonly depotFicheCotation?: DepotFicheCotationEleveCours,
  ) {
    this.serviceCacheBulletin = new ServiceCacheBulletin(cachePort);
  }

  // Cette methode genere le bulletin puis renvoie sa projection.
  public async executer(input: GenererBulletinEleveInput): Promise<BulletinEleveOutput> {
    return this.transactionManagerPort.executer(async () => {
      const bulletin = await this.depotBulletin.trouverVersionActive(input.idEleve, input.idInscriptionScolaire, input.idAnneeScolaire);
      if (bulletin === null) {
        throw new GenerationBulletinException('Le bulletin actif de cet eleve est introuvable.');
      }

      await this.verifierAutorisation(input, bulletin);

      const resultat = await this.depotResultat.trouverParEleveInscription(input.idEleve, input.idInscriptionScolaire);
      if (resultat === null) {
        throw new GenerationBulletinException('Le resultat consolide necessaire au bulletin est introuvable.');
      }

      if (bulletin.obtenirIdInscriptionScolaire() !== resultat.obtenirIdInscriptionScolaire()) {
        throw new GenerationBulletinException(
          'Le bulletin actif et le resultat consolide ne referencent pas la meme inscription scolaire.',
        );
      }

      if (bulletin.obtenirIdEcole() !== resultat.obtenirIdEcole()) {
        throw new GenerationBulletinException(
          'Le bulletin actif et le resultat consolide ne referencent pas la meme ecole.',
        );
      }

      if (bulletin.obtenirIdClassePedagogique() !== resultat.obtenirIdClassePedagogique()) {
        throw new GenerationBulletinException(
          'Le bulletin actif et le resultat consolide ne referencent pas la meme classe pedagogique.',
        );
      }

      if (bulletin.obtenirIdAnneeScolaire() !== resultat.obtenirIdAnneeScolaire()) {
        throw new GenerationBulletinException(
          'Le bulletin actif et le resultat consolide ne referencent pas la meme annee scolaire.',
        );
      }

      if (bulletin.obtenirIdProgrammeNiveau() !== resultat.obtenirIdProgrammeNiveau()) {
        throw new GenerationBulletinException(
          'Le bulletin actif et le resultat consolide ne referencent pas le meme programme niveau.',
        );
      }

      if (bulletin.obtenirVersionReferentielProgramme() !== resultat.obtenirVersionReferentielProgramme()) {
        throw new GenerationBulletinException(
          'Le bulletin actif et le resultat consolide ne referencent pas la meme version de referentiel programme.',
        );
      }

      const referenceProgramme = {
        idProgrammeNiveau: bulletin.obtenirIdProgrammeNiveau(),
        idEcole: bulletin.obtenirIdEcole(),
      };
      const programme = await this.lireProgramme(referenceProgramme);
      if (programme.versionReferentielProgramme !== bulletin.obtenirVersionReferentielProgramme()) {
        throw new GenerationBulletinException(
          'Le programme niveau local ne reference pas la meme version de referentiel que le bulletin actif.',
        );
      }
      const cours = await this.lireCoursProgramme(referenceProgramme);
      const fichesParCours = await this.lireFichesParCours(input.idEleve, input.idAnneeScolaire);
      const lignes = cours.map((coursProgramme, index) => new LigneBulletinEleve({
        idLigneBulletinEleve: `${bulletin.obtenirId()}-ligne-${index + 1}`,
        idReferentielCours: coursProgramme.idReferentielCours,
        libelleCours: coursProgramme.libelleCours,
        ordreAffichage: coursProgramme.ordreAffichage,
        estCalculable: coursProgramme.estCalculable,
        aExamen: coursProgramme.aExamen,
      }));
      for (const ligne of lignes) {
        const fiche = fichesParCours.get(ligne.obtenirIdReferentielCours());
        if (!fiche) {
          continue;
        }

        for (const cote of fiche.obtenirCotesColonnes()) {
          const codeColonne = cote.obtenirCodeColonne();
          ligne.definirMaximum(codeColonne, cote.obtenirMaximumColonne());

          if (estColonneTotalBulletin(codeColonne)) {
            ligne.definirTotal(codeColonne, cote.obtenirCoteObtenue());
          } else {
            ligne.definirCote(codeColonne, cote.obtenirCoteObtenue());
          }

          const style = cote.obtenirStyleAffichage();
          if (style !== undefined) {
            ligne.definirStyle(codeColonne, style);
          }
        }
      }
      const blocs = resultat.obtenirApplicationsPeriodes().map((application, index) => new BlocApplicationConduite({
        idBlocApplicationConduite: `${bulletin.obtenirId()}-bloc-${index + 1}`,
        codePeriode: application.obtenirCodePeriode(),
        application: application.obtenirMentionApplication(),
        conduite: resultat.obtenirConduitesPeriodes().find((conduite) => conduite.obtenirCodePeriode() === application.obtenirCodePeriode())?.obtenirMentionConduite(),
        pointsConduite: resultat.obtenirConduitesPeriodes().find((conduite) => conduite.obtenirCodePeriode() === application.obtenirCodePeriode())?.obtenirPointsConduite(),
      }));

      this.serviceGenerationBulletin.generer(bulletin, lignes, blocs, input.idUtilisateur, input.typeGeneration);
      await this.depotBulletin.sauvegarder(bulletin);
      await this.eventBusPort?.publier(bulletin.recupererEvenements(), {
        organisationId: input.idOrganisation,
        ecoleId: bulletin.obtenirIdEcole(),
        utilisateurId: input.idUtilisateur,
      });
      const sortie = this.serviceProjectionLecture.projeterBulletin(bulletin);
      await this.serviceCacheBulletin.enregistrer(`bulletin:${input.idEleve}:${input.idAnneeScolaire}`, sortie, 300);
      if (input.preparerPdf) {
        await this.bulletinPdfPort?.genererBulletinPdf(sortie);
      }
      await this.serviceAuditBulletin.journaliser({
        action: 'GENERER_BULLETIN',
        idOrganisation: input.idOrganisation,
        idEcole: bulletin.obtenirIdEcole(),
        idUtilisateur: input.idUtilisateur,
        referenceMetier: bulletin.obtenirId(),
        operationId: String(bulletin.obtenirVersionBulletin()),
        details: { typeGeneration: input.typeGeneration },
      });
      bulletin.viderEvenements();
      return sortie;
    });
  }

  private async verifierAutorisation(
    input: GenererBulletinEleveInput,
    bulletin: BulletinEleve,
  ): Promise<void> {
    try {
      await this.autorisationGenerationBulletinPort.verifierGenerationBulletin({
        idUtilisateur: input.idUtilisateur,
        idOrganisation: input.idOrganisation,
        idEcole: bulletin.obtenirIdEcole(),
        idClassePedagogique: bulletin.obtenirIdClassePedagogique(),
        idAnneeScolaire: bulletin.obtenirIdAnneeScolaire(),
      });
    } catch {
      throw new GenerationBulletinException(
        "L'utilisateur demandeur n'est pas autorise a generer ce bulletin.",
      );
    }
  }

  private async lireProgramme(referenceProgramme: {
    idProgrammeNiveau: string;
    idEcole: string;
  }) {
    const programme = await this.referentielAcademiquePort.consulterProgrammeNiveau(referenceProgramme);

    if (programme === null) {
      throw new GenerationBulletinException(
        'Le programme niveau local rattache au bulletin est introuvable.',
      );
    }

    if (programme.statutProgrammeNiveau !== 'VALIDE') {
      throw new ErreurProgrammeNonValide();
    }

    return programme;
  }

  private async lireCoursProgramme(referenceProgramme: {
    idProgrammeNiveau: string;
    idEcole: string;
  }) {
    try {
      const cours = await this.referentielAcademiquePort.listerCoursProgramme(referenceProgramme);

      if (cours.length === 0) {
        throw new GenerationBulletinException(
          'Le programme niveau rattache au bulletin ne contient aucun cours exploitable.',
        );
      }

      return cours;
    } catch (erreur) {
      if (erreur instanceof GenerationBulletinException) {
        throw erreur;
      }

      throw new GenerationBulletinException(
        erreur instanceof Error
          ? erreur.message
          : 'Les cours du programme niveau rattache au bulletin sont introuvables.',
      );
    }
  }

  private async lireFichesParCours(
    idEleve: string,
    idAnneeScolaire: string,
  ): Promise<Map<string, Awaited<ReturnType<NonNullable<DepotFicheCotationEleveCours['listerParEleve']>>>[number]>> {
    if (!this.depotFicheCotation) {
      return new Map();
    }

    const fiches = await this.depotFicheCotation.listerParEleve(idEleve, idAnneeScolaire);
    return new Map(fiches.map((fiche) => [fiche.obtenirIdReferentielCours(), fiche]));
  }
}
