import { createHash } from 'node:crypto';
import { once } from 'node:events';
import type { WriteStream } from 'node:fs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { AuditEntryOutput } from '../../../application/dto/outputs/AuditEntryOutput';
import type { AuditReadFilters, AuditReadRepositoryPort } from '../../../application/ports/outbound/AuditReadRepositoryPort';
import type { AuditExportJob } from './PostgresAuditExportJobStore';
import { PrivateAuditExportFileStore } from './PrivateAuditExportFileStore';

interface GeneratedAuditExport {
  readonly fileKey: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly tailleOctets: number;
  readonly nombreElements: number;
  readonly checksum: string;
}

export class AuditExportFileGenerator {
  private readonly tailleLot = 500;
  private readonly maximumStandard = Number(process.env.EDUCSYN_AUDIT_EXPORT_MAX_ROWS ?? 100_000);
  private readonly maximumPdf = Number(process.env.EDUCSYN_AUDIT_EXPORT_PDF_MAX_ROWS ?? 1_000);

  public constructor(
    private readonly lectures: AuditReadRepositoryPort,
    private readonly fichiers = new PrivateAuditExportFileStore(),
  ) {}

  public async generer(job: AuditExportJob): Promise<GeneratedAuditExport> {
    const extension = job.format.toLowerCase();
    const fileKey = `${job.idExport}.${extension}`;
    const fileName = `audit-${job.idExport}.${extension}`;
    if (job.format === 'PDF') return this.genererPdf(job, fileKey, fileName);
    return this.genererFlux(job, fileKey, fileName);
  }

  private async genererFlux(job: AuditExportJob, fileKey: string, fileName: string): Promise<GeneratedAuditExport> {
    const cible = await this.fichiers.ouvrirEcriture(fileKey);
    const hash = createHash('sha256');
    let nombre = 0;
    let premierJson = true;
    try {
      if (job.format === 'CSV') {
        await this.ecrire(cible.flux, hash, '\uFEFFIdentifiant;Date;Action;Type;Categories;Gravite;Resultat;Acteur;Role;Ressource;Organisation;Ecole;Correlation\n');
      } else {
        await this.ecrire(cible.flux, hash, '{"version":1,"elements":[');
      }
      let position: { dateAction: string; idAuditEntry: string } | undefined;
      while (true) {
        const page = await this.lectures.rechercher(this.filtres(job), { limite: this.tailleLot, position });
        for (const entree of page.items) {
          nombre += 1;
          if (nombre > this.maximumStandard) throw new Error("L'export depasse la limite autorisee. Affinez les filtres puis recommencez.");
          if (job.format === 'CSV') {
            await this.ecrire(cible.flux, hash, `${this.csv(entree)}\n`);
          } else {
            await this.ecrire(cible.flux, hash, `${premierJson ? '' : ','}${JSON.stringify(entree)}`);
            premierJson = false;
          }
        }
        const dernier = page.items.at(-1);
        if (!page.hasNextPage || !dernier) break;
        position = { dateAction: dernier.dateAction, idAuditEntry: dernier.idAuditEntry };
      }
      if (job.format === 'JSON') await this.ecrire(cible.flux, hash, `],"nombreElements":${nombre}}`);
      cible.flux.end();
      await once(cible.flux, 'finish');
      const taille = await this.fichiers.publier(cible.temporaire, cible.final);
      return { fileKey, fileName, mimeType: job.format === 'CSV' ? 'text/csv; charset=utf-8' : 'application/json', tailleOctets: taille, nombreElements: nombre, checksum: hash.digest('hex') };
    } catch (erreur) {
      cible.flux.destroy();
      await this.fichiers.abandonner(cible.temporaire);
      throw erreur;
    }
  }

