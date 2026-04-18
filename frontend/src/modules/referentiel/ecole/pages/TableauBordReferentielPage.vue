<script setup lang="ts">
import { onMounted, ref } from 'vue';
import AlerteMetier from '../../commun/composants/AlerteMetier.vue';
import BadgeStatut from '../../commun/composants/BadgeStatut.vue';
import {
  AlertTriangle,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  Compass,
  FolderCheck,
  School,
  Users,
  Clock,
  TrendingUp,
} from 'lucide-vue-next';

// Ã‰tat de chargement
const isLoading = ref(false);
const lastSync = ref(new Date());

// DonnÃ©es statiques (seront connectÃ©es au backend plus tard)
const messages = ref([
  {
    titre: 'SystÃ¨me opÃ©rationnel',
    message: 'Tous les services sont en ligne et fonctionnels.',
    type: 'succes' as const,
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    actions: []
  }
]);

const classes = ref([
  { id: '1', nom: '6Ã¨me A', effectif: 28, statut: 'actif' },
  { id: '2', nom: '6Ã¨me B', effectif: 26, statut: 'actif' },
  { id: '3', nom: '5Ã¨me A', effectif: 30, statut: 'actif' }
]);

const referentielOfficiel = ref([
  { libelle: 'Programmes nationaux', valeur: '2024-2025', statut: 'actif' },
  { libelle: 'Calendrier acadÃ©mique', valeur: 'Version 2.1', statut: 'actif' },
  { libelle: 'RÃ©fÃ©rentiels pÃ©dagogiques', valeur: 'MÃ  jour', statut: 'mise_a_jour' }
]);

const kpiData = ref({
  anneeActive: '2024-2025',
  statutAnnee: 'Active',
  classesCount: 12,
  classesStatut: 'actives' as const,
  programmesStatut: 'actifs' as const,
  calendrierStatut: 'actif' as const,
  periodeEnCours: 'Trimestre 2',
  prochainePeriode: 'Examens fin T2'
});

// Fonctions de navigation (Ã  connecter au router plus tard)
const preparerAnneeSuivante = () => {
  console.log('Navigation vers annÃ©es scolaires');
};

const explorerReferentiel = () => {
  console.log('Navigation vers rÃ©fÃ©rentiel officiel');
};

const gererClasses = () => {
  console.log('Navigation vers classes pÃ©dagogiques');
};

const verifierProgrammes = () => {
  console.log('Navigation vers programmes niveau');
};

const traiterPriorites = () => {
  console.log('Traitement des prioritÃ©s du tableau de bord');
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  if (hours > 0) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  return 'Ã  l\'instant';
};

// Simuler un chargement au montage
onMounted(async () => {
  isLoading.value = true;
  await new Promise(resolve => setTimeout(resolve, 1500));
  isLoading.value = false;
  lastSync.value = new Date();
});
</script>

