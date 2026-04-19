<script setup lang="ts">
import { onMounted, ref } from 'vue';
import AlerteMetier from '../../commun/composants/AlerteMetier.vue';
import BadgeStatut from '../../commun/composants/BadgeStatut.vue';
import {
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  Compass,
  Layers3,
  FolderCheck,
  School,
  Clock,
} from 'lucide-vue-next';

const lastSync = ref(new Date());

// Données statiques provisoires, en attendant le branchement backend.
const messages = ref([
  {
    titre: 'Tableau de bord prêt',
    message: 'Les indicateurs de l’école seront reliés progressivement aux données réelles.',
    type: 'succes' as const,
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    actions: []
  }
]);

const classes = ref([
  { id: '1', nom: '6ème A', effectif: 28, statut: 'actif' },
  { id: '2', nom: '6ème B', effectif: 26, statut: 'actif' },
  { id: '3', nom: '5ème A', effectif: 30, statut: 'actif' }
]);

const referentielOfficiel = ref([
  { libelle: 'Programmes nationaux', valeur: '2024-2025', famille: 'Programmes', statut: 'actif' },
  { libelle: 'Calendrier académique', valeur: 'Version 2.1', famille: 'Calendrier', statut: 'actif' },
  { libelle: 'Référentiels pédagogiques', valeur: 'À jour', famille: 'Structure', statut: 'mise_a_jour' }
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

// Fonctions de navigation à connecter au routeur métier plus tard.
const preparerAnneeSuivante = () => {
  console.log('Navigation vers années scolaires');
};

const explorerReferentiel = () => {
  console.log('Navigation vers référentiel officiel');
};

const gererClasses = () => {
  console.log('Navigation vers classes pédagogiques');
};

const verifierProgrammes = () => {
  console.log('Navigation vers programmes niveau');
};

const traiterPriorites = () => {
  console.log('Traitement des priorités du tableau de bord');
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
  return 'à l’instant';
};

onMounted(() => {
  lastSync.value = new Date();
});
</script>

<template>
  <section class="dashboard-ecole">
      <header class="dashboard-ecole__entete animate-fade-in">
        <div>
          <h2>Tableau de bord école</h2>
          <p><strong>École courante</strong> - {{ kpiData.anneeActive }}</p>
          <div class="derniere-synchronisation">
            <Clock class="icone-sync" />
            <span>Dernière synchronisation : {{ formatRelativeTime(lastSync) }}</span>
          </div>
        </div>

        <div class="dashboard-ecole__actions">
          <button class="bouton-principal button-lift" type="button" @click="preparerAnneeSuivante">
            <CalendarDays class="icone-bouton" />
            Préparer l’année suivante
          </button>
          <button class="bouton-secondaire button-lift" type="button" @click="explorerReferentiel">
            <Compass class="icone-bouton" />
            Explorer le référentiel
          </button>
        </div>
      </header>

      <section class="dashboard-ecole__kpis" aria-label="Indicateurs principaux">
        <article class="kpi-ecole kpi-ecole--accent interactive-card stagger-item animate-count-up">
          <div class="kpi-ecole__icone kpi-ecole__icone--bleu">
            <CalendarDays class="icone-kpi" />
          </div>
          <div>
            <span>Année active</span>
            <strong class="kpi-number">{{ kpiData.anneeActive }}</strong>
            <p>{{ kpiData.statutAnnee }}</p>
          </div>
        </article>

        <article class="kpi-ecole interactive-card stagger-item animate-count-up">
          <div class="kpi-ecole__icone kpi-ecole__icone--vert">
            <School class="icone-kpi" />
          </div>
          <div>
            <span>Classes pédagogiques</span>
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
            <span>Calendrier académique</span>
            <strong class="kpi-number">{{ kpiData.calendrierStatut }}</strong>
            <p>Périodes scolaires</p>
          </div>
        </article>
      </section>

    <section class="dashboard-ecole__grille">
      <article class="bloc-dashboard bloc-dashboard--alertes">
        <div class="bloc-dashboard__entete">
          <div>
            <BadgeStatut libelle="Priorités" />
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
          <button class="bouton-secondaire button-lift" type="button" @click="traiterPriorites">Traiter les priorités</button>
          <button class="bouton-minimal" type="button">Masquer</button>
        </div>
      </article>

      <article class="bloc-dashboard">
        <div class="bloc-dashboard__entete">
          <div>
            <BadgeStatut libelle="Classes" />
            <h3>État des classes</h3>
          </div>
          <button class="bouton-minimal" type="button">Voir tout</button>
        </div>

        <div class="tableau-mini">
          <div class="tableau-mini__ligne tableau-mini__ligne--entete">
            <span>Classe</span>
            <span>Effectif</span>
            <span>État</span>
          </div>
          <div
            v-for="classe in classes.slice(0, 3)"
            :key="classe.id"
            class="tableau-mini__ligne stagger-item"
          >
            <strong>{{ classe.nom }}</strong>
            <span>{{ classe.effectif }} élèves</span>
            <BadgeStatut
              :libelle="classe.statut === 'actif' ? 'Actif' : classe.statut === 'preparation' ? 'Préparation' : 'Clôturé'"
            />
          </div>
        </div>
      </article>

      <article class="bloc-dashboard">
        <div class="bloc-dashboard__entete">
          <div>
            <BadgeStatut libelle="Actions" />
            <h3>Prochaines opérations</h3>
          </div>
        </div>

        <div class="grille-actions-dashboard">
          <button type="button" class="button-lift" @click="preparerAnneeSuivante">
            <CalendarDays class="icone-action" /> Préparer l’année suivante
          </button>
          <button type="button" class="button-lift" @click="gererClasses">
            <School class="icone-action" /> Gérer les classes
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
            <h3>Suivi académique</h3>
          </div>
          <button class="bouton-minimal" type="button">Ouvrir</button>
        </div>

        <div class="calendrier-mini">
          <p><strong>Période en cours</strong><span>À connecter</span></p>
          <p><strong>Prochaine période</strong><span>À connecter</span></p>
          <p><strong>Statut</strong><span>Préparation attendue</span></p>
        </div>
      </article>
    </section>

    <section class="section-referentiel">
      <div class="section-referentiel__entete">
        <div class="section-referentiel__titre">
          <div class="section-referentiel__icone">
            <Layers3 :size="22" />
          </div>
          <div>
            <BadgeStatut libelle="Référentiel officiel" />
            <h3>Fondation officielle de l’école</h3>
            <p>Éléments nationaux disponibles pour l’exploitation locale.</p>
          </div>
        </div>
        <button class="bouton-secondaire button-lift" type="button" @click="explorerReferentiel">
          <FolderCheck class="icone-bouton" />
          Voir tout
        </button>
      </div>

      <div class="tableau-referentiel">
        <div class="tableau-referentiel__ligne tableau-referentiel__ligne--entete">
          <span>Élément</span>
          <span>Famille</span>
          <span>Version / état</span>
          <span>Statut</span>
        </div>

        <div
          v-for="item in referentielOfficiel"
          :key="item.libelle"
          class="tableau-referentiel__ligne stagger-item"
        >
          <strong>{{ item.libelle }}</strong>
          <span>{{ item.famille }}</span>
          <span>{{ item.valeur }}</span>
          <div>
            <BadgeStatut
              :libelle="item.statut === 'actif' ? 'Actif' : item.statut === 'mise_a_jour' ? 'À jour' : 'Obsolète'"
            />
          </div>
        </div>
      </div>
    </section>
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

.section-referentiel {
  overflow: hidden;
  border: 1px solid var(--couleur-bordure);
  border-radius: var(--rayon-moyen);
  background:
    radial-gradient(circle at top right, rgba(45, 95, 159, 0.1), transparent 18rem),
    var(--couleur-surface);
  box-shadow: var(--ombre-carte);
}

.section-referentiel__entete {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--couleur-bordure);
  background: rgba(251, 252, 254, 0.82);
}

.section-referentiel__titre {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.section-referentiel__icone {
  display: grid;
  width: 2.85rem;
  height: 2.85rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 0.75rem;
  background: var(--couleur-principale);
  color: #ffffff;
}

.section-referentiel__entete h3 {
  margin: 0.42rem 0 0.2rem;
  color: var(--couleur-encre);
}

.section-referentiel__entete p {
  margin: 0;
  color: var(--couleur-texte-douce);
  font-size: 0.9rem;
}

.tableau-referentiel {
  display: grid;
  overflow-x: auto;
}

.tableau-referentiel__ligne {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 0.8fr;
  min-width: 720px;
  align-items: center;
  gap: 0.9rem;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--couleur-bordure);
  color: var(--couleur-texte);
}

.tableau-referentiel__ligne:last-child {
  border-bottom: 0;
}

.tableau-referentiel__ligne--entete {
  background: #f3f6fa;
  color: var(--couleur-texte-douce);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tableau-referentiel__ligne strong {
  color: var(--couleur-encre);
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