  private async genererPdf(job: AuditExportJob, fileKey: string, fileName: string): Promise<GeneratedAuditExport> {
    const lignes: AuditEntryOutput[] = [];
    let position: { dateAction: string; idAuditEntry: string } | undefined;
    while (true) {
      const page = await this.lectures.rechercher(this.filtres(job), { limite: Math.min(this.tailleLot, this.maximumPdf + 1 - lignes.length), position });
      lignes.push(...page.items);
      if (lignes.length > this.maximumPdf) throw new Error("Le document PDF est trop volumineux. Affinez les filtres ou utilisez CSV/JSON.");
      const dernier = page.items.at(-1);
      if (!page.hasNextPage || !dernier) break;
      position = { dateAction: dernier.dateAction, idAuditEntry: dernier.idAuditEntry };
    }
    const document = await PDFDocument.create();
    const normal = await document.embedFont(StandardFonts.Helvetica);
    const gras = await document.embedFont(StandardFonts.HelveticaBold);
    let page = document.addPage([842, 595]);
    let y = 555;
    const entete = () => {
      page.drawText('EduSync - Registre d audit', { x: 36, y, size: 16, font: gras, color: rgb(0.05, 0.16, 0.3) });
      y -= 25;
      page.drawText('Date                     Action                         Resultat       Acteur                  Ressource', { x: 36, y, size: 8, font: gras });
      y -= 14;
    };
    entete();
    for (const ligne of lignes) {
      if (y < 35) { page = document.addPage([842, 595]); y = 555; entete(); }
      const valeurs = [ligne.dateAction.slice(0, 19), ligne.action.slice(0, 28), ligne.resultat.slice(0, 12), (ligne.acteur.roleActif ?? ligne.acteur.typeActeur ?? '').slice(0, 18), (ligne.ressource?.libelle ?? ligne.ressource?.typeRessource ?? '').slice(0, 24)];
      page.drawText(valeurs.join('   '), { x: 36, y, size: 7.5, font: normal });
      y -= 12;
    }
    const bytes = await document.save();
    const cible = await this.fichiers.ouvrirEcriture(fileKey);
    try {
      cible.flux.end(Buffer.from(bytes));
      await once(cible.flux, 'finish');
      const taille = await this.fichiers.publier(cible.temporaire, cible.final);
      return { fileKey, fileName, mimeType: 'application/pdf', tailleOctets: taille, nombreElements: lignes.length, checksum: createHash('sha256').update(bytes).digest('hex') };
    } catch (erreur) {
      cible.flux.destroy();
      await this.fichiers.abandonner(cible.temporaire);
      throw erreur;
    }
  }

  private filtres(job: AuditExportJob): AuditReadFilters {
    const source = job.filtres;
    const texte = (cle: string) => typeof source[cle] === 'string' ? source[cle] as string : undefined;
    return {
      organisationId: job.scope === 'PLATEFORME' ? texte('organisationId') : job.organisationId,
      ecoleId: job.scope === 'ECOLE' ? job.ecoleId : texte('ecoleId'),
      acteurId: texte('acteurId'), typeAuditPrincipal: texte('typeAuditPrincipal'), categorieAudit: texte('categorieAudit'),
      action: texte('action'), gravite: texte('gravite'), resultat: texte('resultat'), typeRessource: texte('typeRessource'),
      ressourceId: texte('ressourceId'), correlationId: texte('correlationId'), requestId: texte('requestId'),
      sourceAudit: texte('sourceAudit'), dateDebut: texte('dateDebut'), dateFin: texte('dateFin'),
    };
  }

  private csv(entree: AuditEntryOutput): string {
    return [entree.idAuditEntry, entree.dateAction, entree.action, entree.typePrincipal, entree.categories.join(', '), entree.gravite,
      entree.resultat, entree.acteur.idUtilisateur, entree.acteur.roleActif, entree.ressource?.libelle ?? entree.ressource?.typeRessource,
      entree.organisationId, entree.ecoleId, entree.correlationId].map((value) => this.celluleCsv(value)).join(';');
  }

  private celluleCsv(value: unknown): string {
    let texte = value === undefined || value === null ? '' : String(value);
    if (/^[=+\-@]/.test(texte)) texte = `'${texte}`;
    return `"${texte.replaceAll('"', '""')}"`;
  }

  private async ecrire(flux: WriteStream, hash: ReturnType<typeof createHash>, contenu: string): Promise<void> {
    hash.update(contenu);
    if (!flux.write(contenu)) await once(flux, 'drain');
  }
}
