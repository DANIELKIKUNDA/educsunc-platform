import { AffectationUtilisateur, MoteurTitulariat } from '../../../security/domain';
import type {
  ActiverAffectationInput,
  AjouterScopeAffectationInput,
  AttribuerTitulariatInput,
  CreerAffectationUtilisateurInput,
  DesactiverAffectationInput,
  RetirerScopeAffectationInput,
  RetirerTitulariatInput,
} from '../dto/input';
import type { AffectationUtilisateurOutput, ScopeUtilisateurOutput, TitulariatOutput } from '../dto/output';
import type {
  AffectationTitulariatRepositoryPort,
  AffectationUtilisateurRepositoryPort,
  SecurityNotificationPort,
} from '../ports';
import type { VerifierTitulariatClasseQuery } from '../queries';
import { ErreurActivationAffectation, ErreurAttributionTitulariat, ErreurCreationAffectation, ErreurRetraitTitulariat, ErreurScopeAffectation } from '../exceptions';
import { AffectationUtilisateurMapper, ScopeMapper, TitulariatMapper } from '../mappers';

// Ce service gere les affectations utilisateur, les scopes et le titulariat.
export class SecurityAffectationService {
  constructor(
    private readonly affectationUtilisateurRepositoryPort: AffectationUtilisateurRepositoryPort,
    private readonly affectationTitulariatRepositoryPort: AffectationTitulariatRepositoryPort,
    private readonly verifierTitulariatClasseQuery: VerifierTitulariatClasseQuery,
    private readonly securityNotificationPort: SecurityNotificationPort,
    private readonly moteurTitulariat: MoteurTitulariat,
  ) {}

  public async creerAffectation(input: CreerAffectationUtilisateurInput): Promise<AffectationUtilisateurOutput> {
    try {
      const affectation = AffectationUtilisateur.creer(input);
      await this.affectationUtilisateurRepositoryPort.sauvegarder(affectation);
      return AffectationUtilisateurMapper.depuisDomaine(affectation);
    } catch (error) {
      throw new ErreurCreationAffectation(error instanceof Error ? error.message : undefined);
    }
  }

  public async activerAffectation(input: ActiverAffectationInput): Promise<AffectationUtilisateurOutput> {
    const affectation = await this.obtenirAffectation(input.idAffectationUtilisateur);
    try {
      affectation.activer();
      await this.affectationUtilisateurRepositoryPort.sauvegarder(affectation);
      return AffectationUtilisateurMapper.depuisDomaine(affectation);
    } catch (error) {
      throw new ErreurActivationAffectation(error instanceof Error ? error.message : undefined);
    }
  }

  public async desactiverAffectation(input: DesactiverAffectationInput): Promise<AffectationUtilisateurOutput> {
    const affectation = await this.obtenirAffectation(input.idAffectationUtilisateur);
    try {
      affectation.desactiver();
      await this.affectationUtilisateurRepositoryPort.sauvegarder(affectation);
      return AffectationUtilisateurMapper.depuisDomaine(affectation);
    } catch (error) {
      throw new ErreurActivationAffectation(error instanceof Error ? error.message : undefined);
    }
  }

  public async ajouterScope(input: AjouterScopeAffectationInput): Promise<readonly ScopeUtilisateurOutput[]> {
    const affectation = await this.obtenirAffectation(input.idAffectationUtilisateur);
    try {
      affectation.ajouterScope(input.typeScope, input.valeurScope, input.estLectureSeule ?? false);
      await this.affectationUtilisateurRepositoryPort.sauvegarder(affectation);
      return affectation.obtenirScopes().map((scope) => ScopeMapper.depuisDomaine(scope));
    } catch (error) {
      throw new ErreurScopeAffectation(error instanceof Error ? error.message : undefined);
    }
  }

  public async retirerScope(input: RetirerScopeAffectationInput): Promise<readonly ScopeUtilisateurOutput[]> {
    const affectation = await this.obtenirAffectation(input.idAffectationUtilisateur);
    try {
      affectation.retirerScope(input.typeScope, input.valeurScope);
      await this.affectationUtilisateurRepositoryPort.sauvegarder(affectation);
      return affectation.obtenirScopes().map((scope) => ScopeMapper.depuisDomaine(scope));
    } catch (error) {
      throw new ErreurScopeAffectation(error instanceof Error ? error.message : undefined);
    }
  }

  public async attribuerTitulariat(input: AttribuerTitulariatInput): Promise<TitulariatOutput> {
    try {
      const classePossedeDejaTitulaire = await this.verifierTitulariatClasseQuery.executer(input.idClasse, input.idAnneeScolaire);
      const titulariat = this.moteurTitulariat.attribuerTitulariat({ ...input, classePossedeDejaTitulaire });
      await this.affectationTitulariatRepositoryPort.sauvegarder(titulariat);
      await this.securityNotificationPort.notifierAccesSensible({
        idUtilisateur: input.idUtilisateur,
        action: 'SECURITY_TITULARIAT_ATTRIBUE',
        details: { idClasse: input.idClasse, idAnneeScolaire: input.idAnneeScolaire },
      });
      return TitulariatMapper.depuisDomaine(titulariat);
    } catch (error) {
      throw new ErreurAttributionTitulariat(error instanceof Error ? error.message : undefined);
    }
  }

  public async retirerTitulariat(input: RetirerTitulariatInput): Promise<TitulariatOutput> {
    const titulariat = await this.affectationTitulariatRepositoryPort.trouverActifParClasse(input.idClasse, input.idAnneeScolaire);
    if (!titulariat) {
      throw new ErreurRetraitTitulariat('Titulariat actif introuvable');
    }

    titulariat.retirer();
    await this.affectationTitulariatRepositoryPort.sauvegarder(titulariat);
    return TitulariatMapper.depuisDomaine(titulariat);
  }

  public async verifierTitulariat(idClasse: string, idAnneeScolaire: string): Promise<boolean> {
    return this.verifierTitulariatClasseQuery.executer(idClasse, idAnneeScolaire);
  }

  private async obtenirAffectation(idAffectationUtilisateur: string): Promise<AffectationUtilisateur> {
    const affectation = await this.affectationUtilisateurRepositoryPort.trouverParId(idAffectationUtilisateur);
    if (!affectation) {
      throw new ErreurCreationAffectation("Affectation introuvable");
    }
    return affectation;
  }
}
