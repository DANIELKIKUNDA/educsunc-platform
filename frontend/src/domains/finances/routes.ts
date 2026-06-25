import type { RouteRecordRaw } from 'vue-router';
import ModuleHomeView from './views/ModuleHomeView.vue';
import PerceptionPaiementView from './views/PerceptionPaiementView.vue';
import OuvertureCaisseView from './views/OuvertureCaisseView.vue';
import ClotureCaisseView from './views/ClotureCaisseView.vue';
import CaisseDuJourView from './views/CaisseDuJourView.vue';

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
];
