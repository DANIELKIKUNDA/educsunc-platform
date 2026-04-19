<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  AlertTriangle,
  Archive,
  Calendar,
  CheckCircle,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Zap,
} from 'lucide-vue-next';
import type {
  AnneeScolaireResume,
  PaginationAnneesScolaires,
  StatutAnneeScolaire,
} from '../../../commun/types/annees-scolaires.types';
import { anneesScolairesApi } from '../../services/annees-scolaires.api';
import {
  contexteEcoleCourant,
  contexteEcoleEstConfigure,
} from '../../stores/contexte-ecole.store';

const anneesScolaires = ref<AnneeScolaireResume[]>([]);
const anneeActive = ref<AnneeScolaireResume | null>(null);
const pagination = ref<PaginationAnneesScolaires>({
  total: 0,
  page: 1,
  taillePage: 20,
  totalPages: 0,
});
const chargement = ref(false);
const messageUtilisateur = ref<string | null>(null);

const totalAnnees = computed(() => pagination.value.total || anneesScolaires.value.length);
const totalPlanifiees = computed(() =>
  anneesScolaires.value.filter((annee) => annee.statut === 'PLANIFIEE').length,
);
const totalClotureesArchivees = computed(() =>
  anneesScolaires.value.filter((annee) =>
    annee.statut === 'CLOTUREE' || annee.statut === 'ARCHIVEE'
  ).length,
);

const libelleAnneeActive = computed(() => anneeActive.value?.code ?? anneeActive.value?.libelle ?? 'À charger');

function obtenirLibelleStatut(statut: StatutAnneeScolaire): string {
  const libelles: Record<StatutAnneeScolaire, string> = {
    ACTIVE: 'Active',
    PLANIFIEE: 'Planifiée',
    CLOTUREE: 'Clôturée',
    ARCHIVEE: 'Archivée',
  };

  return libelles[statut];
}

