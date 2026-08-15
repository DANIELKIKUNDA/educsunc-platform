export type MonitoringRealtimeState = 'idle'|'polling'|'paused'|'degraded';

export interface MonitoringRealtimeController {
  start(): void;
  stop(): void;
  refreshNow(): Promise<void>;
  state(): MonitoringRealtimeState;
}

/**
 * Fallback borne M7. Le depot ne fournit pas encore de transport navigateur SSE/WebSocket
 * exploitable pour Monitoring : on reutilise donc les API Monitoring existantes, sans creer
 * de seconde infrastructure realtime. Le polling se coupe lorsque l'onglet est masque.
 */
export function createMonitoringRealtimeFallback(refresh:()=>Promise<void>, intervalMs=30_000):MonitoringRealtimeController{
  const base=Math.max(15_000, intervalMs);
  let timer:ReturnType<typeof setTimeout>|null=null;
  let stopped=true;
  let failures=0;
  let current:MonitoringRealtimeState='idle';
  const clear=()=>{if(timer){clearTimeout(timer);timer=null}};
  const schedule=()=>{
    clear(); if(stopped)return;
    if(typeof document!=='undefined' && document.visibilityState==='hidden'){current='paused';return;}
    const delay=Math.min(base*(2**Math.min(failures,3)),120_000);
    current=failures>0?'degraded':'polling';
    timer=setTimeout(()=>void tick(),delay);
  };
  const tick=async()=>{try{await refresh();failures=0}catch{failures+=1}finally{schedule()}};
  const onVisibility=()=>{if(stopped)return;if(document.visibilityState==='visible'){void tick()}else{clear();current='paused'}};
  return {
    start(){if(!stopped)return;stopped=false;failures=0;if(typeof document!=='undefined')document.addEventListener('visibilitychange',onVisibility);schedule()},
    stop(){stopped=true;clear();current='idle';if(typeof document!=='undefined')document.removeEventListener('visibilitychange',onVisibility)},
    async refreshNow(){await tick()},
    state(){return current},
  };
}
