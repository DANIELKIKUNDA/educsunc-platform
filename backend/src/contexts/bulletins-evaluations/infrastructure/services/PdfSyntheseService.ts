import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { SyntheseEcoleOutput } from 'contexts/bulletins-evaluations/application/dto/output/SyntheseEcoleOutput';
import type { LigneSyntheseOutput } from 'contexts/bulletins-evaluations/application/dto/output/LigneSyntheseOutput';
import type { SynthesePdfGenere } from 'contexts/bulletins-evaluations/application/ports/out/SynthesePdfPort';
import type { ReferentielAcademiquePort } from 'contexts/bulletins-evaluations/application/ports/out/ReferentielAcademiquePort';
import type { ServiceStockageFichier } from 'shared/infrastructure/storage/FileStorageService';
import { SyntheseDocumentContextService, type SyntheseDocumentContext } from './SyntheseDocumentContextService';

type PDFFontLike = Awaited<ReturnType<typeof PDFDocument.create>> extends PDFDocument ? Awaited<ReturnType<PDFDocument['embedFont']>> : never;
type PDFPageLike = PDFDocument['addPage'] extends (...args: never[]) => infer T ? T : never;

interface SectionSyntheseDocument {
  idSectionScolaire: string;
  codeSection: string;
  libelleSection: string;
  lignes: LigneSyntheseOutput[];
  totaux: {
    inscrits: number;
    participants: number;
    classes: number;
    nonClasses: number;
    abandons: number;
    reussites: number;
    echecs: number;
    tauxReussite: number;
    tauxParticipation: number;
  };
}

interface SyntheseZoneCalibration {
  metrics?: {
    headerAccentHeight?: number;
    resumeAccentHeight?: number;
    footerAccentHeight?: number;
    resumeSeparatorInset?: number;
    blocStatValueOffsetX?: number;
    tableCellPaddingX?: number;
    tableCellBaselineOffsetY?: number;
    badgeAccentWidth?: number;
  };
  zones: Array<{
    id: string;
    page: number;
    x: number | null;
    y: number | null;
    largeur: number | null;
    hauteur: number | null;
  }>;
  tables: Array<{
    id: string;
    page: number;
    x: number | null;
    y: number | null;
    largeur: number | null;
    hauteur: number | null;
    hauteurLigne: number | null;
    ratiosColonnes?: number[];
    colonnes: string[];
  }>;
}

const PALETTE = {
  marine: rgb(0.09, 0.18, 0.36),
  marineClair: rgb(0.17, 0.28, 0.53),
  marineTresClair: rgb(0.92, 0.95, 1),
  ardoise: rgb(0.28, 0.31, 0.38),
  grisTexte: rgb(0.22, 0.24, 0.28),
  grisClair: rgb(0.72, 0.74, 0.79),
  grisFond: rgb(0.975, 0.978, 0.985),
  blanc: rgb(1, 1, 1),
};

// Ce service produit un vrai export PDF structuré de synthèse des résultats.
export class PdfSyntheseService {
  constructor(
    private readonly stockage?: ServiceStockageFichier,
    private readonly contextLoader = new SyntheseDocumentContextService(),
  ) {}

  public async genererDepuisSortie(synthese: SyntheseEcoleOutput): Promise<SynthesePdfGenere> {
    const contexte = await this.contextLoader.charger(synthese);
    const contenu = Buffer.from(await this.rendre(synthese, contexte));
    const nomFichier = `synthese-${synthese.idEcole}-${synthese.idAnneeScolaire}-${synthese.codeColonne}.pdf`;

    if (this.stockage !== undefined) {
      await this.stockage.televerser(`syntheses/${nomFichier}`, contenu);
    }

    return {
      nomFichier,
      contenu,
      mimeType: 'application/pdf',
    };
  }

  private async rendre(synthese: SyntheseEcoleOutput, contexte: SyntheseDocumentContext): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();
    const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const margin = 28;
    const sections = this.grouperParSection(synthese.lignes);
    const calibrationPath = path.resolve(
      process.cwd(),
      '..',
      'docs',
      'assets',
      'syntheses_templates',
      'SYN-TPL-01',
      'zones.calibration.json',
    );
    const backgroundPath = path.resolve(
      process.cwd(),
      '..',
      'docs',
      'assets',
      'syntheses_templates',
      'SYN-TPL-01',
      'background.master.pdf',
    );
    const calibration = JSON.parse(await readFile(calibrationPath, 'utf-8')) as SyntheseZoneCalibration;
    const backgroundSource = await readFile(backgroundPath);
    const backgroundPdf = await PDFDocument.load(backgroundSource);
    const premierePage = backgroundPdf.getPage(0);
    const pageWidth = premierePage.getWidth();
    const pageHeight = premierePage.getHeight();

