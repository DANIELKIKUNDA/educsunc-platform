<template>
  <div class="org-access">
    <div class="org-access__intro">
      <div><strong>Administration système de l’organisation</strong><p>Gérez les responsables techniques autorisés à administrer ce périmètre.</p></div>
      <button class="org-access__primary" type="button" @click="vm.open"><UserPlus :size="18" />Ajouter un responsable</button>
    </div>
    <div v-if="vm.loading.value" class="org-access__state"><LoaderCircle class="org-access__spin" :size="24" /><strong>Chargement des accès…</strong></div>
    <div v-else-if="vm.error.value" class="org-access__state org-access__state--error"><ShieldAlert :size="26" /><strong>Accès indisponibles</strong><p>{{ vm.error.value }}</p><button type="button" @click="vm.load">Réessayer</button></div>
    <div v-else-if="vm.organizationAdministrators.value.length === 0" class="org-access__state"><ShieldQuestion :size="30" /><strong>Aucun responsable technique affecté</strong><p>Ajoutez le premier administrateur système de cette organisation pour terminer sa gouvernance.</p></div>
    <div v-else class="org-access__grid">
      <article v-for="admin in vm.organizationAdministrators.value" :key="admin.idAffectation" class="org-access__card">
        <div class="org-access__avatar">{{ initials(admin.nomComplet) }}</div>
        <div><strong>{{ admin.nomComplet }}</strong><p>{{ admin.email }}</p><span :class="['org-access__badge', admin.etatCompte === 'ACTIVE' && 'is-active']">{{ stateLabel(admin.etatCompte) }}</span></div>
        <dl><div><dt>Sessions actives</dt><dd>{{ admin.sessionsActives }}</dd></div><div><dt>Dernière activité</dt><dd>{{ formatDate(admin.dernierAcces) }}</dd></div></dl>
      </article>
    </div>

    <Teleport to="body">
      <div v-if="vm.dialogOpen.value" class="org-access-modal" role="presentation" @mousedown.self="vm.close">
        <section class="org-access-modal__panel" role="dialog" aria-modal="true" aria-labelledby="org-access-title">
          <header><div><small>Administration et accès</small><h2 id="org-access-title">Ajouter un responsable technique</h2><p>Créez un compte ou affectez une personne déjà enregistrée.</p></div><button aria-label="Fermer" type="button" @click="vm.close"><X :size="20" /></button></header>
          <div class="org-access-modal__modes" role="radiogroup" aria-label="Mode d’ajout">
            <button :class="{ 'is-active': vm.mode.value === 'new' }" type="button" @click="vm.mode.value = 'new'">Nouveau compte</button>
            <button :class="{ 'is-active': vm.mode.value === 'existing' }" type="button" @click="vm.mode.value = 'existing'">Compte existant</button>
          </div>
          <form @submit.prevent="vm.save">
            <template v-if="vm.mode.value === 'new'">
              <label>Nom complet<input v-model.trim="vm.form.nomComplet" required autocomplete="name" /></label>
              <label>Adresse e-mail<input v-model.trim="vm.form.email" required type="email" autocomplete="email" /></label>
              <label>Téléphone <span>facultatif</span><input v-model.trim="vm.form.telephone" autocomplete="tel" /></label>
              <label>Mot de passe initial<input v-model="vm.form.motDePasseInitial" required type="password" minlength="12" autocomplete="new-password" /><small>Au moins 12 caractères. Il ne sera jamais réaffiché.</small></label>
            </template>
            <label v-else>Personne à affecter<select v-model="vm.form.idUtilisateur" required><option value="">Sélectionnez un compte</option><option v-for="account in vm.availableAccounts.value" :key="account.id" :value="account.id">{{ account.nomComplet }} — {{ account.email }}</option></select></label>
            <label class="org-access-modal__wide">Motif de l’affectation<textarea v-model.trim="vm.form.motif" required rows="3" placeholder="Expliquez brièvement cette attribution." /></label>
            <footer><button type="button" @click="vm.close">Annuler</button><button class="org-access__primary" type="submit" :disabled="!vm.canSave.value || vm.saving.value">{{ vm.saving.value ? 'Enregistrement…' : 'Confirmer l’affectation' }}</button></footer>
          </form>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { LoaderCircle, ShieldAlert, ShieldQuestion, UserPlus, X } from 'lucide-vue-next';
