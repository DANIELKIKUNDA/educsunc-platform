import { randomUUID } from 'node:crypto';
import { RacineAgregat } from '../../../domain/AggregateRoot';
import { TentativeConnexionEchouee } from '../events/TentativeConnexionEchouee';
import { TentativeConnexionReussie } from '../events/TentativeConnexionReussie';

export interface ProprietesTentativeConnexion {
  idTentativeConnexion: string;
  email: string;
  adresseIp?: string;
  userAgent?: string;
  reussie: boolean;
  raisonEchec?: string;
  dateTentative: Date;
}

// Cet agregat trace chaque tentative de connexion pour audit et verrouillage.
export class TentativeConnexion extends RacineAgregat<string> {
  private email: string;
  private adresseIp?: string;
  private userAgent?: string;
  private reussie: boolean;
  private raisonEchec?: string;
  private dateTentative: Date;

  constructor(proprietes: ProprietesTentativeConnexion) {
    super(TentativeConnexion.validerTexte(proprietes.idTentativeConnexion, 'idTentativeConnexion'));
    this.email = TentativeConnexion.validerTexte(proprietes.email, 'email');
    this.adresseIp = TentativeConnexion.nettoyerOptionnel(proprietes.adresseIp);
    this.userAgent = TentativeConnexion.nettoyerOptionnel(proprietes.userAgent);
    this.reussie = Boolean(proprietes.reussie);
    this.raisonEchec = TentativeConnexion.nettoyerOptionnel(proprietes.raisonEchec);
    this.dateTentative = TentativeConnexion.validerDate(proprietes.dateTentative);
  }

  // Cette methode cree une tentative initialement en echec tant qu'elle n'est pas marquee.
  public static creer(params: { email: string; adresseIp?: string; userAgent?: string; dateTentative?: Date }): TentativeConnexion {
    return new TentativeConnexion({
      idTentativeConnexion: randomUUID(),
      email: params.email,
      adresseIp: params.adresseIp,
      userAgent: params.userAgent,
      reussie: false,
      dateTentative: params.dateTentative ?? new Date(),
    });
  }

  public obtenirEmail(): string { return this.email; }
  public obtenirAdresseIp(): string | undefined { return this.adresseIp; }
  public obtenirUserAgent(): string | undefined { return this.userAgent; }
  public obtenirReussie(): boolean { return this.reussie; }
  public obtenirRaisonEchec(): string | undefined { return this.raisonEchec; }
  public obtenirDateTentative(): Date { return new Date(this.dateTentative.getTime()); }

  // Cette methode marque la tentative comme reussie et emet l'evenement associe.
  public marquerSucces(): void {
    this.reussie = true;
    this.raisonEchec = undefined;
    this.ajouterEvenement(new TentativeConnexionReussie(this.obtenirId(), this.email));
  }

  // Cette methode marque la tentative comme echouee avec une raison lisible.
  public marquerEchec(raisonEchec: string): void {
    this.reussie = false;
    this.raisonEchec = TentativeConnexion.validerTexte(raisonEchec, 'raisonEchec');
    this.ajouterEvenement(new TentativeConnexionEchouee(this.obtenirId(), this.email, this.raisonEchec));
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static nettoyerOptionnel(valeur?: string): string | undefined {
    const propre = String(valeur || '').trim();
    return propre.length > 0 ? propre : undefined;
  }

  private static validerDate(valeur: Date): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new Error('La date de tentative est invalide.');
    }
    return new Date(valeur.getTime());
  }
}
