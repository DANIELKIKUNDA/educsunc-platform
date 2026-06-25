import type { RouteRecordRaw } from 'vue-router';
import ModuleHomeView from './views/ModuleHomeView.vue';
import PerceptionPaiementView from './views/PerceptionPaiementView.vue';
import OuvertureCaisseView from './views/OuvertureCaisseView.vue';
import ClotureCaisseView from './views/ClotureCaisseView.vue';
import CaisseDuJourView from './views/CaisseDuJourView.vue';
import HistoriquePaiementsEleveView from './views/HistoriquePaiementsEleveView.vue';
import SituationFinanciereEleveView from './views/SituationFinanciereEleveView.vue';
import RecuPaiementView from './views/RecuPaiementView.vue';
import AnalysePaiementsTypeFraisView from './views/AnalysePaiementsTypeFraisView.vue';
import ExonerationsView from './views/ExonerationsView.vue';

export const routesFinances: RouteRecordRaw[] = [
  {
    path: 'finances',
    name: 'finances-home',
    component: ModuleHomeView,
    meta: { title: 'Finances' },
  },
  {
    path: 'finances/paiements/enregistrer',
    name: 'finances-perception-paiement',
    component: PerceptionPaiementView,
    meta: { title: 'Perception de paiement' },
  },
  {
    path: 'finances/caisse/ouverture',
    name: 'finances-ouverture-caisse',
    component: OuvertureCaisseView,
    meta: { title: 'Ouverture de caisse' },
  },
  {
    path: 'finances/caisse/cloture',
    name: 'finances-cloture-caisse',
    component: ClotureCaisseView,
    meta: { title: 'Cloture de caisse' },
  },
  {
    path: 'finances/caisse',
    name: 'finances-caisse-du-jour',
    component: CaisseDuJourView,
    meta: { title: 'Caisse du jour' },
  },
  {
    path: 'finances/historiques',
    name: 'finances-historique-paiements-eleve',
    component: HistoriquePaiementsEleveView,
    meta: { title: 'Historique des paiements' },
  },
  {
    path: 'finances/dettes',
    name: 'finances-situation-financiere-eleve',
    component: SituationFinanciereEleveView,
    meta: { title: 'Situation financiere eleve' },
  },
  {
    path: 'finances/recus/:idRecu',
    name: 'finances-recu-paiement',
    component: RecuPaiementView,
    meta: { title: 'Recu de paiement' },
  },
  {
    path: 'finances/rapports',
    name: 'finances-analyse-paiements-type-frais',
    component: AnalysePaiementsTypeFraisView,
    meta: { title: 'Analyse paiements par type de frais' },
  },
  {
    path: 'finances/exonerations',
    name: 'finances-exonerations',
    component: ExonerationsView,
    meta: { title: 'Exonerations' },
  },
];