function formaterDate(dateIso?: string): string {
  if (dateIso === undefined || dateIso.trim().length === 0) {
    return 'Non renseignée';
  }

  const date = new Date(dateIso);

  if (Number.isNaN(date.getTime())) {
    return dateIso;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function obtenirDateActivation(annee: AnneeScolaireResume): string {
  return annee.dateActivation === undefined
    ? 'Non activée'
    : formaterDate(annee.dateActivation);
}

function obtenirLibelleAlerteContexte(): string | null {
  if (!contexteEcoleEstConfigure()) {
    return "Contexte école non configuré : ajoute VITE_REFERENTIEL_ECOLE_ID pour charger les années réelles.";
  }

  if (messageUtilisateur.value !== null) {
    return messageUtilisateur.value;
  }

  return null;
}

async function chargerAnneesScolaires(): Promise<void> {
  if (!contexteEcoleEstConfigure() || contexteEcoleCourant.idEcole === null) {
    messageUtilisateur.value = obtenirLibelleAlerteContexte();
    return;
  }

  chargement.value = true;
  messageUtilisateur.value = null;

  try {
    const options = { tenantId: contexteEcoleCourant.tenantId ?? contexteEcoleCourant.idEcole };
    const [reponseListe, reponseActive] = await Promise.all([
      anneesScolairesApi.lister(
        {
          idEcole: contexteEcoleCourant.idEcole,
          page: pagination.value.page,
          taillePage: pagination.value.taillePage,
        },
        options,
      ),
      anneesScolairesApi.consulterActive(
        { idEcole: contexteEcoleCourant.idEcole },
        options,
      ),
    ]);

    anneesScolaires.value = reponseListe.donnees;
    pagination.value = reponseListe.pagination;
    anneeActive.value = reponseActive.donnee;
  } catch {
    messageUtilisateur.value =
      "Les années scolaires n'ont pas pu être chargées. Vérifie que le backend est démarré et que le contexte école est correct.";
  } finally {
    chargement.value = false;
  }
}

onMounted(() => {
  void chargerAnneesScolaires();
});
</script>

<template>
  <section class="annees-page">
    <header class="annees-page__header">
      <div class="annees-page__contexte">
        <div>
          <span>Organisation</span>
          <strong>{{ contexteEcoleCourant.nomOrganisation }}</strong>
        </div>
        <div>
          <span>École</span>
          <strong>{{ contexteEcoleCourant.nomEcole }}</strong>
        </div>
        <div>
          <span>Année active</span>
          <strong>{{ libelleAnneeActive }}</strong>
        </div>
      </div>

      <div class="annees-page__actions">
        <button class="bouton-annee bouton-annee--principal" type="button" disabled>
          <Plus :size="17" />
          Créer une année
        </button>
        <button class="bouton-annee" type="button" disabled>
          <RefreshCw :size="17" />
          Préparer suivante
        </button>
        <button class="bouton-annee bouton-annee--accent" type="button" disabled>
          <Zap :size="17" />
          Basculer année
        </button>
      </div>
    </header>

    <section class="annees-page__titre">
      <div>
        <h2>Années scolaires</h2>
        <p>Suivi administratif des années scolaires de l’école, connecté en lecture au backend.</p>
      </div>
    </section>

    <section class="annees-page__cartes" aria-label="Résumé des années scolaires">
      <article class="carte-resume carte-resume--bleue">
        <div class="carte-resume__icone"><Calendar :size="24" /></div>
        <div>
          <span>Année active</span>
          <strong>{{ libelleAnneeActive }}</strong>
          <p>{{ anneeActive === null ? 'Aucune année active confirmée.' : 'Ouverte pour l’exploitation locale.' }}</p>
        </div>
      </article>

      <article class="carte-resume">
        <div class="carte-resume__icone carte-resume__icone--neutre"><Calendar :size="24" /></div>
        <div>
          <span>Total années</span>
          <strong>{{ totalAnnees }}</strong>
          <p>Historique et planification.</p>
        </div>
      </article>

      <article class="carte-resume">
        <div class="carte-resume__icone carte-resume__icone--orange"><RefreshCw :size="24" /></div>
        <div>
          <span>Planifiées</span>
          <strong>{{ totalPlanifiees }}</strong>
          <p>Années suivantes préparées.</p>
        </div>
      </article>

      <article class="carte-resume">
        <div class="carte-resume__icone carte-resume__icone--gris"><Archive :size="24" /></div>
        <div>
          <span>Clôturées / archivées</span>
          <strong>{{ totalClotureesArchivees }}</strong>
          <p>Années passées consultables.</p>
        </div>
      </article>
    </section>

    <section class="annees-page__grille">
      <article class="bloc-annees bloc-annees--alertes">
        <div class="bloc-annees__header">
          <h3>Alertes métier</h3>
          <span class="badge-alerte">À vérifier</span>
        </div>

        <div class="liste-alertes-annees">
          <p v-if="obtenirLibelleAlerteContexte() !== null">
            <AlertTriangle :size="18" />
            {{ obtenirLibelleAlerteContexte() }}
          </p>
          <p v-if="!chargement && anneeActive === null">
            <AlertTriangle :size="18" />
            Aucune année active détectée dans le contexte courant.
          </p>
          <p v-if="totalPlanifiees === 0">
            <AlertTriangle :size="18" />
            Année suivante non préparée ou non disponible dans la liste chargée.
          </p>
          <p>
            <AlertTriangle :size="18" />
            Les actions sensibles restent désactivées jusqu’au branchement des confirmations.
          </p>
        </div>
      </article>

      <article class="bloc-annees">
        <div class="bloc-annees__header">
          <h3>Liste des années scolaires</h3>
          <span class="badge-info">{{ chargement ? 'Chargement' : 'Backend' }}</span>
        </div>

        <div class="tableau-annees">
          <div class="tableau-annees__ligne tableau-annees__ligne--entete">
            <span>Année scolaire</span>
            <span>Date début</span>
            <span>Date fin</span>
            <span>Statut</span>
            <span>Date activation</span>
            <span>Actions</span>
          </div>

          <div v-if="chargement" class="tableau-annees__ligne tableau-annees__ligne--etat">
            <span>Chargement des années scolaires...</span>
          </div>

          <div
            v-for="annee in anneesScolaires"
            :key="annee.id"
            class="tableau-annees__ligne"
          >
            <strong>{{ annee.code || annee.libelle }}</strong>
            <span>{{ formaterDate(annee.dateDebut) }}</span>
            <span>{{ formaterDate(annee.dateFin) }}</span>
            <span class="badge-statut-annee" :data-statut="annee.statut">
              <CheckCircle v-if="annee.statut === 'ACTIVE'" :size="15" />
              <Archive v-else-if="annee.statut === 'CLOTUREE' || annee.statut === 'ARCHIVEE'" :size="15" />
              <RefreshCw v-else :size="15" />
              {{ obtenirLibelleStatut(annee.statut) }}
            </span>
            <span>{{ obtenirDateActivation(annee) }}</span>
            <div class="actions-ligne">
              <button type="button" aria-label="Plus d’actions">
                <MoreHorizontal :size="18" />
              </button>
              <div class="menu-ligne">
                <span><Eye :size="15" /> Voir</span>
                <span><Pencil :size="15" /> Modifier après confirmation</span>
                <span v-if="annee.statut === 'ACTIVE'"><CheckCircle :size="15" /> Clôturer après confirmation</span>
                <span v-if="annee.statut === 'CLOTUREE'"><Archive :size="15" /> Archiver après confirmation</span>
              </div>
            </div>
          </div>

          <div
            v-if="!chargement && anneesScolaires.length === 0"
            class="tableau-annees__ligne tableau-annees__ligne--etat"
          >
            <span>Aucune année scolaire disponible pour ce contexte école.</span>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.annees-page {
  display: grid;
  max-width: 1060px;
  gap: 1rem;
}

.annees-page__header,
.annees-page__titre,
.bloc-annees,
.carte-resume {
  border: 1px solid var(--couleur-bordure);
  border-radius: var(--rayon-moyen);
  background: var(--couleur-surface);
  box-shadow: var(--ombre-carte);
}

.annees-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
}

.annees-page__contexte {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  flex: 1;
  gap: 0.75rem;
}

.annees-page__contexte div {
  padding: 0.75rem 0.9rem;
  border-radius: var(--rayon-moyen);
  background: var(--couleur-surface-froide);
}

.annees-page__contexte span,
.carte-resume span {
  display: block;
  color: var(--couleur-texte-douce);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.annees-page__contexte strong,
.carte-resume strong {
  display: block;
  margin-top: 0.25rem;
  color: var(--couleur-encre);
  font-size: 1.05rem;
}

.annees-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  justify-content: flex-end;
}

.bouton-annee {
  display: inline-flex;
  min-height: 2.55rem;
  align-items: center;
  gap: 0.45rem;
  padding: 0 0.85rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: var(--rayon-moyen);
  background: var(--couleur-surface);
  color: var(--couleur-encre);
  cursor: pointer;
  font-weight: 800;
  transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
}

.bouton-annee:disabled {
  cursor: not-allowed;
  opacity: 0.72;
}

.bouton-annee--principal {
  border-color: var(--couleur-principale);
  background: var(--couleur-principale);
  color: #ffffff;
}

.bouton-annee--accent {
  border-color: var(--couleur-principale-foncee);
  background: var(--couleur-principale-foncee);
  color: #ffffff;
}

.bouton-annee:hover {
  transform: translateY(-1px);
}

.bouton-annee:not(.bouton-annee--principal):not(.bouton-annee--accent):hover {
  border-color: #c8d3e4;
  box-shadow: 0 6px 14px rgba(31, 41, 55, 0.07);
}

.bouton-annee:focus-visible,
.actions-ligne > button:focus-visible {
  outline: 2px solid #7c9fd6;
  outline-offset: 2px;
}

.annees-page__titre {
  padding: 1.15rem 1.2rem;
}

.annees-page__titre h2 {
  margin: 0 0 0.35rem;
  color: var(--couleur-encre);
  font-size: 1.55rem;
}

.annees-page__titre p,
.carte-resume p {
  margin: 0;
  color: var(--couleur-texte-douce);
}

.annees-page__cartes {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;
}

.carte-resume {
  display: flex;
  min-height: 7.5rem;
  gap: 0.9rem;
  align-items: flex-start;
  padding: 1rem;
}

.carte-resume__icone {
  display: grid;
  width: 3rem;
  height: 3rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 0.55rem;
  background: #2d9ccf;
  color: #ffffff;
}

.carte-resume__icone--neutre {
  background: #2d5f9f;
}

.carte-resume__icone--orange {
  background: #f2a51f;
}

.carte-resume__icone--gris {
  background: #7b8494;
}

.annees-page__grille {
  display: grid;
  grid-template-columns: 0.9fr 1.65fr;
  gap: 0.9rem;
}

.bloc-annees {
  overflow: hidden;
}

.bloc-annees__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.95rem 1rem;
  border-bottom: 1px solid var(--couleur-bordure);
  background: #fbfcfe;
}

