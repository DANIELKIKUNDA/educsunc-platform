import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  AnnulerPaiementController,
  CloturerCaisseController,
  ConsulterCaisseJourController,
  ConsulterDetteEleveController,
  ConsulterFraisExigiblesController,
  ConsulterHistoriquePaiementsController,
  EnregistrerPaiementController,
  OuvrirCaisseController,
  RestituerExcedentController,
} from '../controllers';
import { ErreurPaiementsFacturationPresenter } from '../presenters/ErreurPaiementsFacturationPresenter';
import { PaiementTenantContext } from '../../../infrastructure/tenancy/PaiementTenantContext';
import { ValidationHttpPaiementsFacturation } from '../validators/ValidationHttpPaiementsFacturation';

// Ce fichier declare toutes les routes HTTP du BC Paiements & Facturation.
export interface DependancesRoutesPaiementsFacturation {
  controleurEnregistrerPaiement: EnregistrerPaiementController;
  controleurConsulterDetteEleve: ConsulterDetteEleveController;
  controleurConsulterFraisExigibles: ConsulterFraisExigiblesController;
  controleurAnnulerPaiement: AnnulerPaiementController;
  controleurOuvrirCaisse: OuvrirCaisseController;
  controleurCloturerCaisse: CloturerCaisseController;
  controleurConsulterCaisseJour: ConsulterCaisseJourController;
  controleurConsulterHistoriquePaiements: ConsulterHistoriquePaiementsController;
  controleurRestituerExcedent: RestituerExcedentController;
  contexteTenant?: PaiementTenantContext;
}

// Cette fonction lit et applique le contexte tenant depuis les headers de la requete.
function appliquerTenantDepuisRequete(
  requete: FastifyRequest,
  contexteTenant?: PaiementTenantContext,
): void {
  if (contexteTenant === undefined) {
    return;
  }

  const idOrganisation = ValidationHttpPaiementsFacturation.lireHeaderChaine(
    requete.headers,
    'x-organisation-id',
  );
  const idEcole = ValidationHttpPaiementsFacturation.lireHeaderChaine(
    requete.headers,
    'x-tenant-id',
  );
  const idUtilisateur = ValidationHttpPaiementsFacturation.lireHeaderChaine(
    requete.headers,
    'x-user-id',
  );
  const lectureOrganisationnelle =
    ValidationHttpPaiementsFacturation.lireHeaderChaine(
      requete.headers,
      'x-lecture-organisationnelle',
    ) === 'true';

  if (lectureOrganisationnelle && idOrganisation !== undefined) {
    contexteTenant.definirLectureOrganisationnelle(idOrganisation, idUtilisateur);
    return;
  }

  if (idOrganisation !== undefined && idEcole !== undefined) {
    contexteTenant.definirEcoleCourante(idOrganisation, idEcole, idUtilisateur);
  }
}

// Cette fonction execute une route Fastify en appliquant le mapping d'erreur commun.
async function executerRoute(
  requete: FastifyRequest,
  reponse: FastifyReply,
  operation: () => Promise<unknown>,
  contexteTenant?: PaiementTenantContext,
  statutSucces = 200,
): Promise<FastifyReply> {
  try {
    appliquerTenantDepuisRequete(requete, contexteTenant);
    const resultat = await operation();

    return reponse.code(statutSucces).send(resultat);
  } catch (erreur) {
    const erreurPresentee = ErreurPaiementsFacturationPresenter.presenterErreur(erreur);
    return reponse.code(erreurPresentee.statutHttp).send(erreurPresentee.corps);
  } finally {
    contexteTenant?.reinitialiser();
  }
}

// Cette fonction cree le plugin Fastify expose par le BC Paiements.
export const creerRoutesPaiementsFacturation = (
  dependances: DependancesRoutesPaiementsFacturation,
): FastifyPluginAsync => async (serveur) => {
  const executer = (
    requete: FastifyRequest,
    reponse: FastifyReply,
    operation: () => Promise<unknown>,
    statutSucces = 200,
  ) => executerRoute(requete, reponse, operation, dependances.contexteTenant, statutSucces);

  serveur.post('/api/paiements', (requete, reponse) =>
    executer(
      requete,
      reponse,
      () =>
        dependances.controleurEnregistrerPaiement.enregistrer(
          requete.body,
          requete.headers,
        ),
      201,
    ));

  serveur.get('/api/eleves/:idEleve/dette', (requete, reponse) =>
    executer(
      requete,
      reponse,
      () => dependances.controleurConsulterDetteEleve.consulter(requete.params),
    ));

  serveur.get('/api/eleves/:idEleve/frais-exigibles', (requete, reponse) =>
    executer(
      requete,
      reponse,
      () => dependances.controleurConsulterFraisExigibles.consulter(requete.params),
    ));

  serveur.get('/api/eleves/:idEleve/paiements', (requete, reponse) =>
    executer(
      requete,
      reponse,
      () => dependances.controleurConsulterHistoriquePaiements.consulter(requete.params),
    ));

  serveur.post('/api/paiements/:idPaiement/annulation', (requete, reponse) =>
    executer(
      requete,
      reponse,
      () =>
        dependances.controleurAnnulerPaiement.annuler(
          requete.params,
          requete.body,
          requete.headers,
        ),
    ));

  serveur.post('/api/paiements/restitution', (requete, reponse) =>
    executer(
      requete,
      reponse,
      () => dependances.controleurRestituerExcedent.restituer(requete.body, requete.headers),
      201,
    ));

  serveur.post('/api/caisse/ouverture', (requete, reponse) =>
    executer(
      requete,
      reponse,
      () => dependances.controleurOuvrirCaisse.ouvrir(requete.body, requete.headers),
      201,
    ));

  serveur.post('/api/caisse/cloture', (requete, reponse) =>
    executer(
      requete,
      reponse,
      () => dependances.controleurCloturerCaisse.cloturer(requete.body, requete.headers),
    ));

  serveur.get('/api/caisse/jour', (requete, reponse) =>
    executer(
      requete,
      reponse,
      () => dependances.controleurConsulterCaisseJour.consulter(requete.query, requete.headers),
    ));
};
