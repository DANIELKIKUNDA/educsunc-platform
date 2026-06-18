import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  AnnulerPaiementController,
  AssetsRecusController,
  CloturerCaisseController,
  ConsulterArrieresEleveController,
  ConsulterCaisseJourController,
  ConsulterDetteEleveController,
  ConsulterFraisExigiblesController,
  ConsulterHistoriquePaiementsController,
  ConsulterRecusPaiementController,
  ConsulterRapportFinancierController,
  ExonerationController,
  ReimprimerRecuController,
  EnregistrerPaiementController,
  OuvrirCaisseController,
  ParametresPaiementController,
  RestituerExcedentController,
  TarificationController,
} from '../controllers';
import { ErreurPaiementsFacturationPresenter } from '../presenters/ErreurPaiementsFacturationPresenter';
import { PaiementTenantContext } from '../../../infrastructure/tenancy/PaiementTenantContext';
import { ValidationHttpPaiementsFacturation } from '../validators/ValidationHttpPaiementsFacturation';

// Ce fichier declare toutes les routes HTTP du BC Paiements & Facturation.
export interface DependancesRoutesPaiementsFacturation {
  controleurEnregistrerPaiement: EnregistrerPaiementController;
  controleurParametresPaiement?: ParametresPaiementController;
  controleurTarification?: TarificationController;
  controleurExoneration?: ExonerationController;
  controleurConsulterArrieresEleve: ConsulterArrieresEleveController;
  controleurConsulterDetteEleve: ConsulterDetteEleveController;
  controleurConsulterFraisExigibles: ConsulterFraisExigiblesController;
  controleurAnnulerPaiement: AnnulerPaiementController;
  controleurAssetsRecus: AssetsRecusController;
  controleurOuvrirCaisse: OuvrirCaisseController;
  controleurCloturerCaisse: CloturerCaisseController;
  controleurConsulterCaisseJour: ConsulterCaisseJourController;
  controleurConsulterHistoriquePaiements: ConsulterHistoriquePaiementsController;
  controleurConsulterRecusPaiement?: ConsulterRecusPaiementController;
  controleurConsulterRapportFinancier?: ConsulterRapportFinancierController;
  controleurRestituerExcedent: RestituerExcedentController;
  controleurReimprimerRecu: ReimprimerRecuController;
  contexteTenant?: PaiementTenantContext;
}

function construireHeadersEffectifs(requete: FastifyRequest): Record<string, unknown> {
  const headers = {
    ...ValidationHttpPaiementsFacturation.obtenirObjet(requete.headers, 'headers'),
  };

  if (requete.context?.utilisateurId) {
    headers['x-user-id'] = requete.context.utilisateurId;
  }

  if (requete.context?.organisationActiveId) {
    headers['x-organisation-id'] = requete.context.organisationActiveId;
  }

  if (requete.context?.ecoleActiveId) {
    headers['x-tenant-id'] = requete.context.ecoleActiveId;
  }

  if (requete.context?.roleActif) {
    headers['x-role-actif'] = requete.context.roleActif;
  }

  return headers;
}

