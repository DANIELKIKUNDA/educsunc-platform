<template>
  <PageContainer>
    <PageHeader
      eyebrow="MS-03"
      title="Gestion des familles"
      description="Centre famille complet pour consulter, creer, modifier, gerer les responsables et lier les eleves dans le flux reel d inscription."
    >
      <template #actions>
        <div class="scolarite-actions">
          <RouterLink class="scolarite-pill" to="/app/scolarite">
            <ArrowLeft />
            <span>Retour scolarite</span>
          </RouterLink>
          <button class="scolarite-pill" type="button" :disabled="store.state.entries.length === 0" @click="exporterCsv">
            <Sheet />
            <span>Excel</span>
          </button>
          <button class="scolarite-pill scolarite-pill--action" type="button" :disabled="store.state.entries.length === 0" @click="imprimer">
            <Printer />
            <span>Impression</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <SectionBlock title="Perimetre familles" description="La gestion des familles reste une mutation d ecole, strictement reservee au caissier.">
      <div class="scolarite-hero">
        <div class="scolarite-hero__lead">
          <div class="scolarite-hero__icon">
            <Users />
          </div>
          <div>
            <h3>{{ context.schoolName }}</h3>
            <p>{{ perimeterMessage }}</p>
          </div>
        </div>
        <div class="scolarite-badges">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="Organisation" :value="context.organizationName" />
          <ContextBadge label="Ecole" :value="context.schoolName" />
          <ContextBadge label="Annee scolaire" :value="context.schoolYearLabel" />
        </div>
      </div>
    </SectionBlock>

    <AccessBoundary capability="module.scolarite.access">
      <ErrorState
        v-if="!isAuthorized"
        title="Familles non autorisees"
        message="Cette vue reste reservee au caissier actif."
      />

      <template v-else>
        <SectionBlock title="Recherche et creation" description="Le centre famille expose maintenant les vrais filtres backend et les mutations reelles du workflow.">
          <div class="scolarite-kpi-grid">
            <div class="scolarite-kpi-card">
              <small>Familles visibles</small>
              <strong>{{ store.state.pagination?.total ?? store.state.entries.length }}</strong>
              <span>Total retour backend</span>
            </div>
            <div class="scolarite-kpi-card">
              <small>Responsables lies</small>
              <strong>{{ totalResponsables }}</strong>
              <span>Somme sur la page chargee</span>
            </div>
            <div class="scolarite-kpi-card">
              <small>Recherche active</small>
              <strong>{{ hasSearch ? 'Oui' : 'Non' }}</strong>
              <span>Nom famille, responsable ou eleve rattache</span>
            </div>
            <div class="scolarite-kpi-card">
              <small>Creation</small>
              <strong>{{ canCreate ? 'Prete' : 'Incomplete' }}</strong>
              <span>Identifiant + code + nom + telephone requis</span>
            </div>
          </div>

          <div class="scolarite-form-stack">
            <div class="scolarite-subsection">
              <div class="scolarite-subsection__header">
                <div>
                  <h3>Filtres de liste</h3>
                  <p>Recherche backend par nom de famille, responsable ou eleve rattache.</p>
                </div>
              </div>
              <div class="scolarite-grid">
                <label class="scolarite-field">
                  <span>Nom famille</span>
                  <input v-model="filters.nomFamille" type="text" placeholder="Famille Mbuyi" />
                </label>
                <label class="scolarite-field">
                  <span>Responsable</span>
                  <input v-model="filters.nomResponsable" type="text" placeholder="Jean Mbuyi" />
                </label>
                <label class="scolarite-field">
                  <span>Eleve rattache</span>
                  <input v-model="filters.nomEleve" type="text" placeholder="Josias Mukuta" />
                </label>
                <label class="scolarite-field">
                  <span>Page</span>
                  <input v-model.number="filters.page" type="number" min="1" />
                </label>
                <label class="scolarite-field">
                  <span>Taille page</span>
                  <input v-model.number="filters.taillePage" type="number" min="1" />
                </label>
              </div>
              <div class="scolarite-actions-row">
                <button class="scolarite-primary-action" type="button" @click="charger">
                  <Search />
                  <span>Charger</span>
                </button>
                <button class="scolarite-secondary-action" type="button" @click="reinitialiserFiltres">
                  Reinitialiser les filtres
                </button>
              </div>
            </div>

            <div class="scolarite-subsection">
              <div class="scolarite-subsection__header">
                <div>
                  <h3>Creation de famille</h3>
                  <p>Creation directe d une famille administrative avant rattachement des eleves.</p>
                </div>
                <span class="status-chip" :class="canCreate ? 'status-chip--ok' : 'status-chip--neutral'">
                  {{ canCreate ? 'Prete' : 'A completer' }}
                </span>
              </div>
              <div class="scolarite-grid">
                <label class="scolarite-field">
                  <span>Id famille</span>
                  <input v-model="createForm.idFamille" type="text" placeholder="famille-uuid" />
                </label>
                <label class="scolarite-field">
                  <span>Code famille</span>
                  <input v-model="createForm.codeFamille" type="text" placeholder="FAM-001" />
                </label>
                <label class="scolarite-field">
                  <span>Nom famille</span>
                  <input v-model="createForm.nomFamille" type="text" placeholder="Famille Mbuyi" />
                </label>
                <label class="scolarite-field">
                  <span>Telephone principal</span>
                  <input v-model="createForm.telephonePrincipal" type="text" placeholder="+243..." />
                </label>
                <label class="scolarite-field">
                  <span>Email</span>
                  <input v-model="createForm.email" type="text" placeholder="optionnel" />
                </label>
                <label class="scolarite-field scolarite-field--full">
                  <span>Adresse</span>
                  <input v-model="createForm.adresse" type="text" placeholder="optionnel" />
                </label>
              </div>
              <div class="scolarite-actions-row">
                <button class="scolarite-primary-action" type="button" :disabled="!canCreate" @click="creer">
                  <Save />
                  <span>Creer la famille</span>
                </button>
                <button class="scolarite-secondary-action" type="button" @click="reinitialiserCreation">
                  Reinitialiser la creation
                </button>
              </div>
            </div>
          </div>
        </SectionBlock>

        <LoadingState
          v-if="store.state.status === 'loading'"
          title="Chargement des familles"
          message="Lecture des familles, responsables et rattachements en cours."
        />
        <ErrorState
          v-else-if="store.state.status === 'error'"
          title="Familles indisponibles"
          :message="store.state.errorMessage ?? 'La liste ne peut pas etre ouverte.'"
        />
        <EmptyState
          v-else-if="store.state.entries.length === 0"
          title="Aucune famille visible"
          message="La liste sera alimentee des que des familles sont enregistrees."
        />

        <template v-else>
          <SectionBlock title="Liste et detail" description="La vue combine maintenant liste, edition famille, responsables, enfants lies et eligibilite famille nombreuse.">
            <div class="scolarite-layout">
              <div class="scolarite-table-shell">
                <table class="scolarite-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Nom famille</th>
                      <th>Telephone</th>
                      <th>Responsables</th>
                      <th>Eleves actifs</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="entry in store.state.entries"
                      :key="entry.idFamille"
                      :class="{ 'scolarite-row--selected': store.state.selected?.idFamille === entry.idFamille }"
                    >
                      <td>{{ entry.codeFamille }}</td>
                      <td>
                        <strong>{{ entry.nomFamille }}</strong>
                        <div class="scolarite-muted">{{ entry.idFamille }}</div>
                      </td>
                      <td>{{ entry.telephonePrincipal }}</td>
                      <td>{{ entry.responsables.length }}</td>
                      <td>{{ entry.nombreElevesActifs ?? '-' }}</td>
                      <td><button class="scolarite-inline-action" type="button" @click="ouvrirDetail(entry.idFamille)">Ouvrir</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <aside class="scolarite-panel" v-if="store.state.selected">
                <div class="scolarite-panel__header">
                  <div>
                    <p class="scolarite-label">Famille</p>
                    <strong>{{ store.state.selected.nomFamille }}</strong>
                    <div class="scolarite-muted">{{ store.state.selected.idFamille }}</div>
                  </div>
                  <span class="status-chip status-chip--ok">{{ store.state.selected.codeFamille }}</span>
                </div>

                <div class="scolarite-detail-grid">
                  <div><small>Telephone</small><strong>{{ store.state.selected.telephonePrincipal }}</strong></div>
                  <div><small>Email</small><strong>{{ store.state.selected.email ?? '-' }}</strong></div>
                  <div><small>Adresse</small><strong>{{ store.state.selected.adresse ?? '-' }}</strong></div>
                  <div><small>Version</small><strong>{{ store.state.selected.version }}</strong></div>
                  <div><small>Eleves actifs</small><strong>{{ store.state.selected.nombreElevesActifs ?? '-' }}</strong></div>
                </div>

                <div class="scolarite-subsection">
                  <div class="scolarite-subsection__header">
                    <div>
                      <h3>Modifier la famille</h3>
                      <p>Mutation backend reelle sur les coordonnees et le nom de famille.</p>
                    </div>
                  </div>
                  <div class="scolarite-grid">
                    <label class="scolarite-field">
                      <span>Nom famille</span>
                      <input v-model="editFamilyForm.nomFamille" type="text" placeholder="Nom famille" />
                    </label>
                    <label class="scolarite-field">
                      <span>Telephone</span>
                      <input v-model="editFamilyForm.telephonePrincipal" type="text" placeholder="+243..." />
                    </label>
                    <label class="scolarite-field">
                      <span>Email</span>
                      <input v-model="editFamilyForm.email" type="text" placeholder="optionnel" />
                    </label>
                    <label class="scolarite-field scolarite-field--full">
                      <span>Adresse</span>
                      <input v-model="editFamilyForm.adresse" type="text" placeholder="optionnel" />
                    </label>
                  </div>
                  <div class="scolarite-actions-row">
                    <button class="scolarite-primary-action" type="button" @click="modifierFamille">
                      <Save />
                      <span>Mettre a jour</span>
                    </button>
                    <button class="scolarite-secondary-action" type="button" @click="chargerDepuisSelection">
                      Recharger les valeurs
                    </button>
                  </div>
                </div>

                <div class="scolarite-subsection">
                  <div class="scolarite-subsection__header">
                    <div>
                      <h3>Famille nombreuse</h3>
                      <p>Lecture backend de l eligibilite famille nombreuse.</p>
                    </div>
                    <button class="scolarite-secondary-action" type="button" @click="chargerFamilleNombreuse">
                      Evaluer
                    </button>
                  </div>
                  <div v-if="store.state.familleNombreuse" class="scolarite-detail-grid">
                    <div><small>Eligibilite</small><strong>{{ store.state.familleNombreuse.eligible ? 'Oui' : 'Non' }}</strong></div>
                    <div><small>Eleves eligibles</small><strong>{{ store.state.familleNombreuse.nombreElevesEligibles }}</strong></div>
                    <div><small>Seuil</small><strong>{{ store.state.familleNombreuse.seuilFamilleNombreuse }}</strong></div>
                  </div>
                </div>

                <div class="scolarite-subsection">
                  <div class="scolarite-subsection__header">
                    <div>
                      <h3>Responsables</h3>
                      <p>Ajout, edition, retrait et designation du principal branches sur le backend reel.</p>
                    </div>
                  </div>

                  <div class="scolarite-grid">
                    <label class="scolarite-field">
                      <span>Id responsable</span>
                      <input v-model="responsableForm.idResponsableFamille" type="text" placeholder="responsable-uuid" />
                    </label>
                    <label class="scolarite-field">
                      <span>Nom complet</span>
                      <input v-model="responsableForm.nomComplet" type="text" placeholder="Nom complet" />
                    </label>
                    <label class="scolarite-field">
                      <span>Telephone</span>
                      <input v-model="responsableForm.telephone" type="text" placeholder="+243..." />
                    </label>
                    <label class="scolarite-field">
                      <span>Telephone secondaire</span>
                      <input v-model="responsableForm.telephoneSecondaire" type="text" placeholder="optionnel" />
                    </label>
                    <label class="scolarite-field">
                      <span>Profession</span>
                      <input v-model="responsableForm.profession" type="text" placeholder="optionnel" />
                    </label>
                    <label class="scolarite-field">
                      <span>Lien parente</span>
                      <select v-model="responsableForm.lienParente">
                        <option value="PERE">PERE</option>
                        <option value="MERE">MERE</option>
                        <option value="TUTEUR">TUTEUR</option>
                        <option value="TUTRICE">TUTRICE</option>
                        <option value="AUTRE">AUTRE</option>
                      </select>
                    </label>
                    <label class="scolarite-field">
                      <span>Id utilisateur auth</span>
                      <input v-model="responsableForm.idUtilisateurAuth" type="text" placeholder="optionnel" />
                    </label>
                    <label class="scolarite-field scolarite-field--full">
                      <span>Adresse</span>
                      <input v-model="responsableForm.adresse" type="text" placeholder="optionnel" />
                    </label>
                  </div>
                  <div class="scolarite-actions-row">
                    <button class="scolarite-primary-action" type="button" :disabled="!canSaveResponsable" @click="ajouterResponsable">
                      <Save />
                      <span>Ajouter</span>
                    </button>
                    <button class="scolarite-secondary-action" type="button" :disabled="!canSaveResponsable" @click="modifierResponsable">
                      Modifier
                    </button>
                    <button class="scolarite-secondary-action" type="button" @click="reinitialiserResponsable">
                      Reinitialiser
                    </button>
                  </div>

                  <ul v-if="store.state.selected.responsables.length > 0" class="scolarite-list">
                    <li v-for="responsable in store.state.selected.responsables" :key="responsable.idResponsableFamille">
                      <strong>{{ responsable.nomComplet }}</strong>
                      <small>{{ responsable.lienParente }} | {{ responsable.telephone }}</small>
                      <small>{{ responsable.estPrincipal ? 'Principal' : 'Secondaire' }}</small>
                      <div class="scolarite-actions-row">
                        <button class="scolarite-inline-action" type="button" @click="chargerResponsable(responsable)">Charger</button>
                        <button class="scolarite-inline-action" type="button" @click="definirPrincipal(responsable.idResponsableFamille)">Definir principal</button>
                        <button class="scolarite-inline-action" type="button" @click="retirerResponsable(responsable.idResponsableFamille)">Retirer</button>
                      </div>
                    </li>
                  </ul>
                  <div v-else class="scolarite-empty-inline">
                    Aucun responsable expose pour cette famille.
                  </div>
                </div>

                <div class="scolarite-subsection">
                  <div class="scolarite-subsection__header">
                    <div>
                      <h3>Eleves lies</h3>
                      <p>La lecture et le rattachement / detachement d eleves sont maintenant visibles dans la meme vue.</p>
                    </div>
                  </div>
                  <div class="scolarite-grid">
                    <label class="scolarite-field">
                      <span>Id eleve a rattacher</span>
                      <input v-model="linkForm.idEleve" type="text" placeholder="eleve-uuid" />
                    </label>
                  </div>
                  <div class="scolarite-actions-row">
                    <button class="scolarite-primary-action" type="button" :disabled="!canLinkStudent" @click="rattacherEleve">
                      <Link2 />
                      <span>Rattacher l eleve</span>
                    </button>
                  </div>

                  <ul v-if="(store.state.selected.elevesLies?.length ?? 0) > 0" class="scolarite-list">
                    <li v-for="eleve in store.state.selected.elevesLies" :key="eleve.idEleve">
                      <strong>{{ nomComplet(eleve) }}</strong>
                      <small>{{ eleve.matricule }} | {{ eleve.statutGlobal }}</small>
                      <div class="scolarite-actions-row">
                        <button class="scolarite-inline-action" type="button" @click="detacherEleve(eleve.idEleve)">Detacher</button>
                      </div>
                    </li>
                  </ul>
                  <div v-else class="scolarite-empty-inline">
                    Aucun eleve lie n est encore expose pour cette famille.
                  </div>
                </div>
              </aside>
            </div>
          </SectionBlock>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { RouterLink } from 'vue-router';
