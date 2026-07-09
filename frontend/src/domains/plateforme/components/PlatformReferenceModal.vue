<template>
  <Teleport to="body">
    <div v-if="open" class="reference-modal">
      <button class="reference-modal__backdrop" type="button" aria-label="Fermer la fenetre" @click="$emit('close')" />
      <section class="reference-modal__dialog" role="dialog" aria-modal="true" :aria-labelledby="`${id}-title`">
        <header class="reference-modal__header">
          <div>
            <small>{{ eyebrow }}</small>
            <h2 :id="`${id}-title`">{{ title }}</h2>
            <p v-if="description">{{ description }}</p>
          </div>
          <button class="reference-modal__close" type="button" aria-label="Fermer" @click="$emit('close')">
            <slot name="close-icon">×</slot>
          </button>
        </header>

        <div class="reference-modal__body">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="reference-modal__footer">
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  id: string;
  open: boolean;
  title: string;
  eyebrow?: string;
  description?: string;
}>();

defineEmits<{
  close: [];
}>();
</script>

<style scoped>
.reference-modal{
  position:fixed;
  inset:0;
  z-index:2400;
  display:grid;
  place-items:center;
  padding:1.25rem;
}

.reference-modal__backdrop{
  position:absolute;
  inset:0;
  border:0;
  background:rgba(5,15,25,.5);
  backdrop-filter:blur(8px);
}

.reference-modal__dialog{
  position:relative;
  width:min(860px,100%);
  max-height:min(90vh,920px);
  overflow:auto;
  border-radius:30px;
  border:1px solid rgba(255,255,255,.28);
  background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(244,248,252,.98));
  box-shadow:0 40px 90px rgba(9,20,38,.28);
}

.reference-modal__header{
  display:flex;
  align-items:start;
  justify-content:space-between;
  gap:1rem;
  padding:1.35rem 1.4rem 1rem;
  border-bottom:1px solid rgba(17,40,63,.08);
}

.reference-modal__header small{
  display:block;
  color:#6f8597;
  text-transform:uppercase;
  letter-spacing:.08em;
  margin-bottom:.25rem;
}

.reference-modal__header h2{
  margin:0;
  color:#10243b;
  font-size:1.35rem;
}

.reference-modal__header p{
  margin:.35rem 0 0;
  color:#607789;
  line-height:1.5;
}

.reference-modal__close{
  display:grid;
  place-items:center;
  width:2.4rem;
  height:2.4rem;
  border:1px solid rgba(17,40,63,.1);
  border-radius:16px;
  background:rgba(255,255,255,.8);
  color:#31516a;
  cursor:pointer;
}

.reference-modal__body{
  padding:1.2rem 1.4rem;
}

.reference-modal__footer{
  display:flex;
  justify-content:flex-end;
  gap:.8rem;
  padding:0 1.4rem 1.4rem;
}

@media (max-width: 720px){
  .reference-modal{
    padding:.75rem;
    align-items:end;
  }

  .reference-modal__dialog{
    width:100%;
    max-height:92vh;
    border-radius:28px 28px 0 0;
  }

  .reference-modal__header,
  .reference-modal__body,
  .reference-modal__footer{
    padding-left:1rem;
    padding-right:1rem;
  }

  .reference-modal__footer{
    flex-direction:column-reverse;
  }
}
</style>
