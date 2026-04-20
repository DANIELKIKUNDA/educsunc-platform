<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  AlertTriangle,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  FileLock2,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-vue-next';
import type { AnneeScolaireResume } from '../../../commun/types/annees-scolaires.types';
import type {
  CalendrierAcademiqueResume,
  PeriodeCalendrierCreation,
  PeriodeCalendrierResume,
  TypeStructureEvaluationCalendrier,
} from '../../../commun/types/calendriers-academiques.types';
import { anneesScolairesApi } from '../../services/annees-scolaires.api';
import { calendriersAcademiquesApi } from '../../services/calendriers-academiques.api';
import {
  contexteEcoleCourant,
  contexteEcoleEstConfigure,
} from '../../stores/contexte-ecole.store';

const anneeActive = ref<AnneeScolaireResume | null>(null);
const calendrier = ref<CalendrierAcademiqueResume | null>(null);
const recherche = ref('');
const chargement = ref(false);
const actionEnCours = ref(false);
const preparationOuverte = ref(false);
const typeStructureSelectionne = ref<TypeStructureEvaluationCalendrier>('TRIMESTRIEL');
const messagePage = ref<string | null>(null);
const messageSucces = ref<string | null>(null);
const messagePreparation = ref<string | null>(null);

const modelesPeriodes: Record<
  TypeStructureEvaluationCalendrier,
  Array<Pick<PeriodeCalendrierCreation, 'code' | 'libelle' | 'ordre' | 'typePeriode'>>
> = {
  TRIMESTRIEL: [
    { code: 'P1', libelle: 'Période P1', ordre: 1, typePeriode: 'PERIODE' },
    { code: 'P2', libelle: 'Période P2', ordre: 2, typePeriode: 'PERIODE' },
    { code: 'EX1', libelle: 'Examen EX1', ordre: 3, typePeriode: 'EXAMEN' },
    { code: 'P3', libelle: 'Période P3', ordre: 4, typePeriode: 'PERIODE' },
    { code: 'P4', libelle: 'Période P4', ordre: 5, typePeriode: 'PERIODE' },
    { code: 'EX2', libelle: 'Examen EX2', ordre: 6, typePeriode: 'EXAMEN' },
    { code: 'P5', libelle: 'Période P5', ordre: 7, typePeriode: 'PERIODE' },
    { code: 'P6', libelle: 'Période P6', ordre: 8, typePeriode: 'PERIODE' },
    { code: 'EX3', libelle: 'Examen EX3', ordre: 9, typePeriode: 'EXAMEN' },
  ],
  SEMESTRIEL: [
    { code: 'P1', libelle: 'Période P1', ordre: 1, typePeriode: 'PERIODE' },
    { code: 'P2', libelle: 'Période P2', ordre: 2, typePeriode: 'PERIODE' },
    { code: 'EX1', libelle: 'Examen EX1', ordre: 3, typePeriode: 'EXAMEN' },
    { code: 'P3', libelle: 'Période P3', ordre: 4, typePeriode: 'PERIODE' },
    { code: 'P4', libelle: 'Période P4', ordre: 5, typePeriode: 'PERIODE' },
    { code: 'EX2', libelle: 'Examen EX2', ordre: 6, typePeriode: 'EXAMEN' },
  ],
};

const periodesFiltrees = computed(() => {
  const terme = recherche.value.trim().toLocaleLowerCase('fr-FR');
  const periodes = calendrier.value?.periodes ?? [];

  if (terme.length === 0) {
    return periodes;
  }

  return periodes.filter((periode) =>
    [
      periode.code,
      periode.libelle,
      periode.typePeriode,
      formaterDate(periode.dateDebut),
      formaterDate(periode.dateFin),
    ].join(' ').toLocaleLowerCase('fr-FR').includes(terme),
  );
});

const periodeCourante = computed(() => {
  const maintenant = new Date();

  return (calendrier.value?.periodes ?? []).find((periode) => {
    const debut = new Date(periode.dateDebut);
    const fin = new Date(periode.dateFin);

    return debut <= maintenant && maintenant <= fin;
  }) ?? null;
});

const prochainePeriode = computed(() => {
  const maintenant = new Date();

  return (calendrier.value?.periodes ?? [])
    .filter((periode) => new Date(periode.dateDebut) > maintenant)
    .sort((periodeA, periodeB) =>
      new Date(periodeA.dateDebut).getTime() - new Date(periodeB.dateDebut).getTime(),
    )[0] ?? null;
});

