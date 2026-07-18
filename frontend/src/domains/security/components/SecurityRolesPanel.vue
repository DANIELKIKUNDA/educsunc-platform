<template>
  <div class="security-role-layout">
    <section class="security-role-directory" aria-label="Liste des rôles">
      <div class="security-role-directory__toolbar">
        <label><Search :size="16" aria-hidden="true" /><span class="visually-hidden">Rechercher un rôle</span><input v-model.trim="search" type="search" placeholder="Rechercher une responsabilité" /></label>
        <button v-if="canWrite" class="security-button" type="button" @click="$emit('create')"><Plus :size="16" /> Nouveau rôle</button>
      </div>
      <button v-for="role in filteredRoles" :key="role.idRole" class="security-role-list-item" :class="{ 'security-role-list-item--active':selected?.codeRole === role.codeRole }" type="button" @click="$emit('select',role)">
        <span class="security-role-list-item__icon"><ShieldCheck :size="18" /></span>
        <span><strong>{{ role.nomRole }}</strong><small>{{ levelLabel(role.niveauAcces) }} · {{ role.nombreAffectations }} affectation(s)</small></span>
        <span class="security-status" :class="role.estActif ? 'security-status--active' : 'security-status--disabled'">{{ role.estActif ? 'Actif' : 'Inactif' }}</span>
      </button>
      <div v-if="!filteredRoles.length" class="security-empty"><ShieldQuestion :size="28" /><strong>Aucun rôle ne correspond</strong><p>Modifiez votre recherche pour retrouver une responsabilité.</p></div>
    </section>

    <section v-if="selected" class="security-role-detail" aria-live="polite">
      <header><div><span>{{ selected.estSysteme ? 'Responsabilité officielle' : 'Responsabilité personnalisée' }}</span><h3>{{ selected.nomRole }}</h3><p>{{ selected.description || 'Cette responsabilité regroupe les autorisations nécessaires à son activité.' }}</p></div><span class="security-badge">{{ levelLabel(selected.niveauAcces) }}</span></header>
      <div class="security-role-detail__facts"><div><span>Autorisations</span><strong>{{ selected.permissions.length }}</strong></div><div><span>Limitations</span><strong>{{ selected.restrictions.length }}</strong></div><div><span>Affectations</span><strong>{{ selected.nombreAffectations }}</strong></div></div>
      <div v-if="selected.estSysteme" class="security-impact security-impact--calm"><LockKeyhole :size="21" /><div><strong>Rôle officiel protégé</strong><p>Cette responsabilité est maintenue par EduSync et ne peut pas être modifiée depuis le centre.</p></div></div>

      <section class="security-capability-section"><div class="security-capability-section__heading"><div><h4>Autorisations accordées</h4><p>Actions que cette responsabilité permet d’exécuter.</p></div></div>
        <div class="security-capability-list"><div v-for="permission in selected.permissions" :key="permission" class="security-capability"><span><strong>{{ humanize(permission) }}</strong><small>{{ domainLabel(permission) }}</small></span><button v-if="canEdit" type="button" :disabled="busy || selected.permissions.length <= 1" :aria-label="`Retirer ${humanize(permission)}`" @click="$emit('permission',{value:permission,add:false})"><X :size="15" /></button></div></div>
        <div v-if="canEdit" class="security-inline-editor"><label><span>Ajouter une autorisation</span><select v-model="permissionToAdd"><option value="">Sélectionnez une autorisation</option><option v-for="item in availablePermissions" :key="item.code" :value="item.code">{{ humanize(item.code) }} · {{ domainLabel(item.code) }}</option></select></label><button class="security-button security-button--secondary" type="button" :disabled="!permissionToAdd || busy" @click="addPermission"><Plus :size="16" /> Ajouter</button></div>
      </section>

      <section class="security-capability-section"><div class="security-capability-section__heading"><div><h4>Limitations métier</h4><p>Interdictions explicites qui encadrent cette responsabilité.</p></div></div>
        <div v-if="selected.restrictions.length" class="security-capability-list"><div v-for="restriction in selected.restrictions" :key="restriction" class="security-capability security-capability--restriction"><span><strong>{{ restrictionLabel(restriction) }}</strong><small>Limitation active</small></span><button v-if="canEdit" type="button" :disabled="busy" :aria-label="`Retirer ${restrictionLabel(restriction)}`" @click="$emit('restriction',{value:restriction,add:false})"><X :size="15" /></button></div></div>
        <p v-else class="security-role-detail__empty">Aucune limitation particulière n’est appliquée.</p>
        <div v-if="canEdit" class="security-inline-editor"><label><span>Ajouter une limitation</span><select v-model="restrictionToAdd"><option value="">Sélectionnez une limitation</option><option v-for="item in availableRestrictions" :key="item" :value="item">{{ restrictionLabel(item) }}</option></select></label><button class="security-button security-button--secondary" type="button" :disabled="!restrictionToAdd || busy" @click="addRestriction"><Plus :size="16" /> Ajouter</button></div>
      </section>
      <footer v-if="canEdit"><button class="security-button" :class="selected.estActif ? 'security-button--danger' : ''" type="button" :disabled="busy" @click="$emit('state',!selected.estActif)">{{ selected.estActif ? 'Désactiver ce rôle' : 'Réactiver ce rôle' }}</button></footer>
    </section>
    <section v-else class="security-role-detail security-role-detail--empty"><Shield :size="34" /><h3>Sélectionnez un rôle</h3><p>Sa mission, ses autorisations, ses limitations et son impact apparaîtront ici.</p></section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { LockKeyhole, Plus, Search, Shield, ShieldCheck, ShieldQuestion, X } from 'lucide-vue-next';