import {
  ArrowLeft,
  Link2,
  Printer,
  Save,
  Search,
  Sheet,
  ShieldCheck,
  Users,
} from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import {
  authorizedFamillesActors,
  construireNomComplet,
  type EleveItem,
  type ResponsableFamilleItem,
} from '../models/scolarite.model';
import { mapperFamillesCsv, mapperTotalResponsables } from '../mappers/families.mapper';
import { useFamiliesStore } from '../stores/families.store';

const store = useFamiliesStore();
const session = sessionStore.state;
const context = activeContextStore.state;
const isAuthorized = computed(() => authorizedFamillesActors.includes(session.actorCode as never));

const filters = reactive({
  nomFamille: '',
  nomResponsable: '',
  nomEleve: '',
  page: 1,
  taillePage: 20,
});

const createForm = reactive({
  idFamille: '',
  codeFamille: '',
  nomFamille: '',
  telephonePrincipal: '',
  email: '',
  adresse: '',
});

const editFamilyForm = reactive({
  nomFamille: '',
  telephonePrincipal: '',
  email: '',
  adresse: '',
});

const responsableForm = reactive({
  idResponsableFamille: '',
  nomComplet: '',
  telephone: '',
  telephoneSecondaire: '',
  profession: '',
  lienParente: 'PERE' as 'PERE' | 'MERE' | 'TUTEUR' | 'TUTRICE' | 'AUTRE',
  adresse: '',
  idUtilisateurAuth: '',
});