const nombreExamens = computed(() =>
  (calendrier.value?.periodes ?? []).filter((periode) => periode.typePeriode === 'EXAMEN').length,
);

const libelleAnneeActive = computed(() => anneeActive.value?.code ?? 'Année active à charger');

const preparationPossible = computed(() =>
  anneeActive.value !== null &&
  calendrier.value === null &&
  contexteEcoleCourant.idEcole !== null &&
  contexteEcoleCourant.idUtilisateur !== null,
);

const apercuPeriodesPreparation = computed(() => {
  if (anneeActive.value === null) {
    return [];
  }

  return genererPeriodesCalendrier(
    typeStructureSelectionne.value,
    anneeActive.value.dateDebut,
    anneeActive.value.dateFin,
  );
});

function obtenirOptionsRequete(): { tenantId?: string } {
  return {
    tenantId: contexteEcoleCourant.tenantId ?? contexteEcoleCourant.idEcole ?? undefined,
  };
}

function formaterDate(dateIso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateIso));
}

function convertirEnDateUtc(dateIso: string): Date {
  const date = new Date(dateIso);

  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function ajouterJours(date: Date, nombreJours: number): Date {
  const copie = new Date(date);
  copie.setUTCDate(copie.getUTCDate() + nombreJours);

  return copie;
}

function formaterDateApi(date: Date): string {
  return date.toISOString();
}

function genererPeriodesCalendrier(
  typeStructureEvaluation: TypeStructureEvaluationCalendrier,
  dateDebutAnnee: string,
  dateFinAnnee: string,
): PeriodeCalendrierCreation[] {
  const modele = modelesPeriodes[typeStructureEvaluation];
  const debutAnnee = convertirEnDateUtc(dateDebutAnnee);
  const finAnnee = convertirEnDateUtc(dateFinAnnee);
  const dureeTotale = finAnnee.getTime() - debutAnnee.getTime();

  if (dureeTotale <= 0) {
    return [];
  }

  return modele.map((periodeModele, index) => {
    const debutPeriode = index === 0
      ? debutAnnee
      : ajouterJours(
        new Date(debutAnnee.getTime() + Math.floor((dureeTotale * index) / modele.length)),
        1,
      );
    const finPeriode = index === modele.length - 1
      ? finAnnee
      : new Date(debutAnnee.getTime() + Math.floor((dureeTotale * (index + 1)) / modele.length));

    return {
      ...periodeModele,
      dateDebut: formaterDateApi(debutPeriode),
      dateFin: formaterDateApi(finPeriode),
    };
  });
}

function obtenirStatutPeriode(periode: PeriodeCalendrierResume): 'Active' | 'Planifiée' | 'Terminée' {
  const maintenant = new Date();
  const debut = new Date(periode.dateDebut);
  const fin = new Date(periode.dateFin);

  if (debut <= maintenant && maintenant <= fin) {
    return 'Active';
  }

  return maintenant < debut ? 'Planifiée' : 'Terminée';
}

function obtenirClasseStatutPeriode(periode: PeriodeCalendrierResume): string {
  const statut = obtenirStatutPeriode(periode);

  if (statut === 'Active') {
    return 'badge--vert';
  }

  if (statut === 'Planifiée') {
    return 'badge--orange';
  }

  return 'badge--gris';
}

async function chargerCalendrier(): Promise<void> {
  if (!contexteEcoleEstConfigure() || contexteEcoleCourant.idEcole === null) {
    messagePage.value =
      'Contexte école non configuré : impossible de charger le calendrier académique.';
    return;
  }

  chargement.value = true;
  messagePage.value = null;
  messageSucces.value = null;

  try {
    const options = obtenirOptionsRequete();
    const reponseAnneeActive = await anneesScolairesApi.consulterActive(
      { idEcole: contexteEcoleCourant.idEcole },
      options,
    );

    anneeActive.value = reponseAnneeActive.donnee;

    if (anneeActive.value === null) {
      calendrier.value = null;
      messagePage.value =
        'Aucune année active disponible. Va d’abord sur Années scolaires pour garantir une année active.';
      return;
    }

    const reponseCalendrier = await calendriersAcademiquesApi.consulterParEcoleEtAnnee(
      {
        idEcole: contexteEcoleCourant.idEcole,
        idAnneeScolaire: anneeActive.value.id,
      },
      options,
    );

    calendrier.value = reponseCalendrier.donnee;

    if (calendrier.value === null) {
      messagePage.value =
        'Aucun calendrier académique n’est encore préparé pour cette année active.';
    }
  } catch {
    messagePage.value =
      'Le calendrier académique n’a pas pu être chargé. Vérifie que l’école est bien sélectionnée puis réessaie.';
  } finally {
    chargement.value = false;
  }
}

function ouvrirPreparationCalendrier(): void {
  if (!preparationPossible.value) {
    messagePage.value =
      'Le calendrier peut être préparé uniquement lorsqu’une année active existe et qu’aucun calendrier n’est encore créé.';
    return;
  }

  messagePreparation.value = null;
  preparationOuverte.value = true;
}

function fermerPreparationCalendrier(): void {
  if (actionEnCours.value) {
    return;
  }

  preparationOuverte.value = false;
  messagePreparation.value = null;
}

async function preparerCalendrier(): Promise<void> {
  if (
    !preparationPossible.value ||
    anneeActive.value === null ||
    contexteEcoleCourant.idEcole === null ||
    contexteEcoleCourant.idUtilisateur === null
  ) {
    messagePreparation.value =
      'Préparation impossible : vérifie l’année active et le contexte école avant de réessayer.';
    return;
  }

  const periodes = apercuPeriodesPreparation.value;

  if (periodes.length === 0) {
    messagePreparation.value =
      'Les dates de l’année active ne permettent pas de préparer un calendrier cohérent.';
    return;
  }

  actionEnCours.value = true;
  messagePage.value = null;
  messageSucces.value = null;
  messagePreparation.value = null;

  try {
    const reponse = await calendriersAcademiquesApi.creer(
      {
        idEcole: contexteEcoleCourant.idEcole,
        idAnneeScolaire: anneeActive.value.id,
        typeStructureEvaluation: typeStructureSelectionne.value,
        dateDebutAnnee: anneeActive.value.dateDebut,
        dateFinAnnee: anneeActive.value.dateFin,
        periodes,
        creePar: contexteEcoleCourant.idUtilisateur,
      },
      {
        ...obtenirOptionsRequete(),
        idempotencyKey: `preparer-calendrier-${anneeActive.value.id}-${typeStructureSelectionne.value}`,
      },
    );

    calendrier.value = reponse.donnee;
    preparationOuverte.value = false;
    messageSucces.value = 'Le calendrier académique a été préparé avec succès.';
  } catch {
    messagePreparation.value =
      'Le calendrier n’a pas pu être préparé. Les règles métier existantes ont été conservées.';
  } finally {
    actionEnCours.value = false;
  }
}

async function validerCalendrier(): Promise<void> {
  if (calendrier.value === null || contexteEcoleCourant.idUtilisateur === null) {
    return;
  }

  actionEnCours.value = true;
  messagePage.value = null;
  messageSucces.value = null;

  try {
    const reponse = await calendriersAcademiquesApi.valider(
      {
        idCalendrierAcademique: calendrier.value.id,
        validePar: contexteEcoleCourant.idUtilisateur,
      },
      obtenirOptionsRequete(),
    );

    calendrier.value = reponse.donnee;
    messageSucces.value = 'Le calendrier académique a été validé avec succès.';
  } catch {
    messagePage.value = 'Le calendrier n’a pas pu être validé. Les règles métier ont été conservées.';
  } finally {
    actionEnCours.value = false;
  }
}

async function verrouillerCalendrier(): Promise<void> {
  if (calendrier.value === null || contexteEcoleCourant.idUtilisateur === null) {
    return;
  }

  actionEnCours.value = true;
  messagePage.value = null;
  messageSucces.value = null;

  try {
    const reponse = await calendriersAcademiquesApi.verrouiller(
      {
        idCalendrierAcademique: calendrier.value.id,
        verrouillePar: contexteEcoleCourant.idUtilisateur,
      },
      obtenirOptionsRequete(),
    );

    calendrier.value = reponse.donnee;
    messageSucces.value = 'Le calendrier académique a été verrouillé avec succès.';
  } catch {
    messagePage.value =
      'Le calendrier n’a pas pu être verrouillé. Vérifie son état avant de réessayer.';
  } finally {
    actionEnCours.value = false;
  }
}

onMounted(() => {
  void chargerCalendrier();
});
</script>

<template>
  <section class="calendriers-page">
    <header class="calendriers-hero">
      <div>
        <span class="calendriers-hero__eyebrow">Pilotage académique</span>
        <h2>Calendriers académiques</h2>
        <p>Suivi des périodes, examens et verrouillages pour l’année active {{ libelleAnneeActive }}.</p>
      </div>

      <div class="calendriers-hero__actions">
        <button
          class="bouton bouton--principal"
          type="button"
          :disabled="!preparationPossible || actionEnCours"
          @click="ouvrirPreparationCalendrier"
        >
          <Plus :size="18" />
          Préparer calendrier
        </button>
        <button class="bouton" type="button" :disabled="chargement" @click="chargerCalendrier">
          <RefreshCw :size="18" :class="{ 'icone-rotation': chargement }" />
          Recharger
        </button>
        <button
          class="bouton"
          type="button"
          :disabled="calendrier === null || actionEnCours"
          @click="validerCalendrier"
        >
          <ShieldCheck :size="18" />
          Valider
        </button>
        <button
          class="bouton"
          type="button"
          :disabled="calendrier === null || calendrier.verrouille || actionEnCours"
          @click="verrouillerCalendrier"
        >
          <Lock :size="18" />
          Verrouiller
        </button>
      </div>
    </header>

    <section class="indicateurs" aria-label="Indicateurs du calendrier académique">
      <article class="indicateur indicateur--principal">
        <div class="indicateur__icone">
          <CalendarRange :size="24" />
        </div>
        <div>
          <span>Période active</span>
          <strong>{{ periodeCourante?.code ?? 'Aucune' }}</strong>
          <p>
            {{ periodeCourante === null ? 'Aucune période ne couvre la date actuelle' : `${formaterDate(periodeCourante.dateDebut)} au ${formaterDate(periodeCourante.dateFin)}` }}
          </p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--vert">
          <CheckCircle2 :size="22" />
        </div>
        <div>
          <span>État</span>
          <strong>{{ calendrier?.verrouille ? 'Verrouillé' : 'Ouvert' }}</strong>
          <p>{{ calendrier === null ? 'Calendrier à préparer' : `${calendrier.periodes.length} période(s)` }}</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--orange">
          <CalendarClock :size="22" />
        </div>
        <div>
          <span>Prochaine période</span>
          <strong>{{ prochainePeriode?.code ?? 'Aucune' }}</strong>
          <p>{{ prochainePeriode === null ? 'Aucune période future' : formaterDate(prochainePeriode.dateDebut) }}</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--rouge">
          <FileLock2 :size="22" />
        </div>
        <div>
          <span>Examens</span>
          <strong>{{ nombreExamens }}</strong>
          <p>{{ calendrier?.typeStructureEvaluation ?? 'Structure à charger' }}</p>
        </div>
      </article>
    </section>

    <section class="barre-outils" aria-label="Recherche dans le calendrier académique">
      <label class="champ-recherche">
        <Search :size="18" />
        <input v-model="recherche" type="search" placeholder="Rechercher une période, un examen ou une date..." />
      </label>

      <div class="badge-contexte">
        <CheckCircle2 :size="18" />
        Année active {{ libelleAnneeActive }}
      </div>
    </section>

    <p v-if="messageSucces !== null" class="message-page message-page--succes">
      <CheckCircle2 :size="18" />
      {{ messageSucces }}
    </p>
    <p v-if="messagePage !== null" class="message-page message-page--erreur">
      <AlertTriangle :size="18" />
      {{ messagePage }}
    </p>

    <section class="grille-calendrier">
      <article class="carte-tableau carte-tableau--large">
        <div class="carte-tableau__entete">
          <div>
            <span>Calendrier</span>
            <h3>Périodes académiques</h3>
          </div>
          <CalendarDays :size="22" />
        </div>

        <div class="tableau-calendrier tableau-calendrier--periodes">
          <div class="tableau-calendrier__ligne tableau-calendrier__ligne--entete">
            <span>Code</span>
            <span>Période</span>
            <span>Type</span>
            <span>Date début</span>
            <span>Date fin</span>
            <span>Statut</span>
            <span>Verrouillage</span>
          </div>

          <div v-if="chargement" class="tableau-calendrier__ligne tableau-calendrier__ligne--etat">
            <span><Loader2 :size="16" class="icone-rotation" /> Chargement du calendrier...</span>
          </div>
          <div
            v-else-if="periodesFiltrees.length === 0"
            class="tableau-calendrier__ligne tableau-calendrier__ligne--etat"
          >
            <span>Aucune période disponible pour ce calendrier.</span>
          </div>
          <div
            v-for="periode in periodesFiltrees"
            :key="periode.id"
            class="tableau-calendrier__ligne"
          >
            <strong>{{ periode.code }}</strong>
            <span>{{ periode.libelle }}</span>
            <span>{{ periode.typePeriode }}</span>
            <span>{{ formaterDate(periode.dateDebut) }}</span>
            <span>{{ formaterDate(periode.dateFin) }}</span>
            <span>
              <span class="badge" :class="obtenirClasseStatutPeriode(periode)">
                {{ obtenirStatutPeriode(periode) }}
              </span>
            </span>
            <span>{{ calendrier?.verrouille ? 'Verrouillé' : 'Ouvert' }}</span>
          </div>
        </div>
      </article>

      <article class="carte-focus">
        <div class="carte-focus__entete">
          <div>
            <span>État courant</span>
            <h3>Période active</h3>
          </div>
          <CalendarCheck2 :size="24" />
        </div>

        <div class="focus-periode">
          <div class="focus-periode__anneau">
            <strong>{{ periodeCourante?.code ?? '--' }}</strong>
            <span>{{ periodeCourante === null ? 'Aucune' : 'Active' }}</span>
          </div>

          <div class="focus-periode__details">
            <div>
              <span>Début</span>
              <strong>{{ periodeCourante === null ? '-' : formaterDate(periodeCourante.dateDebut) }}</strong>
            </div>
            <div>
              <span>Fin</span>
              <strong>{{ periodeCourante === null ? '-' : formaterDate(periodeCourante.dateFin) }}</strong>
            </div>
            <div>
              <span>État</span>
              <strong>{{ calendrier?.verrouille ? 'Verrouillé' : 'Ouvert' }}</strong>
            </div>
          </div>
        </div>
      </article>

      <article class="carte-tableau">
        <div class="carte-tableau__entete">
          <div>
            <span>Jalons</span>
            <h3>Dates importantes</h3>
          </div>
          <AlertTriangle :size="22" />
        </div>

        <div class="tableau-calendrier tableau-calendrier--jalons">
          <div class="tableau-calendrier__ligne tableau-calendrier__ligne--entete">
            <span>Date</span>
            <span>Jalon</span>
            <span>Type</span>
            <span>Statut</span>
          </div>

          <div
            v-for="periode in (calendrier?.periodes ?? [])"
            :key="`jalon-${periode.id}`"
            class="tableau-calendrier__ligne"
          >
            <strong>{{ formaterDate(periode.dateFin) }}</strong>
            <span>Fin : {{ periode.libelle }}</span>
            <span>{{ periode.typePeriode }}</span>
            <span>
              <span class="badge" :class="obtenirClasseStatutPeriode(periode)">
                {{ obtenirStatutPeriode(periode) }}
              </span>
            </span>
          </div>
          <div v-if="calendrier === null" class="tableau-calendrier__ligne tableau-calendrier__ligne--etat">
            <span>Aucun jalon à afficher tant qu’un calendrier n’est pas préparé.</span>
          </div>
        </div>
      </article>
    </section>

    <Teleport to="body">
      <div v-if="preparationOuverte" class="superposition-modale" role="presentation">
        <section class="modale-preparation" role="dialog" aria-modal="true" aria-labelledby="titre-preparation-calendrier">
          <header class="modale-preparation__entete">
            <div class="modale-preparation__icone">
              <Sparkles :size="24" />
            </div>
            <div>
              <span>Préparation guidée</span>
              <h3 id="titre-preparation-calendrier">Créer le calendrier de {{ libelleAnneeActive }}</h3>
              <p>
                Les périodes sont proposées automatiquement dans les dates de l’année active.
                Tu peux choisir la structure avant l’enregistrement.
              </p>
            </div>
            <button class="bouton-fermeture" type="button" :disabled="actionEnCours" @click="fermerPreparationCalendrier">
              <X :size="20" />
            </button>
          </header>

          <div class="choix-structure" aria-label="Type de structure d’évaluation">
            <button
              class="choix-structure__carte"
              :class="{ 'choix-structure__carte--active': typeStructureSelectionne === 'TRIMESTRIEL' }"
              type="button"
              @click="typeStructureSelectionne = 'TRIMESTRIEL'"
            >
              <CalendarRange :size="22" />
              <strong>Trimestriel</strong>
              <span>P1 à P6 avec EX1, EX2 et EX3</span>
            </button>
            <button
              class="choix-structure__carte"
              :class="{ 'choix-structure__carte--active': typeStructureSelectionne === 'SEMESTRIEL' }"
              type="button"
              @click="typeStructureSelectionne = 'SEMESTRIEL'"
            >
              <CalendarClock :size="22" />
              <strong>Semestriel</strong>
              <span>P1 à P4 avec EX1 et EX2</span>
            </button>
          </div>

          <div class="apercu-preparation">
            <div class="apercu-preparation__entete">
              <span>Aperçu</span>
              <strong>{{ apercuPeriodesPreparation.length }} période(s)</strong>
            </div>

            <div class="tableau-apercu">
              <div class="tableau-apercu__ligne tableau-apercu__ligne--entete">
                <span>Code</span>
                <span>Libellé</span>
                <span>Type</span>
                <span>Début</span>
                <span>Fin</span>
              </div>
              <div
                v-for="periode in apercuPeriodesPreparation"
                :key="`apercu-${periode.code}`"
                class="tableau-apercu__ligne"
              >
                <strong>{{ periode.code }}</strong>
                <span>{{ periode.libelle }}</span>
                <span>{{ periode.typePeriode }}</span>
                <span>{{ formaterDate(periode.dateDebut) }}</span>
                <span>{{ formaterDate(periode.dateFin) }}</span>
              </div>
            </div>
          </div>

          <p v-if="messagePreparation !== null" class="message-page message-page--erreur">
            <AlertTriangle :size="18" />
            {{ messagePreparation }}
          </p>

          <footer class="modale-preparation__actions">
            <button class="bouton" type="button" :disabled="actionEnCours" @click="fermerPreparationCalendrier">
              Annuler
            </button>
            <button class="bouton bouton--principal" type="button" :disabled="actionEnCours" @click="preparerCalendrier">
              <Loader2 v-if="actionEnCours" :size="18" class="icone-rotation" />
              <Plus v-else :size="18" />
              Créer le calendrier
            </button>
          </footer>
        </section>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.calendriers-page {
  display: grid;
  max-width: 1080px;
  gap: 1rem;
}

.calendriers-hero,
.indicateur,
.barre-outils,
.carte-tableau,
.carte-focus {
  border: 1px solid var(--couleur-bordure);
  background: var(--couleur-surface);
  box-shadow: var(--ombre-carte);
}

.calendriers-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 1.2rem;
  border-radius: 1rem;
  background:
    radial-gradient(circle at top right, rgba(45, 95, 159, 0.16), transparent 22rem),
    linear-gradient(135deg, #ffffff 0%, #f7faff 100%);
}

.calendriers-hero__eyebrow,
.indicateur span,
.carte-tableau__entete span,
.carte-focus__entete span,
.focus-periode__details span {
  color: var(--couleur-texte-douce);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.calendriers-hero h2 {
  margin: 0.25rem 0 0.35rem;
  color: var(--couleur-encre);
  font-size: 1.75rem;
  letter-spacing: -0.03em;
}

.calendriers-hero p,
.indicateur p {
  margin: 0;
  color: var(--couleur-texte-douce);
  line-height: 1.55;
}

.calendriers-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.bouton {
  display: inline-flex;
  min-height: 2.55rem;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0 0.95rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.45rem;
  background: #ffffff;
  color: var(--couleur-encre);
  cursor: pointer;
  font-weight: 850;
}

.bouton:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.bouton--principal {
  border-color: var(--couleur-principale);
  background: var(--couleur-principale);
  color: #ffffff;
  box-shadow: 0 10px 18px rgba(45, 95, 159, 0.2);
}

.indicateurs {
  display: grid;
  grid-template-columns: 1.35fr repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.indicateur {
  display: flex;
  min-height: 7.1rem;
  gap: 0.85rem;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 0.85rem;
}

.indicateur--principal {
  background: linear-gradient(135deg, #1f4d85 0%, #2d5f9f 100%);
  color: #ffffff;
}

.indicateur--principal span,
.indicateur--principal strong,
.indicateur--principal p {
  color: #ffffff;
}

.indicateur__icone {
  display: grid;
  width: 2.85rem;
  height: 2.85rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 0.7rem;
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
}

.indicateur__icone--vert {
  background: var(--couleur-succes);
}

.indicateur__icone--orange {
  background: #e5a324;
}

.indicateur__icone--rouge {
  background: #d94b4b;
}

.indicateur strong {
  display: block;
  margin: 0.28rem 0;
  color: var(--couleur-encre);
  font-size: 1.15rem;
}

.barre-outils {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem;
  border-radius: 0.9rem;
}

.champ-recherche {
  display: flex;
  min-height: 2.8rem;
  flex: 1;
  align-items: center;
  gap: 0.65rem;
  padding: 0 0.85rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.65rem;
  background: #fbfcfe;
  color: var(--couleur-texte-douce);
}

.champ-recherche input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--couleur-encre);
}

.badge-contexte {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.72rem 0.85rem;
  border-radius: 999px;
  background: rgba(47, 157, 98, 0.12);
  color: #23784a;
  font-size: 0.85rem;
  font-weight: 900;
  white-space: nowrap;
}

.message-page {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin: 0;
  padding: 0.8rem 0.9rem;
  border-radius: 0.55rem;
  font-weight: 850;
}

.message-page svg {
  flex: 0 0 auto;
}

.message-page--succes {
  border: 1px solid rgba(47, 157, 98, 0.22);
  background: rgba(47, 157, 98, 0.1);
  color: #23784a;
}

.message-page--erreur {
  border: 1px solid rgba(217, 83, 79, 0.24);
  background: rgba(217, 83, 79, 0.09);
  color: #9f1d16;
}

.grille-calendrier {
  display: grid;
  grid-template-columns: 0.82fr 1.18fr;
  gap: 0.85rem;
}

.carte-tableau,
.carte-focus {
  overflow: hidden;
  border-radius: 1rem;
}

.carte-tableau--large {
  grid-column: span 2;
}

.carte-tableau__entete,
.carte-focus__entete {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--couleur-bordure);
  background: linear-gradient(180deg, #fbfcfe 0%, #f3f6fa 100%);
}

.carte-tableau__entete h3,
.carte-focus__entete h3 {
  margin: 0.35rem 0 0;
  color: var(--couleur-encre);
  font-size: 1.05rem;
}

.carte-tableau__entete svg,
.carte-focus__entete svg {
  color: var(--couleur-principale);
}

.tableau-calendrier {
  display: grid;
  overflow-x: auto;
}

.tableau-calendrier__ligne {
  display: grid;
  align-items: center;
  gap: 0.8rem;
  min-width: 900px;
  padding: 0.78rem 1rem;
  border-bottom: 1px solid #e7ecf3;
  color: var(--couleur-texte);
}

.tableau-calendrier__ligne:last-child {
  border-bottom: 0;
}

.tableau-calendrier__ligne--entete {
  background: #f3f6fa;
  color: var(--couleur-texte-douce);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tableau-calendrier__ligne--etat {
  grid-template-columns: 1fr !important;
  color: var(--couleur-texte-douce);
  font-weight: 850;
}

.tableau-calendrier__ligne--etat span {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.tableau-calendrier__ligne strong {
  color: var(--couleur-encre);
}

.tableau-calendrier--periodes .tableau-calendrier__ligne {
  grid-template-columns: 0.55fr 1.35fr 0.75fr 1fr 1fr 0.9fr 1fr;
}

.tableau-calendrier--jalons .tableau-calendrier__ligne {
  min-width: 720px;
  grid-template-columns: 0.85fr 1.8fr 0.95fr 0.9fr;
}

.carte-focus {
  min-height: 100%;
  background:
    radial-gradient(circle at top right, rgba(45, 95, 159, 0.12), transparent 18rem),
    #ffffff;
}

.focus-periode {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.focus-periode__anneau {
  display: grid;
  width: 8.6rem;
  height: 8.6rem;
  place-items: center;
  justify-self: center;
  border: 12px solid rgba(45, 95, 159, 0.16);
  border-top-color: var(--couleur-principale);
  border-radius: 999px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px var(--couleur-bordure);
}

.focus-periode__anneau strong {
  color: var(--couleur-encre);
  font-size: 1.7rem;
}

.focus-periode__anneau span {
  margin-top: -1.7rem;
  color: var(--couleur-texte-douce);
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
}

.focus-periode__details {
  display: grid;
  gap: 0.7rem;
}

.focus-periode__details div {
  padding: 0.85rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.75rem;
  background: #fbfcfe;
}

.focus-periode__details strong {
  display: block;
  margin-top: 0.28rem;
  color: var(--couleur-encre);
}

.badge {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  justify-content: center;
  padding: 0.32rem 0.58rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 900;
}

.badge--vert {
  background: rgba(47, 157, 98, 0.13);
  color: #23784a;
}

.badge--orange {
  background: rgba(229, 163, 36, 0.18);
  color: #9a5e00;
}

.badge--gris {
  background: #edf0f4;
  color: #667085;
}

.icone-rotation {
  animation: rotation 0.8s linear infinite;
}

.superposition-modale {
  position: fixed;
  z-index: 60;
  inset: 0;
  display: grid;
  place-items: start center;
  padding: 7vh 1.25rem 2rem;
  background: rgba(12, 23, 39, 0.42);
  backdrop-filter: blur(7px);
}

.modale-preparation {
  display: grid;
  width: min(920px, 100%);
  max-height: 86vh;
  overflow: hidden auto;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 1.15rem;
  background:
    radial-gradient(circle at top left, rgba(45, 95, 159, 0.16), transparent 18rem),
    #ffffff;
  box-shadow: 0 24px 80px rgba(12, 23, 39, 0.28);
}

.modale-preparation__entete {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.9rem;
  align-items: start;
  padding: 0.35rem;
}

.modale-preparation__icone {
  display: grid;
  width: 3.15rem;
  height: 3.15rem;
  place-items: center;
  border-radius: 0.85rem;
  background: var(--couleur-principale);
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(45, 95, 159, 0.22);
}

.modale-preparation__entete span,
.apercu-preparation__entete span {
  color: var(--couleur-texte-douce);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.modale-preparation__entete h3 {
  margin: 0.18rem 0 0.28rem;
  color: var(--couleur-encre);
  font-size: 1.35rem;
}

.modale-preparation__entete p {
  max-width: 46rem;
  margin: 0;
  color: var(--couleur-texte-douce);
  line-height: 1.55;
}

.bouton-fermeture {
  display: grid;
  width: 2.35rem;
  height: 2.35rem;
  place-items: center;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.65rem;
  background: #ffffff;
  color: var(--couleur-texte-douce);
  cursor: pointer;
}

.choix-structure {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.choix-structure__carte {
  display: grid;
  gap: 0.38rem;
  min-height: 7.2rem;
  padding: 1rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.95rem;
  background: #fbfcfe;
  color: var(--couleur-encre);
  cursor: pointer;
  text-align: left;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.choix-structure__carte:hover,
.choix-structure__carte--active {
  border-color: rgba(45, 95, 159, 0.42);
  box-shadow: 0 12px 28px rgba(45, 95, 159, 0.12);
  transform: translateY(-1px);
}

.choix-structure__carte svg {
  color: var(--couleur-principale);
}

.choix-structure__carte strong {
  font-size: 1rem;
}

.choix-structure__carte span {
  color: var(--couleur-texte-douce);
  font-size: 0.88rem;
}

.apercu-preparation {
  overflow: hidden;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.95rem;
  background: #ffffff;
}

.apercu-preparation__entete {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--couleur-bordure);
  background: #f3f6fa;
}

.apercu-preparation__entete strong {
  color: var(--couleur-encre);
}

.tableau-apercu {
  display: grid;
  max-height: 17rem;
  overflow: auto;
}

.tableau-apercu__ligne {
  display: grid;
  grid-template-columns: 0.65fr 1.4fr 0.9fr 1fr 1fr;
  gap: 0.75rem;
  align-items: center;
  min-width: 720px;
  padding: 0.72rem 1rem;
  border-bottom: 1px solid #e7ecf3;
}

.tableau-apercu__ligne:last-child {
  border-bottom: 0;
}

.tableau-apercu__ligne--entete {
  color: var(--couleur-texte-douce);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tableau-apercu__ligne strong {
  color: var(--couleur-encre);
}

.modale-preparation__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  padding-top: 0.2rem;
}

@keyframes rotation {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1180px) {
  .indicateurs,
  .grille-calendrier {
    grid-template-columns: 1fr;
  }

  .carte-tableau--large {
    grid-column: span 1;
  }
}

@media (max-width: 760px) {
  .calendriers-hero,
  .barre-outils {
    align-items: stretch;
    flex-direction: column;
  }

  .calendriers-hero__actions,
  .bouton {
    width: 100%;
  }

  .badge-contexte {
    justify-content: center;
    white-space: normal;
  }

  .choix-structure,
  .modale-preparation__entete {
    grid-template-columns: 1fr;
  }

  .modale-preparation__actions {
    flex-direction: column-reverse;
  }
}
</style>
