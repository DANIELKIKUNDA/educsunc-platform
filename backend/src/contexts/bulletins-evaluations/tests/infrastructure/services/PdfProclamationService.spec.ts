import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import type { ProclamationClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/ProclamationClasseReadModel';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { SexeEleve } from 'contexts/bulletins-evaluations/domain/value-objects/SexeEleve';
import { StatutProclamationEleve } from 'contexts/bulletins-evaluations/domain/value-objects/StatutProclamationEleve';
import { TypeProclamation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeProclamation';
import { PdfProclamationService } from 'contexts/bulletins-evaluations/infrastructure/services/PdfProclamationService';
import { ProclamationAssetsResolverService } from 'contexts/bulletins-evaluations/infrastructure/services/ProclamationAssetsResolverService';
import { ProclamationDocumentContextLoaderService } from 'contexts/bulletins-evaluations/infrastructure/services/ProclamationDocumentContextLoaderService';
import { ProclamationDocumentDataBuilderService } from 'contexts/bulletins-evaluations/infrastructure/services/ProclamationDocumentDataBuilderService';
import { ProclamationTemplateLayoutRegistryService } from 'contexts/bulletins-evaluations/infrastructure/services/ProclamationTemplateLayoutRegistryService';
import { ProclamationTemplatePackageInspectorService } from 'contexts/bulletins-evaluations/infrastructure/services/ProclamationTemplatePackageInspectorService';
import { ProclamationTemplateResolverService } from 'contexts/bulletins-evaluations/infrastructure/services/ProclamationTemplateResolverService';

function creerReadModel(
  overrides: Partial<ProclamationClasseReadModel> = {},
): ProclamationClasseReadModel {
  return {
    idProclamationClasse: 'proclamation-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_S1,
    typeProclamation: TypeProclamation.SEMESTRE,
    lignes: [{
      rang: 1,
      idEleve: 'eleve-1',
      nomComplet: 'Mukuna Grace',
      sexe: SexeEleve.F,
      totalObtenu: 350,
      maximumGeneral: 500,
      pourcentage: 70,
      observation: 'REUSSITE',
      statutProclamation: StatutProclamationEleve.CLASSE,
    }],
    nonClasses: [{
      idEleve: 'eleve-2',
      nomComplet: 'Kasongo David',
      sexe: SexeEleve.M,
      motifs: [],
      coursManquants: [],
      colonnesManquantes: [CodeColonneBulletin.TOTAL_S1],
    }],
    abandons: [{
      idEleve: 'eleve-3',
      nomComplet: 'Kabeya Ruth',
      sexe: SexeEleve.F,
      dateAbandon: new Date('2026-01-15T00:00:00.000Z'),
      motifAbandon: 'Abandon volontaire',
    }],
    statistiques: {
      inscritsGarcons: 10,
      inscritsFilles: 12,
      inscritsTotal: 22,
      participantsGarcons: 9,
      participantsFilles: 12,
      participantsTotal: 21,
      classesGarcons: 7,
      classesFilles: 10,
      classesTotal: 17,
      nonClassesGarcons: 1,
      nonClassesFilles: 1,
      nonClassesTotal: 2,
      abandonsGarcons: 1,
      abandonsFilles: 0,
      abandonsTotal: 1,
      reussitesGarcons: 7,
      reussitesFilles: 10,
      reussitesTotal: 17,
      echecsGarcons: 1,
      echecsFilles: 1,
      echecsTotal: 2,
      tauxParticipation: 95.45,
      tauxReussite: 80.95,
      tauxEchec: 9.52,
      tauxAbandon: 4.55,
    },
    ...overrides,
  };
}

test('le resolver de template de proclamation ouvre la famille officielle unique', () => {
  const resolver = new ProclamationTemplateResolverService();

  assert.equal(resolver.resoudre(creerReadModel()), 'PROCL-TPL-01');
});

test('le builder documentaire de proclamation assemble contexte, structure et assets', async () => {
  const builder = new ProclamationDocumentDataBuilderService(
    new ProclamationTemplateResolverService(),
    new ProclamationAssetsResolverService({
      async telechargerLogo() {
        return { nomFichier: 'logo.png', mimeType: 'image/png', contenu: Buffer.from('logo') };
      },
    }),
    new ProclamationDocumentContextLoaderService(
      {
        async consulterEleve() { return null; },
        async consulterInscription() { return null; },
        async consulterClassePedagogique() {
          return {
            idClassePedagogique: 'classe-1',
            libelleClasse: '8e EB A',
            idEcole: 'ecole-1',
          };
        },
        async verifierAbandon() { return null; },
      },
      {
        async consulterCours() { return null; },
        async consulterProgrammeNiveau() { return null; },
        async listerCoursProgramme() { return []; },
        async listerColonnesAutorisees() { return []; },
        async consulterEcole() {
          return {
            id: 'ecole-1',
            code: 'ECOLE-001',
            nom: 'College Riziki',
            sigle: 'CR',
            adresse: '26, Avenue du College',
            telephone: '+243000000000',
            email: 'contact@riziki.cd',
            provinceEducationnelle: 'Haut-Katanga 1',
            ville: 'Lubumbashi',
            communeOuTerritoire: 'Kampemba',
          };
        },
        async consulterAnneeScolaire() {
          return {
            id: 'annee-1',
            code: '2025-2026',
            libelle: '2025 - 2026',
          };
        },
      },
      {
        async consulterSectionClasse() {
          return {
            idSectionScolaire: 'section-1',
            sectionCode: 'PRIMAIRE',
            sectionLibelle: 'Primaire',
          };
        },
      },
      {
        async consulterTitulaireClasse() {
          return {
            idUtilisateur: 'utilisateur-1',
            nomComplet: 'Mme Mukadi',
          };
        },
      },
    ),
  );

  const document = await builder.construire(creerReadModel());
  assert.equal(document.meta.templateDocumentaire, 'PROCL-TPL-01');
  assert.equal(document.meta.idEcole, 'ecole-1');
  assert.equal(document.meta.libelleAnneeScolaire, '2025 - 2026');
  assert.equal(document.meta.libellePeriode, '1er semestre');
  assert.match(document.meta.dateEditionDocument ?? '', /^\d{2}\/\d{2}\/\d{4}$/);
  assert.equal(document.identiteInstitutionnelle.nomEcole, 'College Riziki');
  assert.equal(document.contexteClasse.libelleClasse, '8e EB A');
  assert.equal(document.contexteClasse.libelleSection, 'Primaire');
  assert.equal(document.contexteClasse.nomTitulaire, 'Mme Mukadi');
  assert.equal(document.structure.lignesClassees.length, 1);
  assert.equal(document.structure.nonClasses.length, 1);
  assert.equal(document.structure.abandons.length, 1);
  assert.equal(document.assets.logo?.nomFichier, 'logo.png');
});

test('le loader documentaire de proclamation degrade proprement la periode annuelle', async () => {
  const loader = new ProclamationDocumentContextLoaderService();

  const contexte = await loader.charger(creerReadModel({
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    typeProclamation: TypeProclamation.ANNUEL,
  }));

  assert.equal(contexte.meta?.libellePeriode, 'Resultats annuels');
});

test('le service PDF de proclamation genere un vrai document PDF', async () => {
  const service = new PdfProclamationService();

  const pdf = await service.genererDepuisSortie(creerReadModel());
  const document = await PDFDocument.load(pdf.contenu);

  assert.equal(pdf.mimeType, 'application/pdf');
  assert.equal(pdf.nomFichier, 'proclamation-classe-1-annee-1-TOTAL_S1.pdf');
  assert.equal(document.getPageCount() >= 1, true);
});

test('le package documentaire PROCL-TPL-01 est versionne et inspectable', async () => {
  const layout = await new ProclamationTemplateLayoutRegistryService().resoudre('PROCL-TPL-01');
  const paquet = await new ProclamationTemplatePackageInspectorService().inspecter('PROCL-TPL-01');

  assert.equal(layout.template, 'PROCL-TPL-01');
  assert.equal(layout.pages.length, 2);
  assert.equal(paquet.layoutManifestPresent, true);
  assert.equal(paquet.backgroundManifestPresent, true);
  assert.equal(paquet.backgroundMasterPresent, true);
  assert.equal(paquet.zoneCalibrationPresent, true);
  assert.equal(paquet.niveauPreparation, 'PRET_POUR_RENDERER_GRAPHIQUE');
});

test('le service PDF de proclamation pagine quand la liste des classes devient longue', async () => {
  const service = new PdfProclamationService();
  const lignes = Array.from({ length: 34 }, (_, index) => ({
    rang: index + 1,
    idEleve: `eleve-${index + 1}`,
    nomComplet: `Eleve ${index + 1}`,
    sexe: index % 2 === 0 ? SexeEleve.M : SexeEleve.F,
    totalObtenu: 250 + index,
    maximumGeneral: 500,
    pourcentage: 50 + index / 10,
    observation: index < 20 ? 'REUSSITE' : 'ECHEC',
    statutProclamation: StatutProclamationEleve.CLASSE,
  }));

  const pdf = await service.genererDepuisSortie(creerReadModel({
    lignes,
    nonClasses: Array.from({ length: 8 }, (_, index) => ({
      idEleve: `non-classe-${index + 1}`,
      nomComplet: `Non classe ${index + 1}`,
      sexe: SexeEleve.M,
      motifs: [],
      coursManquants: [`cours-${index + 1}`],
      colonnesManquantes: [CodeColonneBulletin.TOTAL_S1],
    })),
  }));
  const document = await PDFDocument.load(pdf.contenu);

  assert.equal(document.getPageCount() > 1, true);
});