const linkForm = reactive({
  idEleve: '',
});

const perimeterMessage = computed(() =>
  `Lecture et mutation bornees a l ecole active ${context.schoolName}, sans delegation sectionnelle.`,
);

const totalResponsables = computed(() => mapperTotalResponsables(store.state.entries));

const hasSearch = computed(() =>
  Boolean(
    filters.nomFamille.trim()
    || filters.nomResponsable.trim()
    || filters.nomEleve.trim(),
  ),
);

const canCreate = computed(() =>
  createForm.idFamille.trim().length > 0
  && createForm.codeFamille.trim().length > 0
  && createForm.nomFamille.trim().length > 0
  && createForm.telephonePrincipal.trim().length > 0,
);

const canSaveResponsable = computed(() =>
  responsableForm.idResponsableFamille.trim().length > 0
  && responsableForm.nomComplet.trim().length > 0
  && responsableForm.telephone.trim().length > 0,
);

const canLinkStudent = computed(() => linkForm.idEleve.trim().length > 0 && Boolean(store.state.selected));

function nomComplet(eleve: Pick<EleveItem, 'nom' | 'postNom' | 'prenom'>): string {
  return construireNomComplet(eleve.nom, eleve.postNom, eleve.prenom);
}

async function charger(): Promise<void> {
  await store.chargerListe({ ...filters });
}

