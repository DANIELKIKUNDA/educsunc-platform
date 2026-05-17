import { BlocApplicationConduite } from '../../../domain/entities/BlocApplicationConduite';
import { LigneBulletinEleve } from '../../../domain/entities/LigneBulletinEleve';
import type { DepotBulletinEleve } from '../../../domain/repositories/DepotBulletinEleve';
import type { DepotResultatBulletinEleve } from '../../../domain/repositories/DepotResultatBulletinEleve';
import type { GenererBulletinEleveInput } from '../../dto/input/GenererBulletinEleveInput';
import type { BulletinEleveOutput } from '../../dto/output/BulletinEleveOutput';
import { GenerationBulletinException } from '../../exceptions/GenerationBulletinException';
import type { BulletinPdfPort } from '../../ports/out/BulletinPdfPort';
import type { CacheBulletinPort } from '../../ports/out/CacheBulletinPort';
import type { EventBusPort } from '../../ports/out/EventBusPort';
import type { ReferentielAcademiquePort } from '../../ports/out/ReferentielAcademiquePort';
import type { TransactionManagerPort } from '../../ports/out/TransactionManagerPort';
import { ServiceAuditBulletin } from '../../services/ServiceAuditBulletin';
import { ServiceCacheBulletin } from '../../services/ServiceCacheBulletin';
import { ServiceGenerationBulletin } from '../../services/ServiceGenerationBulletin';
import { ServiceProjectionLecture } from '../../services/ServiceProjectionLecture';

// Ce use case orchestre la generation applicative d'un bulletin eleve.
export class GenererBulletinEleveUseCase {
  constructor(
    private readonly depotBulletin: DepotBulletinEleve,
    private readonly depotResultat: DepotResultatBulletinEleve,
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly referentielAcademiquePort: ReferentielAcademiquePort,
    private readonly serviceGenerationBulletin = new ServiceGenerationBulletin(),
    private readonly serviceProjectionLecture = new ServiceProjectionLecture(),
    private readonly serviceAuditBulletin = new ServiceAuditBulletin(),
    private readonly serviceCacheBulletin = new ServiceCacheBulletin(),
    private readonly bulletinPdfPort?: BulletinPdfPort,
    cachePort?: CacheBulletinPort,
    private readonly eventBusPort?: EventBusPort,
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

      const resultat = await this.depotResultat.trouverParEleveInscription(input.idEleve, input.idInscriptionScolaire);
      if (resultat === null) {
        throw new GenerationBulletinException('Le resultat consolide necessaire au bulletin est introuvable.');
      }

      const programme = await this.referentielAcademiquePort.consulterProgrammeNiveau((bulletin as unknown as { versionReferentielProgramme: string }).versionReferentielProgramme);
      const cours = programme === null ? [] : await this.referentielAcademiquePort.listerCoursProgramme(programme.idProgrammeNiveau);
      const lignes = cours.map((coursProgramme, index) => new LigneBulletinEleve({
        idLigneBulletinEleve: `${bulletin.obtenirId()}-ligne-${index + 1}`,
        idReferentielCours: coursProgramme.idReferentielCours,
        libelleCours: coursProgramme.libelleCours,
        ordreAffichage: coursProgramme.ordreAffichage,
        estCalculable: coursProgramme.estCalculable,
        aExamen: coursProgramme.aExamen,
      }));
      const blocs = resultat.obtenirApplicationsPeriodes().map((application, index) => new BlocApplicationConduite({
        idBlocApplicationConduite: `${bulletin.obtenirId()}-bloc-${index + 1}`,
        codePeriode: application.obtenirCodePeriode(),
        application: application.obtenirMentionApplication(),
        conduite: resultat.obtenirConduitesPeriodes().find((conduite) => conduite.obtenirCodePeriode() === application.obtenirCodePeriode())?.obtenirMentionConduite(),
        pointsConduite: resultat.obtenirConduitesPeriodes().find((conduite) => conduite.obtenirCodePeriode() === application.obtenirCodePeriode())?.obtenirPointsConduite(),
      }));

      this.serviceGenerationBulletin.generer(bulletin, lignes, blocs, input.idUtilisateur, input.typeGeneration);
      await this.depotBulletin.sauvegarder(bulletin);
      await this.eventBusPort?.publier(bulletin.recupererEvenements());
      const sortie = this.serviceProjectionLecture.projeterBulletin(bulletin);
      await this.serviceCacheBulletin.enregistrer(`bulletin:${input.idEleve}:${input.idAnneeScolaire}`, sortie, 300);
      if (input.preparerPdf) {
        await this.bulletinPdfPort?.genererBulletinPdf(sortie);
      }
      await this.serviceAuditBulletin.journaliser({
        action: 'GENERER_BULLETIN',
        idEcole: (bulletin as unknown as { idEcole: string }).idEcole,
        idUtilisateur: input.idUtilisateur,
        referenceMetier: bulletin.obtenirId(),
        details: { typeGeneration: input.typeGeneration },
      });
      bulletin.viderEvenements();
      return sortie;
    });
  }
}
