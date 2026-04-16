<script setup lang="ts">
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
} from 'lucide-vue-next';
import { referentielEcoleStore } from '../stores/referentiel-ecole.store';
</script>

<template>
  <section class="dashboard-ecole">
    <header class="dashboard-ecole__entete">
      <div>
        <h2>Tableau de bord école</h2>
        <p><strong>École courante</strong> - année active à charger</p>
      </div>

      <div class="dashboard-ecole__actions">
        <button class="bouton-principal" type="button">
          <CalendarDays class="icone-bouton" />
          Préparer l’année suivante
        </button>
        <button class="bouton-secondaire" type="button">
          <Compass class="icone-bouton" />
          Explorer le référentiel
        </button>
      </div>
    </header>

    <section class="dashboard-ecole__kpis" aria-label="Indicateurs principaux">
      <article class="kpi-ecole kpi-ecole--accent">
        <div class="kpi-ecole__icone kpi-ecole__icone--bleu"><CalendarDays class="icone-kpi" /></div>
        <div>
          <span>Année active</span>
          <strong>À charger</strong>
          <p>Statut administratif de l’école</p>
        </div>
      </article>

      <article class="kpi-ecole">
        <div class="kpi-ecole__icone kpi-ecole__icone--vert"><School class="icone-kpi" /></div>
        <div>
          <span>Classes pédagogiques</span>
          <strong>À connecter</strong>
          <p>Organisation locale</p>
        </div>
      </article>

      <article class="kpi-ecole">
        <div class="kpi-ecole__icone kpi-ecole__icone--orange"><BookOpen class="icone-kpi" /></div>
        <div>
          <span>Programmes niveau</span>
          <strong>À vérifier</strong>
          <p>Alignement officiel</p>
        </div>
      </article>

      <article class="kpi-ecole">
        <div class="kpi-ecole__icone kpi-ecole__icone--emeraude"><CalendarCheck class="icone-kpi" /></div>
        <div>
          <span>Calendrier académique</span>
          <strong>À verrouiller</strong>
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
          v-for="message in referentielEcoleStore.messages"
          :key="message.titre"
          :message="message"
        />

        <div class="liste-alertes">
          <p>
            <span><AlertTriangle class="icone-alerte" /></span>
            Année suivante à préparer avant la clôture administrative.
          </p>
          <p>
            <span><AlertTriangle class="icone-alerte" /></span>
            Programmes niveau à valider après initialisation.
          </p>
          <p>
            <span><AlertTriangle class="icone-alerte" /></span>
            Calendrier académique à verrouiller avant exploitation.
          </p>
        </div>

        <div class="bloc-dashboard__actions">
          <button class="bouton-secondaire" type="button">Traiter les priorités</button>
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
            <span>Niveau</span>
            <span>État</span>
          </div>
          <div class="tableau-mini__ligne">
            <strong>À charger</strong>
            <span>Depuis le backend</span>
            <BadgeStatut libelle="Prévu" />
          </div>
          <div class="tableau-mini__ligne">
            <strong>À charger</strong>
            <span>Année active</span>
            <BadgeStatut libelle="Prévu" />
          </div>
          <div class="tableau-mini__ligne">
            <strong>À charger</strong>
            <span>Classes locales</span>
            <BadgeStatut libelle="Prévu" />
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
          <button type="button"><CalendarDays class="icone-action" /> Préparer année suivante</button>
          <button type="button"><School class="icone-action" /> Gérer classes</button>
          <button type="button"><ClipboardList class="icone-action" /> Initialiser programmes</button>
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
        <div>
          <BadgeStatut libelle="Référentiel officiel" />
          <h3>Fondation officielle de l’école</h3>
        </div>
        <button class="bouton-secondaire" type="button">
          <FolderCheck class="icone-bouton" />
          Voir tout
        </button>
      </div>

      <div class="liste-referentiel">
        <article
          v-for="item in referentielEcoleStore.referentielOfficiel"
          :key="item.libelle"
          class="ligne-referentiel"
        >
          <strong>{{ item.libelle }}</strong>
          <span>{{ item.valeur }}</span>
          <BadgeStatut :libelle="item.statut" />
        </article>
      </div>
    </section>
  </section>
</template>
