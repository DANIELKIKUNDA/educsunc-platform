import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { TypeSyntheseResultats } from 'contexts/bulletins-evaluations/domain/value-objects/TypeSyntheseResultats';
import type { SyntheseEcoleOutput } from 'contexts/bulletins-evaluations/application/dto/output/SyntheseEcoleOutput';
import {
  PdfSyntheseService,
  SyntheseDocumentContextService,
} from 'contexts/bulletins-evaluations/infrastructure/services/PdfSyntheseService';

function creerSynthese(overrides: Partial<SyntheseEcoleOutput> = {}): SyntheseEcoleOutput {
  return {
    idSyntheseResultatsEcole: 'synthese-1',
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    typeSynthese: TypeSyntheseResultats.ANNUELLE,
    lignes: [
      {
        idClassePedagogique: 'classe-1',
        libelleClasse: '1re A',
        idSectionScolaire: 'section-secondaire',
        sectionCode: 'SECONDAIRE',
        sectionLibelle: 'Secondaire',
        statistiques: {
          inscritsGarcons: 10,
          inscritsFilles: 12,
          inscritsTotal: 22,
          participantsGarcons: 9,
          participantsFilles: 11,
          participantsTotal: 20,
          classesGarcons: 7,
          classesFilles: 8,
          classesTotal: 15,
          nonClassesGarcons: 1,
          nonClassesFilles: 1,
          nonClassesTotal: 2,
          abandonsGarcons: 0,
          abandonsFilles: 1,
          abandonsTotal: 1,
          reussitesGarcons: 7,
          reussitesFilles: 8,
          reussitesTotal: 15,
          echecsGarcons: 2,
          echecsFilles: 3,
          echecsTotal: 5,
          tauxParticipation: 90.91,
          tauxReussite: 75,
          tauxEchec: 25,
          tauxAbandon: 4.55,
        },
      },
      {
        idClassePedagogique: 'classe-2',
        libelleClasse: '6e Primaire',
        idSectionScolaire: 'section-primaire',
        sectionCode: 'PRIMAIRE',
        sectionLibelle: 'Primaire',
        statistiques: {
          inscritsGarcons: 8,
          inscritsFilles: 10,
          inscritsTotal: 18,
          participantsGarcons: 8,
          participantsFilles: 10,
          participantsTotal: 18,
          classesGarcons: 7,
          classesFilles: 9,
          classesTotal: 16,
          nonClassesGarcons: 0,
          nonClassesFilles: 0,
          nonClassesTotal: 0,
          abandonsGarcons: 0,
          abandonsFilles: 0,
          abandonsTotal: 0,
          reussitesGarcons: 7,
          reussitesFilles: 9,
          reussitesTotal: 16,
          echecsGarcons: 1,
          echecsFilles: 1,
          echecsTotal: 2,
          tauxParticipation: 100,
          tauxReussite: 88.89,
          tauxEchec: 11.11,
          tauxAbandon: 0,
        },
      },
    ],
    totauxEcole: {
      inscritsGarcons: 18,
      inscritsFilles: 22,
      inscritsTotal: 40,
      participantsGarcons: 17,
      participantsFilles: 21,
      participantsTotal: 38,
      classesGarcons: 14,
      classesFilles: 17,
      classesTotal: 31,
      nonClassesGarcons: 1,
      nonClassesFilles: 1,
      nonClassesTotal: 2,
      abandonsGarcons: 0,
      abandonsFilles: 1,
      abandonsTotal: 1,
      reussitesGarcons: 14,
      reussitesFilles: 17,
      reussitesTotal: 31,
      echecsGarcons: 3,
      echecsFilles: 4,
      echecsTotal: 7,
      tauxParticipation: 95,
      tauxReussite: 81.58,
      tauxEchec: 18.42,
      tauxAbandon: 2.5,
    },
    ...overrides,
  };
}

test('le service PDF de synthese genere un vrai document multi-sections', async () => {
  const service = new PdfSyntheseService(
    undefined,
    new SyntheseDocumentContextService({
      async consulterEcole() {
        return {
          id: 'ecole-1',
          code: 'ECOLE-001',
          nom: 'College Saint Raphael',
          sigle: 'CSR',
          adresse: 'Avenue Example 1',
          telephone: '+243000000000',
          email: 'contact@csr.cd',
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
      async consulterCours() { return null; },
      async consulterProgrammeNiveau() { return null; },
      async listerCoursProgramme() { return []; },
      async listerColonnesAutorisees() { return []; },
    }),
  );

  const pdf = await service.genererDepuisSortie(creerSynthese());
  const document = await PDFDocument.load(pdf.contenu);

  assert.equal(pdf.mimeType, 'application/pdf');
  assert.equal(pdf.nomFichier, 'synthese-ecole-1-annee-1-TOTAL_GENERAL.pdf');
  assert.equal(document.getPageCount(), 2);
});

test('le package documentaire SYN-TPL-01 de synthese est versionne dans le repo', async () => {
  const backgroundPath = path.resolve(
    process.cwd(),
    '..',
    'docs',
    'assets',
    'syntheses_templates',
    'SYN-TPL-01',
    'background.master.pdf',
  );
  const source = await readFile(backgroundPath);
  const document = await PDFDocument.load(source);

  assert.equal(document.getPageCount(), 2);
});

test('le package documentaire SYN-TPL-01 expose une calibration structurelle fine', async () => {
  const calibrationPath = path.resolve(
    process.cwd(),
    '..',
    'docs',
    'assets',
    'syntheses_templates',
    'SYN-TPL-01',
    'zones.calibration.json',
  );
  const calibration = JSON.parse(await readFile(calibrationPath, 'utf-8')) as {
    etatCalibration: string;
    metrics?: Record<string, number>;
    zones: Array<{ id: string }>;
  };

  assert.equal(calibration.etatCalibration, 'CALIBRE_STRUCTURELLEMENT');
  assert.deepEqual(
    [
      'z_header_ecole_nom',
      'z_header_ecole_coordonnees',
      'z_header_titre',
      'z_header_badge_section',
      'z_meta_ligne',
      'z_resume_bandeau',
      'z_resume_stat_section',
      'z_resume_stat_classes',
      'z_resume_stat_inscrits',
      'z_resume_stat_participation',
      'z_resume_stat_reussite',
      'z_footer_total_contenu',
      'z_empty_state_message',
    ].every((id) => calibration.zones.some((zone) => zone.id === id)),
    true,
  );
  assert.deepEqual(
    [
      'headerAccentHeight',
      'resumeAccentHeight',
      'footerAccentHeight',
      'resumeSeparatorInset',
      'blocStatValueOffsetX',
      'tableCellPaddingX',
      'tableCellBaselineOffsetY',
      'badgeAccentWidth',
    ].every((id) => typeof calibration.metrics?.[id] === 'number'),
    true,
  );
});