// Cette fonction lit et applique le contexte tenant depuis les headers de la requete.
function appliquerTenantDepuisRequete(
  headers: Record<string, unknown>,
  contexteTenant?: PaiementTenantContext,
): void {
  if (contexteTenant === undefined) {
    return;
  }

  const idOrganisation = ValidationHttpPaiementsFacturation.lireHeaderChaine(
    headers,
    'x-organisation-id',
  );
  const idEcole = ValidationHttpPaiementsFacturation.lireHeaderChaine(
    headers,
    'x-tenant-id',
  );
  const idUtilisateur = ValidationHttpPaiementsFacturation.lireHeaderChaine(
    headers,
    'x-user-id',
  );
  const lectureOrganisationnelle =
    ValidationHttpPaiementsFacturation.lireHeaderChaine(
      headers,
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
  operation: (headersEffectifs: Record<string, unknown>) => Promise<unknown>,
  contexteTenant?: PaiementTenantContext,
  statutSucces = 200,
): Promise<FastifyReply> {
  const headersEffectifs = construireHeadersEffectifs(requete);

  try {
    appliquerTenantDepuisRequete(headersEffectifs, contexteTenant);
    const resultat = await operation(headersEffectifs);

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
    operation: (headersEffectifs: Record<string, unknown>) => Promise<unknown>,
    statutSucces = 200,
  ) => executerRoute(requete, reponse, operation, dependances.contexteTenant, statutSucces);

  serveur.post('/api/paiements', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) =>
        dependances.controleurEnregistrerPaiement.enregistrer(
          requete.body,
          headersEffectifs,
        ),
      201,
    ));

  serveur.post('/api/exonerations', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) =>
        dependances.controleurExoneration?.accorder(
          requete.body,
          headersEffectifs,
        ) ?? Promise.reject(new Error('La gestion des exonerations nest pas configuree.')),
      201,
    ));

  serveur.post('/api/exonerations/:idExoneration/annulation', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) =>
        dependances.controleurExoneration?.annuler(
          requete.params,
          requete.body,
          headersEffectifs,
        ) ?? Promise.reject(new Error('La gestion des exonerations nest pas configuree.')),
    ));

  serveur.get('/api/eleves/:idEleve/dette', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) =>
        dependances.controleurConsulterDetteEleve.consulter(
          requete.params,
          headersEffectifs,
        ),
    ));

  serveur.get('/api/eleves/:idEleve/arrieres', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) =>
        dependances.controleurConsulterArrieresEleve.consulter(
          requete.params,
          headersEffectifs,
        ),
    ));

  serveur.get('/api/eleves/:idEleve/frais-exigibles', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) =>
        dependances.controleurConsulterFraisExigibles.consulter(
          requete.params,
          headersEffectifs,
        ),
    ));

  serveur.get('/api/eleves/:idEleve/paiements', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) =>
        dependances.controleurConsulterHistoriquePaiements.consulter(
          requete.params,
          headersEffectifs,
        ),
    ));

  serveur.get('/api/rapports-financiers/journalier', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) =>
        dependances.controleurConsulterRapportFinancier?.consulterJournalier(
          requete.query,
          headersEffectifs,
        ) ?? Promise.reject(new Error('La consultation du rapport financier nest pas configuree.')),
    ));

  serveur.get('/api/rapports-financiers/paiements-par-caissier', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) =>
        dependances.controleurConsulterRapportFinancier?.consulterPaiementsParCaissier(
          requete.query,
          headersEffectifs,
        ) ?? Promise.reject(new Error('La consultation des paiements par caissier nest pas configuree.')),
    ));

  serveur.get('/api/rapports-financiers/paiements-par-type-frais', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) =>
        dependances.controleurConsulterRapportFinancier?.consulterPaiementsParTypeFrais(
          requete.query,
          headersEffectifs,
        ) ?? Promise.reject(new Error('La consultation des paiements par type de frais nest pas configuree.')),
    ));

  serveur.get('/api/rapports-financiers/fonds-anticipes', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) =>
        dependances.controleurConsulterRapportFinancier?.consulterFondsAnticipes(
          requete.query,
          headersEffectifs,
        ) ?? Promise.reject(new Error('La consultation des fonds anticipes nest pas configuree.')),
    ));

  serveur.post('/api/paiements/:idPaiement/annulation', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) =>
        dependances.controleurAnnulerPaiement.annuler(
          requete.params,
          requete.body,
          headersEffectifs,
        ),
    ));

  serveur.post('/api/paiements/restitution', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) => dependances.controleurRestituerExcedent.restituer(requete.body, headersEffectifs),
      201,
    ));

  serveur.get('/api/recus/:idRecu', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) =>
        dependances.controleurReimprimerRecu.consulter(
          requete.params,
          headersEffectifs,
        ),
    ));

  serveur.get('/api/recus', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) =>
        dependances.controleurConsulterRecusPaiement?.consulter(
          requete.query,
          headersEffectifs,
        ) ?? Promise.reject(new Error('La consultation des recus nest pas configuree.')),
    ));

  serveur.get('/api/recus/:idRecu/pdf', async (requete, reponse) => {
    const headersEffectifs = construireHeadersEffectifs(requete);

    try {
      appliquerTenantDepuisRequete(headersEffectifs, dependances.contexteTenant);
      const resultat = await dependances.controleurReimprimerRecu.telechargerPdf(
        requete.params,
        headersEffectifs,
      );

      return reponse
        .code(200)
        .header('content-type', resultat.mimeType)
        .header(
          'content-disposition',
          `inline; filename="${resultat.nomFichier}"`,
        )
        .send(resultat.contenu);
    } catch (erreur) {
      const erreurPresentee = ErreurPaiementsFacturationPresenter.presenterErreur(erreur);
      return reponse.code(erreurPresentee.statutHttp).send(erreurPresentee.corps);
    } finally {
      dependances.contexteTenant?.reinitialiser();
    }
  });

  serveur.get('/api/recus/assets/ecole', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) => dependances.controleurAssetsRecus.consulterIdentiteEcole(headersEffectifs),
    ));

  serveur.put('/api/recus/assets/ecole', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) => dependances.controleurAssetsRecus.configurerIdentiteEcole(requete.body, headersEffectifs),
    ));

  serveur.get('/api/recus/assets/ecole/logo', async (requete, reponse) => {
    const headersEffectifs = construireHeadersEffectifs(requete);
    try {
      appliquerTenantDepuisRequete(headersEffectifs, dependances.contexteTenant);
      const resultat = await dependances.controleurAssetsRecus.telechargerLogo(headersEffectifs);
      return reponse.code(200).header('content-type', resultat.mimeType).send(resultat.contenu);
    } catch (erreur) {
      const erreurPresentee = ErreurPaiementsFacturationPresenter.presenterErreur(erreur);
      return reponse.code(erreurPresentee.statutHttp).send(erreurPresentee.corps);
    } finally {
      dependances.contexteTenant?.reinitialiser();
    }
  });

  serveur.get('/api/recus/assets/ecole/cachet', async (requete, reponse) => {
    const headersEffectifs = construireHeadersEffectifs(requete);
    try {
      appliquerTenantDepuisRequete(headersEffectifs, dependances.contexteTenant);
      const resultat = await dependances.controleurAssetsRecus.telechargerCachet(headersEffectifs);
      return reponse.code(200).header('content-type', resultat.mimeType).send(resultat.contenu);
    } catch (erreur) {
      const erreurPresentee = ErreurPaiementsFacturationPresenter.presenterErreur(erreur);
      return reponse.code(erreurPresentee.statutHttp).send(erreurPresentee.corps);
    } finally {
      dependances.contexteTenant?.reinitialiser();
    }
  });

  serveur.get('/api/recus/assets/signature', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) => dependances.controleurAssetsRecus.consulterSignature(headersEffectifs),
    ));

  serveur.put('/api/recus/assets/signature', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) => dependances.controleurAssetsRecus.configurerSignature(requete.body, headersEffectifs),
    ));

  serveur.get('/api/paiements/parametres', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) =>
        dependances.controleurParametresPaiement?.consulter(headersEffectifs)
        ?? Promise.reject(new Error('La consultation des parametres de paiement nest pas configuree.')),
    ));

  serveur.put('/api/paiements/parametres', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) =>
        dependances.controleurParametresPaiement?.configurer(
          requete.body,
          headersEffectifs,
        ) ?? Promise.reject(new Error('La configuration des parametres de paiement nest pas configuree.')),
    ));

  serveur.get('/api/tarification/grilles', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) =>
        dependances.controleurTarification?.lister(
          requete.query,
          headersEffectifs,
        ) ?? Promise.reject(new Error('La consultation des grilles de tarification nest pas configuree.')),
    ));

  serveur.post('/api/tarification/grilles', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) =>
        dependances.controleurTarification?.creer(
          requete.body,
          headersEffectifs,
        ) ?? Promise.reject(new Error('La creation des grilles de tarification nest pas configuree.')),
      201,
    ));

  serveur.put('/api/tarification/grilles/:idGrilleTarification', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) =>
        dependances.controleurTarification?.modifier(
          requete.params,
          requete.body,
          headersEffectifs,
        ) ?? Promise.reject(new Error('La modification des grilles de tarification nest pas configuree.')),
    ));

  serveur.post('/api/tarification/grilles/:idGrilleTarification/desactivation', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) =>
        dependances.controleurTarification?.desactiver(
          requete.params,
          requete.body,
          headersEffectifs,
        ) ?? Promise.reject(new Error('La desactivation des grilles de tarification nest pas configuree.')),
    ));

  serveur.get('/api/recus/assets/signature/fichier', async (requete, reponse) => {
    const headersEffectifs = construireHeadersEffectifs(requete);
    try {
      appliquerTenantDepuisRequete(headersEffectifs, dependances.contexteTenant);
      const resultat = await dependances.controleurAssetsRecus.telechargerSignature(headersEffectifs);
      return reponse.code(200).header('content-type', resultat.mimeType).send(resultat.contenu);
    } catch (erreur) {
      const erreurPresentee = ErreurPaiementsFacturationPresenter.presenterErreur(erreur);
      return reponse.code(erreurPresentee.statutHttp).send(erreurPresentee.corps);
    } finally {
      dependances.contexteTenant?.reinitialiser();
    }
  });

  serveur.post('/api/caisse/ouverture', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) => dependances.controleurOuvrirCaisse.ouvrir(requete.body, headersEffectifs),
      201,
    ));

  serveur.post('/api/caisse/cloture', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) => dependances.controleurCloturerCaisse.cloturer(requete.body, headersEffectifs),
    ));

  serveur.get('/api/caisse/jour', (requete, reponse) =>
    executer(
      requete,
      reponse,
      (headersEffectifs) => dependances.controleurConsulterCaisseJour.consulter(requete.query, headersEffectifs),
    ));
};
