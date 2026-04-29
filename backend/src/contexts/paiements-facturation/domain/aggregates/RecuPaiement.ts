import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { RecuPaiementAnnule } from '../events/RecuPaiementAnnule';
import { RecuPaiementEmis } from '../events/RecuPaiementEmis';
import { Money } from '../value-objects/Money';
import { ModePaiement } from '../value-objects/ModePaiement';
import { ReferenceFrais } from '../value-objects/ReferenceFrais';
import { StatutRecu } from '../value-objects/StatutRecu';
import { TypeFrais } from '../value-objects/TypeFrais';

export interface ProprietesRecuPaiement {
  idRecu: string;
  numeroRecu: string;
  idPaiement: string;
  idObligation: string;
  idEcole: string;
  idEleve: string;
  typeFrais: TypeFrais;
  referenceFrais: ReferenceFrais;
  libelle: string;
  montant: Money;
  montantEnLettres: string;
  modePaiement: ModePaiement;
  idCaissier: string;
  dateEmission: Date;
  statutRecu: StatutRecu;
}

export class RecuPaiement extends RacineAgregat<string> {
  private numeroRecu: string;
  private idPaiement: string;
  private idObligation: string;
  private idEcole: string;
  private idEleve: string;
  private typeFrais: TypeFrais;
  private referenceFrais: ReferenceFrais;
  private libelle: string;
  private montant: Money;
  private montantEnLettres: string;
  private modePaiement: ModePaiement;
  private idCaissier: string;
  private dateEmission: Date;
  private statutRecu: StatutRecu;

  constructor(proprietes: ProprietesRecuPaiement) {
    super(RecuPaiement.validerTexte(proprietes.idRecu, 'idRecu'));
    this.numeroRecu = RecuPaiement.validerTexte(proprietes.numeroRecu, 'numeroRecu');
    this.idPaiement = RecuPaiement.validerTexte(proprietes.idPaiement, 'idPaiement');
    this.idObligation = RecuPaiement.validerTexte(proprietes.idObligation, 'idObligation');
    this.idEcole = RecuPaiement.validerTexte(proprietes.idEcole, 'idEcole');
    this.idEleve = RecuPaiement.validerTexte(proprietes.idEleve, 'idEleve');
    this.typeFrais = proprietes.typeFrais;
    this.referenceFrais = proprietes.referenceFrais;
    this.libelle = RecuPaiement.validerTexte(proprietes.libelle, 'libelle');
    this.montant = proprietes.montant;
    this.montantEnLettres = RecuPaiement.validerTexte(proprietes.montantEnLettres, 'montantEnLettres');
    this.modePaiement = proprietes.modePaiement;
    this.idCaissier = RecuPaiement.validerTexte(proprietes.idCaissier, 'idCaissier');
    this.dateEmission = RecuPaiement.validerDate(proprietes.dateEmission);
    this.statutRecu = proprietes.statutRecu;
  }

  public static creer(proprietes: Omit<ProprietesRecuPaiement, 'statutRecu'>): RecuPaiement {
    const recu = new RecuPaiement({
      ...proprietes,
      statutRecu: StatutRecu.EMIS,
    });
    recu.ajouterEvenement(new RecuPaiementEmis(recu.obtenirId(), recu.idPaiement, recu.idObligation));
    return recu;
  }

  public obtenirNumeroRecu(): string { return this.numeroRecu; }
  public obtenirIdPaiement(): string { return this.idPaiement; }
  public obtenirIdObligation(): string { return this.idObligation; }
  public obtenirIdEcole(): string { return this.idEcole; }
  public obtenirIdEleve(): string { return this.idEleve; }
  public obtenirTypeFrais(): TypeFrais { return this.typeFrais; }
  public obtenirReferenceFrais(): ReferenceFrais { return this.referenceFrais; }
  public obtenirLibelle(): string { return this.libelle; }
  public obtenirMontant(): Money { return this.montant; }
  public obtenirMontantEnLettres(): string { return this.montantEnLettres; }
  public obtenirModePaiement(): ModePaiement { return this.modePaiement; }
  public obtenirIdCaissier(): string { return this.idCaissier; }
  public obtenirDateEmission(): Date { return new Date(this.dateEmission.getTime()); }
  public obtenirStatutRecu(): StatutRecu { return this.statutRecu; }

  public annuler(): void {
    this.statutRecu = StatutRecu.ANNULE;
    this.ajouterEvenement(new RecuPaiementAnnule(this.obtenirId(), this.idPaiement, this.idObligation));
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static validerDate(valeur: Date): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new Error('La date d emission du recu est invalide.');
    }
    return new Date(valeur.getTime());
  }
}