async function ouvrirDetail(idFamille: string): Promise<void> {
  await store.chargerDetail(idFamille);
  chargerDepuisSelection();
  await store.evaluerFamilleNombreuse(idFamille);
}

async function creer(): Promise<void> {
  await store.creer({
    ...createForm,
    email: createForm.email || undefined,
    adresse: createForm.adresse || undefined,
  });
  if (store.state.selected) {
    chargerDepuisSelection();
    await store.evaluerFamilleNombreuse(store.state.selected.idFamille);
  }
}

async function modifierFamille(): Promise<void> {
  if (!store.state.selected) return;
  await store.modifier(store.state.selected.idFamille, {
    nomFamille: editFamilyForm.nomFamille || undefined,
    telephonePrincipal: editFamilyForm.telephonePrincipal || undefined,
    email: editFamilyForm.email || undefined,
    adresse: editFamilyForm.adresse || undefined,
    versionAttendue: store.state.selected.version,
  });
}

async function ajouterResponsable(): Promise<void> {
  if (!store.state.selected) return;
  await store.ajouterResponsable(store.state.selected.idFamille, {
    idResponsableFamille: responsableForm.idResponsableFamille,
    nomComplet: responsableForm.nomComplet,
    telephone: responsableForm.telephone,
    telephoneSecondaire: responsableForm.telephoneSecondaire || undefined,
    profession: responsableForm.profession || undefined,
    lienParente: responsableForm.lienParente,
    adresse: responsableForm.adresse || undefined,
    estPrincipal: false,
    idUtilisateurAuth: responsableForm.idUtilisateurAuth || undefined,
    versionAttendue: store.state.selected.version,
  });
}

