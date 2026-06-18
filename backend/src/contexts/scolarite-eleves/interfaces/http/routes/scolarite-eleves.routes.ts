import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  ControleurAffectationsClasses,
  ControleurCycleVieEleves,
  ControleurEleves,
  ControleurFamilles,
  ControleurInscriptionsScolaires,
  ControleurParcoursEleves,
  ControleurScolariteOrganisation,
} from '../controllers';
import { ErreurScolaritePresenter } from '../presenters/ErreurScolaritePresenter';
import { ScolariteTenantContext } from '../../../infrastructure/tenancy/ScolariteTenantContext';

// Ce fichier enregistre toutes les routes HTTP du BC Scolarite des Eleves.
export interface DependancesRoutesScolariteEleves {
  controleurEleves: ControleurEleves;
  controleurFamilles: ControleurFamilles;
  controleurInscriptions: ControleurInscriptionsScolaires;
  controleurAffectations: ControleurAffectationsClasses;
  controleurCycleVie: ControleurCycleVieEleves;
  controleurParcours: ControleurParcoursEleves;
  controleurOrganisation: ControleurScolariteOrganisation;
  contexteTenant?: ScolariteTenantContext;
}

const lireHeaderChaine = (
  headers: FastifyRequest['headers'],
  nom: string,
): string | undefined => {
  const valeur = headers[nom];
  if (Array.isArray(valeur)) return valeur[0];
  return typeof valeur === 'string' && valeur.trim().length > 0 ? valeur.trim() : undefined;
};

const appliquerTenantDepuisRequete = (
  requete: FastifyRequest,
  contexteTenant?: ScolariteTenantContext,
): void => {
  if (typeof requete.headers['x-user-id'] === 'string') {
    delete requete.headers['x-user-id'];
  }

  if (requete.context?.utilisateurId) {
    requete.headers['x-user-id'] = requete.context.utilisateurId;
  }

  if (contexteTenant === undefined) {
    return;
  }

  const idOrganisation = lireHeaderChaine(requete.headers, 'x-organisation-id');
  const idEcole = lireHeaderChaine(requete.headers, 'x-tenant-id');
  const lectureOrganisationnelle = lireHeaderChaine(
    requete.headers,
    'x-lecture-organisationnelle',
  ) === 'true';

  if (lectureOrganisationnelle && idOrganisation !== undefined) {
    contexteTenant.definirLectureOrganisationnelle(idOrganisation);
    return;
  }

  if (idOrganisation !== undefined && idEcole !== undefined) {
    contexteTenant.definirEcoleCourante(idOrganisation, idEcole);
  }
};

const executerRoute = async (
  requete: FastifyRequest,
  reponse: FastifyReply,
  operation: () => Promise<unknown>,
  contexteTenant?: ScolariteTenantContext,
): Promise<FastifyReply> => {
  try {
    appliquerTenantDepuisRequete(requete, contexteTenant);
    const resultat = await operation();
    return reponse.code(200).send(resultat);
  } catch (erreur) {
    const erreurPresentee = ErreurScolaritePresenter.presenterErreur(erreur);
    return reponse.code(erreurPresentee.statutHttp).send(erreurPresentee.corps);
  } finally {
    contexteTenant?.reinitialiser();
  }
};

