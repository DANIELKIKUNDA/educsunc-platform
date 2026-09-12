<template>
  <PageContainer class="platform-cockpit">
    <PageHeader :eyebrow="copy.eyebrow" :title="copy.title" :description="copy.description">
      <template #actions><span class="platform-cockpit__live"><span/>{{ session.actorLabel }}</span></template>
    </PageHeader>

    <LoadingState v-if="canReadOrganizations && store.state.status==='loading' && !store.state.organisations.length" title="Lecture de la plateforme" message="Préparation de votre synthèse…" />
    <ErrorState v-else-if="canReadOrganizations && store.state.status==='error' && !store.state.organisations.length" title="Synthèse momentanément indisponible" :message="store.state.errorMessage ?? 'Les données de pilotage ne peuvent pas être chargées.'" />
    <template v-else>
      <section class="platform-cockpit__metrics" aria-label="Indicateurs essentiels">
        <article v-if="canReadOrganizations" class="platform-cockpit__metric"><span>Organisations</span><strong>{{ organisationsCount }}</strong><small>{{ activeOrganisations }} actives</small></article>
        <article v-if="canReadSchools && context.organizationId" class="platform-cockpit__metric"><span>Écoles du contexte</span><strong>{{ schoolsCount }}</strong><small>{{ context.organizationName }}</small></article>
        <article class="platform-cockpit__metric"><span>Espaces accessibles</span><strong>{{ accessibleModules }}</strong><small>Selon vos permissions effectives</small></article>
        <article v-if="canReadOrganizations" class="platform-cockpit__metric" :class="{ 'platform-cockpit__metric--attention': attentionCount>0 }"><span>{{ copy.attention }}</span><strong>{{ attentionCount }}</strong><small>{{ attentionCount ? 'élément(s) à vérifier' : 'Aucun signal structurel' }}</small></article>
      </section>

      <div class="platform-cockpit__layout">
        <section v-if="canReadOrganizations" class="platform-cockpit__panel platform-cockpit__panel--attention">
          <header><div><small>Priorités</small><h2>{{ copy.attention }}</h2></div><span class="platform-cockpit__count">{{ attentionCount }}</span></header>
          <div v-if="attentionItems.length" class="platform-cockpit__attention-list">
            <article v-for="item in attentionItems" :key="item.title"><span class="platform-cockpit__attention-dot"/><div><strong>{{ item.title }}</strong><p>{{ item.detail }}</p></div></article>
          </div>
          <EmptyState v-else title="Rien de structurel à signaler" message="Les organisations et écoles chargées ne présentent pas d'état inactif." />
        </section>

        <section class="platform-cockpit__panel">
          <header><div><small>Accès rapides</small><h2>Aller à l’essentiel</h2></div><kbd>/</kbd></header>
          <label class="platform-cockpit__search"><Search/><span class="sr-only">Rechercher un espace accessible</span><input ref="searchInput" v-model="query" type="search" placeholder="Rechercher un espace ou une action…" /></label>
          <div class="platform-cockpit__quick-grid">
            <RouterLink v-for="item in filteredQuickLinks" :key="item.route" :to="item.route" class="platform-cockpit__quick"><component :is="item.icon"/><span><strong>{{ item.label }}</strong><small>{{ item.hint }}</small></span><ArrowUpRight/></RouterLink>
          </div>
          <p v-if="!filteredQuickLinks.length" class="platform-cockpit__empty-search">Aucun espace accessible ne correspond à cette recherche.</p>
        </section>
      </div>

      <section v-if="canReadOrganizations" class="platform-cockpit__panel">
        <header><div><small>Portefeuille</small><h2>Organisations</h2></div><RouterLink v-if="canOpen('/app/organisation')" to="/app/organisation" class="platform-cockpit__text-link">Tout voir <ArrowRight/></RouterLink></header>
        <EmptyState v-if="!store.state.organisations.length" title="Aucune organisation" message="Le registre ne retourne aucune organisation pour ce périmètre." />
        <div v-else class="platform-cockpit__orgs">
          <article v-for="organisation in store.state.organisations.slice(0,6)" :key="organisation.id">
            <span class="platform-cockpit__status" :class="{ 'is-off': !organisation.actif }"/><div><strong>{{ organisation.nom }}</strong><small>{{ organisation.code }} · {{ organisation.typeOrganisation }}</small></div><span>{{ organisation.actif ? 'Active' : 'Inactive' }}</span>
          </article>
        </div>
      </section>
    </template>
  </PageContainer>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'; import { RouterLink } from 'vue-router';
