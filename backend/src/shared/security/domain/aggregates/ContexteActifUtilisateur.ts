import { randomUUID } from 'node:crypto';
import { RacineAgregat } from '../../../domain/AggregateRoot';
import { EcoleActiveChangee } from '../events/EcoleActiveChangee';
import { OrganisationActiveChangee } from '../events/OrganisationActiveChangee';
import { PolicyIsolationTenant } from '../policies/PolicyIsolationTenant';

export interface ProprietesContexteActifUtilisateur {
  idContexteActifUtilisateur: string;
  idUtilisateur: string;
  idOrganisationActive?: string;
  idEcoleActive?: string;
  dateChangement: Date;
  version: number;
}

// Cet agregat porte le contexte courant applique aux decisions de securite.
export class ContexteActifUtilisateur extends RacineAgregat<string> {
  private idUtilisateur: string;
  private idOrganisationActive?: string;
  private idEcoleActive?: string;
  private dateChangement: Date;
  private version: number;

  constructor(proprietes: ProprietesContexteActifUtilisateur) {
    super(ContexteActifUtilisateur.validerTexte(proprietes.idContexteActifUtilisateur, 'idContexteActifUtilisateur'));
    this.idUtilisateur = ContexteActifUtilisateur.validerTexte(proprietes.idUtilisateur, 'idUtilisateur');
    this.idOrganisationActive = ContexteActifUtilisateur.nettoyerOptionnel(proprietes.idOrganisationActive);
    this.idEcoleActive = ContexteActifUtilisateur.nettoyerOptionnel(proprietes.idEcoleActive);
    this.dateChangement = new Date(proprietes.dateChangement.getTime());
    this.version = proprietes.version;
    PolicyIsolationTenant.verifier(this.idOrganisationActive, this.idEcoleActive, true);
  }

  public static creer(idUtilisateur: string): ContexteActifUtilisateur {
    return new ContexteActifUtilisateur({
      idContexteActifUtilisateur: randomUUID(),
      idUtilisateur,
      dateChangement: new Date(),
      version: 1,
    });
  }

  public obtenirIdUtilisateur(): string { return this.idUtilisateur; }
  public obtenirIdOrganisationActive(): string | undefined { return this.idOrganisationActive; }
  public obtenirIdEcoleActive(): string | undefined { return this.idEcoleActive; }
  public obtenirDateChangement(): Date { return new Date(this.dateChangement.getTime()); }

  public changerOrganisation(idOrganisationActive?: string): void {
    this.idOrganisationActive = ContexteActifUtilisateur.nettoyerOptionnel(idOrganisationActive);
    if (!this.idOrganisationActive) {
      this.idEcoleActive = undefined;
    }
    this.marquerChangement();
    this.ajouterEvenement(new OrganisationActiveChangee(this.obtenirId(), this.idOrganisationActive));
  }

  public changerEcole(idEcoleActive?: string, ecoleAppartientOrganisation = true): void {
    const valeur = ContexteActifUtilisateur.nettoyerOptionnel(idEcoleActive);
    PolicyIsolationTenant.verifier(this.idOrganisationActive, valeur, ecoleAppartientOrganisation);
    this.idEcoleActive = valeur;
    this.marquerChangement();
    this.ajouterEvenement(new EcoleActiveChangee(this.obtenirId(), this.idEcoleActive));
  }

  public verifierContexte(): void {
    PolicyIsolationTenant.verifier(this.idOrganisationActive, this.idEcoleActive, true);
  }

  private marquerChangement(): void {
    this.dateChangement = new Date();
    this.version += 1;
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim() === '') {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static nettoyerOptionnel(valeur?: string): string | undefined {
    const propre = String(valeur || '').trim();
    return propre === '' ? undefined : propre;
  }
}