.bloc-annees__header h3 {
  margin: 0;
  color: var(--couleur-encre);
  font-size: 1.05rem;
}

.badge-alerte,
.badge-info {
  padding: 0.25rem 0.55rem;
  border-radius: 0.35rem;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

.badge-alerte {
  background: rgba(217, 83, 79, 0.12);
  color: #b42318;
}

.badge-info {
  background: rgba(45, 95, 159, 0.12);
  color: #2d5f9f;
}

.liste-alertes-annees {
  display: grid;
}

.liste-alertes-annees p {
  display: flex;
  gap: 0.7rem;
  align-items: center;
  margin: 0;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--couleur-bordure);
  color: var(--couleur-texte);
}

.liste-alertes-annees svg {
  flex: 0 0 auto;
  color: #d9534f;
}

.tableau-annees {
  display: grid;
  overflow-x: auto;
}

.tableau-annees__ligne {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr 0.9fr 0.85fr 1fr 0.7fr;
  min-width: 820px;
  align-items: center;
  gap: 0.75rem;
  padding: 0.82rem 1rem;
  border-bottom: 1px solid var(--couleur-bordure);
}

.tableau-annees__ligne:last-child {
  border-bottom: 0;
}

.tableau-annees__ligne--entete {
  background: #f3f6fa;
  color: var(--couleur-texte-douce);
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tableau-annees__ligne--etat {
  grid-template-columns: 1fr;
  color: var(--couleur-texte-douce);
  font-weight: 800;
}

.badge-statut-annee {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.55rem;
  border-radius: 0.35rem;
  font-size: 0.75rem;
  font-weight: 900;
}

.badge-statut-annee[data-statut='ACTIVE'] {
  background: rgba(47, 157, 98, 0.12);
  color: #23784a;
}

.badge-statut-annee[data-statut='PLANIFIEE'] {
  background: rgba(242, 166, 31, 0.16);
  color: #a15d00;
}

.badge-statut-annee[data-statut='CLOTUREE'],
.badge-statut-annee[data-statut='ARCHIVEE'] {
  background: rgba(123, 132, 148, 0.15);
  color: #4b5563;
}

.actions-ligne {
  position: relative;
  width: fit-content;
}

.actions-ligne > button {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 1px solid var(--couleur-bordure);
  border-radius: var(--rayon-moyen);
  background: var(--couleur-surface);
  color: var(--couleur-texte);
  cursor: pointer;
}

.menu-ligne {
  position: absolute;
  right: 0;
  z-index: 5;
  display: none;
  min-width: 12rem;
  padding: 0.35rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: var(--rayon-moyen);
  background: var(--couleur-surface);
  box-shadow: var(--ombre-flottante);
}

.actions-ligne:hover .menu-ligne {
  display: grid;
}

.menu-ligne span {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem;
  border-radius: 0.4rem;
  color: var(--couleur-texte);
  cursor: default;
  font-weight: 700;
}

.menu-ligne span:hover {
  background: #f3f6fa;
}

@media (max-width: 1100px) {
  .annees-page__cartes {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .annees-page__grille {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .annees-page__header {
    flex-direction: column;
    align-items: stretch;
  }

  .annees-page__contexte {
    grid-template-columns: 1fr;
  }

  .annees-page__actions {
    justify-content: stretch;
  }

  .bouton-annee {
    width: 100%;
    justify-content: center;
  }

  .annees-page__cartes {
    grid-template-columns: 1fr;
  }
}
</style>