    if (sections.length === 0) {
      const [importedPage] = await pdf.copyPages(backgroundPdf, [0]);
      const page = pdf.addPage(importedPage);
      this.dessinerSyntheseVide(page, { pageWidth, pageHeight, margin, fontRegular, fontBold, contexte, calibration });
      return await pdf.save();
    }

    for (let index = 0; index < sections.length; index += 1) {
      const section = sections[index];
      const pageIndex = index % Math.max(1, backgroundPdf.getPageCount());
      const [importedPage] = await pdf.copyPages(backgroundPdf, [pageIndex]);
      const page = pdf.addPage(importedPage);
      this.dessinerSection(page, {
        pageWidth,
        pageHeight,
        margin,
        fontRegular,
        fontBold,
        contexte,
        section,
        calibration,
        afficherTotauxEcole: index === sections.length - 1 ? synthese.totauxEcole : undefined,
      });
    }

    return await pdf.save();
  }

  private dessinerSection(
    page: PDFPageLike,
    params: {
      pageWidth: number;
      pageHeight: number;
      margin: number;
      fontRegular: PDFFontLike;
      fontBold: PDFFontLike;
      contexte: SyntheseDocumentContext;
      section: SectionSyntheseDocument;
      calibration: SyntheseZoneCalibration;
      afficherTotauxEcole?: SyntheseEcoleOutput['totauxEcole'];
    },
  ): void {
    const {
      pageWidth,
      pageHeight,
      margin,
      fontRegular,
      fontBold,
      contexte,
      section,
      calibration,
      afficherTotauxEcole,
    } = params;
    let y = pageHeight - margin;

    // Masque les donnees de demonstration du PDF source avant de superposer les donnees reelles.
    this.dessinerMasqueDepuisZone(page, calibration, 'z_header_mask');
    this.dessinerMasqueDepuisZone(page, calibration, 'z_meta_mask');
    this.dessinerMasqueDepuisZone(page, calibration, 'z_resume_mask');
    this.dessinerMasqueDepuisTable(page, calibration, 't_synthese_section_page');
    if (afficherTotauxEcole !== undefined) {
      this.dessinerMasqueDepuisZone(page, calibration, 'z_footer_total_mask');
    }

    const zoneHeader = this.trouverZone(calibration, 'z_header_mask');
    const zoneMeta = this.trouverZone(calibration, 'z_meta_mask');
    const zoneResume = this.trouverZone(calibration, 'z_resume_mask');
    const table = this.trouverTable(calibration, 't_synthese_section_page');
    const tableX = table.x ?? 58;
    const tableTopY = table.y ?? 380;
    const tableLargeur = table.largeur ?? 676;
    const rowHeight = table.hauteurLigne ?? 18;
    const headerX = zoneHeader.x ?? margin;
    const headerY = zoneHeader.y ?? y;
    const headerLargeur = zoneHeader.largeur ?? (pageWidth - margin * 2);
    const headerHauteur = zoneHeader.hauteur ?? 78;
    const zoneNomEcole = this.trouverZone(calibration, 'z_header_ecole_nom');
    const zoneCoordonnees = this.trouverZone(calibration, 'z_header_ecole_coordonnees');
    const zoneTitre = this.trouverZone(calibration, 'z_header_titre');
    const zoneBadge = this.trouverZone(calibration, 'z_header_badge_section');
    const zoneMetaLigne = this.trouverZone(calibration, 'z_meta_ligne');
    const zoneResumeBandeau = this.trouverZone(calibration, 'z_resume_bandeau');
    const zoneResumeSection = this.trouverZone(calibration, 'z_resume_stat_section');
    const zoneResumeClasses = this.trouverZone(calibration, 'z_resume_stat_classes');
    const zoneResumeInscrits = this.trouverZone(calibration, 'z_resume_stat_inscrits');
    const zoneResumeParticipation = this.trouverZone(calibration, 'z_resume_stat_participation');
    const zoneResumeReussite = this.trouverZone(calibration, 'z_resume_stat_reussite');
    const resumeLargeur = zoneResumeBandeau.largeur ?? (zoneResume.largeur ?? (pageWidth - (margin * 2)));
    const headerAccentHeight = calibration.metrics?.headerAccentHeight ?? 3;
    const resumeAccentHeight = calibration.metrics?.resumeAccentHeight ?? 5;
    const resumeSeparatorInset = calibration.metrics?.resumeSeparatorInset ?? 8;
    const footerAccentHeight = calibration.metrics?.footerAccentHeight ?? 4;

    page.drawRectangle({
      x: headerX,
      y: headerY + headerHauteur - (headerAccentHeight + 2),
      width: headerLargeur,
      height: headerAccentHeight,
      color: PALETTE.marineClair,
    });

    page.drawText(contexte.identiteInstitutionnelle.nomEcole, {
      x: zoneNomEcole.x ?? (headerX + 8),
      y: zoneNomEcole.y ?? (headerY + Math.max(12, headerHauteur - 22)),
      size: 18,
      font: fontBold,
      color: PALETTE.marine,
    });

    const ligneInstitution = [
      contexte.identiteInstitutionnelle.sigleEcole,
      contexte.identiteInstitutionnelle.adresseEcole,
      contexte.identiteInstitutionnelle.telephoneEcole,
      contexte.identiteInstitutionnelle.emailEcole,
    ].filter((valeur) => typeof valeur === 'string' && valeur.trim().length > 0).join(' | ');
    if (ligneInstitution.length > 0) {
      page.drawText(ligneInstitution, {
        x: zoneCoordonnees.x ?? (headerX + 8),
        y: zoneCoordonnees.y ?? (headerY + 10),
        size: 8.5,
        font: fontRegular,
        color: PALETTE.grisTexte,
      });
    }

    const titre = 'SYNTHESE DES RESULTATS';
    this.dessinerTexteCentre(
      page,
      titre,
      (zoneTitre.x ?? headerX) + ((zoneTitre.largeur ?? headerLargeur) / 2),
      zoneTitre.y ?? (headerY + 34),
      16,
      fontBold,
      PALETTE.marine,
    );
    this.dessinerBadgeSection(
      page,
      zoneBadge.x ?? (headerX + headerLargeur - 164),
      zoneBadge.y ?? (headerY + 28),
      zoneBadge.largeur ?? 154,
      zoneBadge.hauteur ?? 24,
      section.libelleSection.toUpperCase(),
      fontBold,
      calibration,
    );

    const meta = [
      `Annee scolaire : ${contexte.meta.libelleAnneeScolaire ?? '-'}`,
      `Periode : ${contexte.meta.libellePeriode}`,
      `Edition : ${contexte.meta.dateEditionDocument}`,
    ].join('      ');
    this.dessinerTexteCentre(
      page,
      meta,
      (zoneMetaLigne.x ?? (zoneMeta.x ?? margin)) + ((zoneMetaLigne.largeur ?? (zoneMeta.largeur ?? (pageWidth - margin * 2))) / 2),
      zoneMetaLigne.y ?? ((zoneMeta.y ?? 458) + 12),
      9,
      fontRegular,
      PALETTE.ardoise,
    );

    page.drawRectangle({
      x: zoneResumeBandeau.x ?? (zoneResume.x ?? margin),
      y: zoneResumeBandeau.y ?? (zoneResume.y ?? 404),
      width: zoneResumeBandeau.largeur ?? (zoneResume.largeur ?? (pageWidth - (margin * 2))),
      height: zoneResumeBandeau.hauteur ?? (zoneResume.hauteur ?? 42),
      color: PALETTE.grisFond,
      borderWidth: 0.7,
      borderColor: PALETTE.grisClair,
    });
    page.drawRectangle({
      x: zoneResumeBandeau.x ?? (zoneResume.x ?? margin),
      y: zoneResumeBandeau.y ?? (zoneResume.y ?? 404),
      width: zoneResumeBandeau.largeur ?? (zoneResume.largeur ?? (pageWidth - (margin * 2))),
      height: resumeAccentHeight,
      color: PALETTE.marineClair,
    });
    const resumeY = (zoneResumeBandeau.y ?? (zoneResume.y ?? 404)) + 16;
    const resumeX = zoneResumeBandeau.x ?? (zoneResume.x ?? margin);
    const blocsResume = [
      { zone: zoneResumeSection, fallbackX: resumeX + 10, label: 'Section', value: section.libelleSection },
      { zone: zoneResumeClasses, fallbackX: resumeX + Math.round(resumeLargeur * 0.23), label: 'Classes', value: String(section.lignes.length) },
      { zone: zoneResumeInscrits, fallbackX: resumeX + Math.round(resumeLargeur * 0.37), label: 'Inscrits', value: String(section.totaux.inscrits) },
      { zone: zoneResumeParticipation, fallbackX: resumeX + Math.round(resumeLargeur * 0.54), label: 'Participation', value: this.formaterPourcentage(section.totaux.tauxParticipation) },
      { zone: zoneResumeReussite, fallbackX: resumeX + Math.round(resumeLargeur * 0.79), label: 'Reussite', value: this.formaterPourcentage(section.totaux.tauxReussite) },
    ];
    for (const bloc of blocsResume.slice(1)) {
      const separatorX = bloc.zone.x ?? bloc.fallbackX;
      page.drawLine({
        start: { x: separatorX - 10, y: (zoneResumeBandeau.y ?? (zoneResume.y ?? 404)) + resumeSeparatorInset },
        end: {
          x: separatorX - 10,
          y: (zoneResumeBandeau.y ?? (zoneResume.y ?? 404))
            + (zoneResumeBandeau.hauteur ?? (zoneResume.hauteur ?? 42))
            - resumeSeparatorInset,
        },
        thickness: 0.6,
        color: PALETTE.grisClair,
      });
    }
    blocsResume.forEach((bloc) => {
      this.dessinerBlocStat(
        page,
        bloc.zone.x ?? bloc.fallbackX,
        bloc.zone.y ?? resumeY,
        bloc.label,
        bloc.value,
        fontRegular,
        fontBold,
        calibration,
      );
    });

    const widths = this.calculerLargeursColonnes(tableLargeur, table.ratiosColonnes);
    const headers = ['CLASSE', 'INSCRITS', 'PART.', 'CLASSES', 'NON CL.', 'ABAND.', 'REUSS.', 'ECHECS', 'TAUX %'];
    this.dessinerTableau(page, {
      startX: tableX,
      topY: tableTopY,
      widths,
      header: headers,
      rows: section.lignes.map((ligne) => [
        ligne.libelleClasse,
        this.formaterNombre(ligne.statistiques.inscritsTotal),
        this.formaterNombre(ligne.statistiques.participantsTotal),
        this.formaterNombre(ligne.statistiques.classesTotal),
        this.formaterNombre(ligne.statistiques.nonClassesTotal),
        this.formaterNombre(ligne.statistiques.abandonsTotal),
        this.formaterNombre(ligne.statistiques.reussitesTotal),
        this.formaterNombre(ligne.statistiques.echecsTotal),
        this.formaterPourcentage(ligne.statistiques.tauxReussite),
      ]),
      footer: [
        'TOTAL SECTION',
        this.formaterNombre(section.totaux.inscrits),
        this.formaterNombre(section.totaux.participants),
        this.formaterNombre(section.totaux.classes),
        this.formaterNombre(section.totaux.nonClasses),
        this.formaterNombre(section.totaux.abandons),
        this.formaterNombre(section.totaux.reussites),
        this.formaterNombre(section.totaux.echecs),
        this.formaterPourcentage(section.totaux.tauxReussite),
      ],
      fontRegular,
      fontBold,
      fontSize: 8,
      rowHeight,
      calibration,
    });

    if (afficherTotauxEcole !== undefined) {
      const zoneFooter = this.trouverZone(calibration, 'z_footer_total_mask');
      const zoneFooterContenu = this.trouverZone(calibration, 'z_footer_total_contenu');
      const footerY = (zoneFooter.y ?? 42) + (zoneFooter.hauteur ?? 30);
      page.drawRectangle({
        x: zoneFooter.x ?? margin,
        y: zoneFooter.y ?? 42,
        width: zoneFooter.largeur ?? (pageWidth - (margin * 2)),
        height: zoneFooter.hauteur ?? 30,
        color: PALETTE.marineTresClair,
        borderWidth: 0.7,
        borderColor: PALETTE.marineClair,
      });
      page.drawRectangle({
        x: zoneFooter.x ?? margin,
        y: (zoneFooter.y ?? 42) + (zoneFooter.hauteur ?? 30) - footerAccentHeight,
        width: zoneFooter.largeur ?? (pageWidth - (margin * 2)),
        height: footerAccentHeight,
        color: PALETTE.marineClair,
      });
      page.drawText(
        [
          'TOTAL ECOLE',
          `Inscrits ${this.formaterNombre(afficherTotauxEcole.inscritsTotal)}`,
          `Participants ${this.formaterNombre(afficherTotauxEcole.participantsTotal)}`,
          `Classes ${this.formaterNombre(afficherTotauxEcole.classesTotal)}`,
          `Non classes ${this.formaterNombre(afficherTotauxEcole.nonClassesTotal)}`,
          `Abandons ${this.formaterNombre(afficherTotauxEcole.abandonsTotal)}`,
          `Reussite ${this.formaterPourcentage(afficherTotauxEcole.tauxReussite)}`,
        ].join('   |   '),
        {
          x: zoneFooterContenu.x ?? ((zoneFooter.x ?? margin) + 10),
          y: zoneFooterContenu.y ?? (footerY - 20),
          size: 8.5,
          font: fontBold,
          color: PALETTE.marine,
        },
      );
    }
  }

  private dessinerMasqueTemplate(
    page: PDFPageLike,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    page.drawRectangle({
      x,
      y,
      width,
      height,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    });
  }

  private dessinerMasqueDepuisZone(page: PDFPageLike, calibration: SyntheseZoneCalibration, zoneId: string): void {
    const zone = this.trouverZone(calibration, zoneId);
    if (zone.x === null || zone.y === null || zone.largeur === null || zone.hauteur === null) {
      return;
    }

    this.dessinerMasqueTemplate(page, zone.x, zone.y, zone.largeur, zone.hauteur);
  }

  private dessinerMasqueDepuisTable(page: PDFPageLike, calibration: SyntheseZoneCalibration, tableId: string): void {
    const table = this.trouverTable(calibration, tableId);
    if (table.x === null || table.y === null || table.largeur === null || table.hauteur === null) {
      return;
    }

    this.dessinerMasqueTemplate(page, table.x, table.y - table.hauteur, table.largeur, table.hauteur);
  }

  private dessinerSyntheseVide(
    page: PDFPageLike,
    params: {
      pageWidth: number;
      pageHeight: number;
      margin: number;
      fontRegular: PDFFontLike;
      fontBold: PDFFontLike;
      contexte: SyntheseDocumentContext;
      calibration?: SyntheseZoneCalibration;
    },
  ): void {
    const { pageWidth, pageHeight, margin, fontRegular, fontBold, contexte, calibration } = params;
    let y = pageHeight - margin;
    page.drawText(contexte.identiteInstitutionnelle.nomEcole, { x: margin, y, size: 18, font: fontBold });
    y -= 28;
    this.dessinerTexteCentre(page, 'SYNTHESE DES RESULTATS', pageWidth / 2, y, 16, fontBold, PALETTE.marine);
    y -= 28;
    this.dessinerTexteCentre(
      page,
      `Annee scolaire : ${contexte.meta.libelleAnneeScolaire ?? '-'}   |   Periode : ${contexte.meta.libellePeriode}`,
      pageWidth / 2,
      y,
      9,
      fontRegular,
      PALETTE.ardoise,
    );
    y -= 60;
    const zoneMessage = calibration !== undefined
      ? this.trouverZone(calibration, 'z_empty_state_message')
      : { x: null, y: null, largeur: null, hauteur: null, id: 'z_empty_state_message', page: 1 };
    this.dessinerTexteCentre(
      page,
      'Aucune ligne de synthese disponible pour ce contexte.',
      zoneMessage.x !== null && zoneMessage.largeur !== null ? zoneMessage.x + (zoneMessage.largeur / 2) : pageWidth / 2,
      zoneMessage.y ?? y,
      12,
      fontBold,
      PALETTE.marine,
    );
  }

  private dessinerTableau(
    page: PDFPageLike,
    params: {
      startX: number;
      topY: number;
      widths: number[];
      header: string[];
      rows: string[][];
      footer: string[];
      fontRegular: PDFFontLike;
      fontBold: PDFFontLike;
      fontSize: number;
      rowHeight: number;
      calibration?: SyntheseZoneCalibration;
    },
  ): void {
    const { startX, topY, widths, header, rows, footer, fontRegular, fontBold, fontSize, rowHeight, calibration } = params;
    const totalWidth = widths.reduce((sum, width) => sum + width, 0);
    let y = topY;

    this.dessinerLigneTable(page, startX, y, widths, header, rowHeight, fontBold, fontSize, {
      fond: PALETTE.marineClair,
      texte: PALETTE.blanc,
    }, calibration);
    y -= rowHeight;

    rows.forEach((row, index) => {
      this.dessinerLigneTable(page, startX, y, widths, row, rowHeight, fontRegular, fontSize, {
        fond: index % 2 === 0 ? PALETTE.grisFond : PALETTE.blanc,
        texte: PALETTE.grisTexte,
      }, calibration);
      y -= rowHeight;
    });

    this.dessinerLigneTable(page, startX, y, widths, footer, rowHeight, fontBold, fontSize, {
      fond: PALETTE.marineTresClair,
      texte: PALETTE.marine,
    }, calibration);

    page.drawRectangle({
      x: startX,
      y: y,
      width: totalWidth,
      height: rowHeight * (rows.length + 2),
      borderWidth: 0.8,
      borderColor: PALETTE.ardoise,
    });
  }

  private dessinerLigneTable(
    page: PDFPageLike,
    startX: number,
    topY: number,
    widths: number[],
    values: string[],
    rowHeight: number,
    font: PDFFontLike,
    fontSize: number,
    palette: { fond: ReturnType<typeof rgb>; texte: ReturnType<typeof rgb> },
    calibration?: SyntheseZoneCalibration,
  ): void {
    const paddingX = calibration?.metrics?.tableCellPaddingX ?? 4;
    const baselineOffsetY = calibration?.metrics?.tableCellBaselineOffsetY ?? 12.5;
    let x = startX;
    widths.forEach((width, index) => {
      page.drawRectangle({
        x,
        y: topY - rowHeight,
        width,
        height: rowHeight,
        color: palette.fond,
        borderWidth: 0.5,
        borderColor: PALETTE.grisClair,
      });

      const raw = values[index] ?? '';
      const text = this.couperTexte(raw, width - (paddingX * 2), font.widthOfTextAtSize.bind(font), fontSize);
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const alignLeft = index === 0;
      const textX = alignLeft ? x + paddingX : x + Math.max(2, (width - textWidth) / 2);
      page.drawText(text, {
        x: textX,
        y: topY - baselineOffsetY,
        size: fontSize,
        font,
        color: palette.texte,
      });
      x += width;
    });
  }

  private dessinerBlocStat(
    page: PDFPageLike,
    x: number,
    y: number,
    label: string,
    value: string,
    fontRegular: PDFFontLike,
    fontBold: PDFFontLike,
    calibration?: SyntheseZoneCalibration,
  ): void {
    const valueOffsetX = calibration?.metrics?.blocStatValueOffsetX ?? 52;
    page.drawText(`${label} :`, {
      x,
      y,
      size: 8.5,
      font: fontBold,
      color: PALETTE.marine,
    });
    page.drawText(value, {
      x: x + valueOffsetX,
      y,
      size: 8.5,
      font: fontRegular,
      color: PALETTE.grisTexte,
    });
  }

  private dessinerTexteCentre(
    page: PDFPageLike,
    texte: string,
    centreX: number,
    y: number,
    size: number,
    font: PDFFontLike,
    color = PALETTE.grisTexte,
  ): void {
    const largeur = font.widthOfTextAtSize(texte, size);
    page.drawText(texte, {
      x: centreX - (largeur / 2),
      y,
      size,
      font,
      color,
    });
  }

  private dessinerBadgeSection(
    page: PDFPageLike,
    x: number,
    y: number,
    width: number,
    height: number,
    texte: string,
    font: PDFFontLike,
    calibration?: SyntheseZoneCalibration,
  ): void {
    const badgeAccentWidth = calibration?.metrics?.badgeAccentWidth ?? 6;
    page.drawRectangle({
      x,
      y,
      width,
      height,
      color: PALETTE.marineTresClair,
      borderWidth: 0.8,
      borderColor: PALETTE.marineClair,
    });
    page.drawRectangle({
      x,
      y,
      width: badgeAccentWidth,
      height,
      color: PALETTE.marineClair,
    });
    const contenu = this.couperTexte(texte, width - 18, font.widthOfTextAtSize.bind(font), 9);
    this.dessinerTexteCentre(page, contenu, x + (width / 2) + 3, y + 8, 9, font, PALETTE.marine);
  }

  private trouverZone(calibration: SyntheseZoneCalibration, zoneId: string): SyntheseZoneCalibration['zones'][number] {
    return calibration.zones.find((zone) => zone.id === zoneId) ?? {
      id: zoneId,
      page: 1,
      x: null,
      y: null,
      largeur: null,
      hauteur: null,
    };
  }

  private trouverTable(calibration: SyntheseZoneCalibration, tableId: string): SyntheseZoneCalibration['tables'][number] {
    return calibration.tables.find((table) => table.id === tableId) ?? {
      id: tableId,
      page: 1,
      x: null,
      y: null,
      largeur: null,
      hauteur: null,
      hauteurLigne: null,
      ratiosColonnes: undefined,
      colonnes: [],
    };
  }

  private grouperParSection(lignes: LigneSyntheseOutput[]): SectionSyntheseDocument[] {
    const map = new Map<string, SectionSyntheseDocument>();

    lignes.forEach((ligne) => {
      const cle = ligne.idSectionScolaire ?? ligne.sectionCode ?? 'SECTION_NON_RENSEIGNEE';
      const courant = map.get(cle) ?? {
        idSectionScolaire: ligne.idSectionScolaire ?? cle,
        codeSection: ligne.sectionCode ?? 'N/A',
        libelleSection: ligne.sectionLibelle ?? 'Section non renseignee',
        lignes: [],
        totaux: {
          inscrits: 0,
          participants: 0,
          classes: 0,
          nonClasses: 0,
          abandons: 0,
          reussites: 0,
          echecs: 0,
          tauxReussite: 0,
          tauxParticipation: 0,
        },
      };

      courant.lignes.push(ligne);
      courant.totaux.inscrits += ligne.statistiques.inscritsTotal;
      courant.totaux.participants += ligne.statistiques.participantsTotal;
      courant.totaux.classes += ligne.statistiques.classesTotal;
      courant.totaux.nonClasses += ligne.statistiques.nonClassesTotal;
      courant.totaux.abandons += ligne.statistiques.abandonsTotal;
      courant.totaux.reussites += ligne.statistiques.reussitesTotal;
      courant.totaux.echecs += ligne.statistiques.echecsTotal;
      map.set(cle, courant);
    });

    return [...map.values()]
      .map((section) => ({
        ...section,
        lignes: [...section.lignes].sort((a, b) => a.libelleClasse.localeCompare(b.libelleClasse, 'fr')),
        totaux: {
          ...section.totaux,
          tauxParticipation: this.calculerTaux(section.totaux.participants, section.totaux.inscrits),
          tauxReussite: this.calculerTaux(section.totaux.reussites, section.totaux.participants),
        },
      }))
      .sort((a, b) => a.libelleSection.localeCompare(b.libelleSection, 'fr'));
  }

  private calculerTaux(partie: number, total: number): number {
    if (total <= 0) {
      return 0;
    }

    return Number(((partie / total) * 100).toFixed(2));
  }

  private calculerLargeursColonnes(largeurTotale: number, ratiosPersonnalises?: number[]): number[] {
    const ratios = ratiosPersonnalises !== undefined && ratiosPersonnalises.length === 8
      ? ratiosPersonnalises
      : [0.207, 0.089, 0.101, 0.083, 0.083, 0.083, 0.083, 0.083];
    const largeurs = ratios.map((ratio) => Math.round(largeurTotale * ratio));
    const sommePartielle = largeurs.reduce((sum, width) => sum + width, 0);
    return [...largeurs, largeurTotale - sommePartielle];
  }

  private formaterNombre(valeur: number): string {
    return new Intl.NumberFormat('fr-FR').format(valeur);
  }

  private formaterPourcentage(valeur: number): string {
    return `${new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: Number.isInteger(valeur) ? 0 : 1,
      maximumFractionDigits: 2,
    }).format(valeur)} %`;
  }

  private couperTexte(
    texte: string,
    largeurMax: number,
    mesurer: (texte: string, size: number) => number,
    size: number,
  ): string {
    if (mesurer(texte, size) <= largeurMax) {
      return texte;
    }

    let courant = texte;
    while (courant.length > 3 && mesurer(`${courant}...`, size) > largeurMax) {
      courant = courant.slice(0, -1);
    }

    return `${courant}...`;
  }
}

export { SyntheseDocumentContextService };
export type { ReferentielAcademiquePort };