/** Cree le plugin Fastify du BC Scolarite des Eleves. */
export const creerRoutesScolariteEleves = (
  dependances: DependancesRoutesScolariteEleves,
): FastifyPluginAsync => async (serveur) => {
  const executer = (
    requete: FastifyRequest,
    reponse: FastifyReply,
    operation: () => Promise<unknown>,
  ) => executerRoute(requete, reponse, operation, dependances.contexteTenant);

  serveur.post('/api/eleves', (requete, reponse) => executer(requete, reponse, () => dependances.controleurEleves.creerEleve(requete.body, requete.headers)));
  serveur.patch('/api/eleves/:id', (requete, reponse) => executer(requete, reponse, () => dependances.controleurEleves.modifierEleve(requete.params, requete.body, requete.headers)));
  serveur.get('/api/eleves/recherche', (requete, reponse) => executer(requete, reponse, () => dependances.controleurEleves.rechercherEleves(requete.query, requete.headers)));
  serveur.get('/api/eleves/:id', (requete, reponse) => executer(requete, reponse, () => dependances.controleurEleves.consulterEleve(requete.params, requete.headers)));
  serveur.get('/api/eleves', (requete, reponse) => executer(requete, reponse, () => dependances.controleurEleves.listerEleves(requete.query, requete.headers)));
  serveur.post('/api/eleves/:id/rattacher-famille', (requete, reponse) => executer(requete, reponse, () => dependances.controleurEleves.rattacherFamille(requete.params, requete.body, requete.headers)));
  serveur.post('/api/eleves/:id/detacher-famille', (requete, reponse) => executer(requete, reponse, () => dependances.controleurEleves.detacherFamille(requete.params, requete.body, requete.headers)));
  serveur.post('/api/eleves/:id/deces', (requete, reponse) => executer(requete, reponse, () => dependances.controleurCycleVie.declarerDeces(requete.params, requete.body, requete.headers)));

  serveur.post('/api/familles', (requete, reponse) => executer(requete, reponse, () => dependances.controleurFamilles.creerFamille(requete.body, requete.headers)));
  serveur.patch('/api/familles/:id', (requete, reponse) => executer(requete, reponse, () => dependances.controleurFamilles.modifierFamille(requete.params, requete.body, requete.headers)));
  serveur.get('/api/familles/:id', (requete, reponse) => executer(requete, reponse, () => dependances.controleurFamilles.consulterFamille(requete.params, requete.headers)));
  serveur.get('/api/familles', (requete, reponse) => executer(requete, reponse, () => dependances.controleurFamilles.listerFamilles(requete.query, requete.headers)));
  serveur.post('/api/familles/:id/responsables', (requete, reponse) => executer(requete, reponse, () => dependances.controleurFamilles.ajouterResponsable(requete.params, requete.body, requete.headers)));
  serveur.patch('/api/familles/:id/responsables/:idResponsable', (requete, reponse) => executer(requete, reponse, () => dependances.controleurFamilles.modifierResponsable(requete.params, requete.body, requete.headers)));
  serveur.delete('/api/familles/:id/responsables/:idResponsable', (requete, reponse) => executer(requete, reponse, () => dependances.controleurFamilles.retirerResponsable(requete.params, requete.body, requete.headers)));
  serveur.post('/api/familles/:id/responsable-principal', (requete, reponse) => executer(requete, reponse, () => dependances.controleurFamilles.definirResponsablePrincipal(requete.params, requete.body, requete.headers)));
  serveur.get('/api/familles/:id/famille-nombreuse', (requete, reponse) => executer(requete, reponse, () => dependances.controleurFamilles.evaluerFamilleNombreuse(requete.params, requete.headers)));

  serveur.post('/api/inscriptions-scolaires', (requete, reponse) => executer(requete, reponse, () => dependances.controleurInscriptions.creerInscription(requete.body, requete.headers)));
  serveur.post('/api/inscriptions-scolaires/complete', (requete, reponse) => executer(requete, reponse, () => dependances.controleurInscriptions.creerInscriptionComplete(requete.body, requete.headers)));
  serveur.post('/api/inscriptions-scolaires/:id/valider', (requete, reponse) => executer(requete, reponse, () => dependances.controleurInscriptions.validerInscription(requete.params, requete.body, requete.headers)));
  serveur.post('/api/inscriptions-scolaires/:id/annuler', (requete, reponse) => executer(requete, reponse, () => dependances.controleurInscriptions.annulerInscription(requete.params, requete.body, requete.headers)));
  serveur.get('/api/inscriptions-scolaires/par-annee/:idAnnee', (requete, reponse) => executer(requete, reponse, () => dependances.controleurInscriptions.listerParAnnee(requete.params)));
  serveur.get('/api/inscriptions-scolaires/par-classe/:idClasse', (requete, reponse) => executer(requete, reponse, () => dependances.controleurInscriptions.listerParClasse(requete.params)));
  serveur.get('/api/inscriptions-scolaires/:id', (requete, reponse) => executer(requete, reponse, () => dependances.controleurInscriptions.consulterInscription(requete.params)));

  serveur.post('/api/affectations-classes', (requete, reponse) => executer(requete, reponse, () => dependances.controleurAffectations.affecterEleve(requete.body, requete.headers)));
  serveur.post('/api/affectations-classes/:id/changer-classe', (requete, reponse) => executer(requete, reponse, () => dependances.controleurAffectations.changerClasse(requete.params, requete.body, requete.headers)));
  serveur.post('/api/affectations-classes/:id/desactiver', (requete, reponse) => executer(requete, reponse, () => dependances.controleurAffectations.desactiverAffectation(requete.params, requete.headers)));
  serveur.get('/api/affectations-classes/active/:idInscription', (requete, reponse) => executer(requete, reponse, () => dependances.controleurAffectations.consulterAffectationActive(requete.params, requete.headers)));
  serveur.get('/api/affectations-classes/:id', (requete, reponse) => executer(requete, reponse, () => dependances.controleurAffectations.consulterAffectation(requete.params, requete.headers)));
  serveur.get('/api/classes-pedagogiques/:id/eleves', (requete, reponse) => executer(requete, reponse, () => dependances.controleurAffectations.listerElevesParClasse(requete.params, requete.headers)));

  serveur.post('/api/eleves/:id/abandon', (requete, reponse) => executer(requete, reponse, () => dependances.controleurCycleVie.declarerAbandon(requete.params, requete.body, requete.headers)));
  serveur.post('/api/eleves/:id/transfert', (requete, reponse) => executer(requete, reponse, () => dependances.controleurCycleVie.transfererEleve(requete.params, requete.body, requete.headers)));
  serveur.post('/api/eleves/:id/reintegration', (requete, reponse) => executer(requete, reponse, () => dependances.controleurCycleVie.reintegrerEleve(requete.params, requete.body, requete.headers)));
  serveur.post('/api/eleves/:id/suspension', (requete, reponse) => executer(requete, reponse, () => dependances.controleurCycleVie.suspendreEleve(requete.params, requete.body, requete.headers)));
  serveur.post('/api/eleves/:id/reactivation', (requete, reponse) => executer(requete, reponse, () => dependances.controleurCycleVie.reactiverEleve(requete.params, requete.body, requete.headers)));

  serveur.get('/api/eleves/:id/parcours', (requete, reponse) => executer(requete, reponse, () => dependances.controleurParcours.consulterParcours(requete.params, requete.headers)));
  serveur.get('/api/eleves/:id/evenements', (requete, reponse) => executer(requete, reponse, () => dependances.controleurParcours.listerEvenementsParEleve(requete.params, requete.headers)));
  serveur.get('/api/parcours/evenements/par-annee/:idAnnee', (requete, reponse) => executer(requete, reponse, () => dependances.controleurParcours.listerEvenementsParAnnee(requete.params, requete.headers)));

  serveur.get('/api/organisations/:idOrganisation/scolarite/eleves', (requete, reponse) => executer(requete, reponse, () => dependances.controleurOrganisation.listerElevesParOrganisation(requete.params, requete.query, requete.headers)));
  serveur.get('/api/organisations/:idOrganisation/scolarite/inscriptions', (requete, reponse) => executer(requete, reponse, () => dependances.controleurOrganisation.listerInscriptionsParOrganisation(requete.params, requete.query, requete.headers)));
  serveur.get('/api/organisations/:idOrganisation/scolarite/synthese', (requete, reponse) => executer(requete, reponse, () => dependances.controleurOrganisation.consulterSyntheseOrganisation(requete.params, requete.query, requete.headers)));
  serveur.get('/api/organisations/:idOrganisation/scolarite/alertes', (requete, reponse) => executer(requete, reponse, () => dependances.controleurOrganisation.listerAlertesOrganisation(requete.params, requete.query, requete.headers)));
};

export type RequeteScolariteEleves = FastifyRequest;