<template>
  <section class="dashboard-ecole">
    <!-- Ã‰tat de chargement -->
    <div v-if="isLoading" class="dashboard-loading">
      <div class="loading-spinner"></div>
      <p>Chargement des donnÃ©es...</p>
    </div>

    <template v-else>
      <header class="dashboard-ecole__entete animate-fade-in">
        <div>
          <h2>Tableau de bord Ã©cole</h2>
          <p><strong>Ã‰cole courante</strong> - {{ kpiData.anneeActive }}</p>
          <div class="derniere-synchronisation">
            <Clock class="icone-sync" />
            <span>DerniÃ¨re synchro: {{ formatRelativeTime(lastSync) }}</span>
          </div>
        </div>

        <div class="dashboard-ecole__actions">
          <button class="bouton-principal button-lift" type="button" @click="preparerAnneeSuivante">
            <CalendarDays class="icone-bouton" />
            PrÃ©parer l'annÃ©e suivante
          </button>
          <button class="bouton-secondaire button-lift" type="button" @click="explorerReferentiel">
            <Compass class="icone-bouton" />
            Explorer le rÃ©fÃ©rentiel
          </button>
        </div>
      </header>

      <section class="dashboard-ecole__kpis" aria-label="Indicateurs principaux">
        <article class="kpi-ecole kpi-ecole--accent interactive-card stagger-item animate-count-up">
          <div class="kpi-ecole__icone kpi-ecole__icone--bleu">
            <CalendarDays class="icone-kpi" />
          </div>
          <div>
            <span>AnnÃ©e active</span>
            <strong class="kpi-number">{{ kpiData.anneeActive }}</strong>
            <p>{{ kpiData.statutAnnee }}</p>
          </div>
        </article>

        <article class="kpi-ecole interactive-card stagger-item animate-count-up">
          <div class="kpi-ecole__icone kpi-ecole__icone--vert">
            <School class="icone-kpi" />
          </div>
          <div>
            <span>Classes pÃ©dagogiques</span>
            <strong class="kpi-number">{{ kpiData.classesStatut }}</strong>
            <p>Organisation locale</p>
          </div>
        </article>

        <article class="kpi-ecole interactive-card stagger-item animate-count-up">
          <div class="kpi-ecole__icone kpi-ecole__icone--orange">
            <BookOpen class="icone-kpi" />
          </div>
          <div>
            <span>Programmes niveau</span>
            <strong class="kpi-number">{{ kpiData.programmesStatut }}</strong>
            <p>Alignement officiel</p>
          </div>
        </article>

        <article class="kpi-ecole interactive-card stagger-item animate-count-up">
          <div class="kpi-ecole__icone kpi-ecole__icone--emeraude">
            <CalendarCheck class="icone-kpi" />
          </div>
          <div>
            <span>Calendrier acadÃ©mique</span>
            <strong class="kpi-number">{{ kpiData.calendrierStatut }}</strong>
            <p>PÃ©riodes scolaires</p>
          </div>
        </article>
      </section>

    <section class="dashboard-ecole__grille">
      <article class="bloc-dashboard bloc-dashboard--alertes">
        <div class="bloc-dashboard__entete">
          <div>
            <BadgeStatut libelle="PrioritÃ©s" />
            <h3>Alertes principales</h3>
          </div>
        </div>

        <AlerteMetier
          v-for="message in messages"
          :key="message.titre"
          :message="message"
          class="stagger-item"
        />

        <div class="bloc-dashboard__actions">
          <button class="bouton-secondaire button-lift" type="button" @click="traiterPriorites">Traiter les prioritÃ©s</button>
          <button class="bouton-minimal" type="button">Masquer</button>
        </div>
      </article>

      <article class="bloc-dashboard">
        <div class="bloc-dashboard__entete">
          <div>
            <BadgeStatut libelle="Classes" />
            <h3>Ã‰tat des classes</h3>
          </div>
          <button class="bouton-minimal" type="button">Voir tout</button>
        </div>

        <div class="tableau-mini">
          <div class="tableau-mini__ligne tableau-mini__ligne--entete">
            <span>Classe</span>
            <span>Effectif</span>
            <span>Ã‰tat</span>
          </div>
          <div
            v-for="classe in classes.slice(0, 3)"
            :key="classe.id"
            class="tableau-mini__ligne stagger-item"
          >
            <strong>{{ classe.nom }}</strong>
            <span>{{ classe.effectif }} Ã©lÃ¨ves</span>
            <BadgeStatut
              :libelle="classe.statut === 'actif' ? 'Actif' : classe.statut === 'preparation' ? 'PrÃ©paration' : 'ClÃ´turÃ©'"
            />
          </div>
        </div>
      </article>

      <article class="bloc-dashboard">
        <div class="bloc-dashboard__entete">
          <div>
            <BadgeStatut libelle="Actions" />
            <h3>Prochaines opÃ©rations</h3>
          </div>
        </div>

        <div class="grille-actions-dashboard">
          <button type="button" class="button-lift" @click="preparerAnneeSuivante">
            <CalendarDays class="icone-action" /> PrÃ©parer annÃ©e suivante
          </button>
          <button type="button" class="button-lift" @click="gererClasses">
            <School class="icone-action" /> GÃ©rer classes
          </button>
          <button type="button" class="button-lift" @click="verifierProgrammes">
            <ClipboardList class="icone-action" /> Initialiser programmes
          </button>
        </div>
      </article>

      <article class="bloc-dashboard">
        <div class="bloc-dashboard__entete">
          <div>
            <BadgeStatut libelle="Calendrier" />
            <h3>Suivi acadÃ©mique</h3>
          </div>
          <button class="bouton-minimal" type="button">Ouvrir</button>
        </div>

        <div class="calendrier-mini">
          <p><strong>PÃ©riode en cours</strong><span>Ã€ connecter</span></p>
          <p><strong>Prochaine pÃ©riode</strong><span>Ã€ connecter</span></p>
          <p><strong>Statut</strong><span>PrÃ©paration attendue</span></p>
        </div>
      </article>
    </section>

    <section class="section-referentiel">
      <div class="section-referentiel__entete">
        <div class="section-referentiel__entete-titre">
          <BadgeStatut libelle="RÃ©fÃ©rentiel officiel" />
          <h3>Fondation officielle de l'Ã©cole</h3>
        </div>
        <button class="bouton-secondaire" type="button">
          <FolderCheck class="icone-bouton" />
          Voir tout
        </button>
      </div>

      <div class="liste-referentiel">
        <article
          v-for="item in referentielOfficiel"
          :key="item.libelle"
          class="ligne-referentiel stagger-item"
        >
          <div class="ligne-referentiel__contenu">
            <div class="ligne-referentiel__gauche">
              <strong>{{ item.libelle }}</strong>
              <span>{{ item.valeur }}</span>
            </div>
            <div class="ligne-referentiel__droite">
              <BadgeStatut
                :libelle="item.statut === 'actif' ? 'Actif' : item.statut === 'mise_a_jour' ? 'MÃ  jour' : 'ObsolÃ¨te'"
              />
            </div>
          </div>
        </article>
      </div>
    </section>
  </template>
  </section>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes countUp {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-fade-in {
  animation: fadeIn 280ms ease-out;
}

.animate-slide-in {
  animation: slideIn 280ms ease-out;
}

.animate-count-up {
  animation: countUp 420ms ease-out;
}

.stagger-item {
  opacity: 0;
  animation: fadeIn 280ms ease-out forwards;
}

.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 50ms; }
.stagger-item:nth-child(3) { animation-delay: 100ms; }
.stagger-item:nth-child(4) { animation-delay: 150ms; }
.stagger-item:nth-child(5) { animation-delay: 200ms; }
.stagger-item:nth-child(6) { animation-delay: 250ms; }

