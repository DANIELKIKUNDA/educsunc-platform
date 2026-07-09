<template>
  <Teleport to="body">
    <div v-if="notifications.length > 0" class="toast-stack" aria-live="polite" aria-atomic="true">
      <article
        v-for="notification in notifications"
        :key="notification.id"
        class="toast-card"
        :class="`toast-card--${notification.type}`"
      >
        <div class="toast-card__accent" />
        <div class="toast-card__icon">
          <component :is="lireIcone(notification.type)" :size="18" />
        </div>
        <div class="toast-card__content">
          <strong>{{ notification.titre }}</strong>
          <p>{{ notification.message }}</p>
        </div>
        <button
          class="toast-card__close"
          type="button"
          aria-label="Fermer la notification"
          @click="notificationsService.retirer(notification.id)"
        >
          <X :size="16" />
        </button>
      </article>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CheckCircle2, Info, OctagonAlert, TriangleAlert, X } from 'lucide-vue-next';
import { notificationsService, type NotificationMessage } from '../../services/notifications.service';

const notifications = computed(() => notificationsService.notifications.value);

function lireIcone(type: NotificationMessage['type']) {
  switch (type) {
    case 'succes':
      return CheckCircle2;
    case 'danger':
      return OctagonAlert;
    case 'attention':
      return TriangleAlert;
    default:
      return Info;
  }
}
</script>

<style scoped>
.toast-stack{
  position:fixed;
  top:1.25rem;
  right:1.25rem;
  z-index:3000;
  display:grid;
  gap:.9rem;
  width:min(430px,calc(100vw - 2rem));
  pointer-events:none;
}

.toast-card{
  pointer-events:auto;
  position:relative;
  display:grid;
  grid-template-columns:4px auto minmax(0,1fr) auto;
  align-items:start;
  gap:.9rem;
  padding:1rem 1rem 1rem 0;
  border-radius:24px;
  border:1px solid rgba(17,40,63,.08);
  background:rgba(255,255,255,.92);
  backdrop-filter:blur(22px);
  box-shadow:0 28px 64px rgba(15,23,42,.16);
  overflow:hidden;
  transform-origin:top right;
  animation:toast-enter .22s ease;
}

.toast-card__accent{
  align-self:stretch;
  border-radius:999px;
  margin:.35rem 0 .35rem .35rem;
}

.toast-card__icon{
  display:grid;
  place-items:center;
  width:2.45rem;
  height:2.45rem;
  border-radius:16px;
  margin-top:.2rem;
  background:rgba(255,255,255,.74);
}

.toast-card__content{
  display:grid;
  gap:.28rem;
  min-width:0;
}

.toast-card__content strong{
  color:#10243b;
  font-size:1rem;
  line-height:1.25;
}

.toast-card__content p{
  margin:0;
  color:#4a6578;
  line-height:1.55;
}

.toast-card__close{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:2rem;
  height:2rem;
  margin-top:.1rem;
  border:0;
  border-radius:12px;
  background:transparent;
  color:#587083;
  cursor:pointer;
  transition:all .2s ease;
}

.toast-card__close:hover{
  background:rgba(17,40,63,.06);
  color:#11283f;
}

.toast-card--succes{
  background:linear-gradient(180deg,rgba(237,251,242,.96),rgba(255,255,255,.98));
}

.toast-card--succes .toast-card__accent,
.toast-card--succes .toast-card__icon{
  background:linear-gradient(180deg,#20b15a,#17924a);
  color:#fff;
}

.toast-card--danger{
  background:linear-gradient(180deg,rgba(255,243,243,.96),rgba(255,255,255,.98));
}

.toast-card--danger .toast-card__accent,
.toast-card--danger .toast-card__icon{
  background:linear-gradient(180deg,#ef4444,#c62828);
  color:#fff;
}

.toast-card--info{
  background:linear-gradient(180deg,rgba(239,245,255,.96),rgba(255,255,255,.98));
}

.toast-card--info .toast-card__accent,
.toast-card--info .toast-card__icon{
  background:linear-gradient(180deg,#2563eb,#1741a6);
  color:#fff;
}

.toast-card--attention{
  background:linear-gradient(180deg,rgba(255,248,238,.96),rgba(255,255,255,.98));
}

.toast-card--attention .toast-card__accent,
.toast-card--attention .toast-card__icon{
  background:linear-gradient(180deg,#f59e0b,#c77607);
  color:#fff;
}

@keyframes toast-enter{
  from{
    opacity:0;
    transform:translateY(-10px) scale(.97);
  }
  to{
    opacity:1;
    transform:translateY(0) scale(1);
  }
}

@media (max-width: 720px){
  .toast-stack{
    left:1rem;
    right:1rem;
    width:auto;
    top:1rem;
  }

  .toast-card{
    grid-template-columns:4px auto minmax(0,1fr);
    padding-right:.7rem;
  }

  .toast-card__close{
    grid-column:3;
    justify-self:end;
  }
}
</style>