async function modifierResponsable(): Promise<void> {
  if (!store.state.selected) return;
  await store.modifierResponsable(store.state.selected.idFamille, responsableForm.idResponsableFamille, {
    idResponsableFamille: responsableForm.idResponsableFamille,
    nomComplet: responsableForm.nomComplet,
    telephone: responsableForm.telephone,
    telephoneSecondaire: responsableForm.telephoneSecondaire || undefined,
    profession: responsableForm.profession || undefined,
    lienParente: responsableForm.lienParente,
    adresse: responsableForm.adresse || undefined,
    estPrincipal: false,
    idUtilisateurAuth: responsableForm.idUtilisateurAuth || undefined,
    versionAttendue: store.state.selected.version,
  });
}

async function retirerResponsable(idResponsableFamille: string): Promise<void> {
  if (!store.state.selected) return;
  await store.retirerResponsable(store.state.selected.idFamille, idResponsableFamille, {
    versionAttendue: store.state.selected.version,
  });
}

async function definirPrincipal(idResponsableFamille: string): Promise<void> {
  if (!store.state.selected) return;
  await store.definirResponsablePrincipal(store.state.selected.idFamille, idResponsableFamille, {
    versionAttendue: store.state.selected.version,
  });
}

async function chargerFamilleNombreuse(): Promise<void> {
  if (!store.state.selected) return;
  await store.evaluerFamilleNombreuse(store.state.selected.idFamille);
}

