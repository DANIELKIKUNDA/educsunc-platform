import type { Pool } from 'pg';
import { TraceOperation, type FiltreMonitoring, type PortRepositoryTrace } from '../../domain';
import type { MonitoringTracingPort } from '../../application';
type Row={payload:Record<string,unknown>};
const hydrater=(r:Row)=>{const p=r.payload as any; return new TraceOperation({...p,captureeLe:new Date(p.captureeLe)});};
export class RepositoryTraceMonitoringPostgres implements PortRepositoryTrace, MonitoringTracingPort {
 constructor(private readonly pool:Pool){}
 async sauvegarder(trace:TraceOperation){const p=trace.valeur(); await this.pool.query(`INSERT INTO monitoring_traces(identifiant,payload,type,capturee_le) VALUES($1,$2::jsonb,$3,$4) ON CONFLICT(identifiant) DO UPDATE SET payload=EXCLUDED.payload,type=EXCLUDED.type,capturee_le=EXCLUDED.capturee_le`,[p.identifiant,JSON.stringify(p),p.type,p.captureeLe]);}
 async rechercherParFiltre(_f:FiltreMonitoring){return this.listerTraces();}
 async enregistrerTrace(t:TraceOperation){await this.sauvegarder(t);}
 async retrouverTraces(ids?:readonly string[]){if(!ids?.length)return this.listerTraces(); const r=await this.pool.query<Row>('SELECT payload FROM monitoring_traces WHERE identifiant = ANY($1::text[]) ORDER BY capturee_le DESC',[ids]); return r.rows.map(hydrater);}
 async listerTraces(){const r=await this.pool.query<Row>('SELECT payload FROM monitoring_traces ORDER BY capturee_le DESC LIMIT 1000');return r.rows.map(hydrater);}
}