import type { SecurityPermissionCatalogItem, SecurityRoleDetail, SecurityRoleItem } from '../models/security.model';

const props=defineProps<{ roles:readonly SecurityRoleItem[]; selected:SecurityRoleDetail|null; catalog:readonly SecurityPermissionCatalogItem[]; canWrite:boolean; busy:boolean }>();
const emit=defineEmits<{ create:[]; select:[role:SecurityRoleItem]; state:[active:boolean]; permission:[change:{value:string;add:boolean}]; restriction:[change:{value:string;add:boolean}] }>();
const search=ref(''); const permissionToAdd=ref(''); const restrictionToAdd=ref('');
const restrictions=['INTERDICTION_CAISSE','INTERDICTION_BULLETINS','INTERDICTION_FINANCES','INTERDICTION_MODIFICATION_COTES','INTERDICTION_TRANSFERT','INTERDICTION_ABANDON'] as const;
const canEdit=computed(()=>props.canWrite && Boolean(props.selected) && !props.selected?.estSysteme);
const filteredRoles=computed(()=>{const term=search.value.toLocaleLowerCase('fr');return props.roles.filter(role=>!term || `${role.nomRole} ${role.description ?? ''}`.toLocaleLowerCase('fr').includes(term));});
const availablePermissions=computed(()=>props.catalog.filter(item=>!props.selected?.permissions.includes(item.code)));
const availableRestrictions=computed(()=>restrictions.filter(item=>!props.selected?.restrictions.includes(item)));
watch(()=>props.selected?.codeRole,()=>{permissionToAdd.value='';restrictionToAdd.value='';});
const levelLabel=(value:string)=>({PLATEFORME:'Plateforme',ORGANISATION:'Organisation',ECOLE:'École',SECTION:'Section',CLASSE:'Classe',COURS:'Cours'}[value] ?? value);
const nouns:Readonly<Record<string,string>>={security:'la sécurité',accounts:'les comptes',admin:'les administrateurs',organizations:'les organisations',schools:'les écoles',roles:'les rôles',permissions:'les autorisations',assignments:'les affectations',sessions:'les sessions',audit:'l’historique',configuration:'la configuration',modules:'les modules',referentiel:'le référentiel',finance:'les finances',paiements:'les paiements',caisse:'la caisse',utilisateurs:'les utilisateurs'};
const verbs:Readonly<Record<string,string>>={read:'Consulter',write:'Gérer',lifecycle:'Gérer le cycle de vie de',unlock:'Déverrouiller',revoke:'Révoquer',emergency:'Intervenir exceptionnellement sur'};
const humanize=(value:string)=>{const parts=value.split('.');const action=parts.at(-1) ?? '';const subjectParts=parts.slice(0,-1).filter(part=>part!=='security');const subject=subjectParts.map(part=>nouns[part] ?? part.replace(/[_-]+/g,' ')).join(' et ') || 'les accès';return `${verbs[action] ?? action.replace(/[_-]+/g,' ')} ${subject}`.replace(/^\s+/,'').replace(/^./,letter=>letter.toUpperCase());};
const domainLabel=(value:string)=>({security:'Sécurité',roles:'Rôles',permissions:'Autorisations',utilisateurs:'Utilisateurs',configuration:'Configuration',modules:'Configuration',referentiel:'Référentiel',audit:'Historique',finance:'Finances',paiements:'Finances',caisse:'Finances'}[value.split('.')[0]] ?? 'Fonction métier');
const restrictionLabel=(value:string)=>({INTERDICTION_CAISSE:'Accès à la caisse interdit',INTERDICTION_BULLETINS:'Accès aux bulletins interdit',INTERDICTION_FINANCES:'Accès aux finances interdit',INTERDICTION_MODIFICATION_COTES:'Modification des cotes interdite',INTERDICTION_TRANSFERT:'Transfert d’élève interdit',INTERDICTION_ABANDON:'Déclaration d’abandon interdite'}[value] ?? 'Limitation métier');
function addPermission(){if(!permissionToAdd.value)return;emit('permission',{value:permissionToAdd.value,add:true});permissionToAdd.value='';}
function addRestriction(){if(!restrictionToAdd.value)return;emit('restriction',{value:restrictionToAdd.value,add:true});restrictionToAdd.value='';}
</script>