async function rattacherEleve(): Promise<void> {
  if (!store.state.selected) return;
  await store.rattacherEleve(linkForm.idEleve, {
    idFamille: store.state.selected.idFamille,
    versionAttendue: store.state.selected.version,
  });
  linkForm.idEleve = '';
}

async function detacherEleve(idEleve: string): Promise<void> {
  if (!store.state.selected) return;
  await store.detacherEleve(idEleve, {
    versionAttendue: store.state.selected.version,
  });
}

function chargerResponsable(responsable: ResponsableFamilleItem): void {
  responsableForm.idResponsableFamille = responsable.idResponsableFamille;
  responsableForm.nomComplet = responsable.nomComplet;
  responsableForm.telephone = responsable.telephone;
  responsableForm.telephoneSecondaire = responsable.telephoneSecondaire ?? '';
  responsableForm.profession = responsable.profession ?? '';
  responsableForm.lienParente = responsable.lienParente;
  responsableForm.adresse = responsable.adresse ?? '';
  responsableForm.idUtilisateurAuth = responsable.idUtilisateurAuth ?? '';
}

function chargerDepuisSelection(): void {
  if (!store.state.selected) return;
  editFamilyForm.nomFamille = store.state.selected.nomFamille;
  editFamilyForm.telephonePrincipal = store.state.selected.telephonePrincipal;
  editFamilyForm.email = store.state.selected.email ?? '';
  editFamilyForm.adresse = store.state.selected.adresse ?? '';
}

