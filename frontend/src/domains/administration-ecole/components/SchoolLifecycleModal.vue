<template>
  <ModalShell :open="open" @close="$emit('close')">
    <template #header>
      <div class="school-lifecycle-modal__header">
        <div>
          <small>Confirmation</small>
          <h2>{{ action === 'activate' ? "Activer l’école" : "Désactiver l’école" }}</h2>
          <p>
            <template v-if="action === 'activate'">
              Vous êtes sur le point de rendre <strong>{{ schoolName }}</strong> de nouveau active dans le registre.
            </template>
            <template v-else>
              Vous êtes sur le point de désactiver <strong>{{ schoolName }}</strong>. L’école restera visible dans le registre avec son nouveau statut.
            </template>
          </p>
        </div>
      </div>
    </template>

    <section class="school-lifecycle-modal__panel">
      <strong>Controle avant confirmation</strong>
      <ul>
        <li>La trace de cette action restera disponible dans la fiche de l’école.</li>
        <li>Cette confirmation ne modifie pas les autres informations de l’établissement.</li>
        <li>Le registre sera relu automatiquement après validation.</li>
      </ul>
    </section>

    <template #footer>
      <div class="school-lifecycle-modal__footer">
        <button class="school-lifecycle-modal__ghost" type="button" @click="$emit('close')">
          Annuler
        </button>
        <button
          class="school-lifecycle-modal__primary"
          :class="action === 'deactivate' ? 'school-lifecycle-modal__primary--danger' : ''"
          type="button"
          :disabled="pending"
          @click="$emit('confirm')"
        >
          {{ pending ? 'Validation en cours…' : action === 'activate' ? "Activer l’école" : "Désactiver l’école" }}
        </button>
      </div>
    </template>
  </ModalShell>
</template>

<script setup lang="ts">
import ModalShell from '../../../components/communs/ModalShell.vue';

defineProps<{
  open: boolean;
  action: 'activate' | 'deactivate';
  schoolName: string;
  pending: boolean;
}>();

defineEmits<{
  (event: 'close'): void;
  (event: 'confirm'): void;
}>();
</script>

<style scoped>
.school-lifecycle-modal__header small{
  display:block;
  color:#61788a;
  text-transform:uppercase;
  letter-spacing:.08em;
  font-weight:700;
}

.school-lifecycle-modal__header h2{
  margin:.35rem 0;
  color:#10243b;
}

.school-lifecycle-modal__header p{
  margin:0;
  color:#587083;
  line-height:1.6;
}

.school-lifecycle-modal__panel{
  display:grid;
  gap:.7rem;
  padding:1rem 1.1rem;
  border-radius:22px;
  border:1px solid rgba(17,40,63,.08);
  background:#fff;
}

.school-lifecycle-modal__panel strong{
  color:#10243b;
}

.school-lifecycle-modal__panel ul{
  margin:0;
  padding-left:1.1rem;
  color:#587083;
  display:grid;
  gap:.5rem;
}

.school-lifecycle-modal__footer{
  display:flex;
  justify-content:flex-end;
  gap:.8rem;
}

.school-lifecycle-modal__ghost,
.school-lifecycle-modal__primary{
  border-radius:999px;
  padding:.8rem 1.15rem;
  font-weight:700;
  border:1px solid rgba(17,40,63,.12);
}

.school-lifecycle-modal__ghost{
  background:#fff;
  color:#11283f;
}

.school-lifecycle-modal__primary{
  background:linear-gradient(135deg,#113f67,#1a6aa0);
  border-color:transparent;
  color:#fff;
}

.school-lifecycle-modal__primary--danger{
  background:linear-gradient(135deg,#b94b4b,#db5e5e);
}

@media (max-width: 720px){
  .school-lifecycle-modal__footer{
    flex-direction:column;
  }
}
</style>
