import { Eleve } from '../../domain/aggregates/Eleve';
import { DepotEleve } from '../../domain/repositories/DepotEleve';
import { CritereRechercheIdentiteEleve } from '../../domain/repositories/DepotEleve';

// Ce fichier contient des depots memoire simples pour les tests applicatifs.
export class DepotEleveMemoire implements DepotEleve {
  public readonly eleves = new Map<string, Eleve>();

  public async sauvegarder(eleve: Eleve): Promise<void> { this.eleves.set(eleve.obtenirId(), eleve); }
  public async trouverParId(idEleve: string): Promise<Eleve | null> { return this.eleves.get(idEleve) ?? null; }
  public async trouverParMatricule(idEcole: string, matricule: string): Promise<Eleve | null> { return [...this.eleves.values()].find((eleve) => eleve.obtenirIdEcole() === idEcole && eleve.obtenirMatricule() === matricule) ?? null; }
  public async listerParEcole(idEcole: string): Promise<Eleve[]> { return [...this.eleves.values()].filter((eleve) => eleve.obtenirIdEcole() === idEcole); }
  public async listerParOrganisation(idOrganisation: string): Promise<Eleve[]> { return [...this.eleves.values()].filter((eleve) => eleve.obtenirIdOrganisation() === idOrganisation); }
  public async rechercherParIdentite(critere: CritereRechercheIdentiteEleve): Promise<Eleve[]> { return [...this.eleves.values()].filter((eleve) => eleve.obtenirIdEcole() === critere.idEcole); }
  public async existeMatriculeDansEcole(idEcole: string, matricule: string): Promise<boolean> { return (await this.trouverParMatricule(idEcole, matricule)) !== null; }
  public async existeDoublonProbable(): Promise<boolean> { return false; }
  public async trouverParFamille(idFamille: string): Promise<Eleve[]> { return [...this.eleves.values()].filter((eleve) => eleve.obtenirIdFamille() === idFamille); }
}