import { ArrowRight, ArrowUpRight, Search, Activity, Bell, Building2, FileClock, LockKeyhole, Settings2 } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue'; import PageHeader from '../../../shared/layout/PageHeader.vue'; import EmptyState from '../../../shared/ui/EmptyState.vue'; import ErrorState from '../../../shared/ui/ErrorState.vue'; import LoadingState from '../../../shared/ui/LoadingState.vue';
import { sessionStore } from '../../../shared/auth/session.store'; import { activeContextStore } from '../../../shared/session/active-context.store'; import { getAccessiblePages } from '../../../shared/doctrine/doctrine.resolver'; import { platformRoleCopy } from '../../../shared/navigation/platform-experience'; import { useOrganizationGovernanceStore } from '../../organisation/stores/organization-governance.store';
const session=sessionStore.state, context=activeContextStore.state, store=useOrganizationGovernanceStore(), query=ref(''), searchInput=ref<HTMLInputElement|null>(null); const copy=computed(()=>platformRoleCopy(session.actorCode));
const pages=computed(()=>getAccessiblePages(session.actorCode,context.governanceLevel)); const canOpen=(route:string)=>pages.value.some(p=>p.routePath===route||p.routePath.startsWith(`${route}/`));
const canReadOrganizations=computed(()=>canOpen('/app/organisation')); const canReadSchools=computed(()=>canOpen('/app/administration-ecole'));
const organisationsCount=computed(()=>store.state.organisationsPagination?.total??store.state.organisations.length); const activeOrganisations=computed(()=>store.state.organisations.filter(o=>o.actif).length); const schoolsCount=computed(()=>store.state.ecolesPagination?.total??store.state.ecoles.length); const accessibleModules=computed(()=>new Set(pages.value.map(p=>p.moduleCode)).size);
const attentionItems=computed(()=>{const items:{title:string;detail:string;count:number}[]=[]; const offOrg=store.state.organisations.filter(o=>!o.actif).length, offSchool=store.state.ecoles.filter(e=>!e.actif).length; if(offOrg)items.push({title:`${offOrg} organisation(s) inactive(s)`,detail:'Vérifiez si cet état est attendu avant toute action de gouvernance.',count:offOrg}); if(offSchool)items.push({title:`${offSchool} école(s) inactive(s)`,detail:`Dans ${context.organizationName || 'le contexte actuellement chargé'}.`,count:offSchool}); return items}); const attentionCount=computed(()=>attentionItems.value.reduce((total,item)=>total+item.count,0));
const candidates=[{route:'/app/organisation',label:'Organisations',hint:'Portefeuille et gouvernance',icon:Building2},{route:'/app/monitoring',label:'Supervision',hint:'Santé et exploitation',icon:Activity},{route:'/app/notifications',label:'Notifications',hint:'Communications et livraison',icon:Bell},{route:'/app/audit',label:'Audit',hint:'Traçabilité et événements',icon:FileClock},{route:'/app/security',label:'Sécurité',hint:'Accès et gouvernance',icon:LockKeyhole},{route:'/app/configuration',label:'Configuration',hint:'Politiques et paramètres',icon:Settings2}];
const quickLinks=computed(()=>candidates.filter(c=>canOpen(c.route))); const filteredQuickLinks=computed(()=>{const q=query.value.trim().toLowerCase(); return q?quickLinks.value.filter(i=>`${i.label} ${i.hint}`.toLowerCase().includes(q)):quickLinks.value});
async function load(){if(!canReadOrganizations.value)return; await store.chargerOrganisations(); if(canReadSchools.value&&context.organizationId)await store.chargerEcolesParOrganisation(context.organizationId)} function shortcut(e:KeyboardEvent){if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes((e.target as HTMLElement)?.tagName)){e.preventDefault();searchInput.value?.focus()}}
onMounted(()=>{void load();window.addEventListener('keydown',shortcut)}); onUnmounted(()=>window.removeEventListener('keydown',shortcut));
</script>
<style scoped>
.platform-cockpit{--ink:#10263e;--muted:#68798c;--line:rgba(18,45,72,.11)}.platform-cockpit__live{display:inline-flex;align-items:center;gap:.5rem;padding:.6rem .85rem;border:1px solid var(--line);border-radius:999px;background:#fff;font-weight:750;color:var(--ink)}.platform-cockpit__live>span{width:.55rem;height:.55rem;border-radius:50%;background:#24a36a;box-shadow:0 0 0 4px rgba(36,163,106,.12)}.platform-cockpit__metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem;margin:1.25rem 0}.platform-cockpit__metric,.platform-cockpit__panel{border:1px solid var(--line);background:rgba(255,255,255,.94);box-shadow:0 18px 45px rgba(16,38,62,.055)}.platform-cockpit__metric{padding:1.15rem;border-radius:1.2rem}.platform-cockpit__metric span,.platform-cockpit__metric small,.platform-cockpit__panel small{color:var(--muted)}.platform-cockpit__metric strong{display:block;margin:.35rem 0;font-size:2rem;letter-spacing:-.04em;color:var(--ink)}.platform-cockpit__metric--attention{background:linear-gradient(135deg,#fffaf0,#fff)}.platform-cockpit__layout{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:1rem}.platform-cockpit__panel{border-radius:1.35rem;padding:1.15rem;margin-bottom:1rem}.platform-cockpit__panel header{display:flex;justify-content:space-between;gap:1rem;align-items:center;margin-bottom:1rem}.platform-cockpit__panel h2{margin:.15rem 0 0;color:var(--ink);font-size:1.1rem}.platform-cockpit__count,kbd{padding:.35rem .55rem;border-radius:.65rem;background:#f1f5f9;color:#496078;font-weight:800;border:0}.platform-cockpit__attention-list{display:grid;gap:.7rem}.platform-cockpit__attention-list article{display:grid;grid-template-columns:auto 1fr;gap:.75rem;padding:.85rem;border-radius:1rem;background:#fff8ec}.platform-cockpit__attention-list p{margin:.2rem 0 0;color:var(--muted);font-size:.86rem}.platform-cockpit__attention-dot{width:.6rem;height:.6rem;margin-top:.35rem;border-radius:50%;background:#e89a27}.platform-cockpit__search{height:3rem;display:flex;align-items:center;gap:.65rem;padding:0 .9rem;border:1px solid var(--line);border-radius:1rem;background:#f8fafc;transition:.15s}.platform-cockpit__search:focus-within{background:#fff;border-color:#4d86bd;box-shadow:0 0 0 4px rgba(77,134,189,.1)}.platform-cockpit__search svg{width:1.1rem;color:#718196}.platform-cockpit__search input{width:100%;border:0;outline:0;background:transparent;font:inherit;color:var(--ink)}.platform-cockpit__quick-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.65rem;margin-top:.8rem}.platform-cockpit__quick{display:grid;grid-template-columns:auto 1fr auto;gap:.7rem;align-items:center;padding:.8rem;border:1px solid var(--line);border-radius:1rem;text-decoration:none;color:var(--ink);transition:.15s}.platform-cockpit__quick:hover{transform:translateY(-1px);border-color:#8eb5e3;box-shadow:0 8px 22px rgba(16,38,62,.07)}.platform-cockpit__quick>svg{width:1.1rem}.platform-cockpit__quick small{display:block;margin-top:.1rem}.platform-cockpit__empty-search{color:var(--muted)}.platform-cockpit__text-link{display:flex;gap:.35rem;align-items:center;color:#245f96;text-decoration:none;font-weight:750}.platform-cockpit__text-link svg{width:1rem}.platform-cockpit__orgs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.65rem}.platform-cockpit__orgs article{display:grid;grid-template-columns:auto 1fr auto;gap:.65rem;align-items:center;padding:.85rem;border-radius:1rem;background:#f8fafc}.platform-cockpit__orgs small{display:block}.platform-cockpit__orgs>article>span:last-child{font-size:.75rem;font-weight:800}.platform-cockpit__status{width:.55rem;height:.55rem;border-radius:50%;background:#24a36a}.platform-cockpit__status.is-off{background:#d8902b}
@media(max-width:1100px){.platform-cockpit__metrics{grid-template-columns:repeat(2,1fr)}.platform-cockpit__layout{grid-template-columns:1fr}.platform-cockpit__orgs{grid-template-columns:repeat(2,1fr)}}@media(max-width:640px){.platform-cockpit__metrics{grid-template-columns:repeat(2,minmax(0,1fr));gap:.65rem}.platform-cockpit__metric{padding:.9rem}.platform-cockpit__metric strong{font-size:1.6rem}.platform-cockpit__quick-grid,.platform-cockpit__orgs{grid-template-columns:1fr}.platform-cockpit__panel{padding:.9rem;border-radius:1.1rem}}
.platform-cockpit{--ink:var(--ui-text-strong);--muted:var(--ui-text-muted);--line:var(--ui-border)}
.platform-cockpit__live,.platform-cockpit__metric,.platform-cockpit__panel{background:linear-gradient(180deg,var(--ui-surface),var(--ui-surface-subtle))}
.platform-cockpit__metric--attention{background:linear-gradient(135deg,var(--ui-warning-soft),var(--ui-surface))}
.platform-cockpit__count,.platform-cockpit kbd{background:var(--ui-surface-muted);color:var(--ui-text)}
.platform-cockpit__attention-list article{background:var(--ui-warning-soft)}
.platform-cockpit__search,.platform-cockpit__orgs article{background:var(--ui-surface-subtle)}
.platform-cockpit__search:focus-within{background:var(--ui-surface);border-color:var(--ui-primary);box-shadow:0 0 0 4px color-mix(in srgb,var(--ui-primary) 10%,transparent)}
.platform-cockpit__quick:hover,.platform-cockpit__quick:focus-visible{border-color:var(--ui-primary);box-shadow:var(--ui-shadow-sm)}
.platform-cockpit__text-link{color:var(--ui-primary)}
</style>