.interactive-card {
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background-color 280ms ease;
}

.interactive-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(31, 41, 55, 0.12);
}

.interactive-card:active {
  transform: translateY(0);
  transition-duration: 100ms;
}

.button-lift {
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.button-lift:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(45, 95, 159, 0.2);
}

.button-lift:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(45, 95, 159, 0.1);
}

.loading-spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid var(--couleur-bordure);
  border-top: 2px solid var(--couleur-principale);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.dashboard-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
  color: var(--couleur-texte-douce);
}

.dashboard-loading .loading-spinner {
  width: 3rem;
  height: 3rem;
}

.ligne-referentiel {
  padding: 1rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: var(--rayon-moyen);
  background: var(--couleur-surface);
  transition: all var(--transition-rapide) ease;
}

.ligne-referentiel:hover {
  border-color: var(--couleur-principale);
  box-shadow: 0 2px 8px rgba(45, 95, 159, 0.1);
}

.section-referentiel__entete {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-referentiel__entete-titre {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ligne-referentiel {
  padding: 1rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: var(--rayon-moyen);
  background: var(--couleur-surface);
  transition: all var(--transition-rapide) ease;
  margin-bottom: 0.75rem;
}

.ligne-referentiel:hover {
  border-color: var(--couleur-principale);
  box-shadow: 0 2px 8px rgba(45, 95, 159, 0.1);
}

.ligne-referentiel__contenu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.ligne-referentiel__gauche {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  margin-left: 0.5rem;
}

.ligne-referentiel__gauche strong {
  font-size: 0.95rem;
  color: var(--couleur-encre);
  font-weight: 600;
}

.ligne-referentiel__gauche span {
  font-size: 0.875rem;
  color: var(--couleur-texte-douce);
}

.ligne-referentiel__droite {
  display: flex;
  align-items: center;
}

.derniere-synchronisation {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--couleur-texte-douce);
}

.icone-sync {
  width: 1rem;
  height: 1rem;
  opacity: 0.7;
}

.kpi-number {
  display: inline-block;
  transition: transform var(--transition-rapide) ease;
}

.kpi-number:hover {
  transform: scale(1.05);
}

.bloc-dashboard {
  animation: fadeIn var(--transition-moyenne) ease-out;
}

.ligne-referentiel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--couleur-bordure);
  transition: background-color var(--transition-rapide) ease;
}

.ligne-referentiel:hover {
  background-color: var(--couleur-surface-froide);
  border-radius: var(--rayon-moyen);
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.ligne-referentiel:last-child {
  border-bottom: none;
}

.tableau-mini__ligne {
  transition: background-color var(--transition-rapide) ease;
}

.tableau-mini__ligne:hover {
  background-color: var(--couleur-surface-froide);
  border-radius: var(--rayon-moyen);
}

/* Responsive design */
@media (max-width: 768px) {
  .dashboard-ecole__entete {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .dashboard-ecole__actions {
    width: 100%;
    flex-direction: column;
  }

  .dashboard-ecole__kpis {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .dashboard-ecole__grille {
    grid-template-columns: 1fr;
  }
}
</style>