function reinitialiserResponsable(): void {
  responsableForm.idResponsableFamille = '';
  responsableForm.nomComplet = '';
  responsableForm.telephone = '';
  responsableForm.telephoneSecondaire = '';
  responsableForm.profession = '';
  responsableForm.lienParente = 'PERE';
  responsableForm.adresse = '';
  responsableForm.idUtilisateurAuth = '';
}

function reinitialiserCreation(): void {
  createForm.idFamille = '';
  createForm.codeFamille = '';
  createForm.nomFamille = '';
  createForm.telephonePrincipal = '';
  createForm.email = '';
  createForm.adresse = '';
}

function reinitialiserFiltres(): void {
  filters.nomFamille = '';
  filters.nomResponsable = '';
  filters.nomEleve = '';
  filters.page = 1;
  filters.taillePage = 20;
  void charger();
}

function exporterCsv(): void {
  const csv = mapperFamillesCsv(store.state.entries);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'familles.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function imprimer(): void {
  window.print();
}

void charger();
</script>

<style scoped>
.scolarite-actions,.scolarite-actions-row,.scolarite-subsection__header{display:flex;flex-wrap:wrap;gap:.75rem;align-items:center;justify-content:space-between}
.scolarite-pill,.scolarite-primary-action,.scolarite-secondary-action,.scolarite-inline-action{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;font-weight:600;text-decoration:none}
.scolarite-pill--action,.scolarite-primary-action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.scolarite-primary-action:disabled{opacity:.55;cursor:not-allowed}
.scolarite-hero{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.scolarite-hero__lead{display:flex;align-items:center;gap:1rem}
.scolarite-hero__icon{width:56px;height:56px;border-radius:18px;display:grid;place-items:center;background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff}
.scolarite-badges{display:flex;flex-wrap:wrap;gap:.75rem;align-items:flex-start}
.scolarite-form-stack{display:grid;gap:1rem}
.scolarite-subsection,.scolarite-panel{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:1rem}
.scolarite-grid,.scolarite-kpi-grid,.scolarite-detail-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.scolarite-field{display:grid;gap:.45rem}
.scolarite-field--full{grid-column:1/-1}
.scolarite-field input,.scolarite-field select{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.scolarite-inline-note,.scolarite-empty-inline{display:flex;gap:.75rem;align-items:flex-start;border-radius:18px;background:#f7fbfd;padding:.9rem 1rem;color:#456175}
.scolarite-layout{display:grid;grid-template-columns:minmax(0,2fr) minmax(360px,1fr);gap:1rem}
.scolarite-table-shell{overflow:auto;border-radius:22px;border:1px solid rgba(17,40,63,.08);background:#fff}
.scolarite-table{width:100%;border-collapse:collapse;min-width:860px}
.scolarite-table th,.scolarite-table td{padding:.9rem 1rem;border-bottom:1px solid rgba(17,40,63,.08);text-align:left;vertical-align:top}
.scolarite-table th{background:#edf4f8;font-size:.85rem;letter-spacing:.03em;text-transform:uppercase}
.scolarite-row--selected{background:#f7fbfd}
.scolarite-panel__header{display:flex;justify-content:space-between;align-items:flex-start;gap:.75rem}
.scolarite-list{display:grid;gap:.8rem;padding-left:1rem;margin:0}
.scolarite-list li{display:grid;gap:.35rem}
.scolarite-label{margin:0 0 .2rem;color:#4f6677;font-size:.83rem;text-transform:uppercase;letter-spacing:.08em}
.scolarite-muted{color:#5d7385;font-size:.82rem}
.status-chip{display:inline-flex;align-items:center;border-radius:999px;padding:.2rem .65rem;font-size:.82rem;font-weight:600}
.status-chip--ok{background:#e7f6ee;color:#166534}
.status-chip--neutral{background:#edf4f8;color:#365066}
@media (max-width:1080px){.scolarite-layout{grid-template-columns:1fr}.scolarite-hero{flex-direction:column}.scolarite-hero__lead{align-items:flex-start}}
</style>