import { useOrganizationAccessAdministration } from '../viewmodels/useOrganizationAccessAdministration';
const props = defineProps<{ organisationId: string }>();
const vm = useOrganizationAccessAdministration(props.organisationId);
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
const stateLabel = (state: string) => ({ ACTIVE: 'Actif', SUSPENDED: 'Suspendu', DISABLED: 'Désactivé' }[state] ?? state);
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat('fr-CD', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Aucune activité récente';
</script>

<style scoped>
.org-access{display:grid;gap:1rem}.org-access__intro{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1.1rem;border-radius:22px;background:linear-gradient(135deg,#f2fbfd,#fff);border:1px solid rgba(13,95,122,.12)}.org-access__intro p,.org-access__card p,.org-access__state p{margin:.3rem 0 0;color:#60778a}.org-access__primary{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;min-height:46px;padding:.75rem 1rem;border:0;border-radius:15px;background:linear-gradient(135deg,#0b5d7a,#1595b3);color:#fff;font-weight:800}.org-access__primary:disabled{opacity:.55}.org-access__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.org-access__card{display:grid;grid-template-columns:auto 1fr;gap:1rem;padding:1.1rem;border:1px solid rgba(17,40,63,.09);border-radius:22px;background:#fff;box-shadow:0 16px 32px rgba(15,23,42,.06)}.org-access__avatar{display:grid;place-items:center;width:48px;height:48px;border-radius:16px;background:#e8f7fb;color:#0b5d7a;font-weight:900}.org-access__badge{display:inline-flex;margin-top:.65rem;padding:.3rem .65rem;border-radius:999px;background:#f3f4f6;color:#475569;font-size:.8rem;font-weight:800}.org-access__badge.is-active{background:#e9f8ef;color:#166534}.org-access__card dl{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin:0;padding-top:.85rem;border-top:1px solid #edf2f7}.org-access__card dl div{display:grid;gap:.2rem}.org-access__card dt{color:#6b8092;font-size:.8rem}.org-access__card dd{margin:0;color:#17324a;font-weight:700}.org-access__state{display:grid;justify-items:center;gap:.4rem;padding:2rem;text-align:center;border-radius:22px;background:#f8fbfd;color:#27465f}.org-access__state--error{background:#fff7f7;color:#991b1b}.org-access__spin{animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
.org-access-modal{position:fixed;inset:0;z-index:1200;display:grid;place-items:center;padding:1rem;background:rgba(10,25,40,.58);backdrop-filter:blur(8px)}.org-access-modal__panel{width:min(720px,100%);max-height:calc(100vh - 2rem);overflow:auto;border-radius:28px;background:#fff;box-shadow:0 32px 90px rgba(2,12,27,.35)}.org-access-modal__panel header{display:flex;justify-content:space-between;gap:1rem;padding:1.4rem 1.5rem;border-bottom:1px solid #e8eef3}.org-access-modal__panel h2{margin:.25rem 0;color:#122c44}.org-access-modal__panel header p{margin:0;color:#60778a}.org-access-modal__panel header button{align-self:start;border:0;border-radius:12px;padding:.65rem;background:#f1f5f9}.org-access-modal__modes{display:grid;grid-template-columns:1fr 1fr;gap:.55rem;margin:1.2rem 1.5rem;padding:.35rem;border-radius:16px;background:#f1f6f9}.org-access-modal__modes button{border:0;border-radius:12px;padding:.75rem;background:transparent;font-weight:800;color:#577084}.org-access-modal__modes button.is-active{background:#fff;color:#0b5d7a;box-shadow:0 5px 16px rgba(15,23,42,.09)}.org-access-modal form{display:grid;grid-template-columns:1fr 1fr;gap:1rem;padding:0 1.5rem 1.5rem}.org-access-modal label{display:grid;gap:.4rem;color:#233f57;font-weight:750}.org-access-modal label span,.org-access-modal label small{color:#75899a;font-weight:500}.org-access-modal input,.org-access-modal select,.org-access-modal textarea{width:100%;min-height:48px;border:1px solid #ccd8e2;border-radius:14px;padding:.75rem;background:#fff;color:#17324a}.org-access-modal textarea{resize:vertical}.org-access-modal__wide,.org-access-modal footer{grid-column:1/-1}.org-access-modal footer{display:flex;justify-content:flex-end;gap:.75rem;padding-top:.6rem}.org-access-modal footer>button:not(.org-access__primary){min-height:46px;padding:.75rem 1rem;border:1px solid #d8e1e8;border-radius:15px;background:#fff;font-weight:800}
@media(max-width:720px){.org-access__intro{align-items:stretch;flex-direction:column}.org-access__grid,.org-access-modal form{grid-template-columns:1fr}.org-access-modal__wide,.org-access-modal footer{grid-column:auto}.org-access-modal footer{flex-direction:column-reverse}.org-access-modal footer button{width:100%}.org-access__card dl{grid-template-columns:1fr}}
</style>
