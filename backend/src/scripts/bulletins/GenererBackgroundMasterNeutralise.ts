import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, rgb } from 'pdf-lib';
import type { BulletinTemplateDocumentaire } from 'contexts/bulletins-evaluations/application/read-models/BulletinDocumentDataReadModel';

type RectangleNormalise = {
  id: string;
  x: number;
  y: number;
  largeur: number;
  hauteur: number;
};

type NeutralisationConfig = {
  template: BulletinTemplateDocumentaire;
  version: string;
  sourcePageIndex: number;
  rectangles: RectangleNormalise[];
};

const templatesSupportes: BulletinTemplateDocumentaire[] = [
  'BULL-TPL-01',
  'BULL-TPL-02',
  'BULL-TPL-03',
  'BULL-TPL-04',
  'BULL-TPL-05',
  'BULL-TPL-06',
];

function resoudreTemplateDepuisCli(): BulletinTemplateDocumentaire {
  const candidat = (process.argv[2] ?? 'BULL-TPL-01').trim().toUpperCase();

  if (templatesSupportes.includes(candidat as BulletinTemplateDocumentaire)) {
    return candidat as BulletinTemplateDocumentaire;
  }

  throw new Error(`Template bulletin non supporte pour neutralisation: ${candidat}`);
}

async function main(): Promise<void> {
  const racineRepo = path.resolve(__dirname, '..', '..', '..', '..');
  const template = resoudreTemplateDepuisCli();
  const dossierTemplate = path.join(racineRepo, 'docs', 'assets', 'bulletins_templates', template);
  const cheminConfig = path.join(dossierTemplate, 'background.neutralization.json');
  const cheminManifest = path.join(dossierTemplate, 'background.manifest.json');
  const cheminSortie = path.join(dossierTemplate, 'background.master.pdf');

  const manifest = JSON.parse(await readFile(cheminManifest, 'utf8')) as {
    sourcePdfRelativePath: string;
  };
  const config = JSON.parse(await readFile(cheminConfig, 'utf8')) as NeutralisationConfig;
  const cheminSource = path.resolve(racineRepo, manifest.sourcePdfRelativePath);

  const sourceBytes = await readFile(cheminSource);
  const sourcePdf = await PDFDocument.load(sourceBytes);
  const ciblePdf = await PDFDocument.create();
  const [page] = await ciblePdf.copyPages(sourcePdf, [config.sourcePageIndex]);
  ciblePdf.addPage(page);

  const largeurPage = page.getWidth();
  const hauteurPage = page.getHeight();

  for (const rectangle of config.rectangles) {
    const x = rectangle.x * largeurPage;
    const largeur = rectangle.largeur * largeurPage;
    const hauteur = rectangle.hauteur * hauteurPage;
    const yDepuisHaut = rectangle.y * hauteurPage;
    const y = hauteurPage - yDepuisHaut - hauteur;

    page.drawRectangle({
      x,
      y,
      width: largeur,
      height: hauteur,
      color: rgb(1, 1, 1),
      borderColor: rgb(1, 1, 1),
      borderWidth: 0,
      opacity: 1,
    });
  }

  await mkdir(path.dirname(cheminSortie), { recursive: true });
  await writeFile(cheminSortie, await ciblePdf.save());

  process.stdout.write(
    JSON.stringify(
      {
        template: config.template,
        version: config.version,
        sourcePageIndex: config.sourcePageIndex + 1,
        largeurPage,
        hauteurPage,
        rectanglesNeutralises: config.rectangles.length,
        sortie: cheminSortie,
      },
      null,
      2,
    ),
  );
}

void main();
