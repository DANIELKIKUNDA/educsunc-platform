<script setup lang="ts">
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  Home,
  Layers3,
  RefreshCw,
  School,
  UserRound,
} from 'lucide-vue-next';
import { onMounted } from 'vue';
import { useTheme } from '../composables/useTheme';
import ThemeToggle from '../modules/referentiel/commun/composants/ThemeToggle.vue';

const { initTheme } = useTheme();

onMounted(() => {
  initTheme();
});
</script>

<template>
  <!-- Structure de base du layout d'administration. -->
  <section class="layout-admin">
    <aside class="layout-admin__navigation">
      <div class="layout-admin__marque">
        <Home class="icone-layout icone-layout--marque" />
      </div>

      <nav class="layout-admin__menu" aria-label="Navigation principale">
        <p class="layout-admin__menu-section">Référentiel école</p>
        <RouterLink to="/referentiel/ecole"><Home class="icone-layout" /> Tableau de bord</RouterLink>
        <RouterLink to="/referentiel/ecole/annees"><CalendarDays class="icone-layout" /> Années scolaires</RouterLink>
        <RouterLink to="/referentiel/ecole/officiel"><Layers3 class="icone-layout" /> Référentiel officiel</RouterLink>
        <RouterLink to="/referentiel/ecole/classes-pedagogiques"><School class="icone-layout" /> Classes pédagogiques</RouterLink>
        <RouterLink to="/referentiel/ecole/programmes-niveau"><BookOpen class="icone-layout" /> Programmes niveau</RouterLink>
        <RouterLink to="/referentiel/ecole/calendriers"><ClipboardList class="icone-layout" /> Calendriers</RouterLink>
        <p class="layout-admin__menu-section">Maintenance</p>
        <RouterLink to="/referentiel/ecole/maintenance"><RefreshCw class="icone-layout" /> Mises à jour</RouterLink>
      </nav>
    </aside>

    <div class="layout-admin__contenu">
      <header class="barre-contexte">
        <div class="barre-contexte__selection">
          <span>Organisation</span>
          <strong>À connecter</strong>
        </div>
        <div class="barre-contexte__selection">
          <span>École</span>
          <strong>École courante</strong>
        </div>
        <div class="barre-contexte__selection">
          <span>Année</span>
          <strong>Active à charger</strong>
        </div>
        <div class="barre-contexte__utilisateur">
          <ThemeToggle />
          <button class="layout-admin__avatar" type="button" aria-label="Profil utilisateur connecté">
            <UserRound class="icone-layout icone-layout--avatar" />
          </button>
          <div>
            <strong>Admin principal</strong>
          </div>
        </div>
      </header>

      <main class="layout-admin__principal">
        <RouterView />
      </main>
    </div>
  </section>
</template>
