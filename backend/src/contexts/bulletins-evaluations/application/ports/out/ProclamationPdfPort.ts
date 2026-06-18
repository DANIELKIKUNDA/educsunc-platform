import type { ProclamationClasseOutput } from '../../dto/output/ProclamationClasseOutput';

// Ce port prepare ou genere une representation PDF officielle d'une proclamation.
export interface ProclamationPdfPort {
  genererProclamationPdf(proclamation: ProclamationClasseOutput): Promise<ProclamationPdfGenere>;
}

export interface ProclamationPdfGenere {
  nomFichier: string;
  contenu: Uint8Array | Buffer;
  mimeType: string;
}
