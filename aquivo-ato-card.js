/* Aquivo ATO Card 1.0.1 — local dashboard UI, no external dependencies. */
const VERSION = '1.0.1';
const registryCache = new WeakMap();
const FIELDS = {
  mode: ['binary_output_1', 'Automatické dopúšťanie', 'switch'],
  web_ip_high: ["analog_input_70", "Web IPv4 horná časť", "sensor"],
  web_ip_low: ["analog_input_71", "Web IPv4 dolná časť", "sensor"],
  web_ip_check: ["analog_input_72", "Web IPv4 kontrola", "sensor"],
  percent: ['analog_in_percentage_9', 'Zostatok zásobníka', 'sensor'],
  remaining: ['analog_input_3', 'Zostávajúca voda', 'sensor'],
  daily: ['analog_input_4', 'Spotreba za aktuálne 24 h', 'sensor'],
  total: ['analog_input_5', 'Celková spotreba vody', 'sensor'],
  pump: ['binary_input_10', 'Pumpa beží', 'binary_sensor'],
  low: ['binary_input_11', 'Plavák žiada dopúšťanie', 'binary_sensor'],
  fault: ['binary_input_12', 'Alarm dopúšťača', 'binary_sensor'],
  ready: ['binary_input_13', 'Pripravené na AUTO', 'binary_sensor'],
  calibrating: ['binary_input_14', 'Prebieha kalibrácia', 'binary_sensor'],
  faultCode: ['analog_input_2', 'Kód alarmu', 'sensor'],
  flow: ['analog_input_6', 'Kalibrovaný prietok pumpy', 'sensor'],
  calibration: ['analog_input_7', 'Dĺžka neuloženého merania', 'sensor'],
  dailyLimit: ['analog_output_22', 'Limit dopúšťania za 24 h', 'number'],
  capacity: ['analog_output_20', 'Objem zásobníka', 'number'],
  refill: ['analog_output_21', 'Zostatok po doplnení vody', 'number'],
  clear: ['binary_output_30', 'Potvrdiť alarm', 'switch'],
  reset: ['binary_output_34', 'Reset počítadla limitu', 'switch'],
};
const validState = s => s && !['unknown', 'unavailable'].includes(s.state);
const normalize = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function webAddress(value) {
  if (!String(value || '').trim()) return '';
  try {
    const raw=String(value).trim();
    const url=new URL(raw.includes('://')?raw:'http://'+raw);
    return ['http:','https:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}
function historySamples(rows) {
  return (Array.isArray(rows)?rows:[]).map(r=>({v:r.s??r.state,t:typeof r.lu==='number'?r.lu*1000:Date.parse(r.last_changed??r.last_updated)}))
    .filter(r=>Number.isFinite(r.t)).sort((a,b)=>a.t-b.t);
}
function settledCounter(history,pumpId,totalId,now) {
  const pumps=historySamples(history?.[pumpId]).filter(r=>r.t<=now);
  const totals=historySamples(history?.[totalId]).filter(r=>r.t<=now);
  let active=null,stop=null,previous;
  for(const r of pumps){
    if(r.v==='on'&&previous==='off')active=r.t;
    else if(r.v==='off'&&previous==='on'&&active!==null){stop=r.t;active=null;}
    else if(!['on','off'].includes(r.v)){active=null;stop=null;}
    previous=r.v;
  }
  if(!['on','off'].includes(previous)||previous==='on'&&active===null)return null;
  const pending=active!==null || stop!==null&&now<stop+75000;
  // Freeze at the last completed reporting window. Later stale packets must
  // not rewrite today's sum. An active run is added only after it settles.
  let cutoff=active!==null?active-2000:stop!==null?Math.min(now,stop+75000):now;
  if(pending&&active===null){
    const start=pumps.filter(r=>r.v==='on'&&r.t<stop).at(-1)?.t;
    cutoff=start!==undefined?start-2000:cutoff;
  }
  // Lifetime resets and substantial idle ledger corrections are genuine
  // changes; do not conceal them behind a frozen completed-cycle snapshot.
  if(!pending){
    let previousValue;
    for(const r of totals){const n=Number(r.v);
      if(r.t>cutoff&&Number.isFinite(n)&&(n===0||previousValue!==undefined&&previousValue-n>25))cutoff=now;
      previousValue=Number.isFinite(n)?n:undefined;
    }
  }
  const sample=totals.filter(r=>r.t<=cutoff).at(-1);
  const value=sample&&String(sample.v??'').trim()!==''&&Number.isFinite(Number(sample.v))&&Number(sample.v)>=0?Number(sample.v):null;
  return {value,cutoff,pending,retryAt:active===null&&pending?stop+76000:null};
}
function lastFilling(history, pumpId, totalId, calibrationId, now) {
  const pumps=historySamples(history?.[pumpId]),totals=historySamples(history?.[totalId]);
  const calibration=historySamples(history?.[calibrationId]);
  const at=(rows,t)=>{let found;for(const r of rows){if(r.t>t)break;found=r;}return found;};
  let previous,active=null,last=null;
  for(let i=0;i<pumps.length;i++){
    const sample=pumps[i];
    if(sample.v==='on' && previous==='off')active=sample.t;
    else if(sample.v==='off' && previous==='on' && active!==null){
      const initial=at(calibration,active);
      // A reporting gap or an unknown calibration mode cannot prove a fill.
      const clean=initial?.v==='off' && !calibration.some(r=>r.t>active&&r.t<=sample.t&&r.v!=='off');
      if(clean){
        const next=pumps.slice(i+1).find(r=>r.v==='on');
        // Endpoint clusters are reported independently. Give the final total
        // one SDK refresh (60 s) plus the paced queue, and exclude initial
        // increments that can be delivered just before the pump ON report.
        const end=Math.min(sample.t+75000,now,next?next.t-2000:Infinity);
        const before=at(totals,active-2000),after=at(totals,end);
        const value=r=>r&&r.v!==null&&String(r.v).trim()!==''&&Number.isFinite(Number(r.v))&&Number(r.v)>=0?Number(r.v):null;
        let ml=value(before)!==null&&value(after)!==null?value(after)-value(before):null;
        const segment=[before,...totals.filter(r=>r.t>active-2000&&r.t<=end)].filter(Boolean);
        let peak=value(before);
        for(const row of segment){
          const current=value(row);
          // A completed fill is an endpoint difference, not a sum of updates.
          // Small stale values and the bounded (<=25 ml) reservation settlement
          // may decrease temporarily or permanently. Resets, larger corrections
          // and reporting gaps still invalidate the estimate.
          if(current===null || (peak!==null && peak-current>25))ml=null;
          if(current!==null)peak=Math.max(peak??current,current);
        }
        last={start:active,end:sample.t,ml:ml!==null&&ml>=0?ml:null,pending:now<sample.t+75000&&(!next||now<next.t)};
      }
      active=null;
    } else if(!['on','off'].includes(sample.v))active=null;
    previous=sample.v;
  }
  return last;
}
function calendarWindow(now, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-CA', {timeZone, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23'});
  const parts = stamp => Object.fromEntries(formatter.formatToParts(new Date(stamp)).filter(p=>p.type!=='literal').map(p=>[p.type, Number(p.value)]));
  const p=parts(now), local=Date.UTC(p.year,p.month-1,p.day);let start=local;
  // Resolve the offset at midnight itself, including 23/25-hour DST days.
  for(let i=0;i<4;i++){const q=parts(start);const represented=Date.UTC(q.year,q.month-1,q.day,q.hour,q.minute,q.second);const shift=represented-local;if(!shift)break;start-=shift;}
  return {key:`${timeZone}|${p.year}-${p.month}-${p.day}`, start:new Date(start).toISOString()};
}
function historyAnchor(rows, start, current, queriedAt) {
  const stamp=v=>typeof v==='number'?v*1000:Date.parse(v);
  const values=(Array.isArray(rows)?rows:[]).filter(s=>{const v=s.s??s.state;return v!==null&&v!==undefined&&String(v).trim()!=='';}).map(s=>({v:Number(s.s??s.state),t:stamp(s.lu??s.last_updated??s.last_changed)}))
    .filter(s=>Number.isFinite(s.v)&&s.v>=0&&Number.isFinite(s.t)).sort((a,b)=>a.t-b.t);
  if(!values.length || (values[0].t>Date.parse(start)+1000 && values[0].v!==0))return null;
  // Include the state visible when the query began, while Recorder catches up.
  if(current!==null && Number.isFinite(current))values.push({v:current,t:queriedAt});
  const base=values[0].v;let previous=base,offset=0;
  for(const sample of values.slice(1)){
    // A reset to zero starts a new lifetime segment. Nonzero corrections
    // remain corrections and must not be counted as additional water.
    if(sample.v===0 && previous>0)offset+=previous;
    previous=sample.v;
  }
  return {base,offset};
}
function devicesFor(registry) {
  return registry.devices.filter(d => d.manufacturer === 'NET4U' && (d.model_id === 'NET4U-ATO-ZB' || /(?:^|[^A-Z0-9])NET4U-ATO-ZB(?:$|[^A-Z0-9])/.test(d.model || '')));
}
function mapEntities(registry, deviceId) {
  const entities = registry.entities.filter(e => e.device_id === deviceId && !e.disabled_by);
  const map = {};
  for (const [field, [property, label, domain]] of Object.entries(FIELDS)) {
    const candidates = entities.filter(e => e.entity_id.startsWith(domain + '.'));
    const exact = candidates.filter(e => new RegExp('(?:^|_)' + property + '(?:_|$)').test(e.unique_id || ''));
    const named = candidates.filter(e => normalize(e.original_name) === normalize(label));
    const found = exact.length ? exact : named;
    if (found.length === 1) map[field] = found[0].entity_id;
  }
  return map;
}
async function getRegistry(hass, force = false) {
  const key = hass.connection || hass;
  const cached = registryCache.get(key);
  if (!force && cached && Date.now() - cached.time < 60000) return cached.promise;
  const promise = Promise.all([
    hass.callWS({type: 'config/device_registry/list'}),
    hass.callWS({type: 'config/entity_registry/list'}),
  ]).then(([devices, entities]) => ({devices, entities}));
  registryCache.set(key, {time: Date.now(), promise});
  promise.catch(() => { if (registryCache.get(key)?.promise === promise) registryCache.delete(key); });
  return promise;
}
const ICON = `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 25h44v24a7 7 0 0 1-7 7H17a7 7 0 0 1-7-7Z" fill="currentColor" opacity=".14"/><path d="M10 32c8-8 14 8 22 0s14 8 22 0M10 25h44v24a7 7 0 0 1-7 7H17a7 7 0 0 1-7-7Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M38 14c0 8-12 8-12 0 0-4 6-11 6-11s6 7 6 11Z" fill="currentColor"/><path d="m24 42-5-4v8Zm0 0c5-6 13-6 18 0-5 6-13 6-18 0" fill="currentColor"/><circle cx="37" cy="41" r="1" fill="var(--ha-card-background,var(--card-background-color,#fff))"/></svg>`;

class Net4uAtoCard extends HTMLElement {
  constructor() {
    super(); this.attachShadow({mode: 'open'}); this._map = {}; this._registry = null;
    this._loading = false; this._command = null; this._message = ''; this._lastDraw = '';
    this._todaySerial=0;this._todayKey='';this._todayAnchor=null;this._todayPending=null;this._todayRetryAt=0;
    this._lastFillSerial=0;this._lastFillKey='';this._lastFill=null;this._lastFillPending=null;this._lastFillAt=0;
    this._settledCounter=null;
  }
  static getConfigElement() { return document.createElement('net4u-ato-card-editor'); }
  static getStubConfig() { return {type: 'custom:net4u-ato-card', name: 'Akvárium'}; }
  getCardSize() { return 7; }
  getGridOptions() { return {columns: 12, rows: 'auto', min_columns: 6}; }
  setConfig(config) {
    if (config.device_id !== undefined && typeof config.device_id !== 'string') throw new Error('Neplatné zariadenie dopúšťača.');
    if(config.web_url && !webAddress(config.web_url))throw new Error('Zadaj platnú HTTP alebo HTTPS adresu webu ATO.');
    clearTimeout(this._lastFillTimer);++this._lastFillSerial;this._lastFillKey='';this._lastFill=null;this._lastFillPending=null;this._lastFillAt=0;this._settledCounter=null;
    this._config = {...config}; this._registryAt = 0; this._lastDraw = '';this._map={};this._todayKey='';this._todayAnchor=null;this._todayPending=null;++this._todaySerial;this._create(); this._resolve(); this._render();
  }
  set hass(hass) { this._hass = hass; this._resolve();this._loadToday();this._loadLastFill();this._render(); }
  connectedCallback() {
    this._create(); this._resolve();
    this._loadLastFill();
    this._poll ||= setInterval(() => { if (document.visibilityState !== 'hidden'){this._resolve(true);this._loadToday();this._loadLastFill();this._render();} }, 60000);
  }
  disconnectedCallback() { clearInterval(this._poll); this._poll = null; clearTimeout(this._commandTimer); this._commandTimer = null; this._command = null;this._todayPending=null;++this._todaySerial;this._lastFillPending=null;clearTimeout(this._lastFillTimer);++this._lastFillSerial; }
  async _resolve(force = false) {
    if (!this._hass || !this._config || this._loading || (!force && this._registry && this._registryAt > Date.now() - 60000)) return;
    this._loading = true;
    try {
      const registry = await getRegistry(this._hass, force); this._registry = registry; this._registryAt = Date.now();
      const devices = devicesFor(registry);
      this._deviceId = this._config.device_id || (devices.length === 1 ? devices[0].id : null);
      this._device = devices.find(d => d.id === this._deviceId);
      this._map = this._device ? mapEntities(registry, this._deviceId) : {};
      this._registryError = '';
    } catch { this._registryError = 'Nepodarilo sa načítať entity. Skús obnoviť stránku.'; }
    finally { this._loading = false;this._loadToday();this._loadLastFill();this._render(); }
  }
  async _loadLastFill(force=false) {
    if(!this.isConnected || !this._hass || !this._map.pump || !this._map.total || !this._map.calibrating)return;
    const now=Date.now(),pump=this._state('pump');
    const key=[this._deviceId,this._map.pump,pump?.state,pump?.last_changed,pump?.state==='off'?this._state('total')?.state:''].join('|');
    if(this._lastFillPending || (!force && key===this._lastFillKey && now-this._lastFillAt<300000))return;
    this._lastFillKey=key;this._lastFillAt=now;
    const token={serial:++this._lastFillSerial,device:this._deviceId};this._lastFillPending=token;
    const pumpId=this._map.pump,totalId=this._map.total,calibrationId=this._map.calibrating;let timer;
    try {
      const history=await Promise.race([
        this._hass.callWS({type:'history/history_during_period',start_time:new Date(now-7*86400000).toISOString(),end_time:new Date(now).toISOString(),entity_ids:[pumpId,totalId,calibrationId],include_start_time_state:true,minimal_response:true,no_attributes:true}),
        new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('history timeout')),8000);}),
      ]);
      if(token.serial===this._lastFillSerial && token.device===this._deviceId){this._lastFill=lastFilling(history,pumpId,totalId,calibrationId,now);this._settledCounter=settledCounter(history,pumpId,totalId,now);this._lastFillError=false;this._loadToday();
        clearTimeout(this._lastFillTimer);
        const retry=this._settledCounter?.retryAt;
        if(retry)this._lastFillTimer=setTimeout(()=>this._loadLastFill(true),Math.max(1000,retry-Date.now()));}
    } catch {if(token.serial===this._lastFillSerial){this._lastFillError=true;this._lastFillAt=now-240000;}}
    finally {
      clearTimeout(timer);
      if(this._lastFillPending===token){this._lastFillPending=null;this._lastDraw='';this._render();if(key!==[this._deviceId,this._map.pump,this._state('pump')?.state,this._state('pump')?.last_changed,this._state('pump')?.state==='off'?this._state('total')?.state:''].join('|'))this._loadLastFill();}
    }
  }
  async _loadToday() {
    if(!this._hass || !this._map.total || !this._settledCounter)return;
    const now=Date.now(),zone=this._hass.config?.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    let day;try{day=calendarWindow(now,zone);}catch{return;}
    const key=day.key+'|'+this._map.total,current=this._settledCounter.value;
    const changed=key!==this._todayKey, decreased=!changed&&current!==null&&this._todayLast!==null&&current<this._todayLast;
    this._todayLast=current;
    if(changed || decreased){this._todayKey=key;this._todayAnchor=null;this._todayRetryAt=0;++this._todaySerial;}
    if(this._todayPending){if(changed||decreased)this._todayAgain=true;return;}
    if(this._todayAnchor || now<this._todayRetryAt)return;
    const token={serial:++this._todaySerial,key};this._todayPending=token;
    const entity=this._map.total;let timer;
    try {
      const history=await Promise.race([
        this._hass.callWS({type:'history/history_during_period',start_time:day.start,end_time:new Date(Math.max(Date.parse(day.start),this._settledCounter.cutoff)).toISOString(),entity_ids:[entity],include_start_time_state:true,minimal_response:true,no_attributes:true}),
        new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('history timeout')),8000);}),
      ]);
      if(token.serial===this._todaySerial && token.key===this._todayKey){
        this._todayAnchor=historyAnchor(history?.[entity],day.start,current,now);
        this._todayRetryAt=this._todayAnchor?0:Date.now()+60000;
      }
    } catch {if(token.serial===this._todaySerial)this._todayRetryAt=Date.now()+60000;}
    finally {
      clearTimeout(timer);
      if(this._todayPending===token){this._todayPending=null;this._lastDraw='';this._render();}
      if(this._todayAgain){this._todayAgain=false;this._loadToday();}
    }
  }
  _todayVolume() {
    const total=this._settledCounter?.value;
    return this._todayAnchor && Number.isFinite(total)?Math.max(0,total+this._todayAnchor.offset-this._todayAnchor.base):null;
  }
  _state(field) { return this._hass?.states[this._map[field]]; }
  _number(field) { const s = this._state(field); return validState(s) && s.state.trim() !== '' && Number.isFinite(Number(s.state)) ? Number(s.state) : null; }
  _isOn(field) { return this._state(field)?.state === 'on'; }
  _webUrl() {
    const keys=['web_ip_high','web_ip_low','web_ip_check'];
    if(keys.some(key=>this._map[key])){
      if(!validState(this._state('mode')))return '';
      const [high,low,check]=keys.map(key=>this._number(key));
      if(![high,low,check].every(n=>Number.isInteger(n)&&n>=0&&n<=65535)||(high^low)!==check)return '';
      const octets=[high>>>8,high&255,low>>>8,low&255];if(octets[0]===0||octets[0]===127||octets[0]>=224)return '';
      return 'http://'+octets.join('.')+'/';
    }
    return webAddress(this._device?.configuration_url)||webAddress(this._config.web_url);
  }
  _fmt(n, digits = 0) { return new Intl.NumberFormat(this._hass?.locale?.language || 'sk', {maximumFractionDigits: digits}).format(n); }
  _litres(n) { return n === null ? '—' : this._fmt(n / 1000, 2); }
  _el(id) { return this.shadowRoot.getElementById(id); }
  _create() {
    if (this._el('card')) return;
    this.shadowRoot.innerHTML = `<style>
:host{display:block;--ato-a:#23b7a0;--ato-ink:var(--primary-text-color,#163d44);--ato-muted:var(--secondary-text-color,#668187)}*{box-sizing:border-box}ha-card{display:block;overflow:hidden;border-radius:22px;color:var(--ato-ink);background:var(--ha-card-background,var(--card-background-color,#fff));padding:22px;position:relative}.head{display:flex;gap:12px;align-items:center}.mark{width:44px;height:44px;color:var(--ato-a);flex-shrink:0}.mark svg{width:100%;height:100%}.brand{font-size:10px;letter-spacing:2px;font-weight:800;color:var(--ato-muted)}h2{font-size:20px;line-height:1.3;margin:3px 0;font-weight:650}.pill{margin-left:auto;border-radius:999px;font-size:11px;letter-spacing:.4px;padding:7px 10px;background:color-mix(in srgb,var(--ato-a) 13%,transparent);color:var(--ato-ink);white-space:nowrap}.pill.bad{background:#b530301b;color:var(--error-color,#c64747)}.main{display:flex;align-items:center;gap:24px;margin:26px 0 22px}.tank{position:relative;width:110px;height:145px;flex-shrink:0;border:2px solid color-mix(in srgb,var(--ato-a) 27%,transparent);border-radius:14px 14px 25px 25px;background:color-mix(in srgb,var(--ato-a) 4%,transparent);overflow:hidden}.water{position:absolute;bottom:0;width:100%;height:calc(var(--fill,0)*1%);min-height:0;background:linear-gradient(165deg,#33cbb7aa,#139b91cc);transition:height 1s ease}.surface{height:5px;background:#ffffff4a}.fish{position:absolute;top:44%;left:21%;width:58px;height:30px;opacity:.9}.bubble{position:absolute;width:6px;height:6px;border:1.5px solid #fff9;border-radius:50%;right:22%;top:24%}.bubble.b2{width:4px;height:4px;right:32%;top:15%}.tank.unknown .water{height:0}.tank.unknown::after{content:'?';position:absolute;inset:0;display:grid;place-items:center;font-size:40px;color:var(--ato-muted)}.big{font-size:54px;font-weight:650;letter-spacing:-3px;line-height:1.05;font-variant-numeric:tabular-nums}.big small{font-size:23px;letter-spacing:0;font-weight:400;padding-left:4px;color:var(--ato-muted)}.sub{font-size:13px;color:var(--ato-muted);margin-top:9px}.available{font-size:14px;margin-top:5px}.metrics{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}.metric{background:color-mix(in srgb,var(--ato-a) 5%,transparent);border:1px solid color-mix(in srgb,var(--ato-a) 9%,transparent);border-radius:13px;padding:12px 14px;min-width:0}.metric-label{font-size:11px;color:var(--ato-muted);margin-bottom:5px}.metric-value{font-size:17px;font-weight:600;font-variant-numeric:tabular-nums}.dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--ato-muted);margin-right:6px;vertical-align:middle}.dot.on{background:var(--ato-a);box-shadow:0 0 0 4px #23b7a014}.controls{display:grid;grid-template-columns:1fr 1fr;gap:10px}button{font:inherit;cursor:pointer;border:0;border-radius:11px;padding:12px 10px;min-height:44px;color:var(--ato-ink);background:color-mix(in srgb,var(--ato-a) 10%,transparent);transition:opacity .15s,background .15s}button:focus-visible,summary:focus-visible,input:focus-visible{outline:2px solid var(--ato-a);outline-offset:3px}button.primary{background:#158a7d;color:white}button.stop{border:1px solid #c2545438;background:#c254540c;color:var(--ato-ink)}button.active{box-shadow:inset 0 0 0 2px var(--ato-a)}button:disabled{cursor:default;opacity:.4}.note{font-size:11px;line-height:1.5;color:var(--ato-muted);margin:12px 0 0}.notice{font-size:12px;line-height:1.5;padding:10px 12px;background:color-mix(in srgb,var(--ato-a) 8%,transparent);border-radius:10px;margin:0 0 13px}.notice.error{background:#c2545415;color:var(--error-color,#c64747)}.notice:empty{display:none}.footer{margin-top:14px;padding-top:13px;border-top:1px solid var(--divider-color,#ddd);display:flex;justify-content:space-between;align-items:center;gap:8px}.links{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:12px}.links a{color:var(--ato-a);font-size:12px;text-decoration:none;overflow-wrap:anywhere}.links button{font-size:12px;padding:8px 10px;min-height:36px}.last-fill{padding:12px 14px;border:1px solid var(--divider-color,#ddd);border-radius:13px;margin-bottom:14px}.last-fill .metric-value{font-size:14px;line-height:1.5}.footer button{padding:7px 10px;min-height:36px;font-size:12px;background:transparent}.float{font-size:11px;color:var(--ato-muted)}.overlay{position:absolute;inset:0;background:var(--ha-card-background,var(--card-background-color,#fff));padding:24px;z-index:3;display:flex;flex-direction:column;justify-content:center}.overlay[hidden]{display:none}h3{font-size:20px;margin:0 0 8px}.overlay p{color:var(--ato-muted);font-size:13px;line-height:1.6;margin:0 0 18px}label{font-size:12px;color:var(--ato-muted)}input{width:100%;margin-top:8px;border:1px solid var(--divider-color,#ccc);border-radius:10px;padding:13px;font:inherit;color:var(--ato-ink);background:transparent}.modal-actions{display:grid;gap:8px;margin-top:16px}.overlay .notice{margin-top:12px}.empty{padding:18px 0;font-size:13px;line-height:1.6;color:var(--ato-muted)}[hidden]{display:none!important}@media(max-width:330px){ha-card{padding:16px}.main{gap:16px}.tank{width:88px;height:130px}.big{font-size:46px}.metric{padding:10px}}@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style><ha-card id="card"><div class="head"><div class="mark">${ICON}</div><div><div class="brand">AQUIVO · ATO</div><h2 id="title">Akvárium</h2></div><span id="status" class="pill">Načítavam</span></div>
<div id="empty" class="empty" hidden></div><div id="body"><div class="main"><div id="tank" class="tank"><div id="water" class="water"><div class="surface"></div><svg class="fish" viewBox="0 0 60 30" aria-hidden="true"><path d="m15 15-11-8v16Zm0 0c12-15 28-15 39 0-11 15-27 15-39 0" fill="#fff"/><circle cx="43" cy="13" r="2" fill="#167e79"/></svg><i class="bubble"></i><i class="bubble b2"></i></div></div><div><div class="big"><span id="percent">—</span><small>%</small></div><div class="sub">zostáva v zásobníku</div><div class="available"><span id="litres">—</span> l <span id="capacity"></span></div></div></div>
<div class="metrics"><div class="metric"><div class="metric-label">Dopustené dnes</div><div class="metric-value"><span id="daily">—</span> l</div><div id="daily-note" class="metric-label"></div></div><div class="metric"><div class="metric-label">Pumpa</div><div class="metric-value"><i id="pump-dot" class="dot"></i><span id="pump">—</span></div></div></div><div class="last-fill"><div class="metric-label">Posledné dopúšťanie</div><div id="last-fill" class="metric-value">Čakám</div></div><div id="notice" class="notice" role="status"></div><div class="controls"><button id="auto" class="primary">Zapnúť AUTO</button><button id="service" class="stop">SERVICE / zastaviť</button></div><p class="note">Odhad podľa kalibrácie. Dopúšťanie riadi lokálny plavák.</p><div class="footer"><span id="float" class="float"></span><button id="refill-open">Doplniť zásobník ↗</button></div><div class="links"><a id="web" target="_blank" rel="noopener noreferrer" hidden></a><span id="web-missing" class="note">IP adresu webu nastav v úprave karty.</span><button id="reset-open">Reset počítadla</button></div><div class="note" style="text-align:right">Karta ${VERSION}</div><button id="clear" hidden>Potvrdiť alarm</button></div>
<div id="modal" class="overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden><h3 id="modal-title">Doplnil si vodu?</h3><p>Zadaj skutočný celkový zostatok po doplnení. Tento údaj nastav odhadom alebo podľa objemu nádoby.</p><label for="refill-value">Voda v zásobníku (ml)<input id="refill-value" type="number" min="0" step="1" inputmode="decimal"></label><div id="modal-error" class="notice error" role="status"></div><div class="modal-actions"><button id="refill-save" class="primary">Uložiť skutočný zostatok</button><button id="refill-full">Vyplniť plný objem</button><button id="refill-cancel">Späť</button></div></div><div id="reset-modal" class="overlay" role="dialog" aria-modal="true" aria-labelledby="reset-title" hidden><h3 id="reset-title">Reset počítadla limitu?</h3><p>Vynuluje spotrebu ochranného 24-hodinového obdobia a otvorí nový rozpočet dopúšťania. Zostatok v bandaske, kalibrácia a celková spotreba zostanú zachované. AUTO sa samo nezapne.</p><div id="reset-error" class="notice error" role="status"></div><div class="modal-actions"><button id="reset-confirm" class="primary">Vynulovať počítadlo limitu</button><button id="reset-cancel">Späť</button></div></div></ha-card>`;
    this._el('reset-open').onclick=()=>this._openReset();
    this._el('reset-cancel').onclick=()=>this._closeReset();
    this._el('reset-confirm').onclick=()=>this._resetCounter();
    this._el('reset-modal').onkeydown=event=>{if(event.key==='Escape'){event.stopPropagation();this._closeReset();}if(event.key==='Tab'){const targets=[...this._el('reset-modal').querySelectorAll('button')].filter(e=>!e.disabled);const i=targets.indexOf(this.shadowRoot.activeElement);if(event.shiftKey&&i===0){event.preventDefault();targets.at(-1).focus();}else if(!event.shiftKey&&i===targets.length-1){event.preventDefault();targets[0].focus();}}};
    this._el('auto').onclick = () => this._mode(true);
    this._el('service').onclick = () => this._mode(false);
    this._el('clear').onclick = () => this._send('clear', 'switch', 'turn_on', {entity_id:this._map.clear});
    this._el('refill-open').onclick = () => this._openRefill();
    this._el('refill-cancel').onclick = () => this._closeRefill();
    this._el('refill-save').onclick = () => this._refill();
    this._el('refill-full').onclick = () => { const n=this._number('capacity'); if(n!==null) this._el('refill-value').value=n; };
    this._el('modal').onkeydown = event => {
      if(event.key==='Escape') { event.stopPropagation(); this._closeRefill(); }
      if(event.key==='Tab') { const targets=[...this._el('modal').querySelectorAll('input,button')].filter(e=>!e.disabled); const i=targets.indexOf(this.shadowRoot.activeElement); if(event.shiftKey && i===0){event.preventDefault();targets.at(-1).focus();} else if(!event.shiftKey && i===targets.length-1){event.preventDefault();targets[0].focus();} }
    };
  }
  _render() {
    if(!this._config || !this._hass || !this._el('card')) return;
    const signature=JSON.stringify([this._config,this._deviceId,this._registryError,this._message,this._command,this._todayKey,this._todayAnchor,this._todayRetryAt,this._settledCounter,this._lastFill,this._lastFillError,this._lastFillPending,Object.entries(this._map).map(([k,id])=>[k,id,this._hass.states[id]?.state])]);
    if(signature===this._lastDraw) return; this._lastDraw=signature;
    this._el('title').textContent=this._config.name || this._device?.name_by_user || 'Akvárium';
    const empty=this._registryError || (!this._registry?'Načítavam dopúšťač…':!this._device?'V nastavení karty vyber dopúšťač Aquivo.':!this._map.mode?'Entity dopúšťača sa ešte nenačítali. Skontroluj Zigbee2MQTT.':'');
    this._el('empty').textContent=empty;this._el('empty').hidden=!empty;this._el('body').hidden=!!empty;
    const online=validState(this._state('mode')); const automatic=this._isOn('mode');const fault=this._isOn('fault');const pumping=this._isOn('pump');
    const percent=this._number('percent'),remaining=this._number('remaining'),capacity=this._number('capacity');
    this._el('status').textContent=empty?'Nastavenie':!online?'Offline':fault?'Alarm':automatic?'AUTO':'SERVICE';this._el('status').classList.toggle('bad',!empty&&(!online||fault));
    this._el('percent').textContent=online&&percent!==null?this._fmt(percent):'—';this._el('litres').textContent=online?this._litres(remaining):'—';this._el('capacity').textContent=capacity!==null?' / '+this._litres(capacity)+' l':'';
    this._el('tank').classList.toggle('unknown',!online||percent===null);this._el('water').style.setProperty('--fill',online&&percent!==null?Math.min(100,Math.max(0,percent)):0);
    this._el('daily-note').hidden=!this._lastFillError&&!this._settledCounter?.pending;
    this._el('daily-note').textContent=this._lastFillError?'História nedostupná':this._settledCounter?.pending?'Čakám':'';
    this._el('daily').textContent=online?this._litres(this._todayVolume()):'—';this._el('daily').title=this._todayAnchor?'Od polnoci podľa časového pásma Home Assistanta':this._todayPending?'Načítavam dnešnú spotrebu':'Dnešný údaj nie je dostupný v histórii';this._el('pump').textContent=!online||!validState(this._state('pump'))?'Neznámy':pumping?'Dopúšťa':'Vypnutá';this._el('pump-dot').classList.toggle('on',online&&pumping);
    const expected=this._command?.expected;
    if(expected && this._command?.sent && this._state(expected.field)?.state===expected.state){clearTimeout(this._commandTimer);this._command=null;this._message='';}
    const busy=!!this._command;
    const code=this._number('faultCode'),daily=this._number('daily'),limit=this._number('dailyLimit');
    const alarms={1:'Pôvodný časový alarm. Potvrď alarm.',2:'Zásobník je podľa odhadu prázdny.',3:'Dosiahnutý limit dopúšťania. Skontroluj hladinu a počítadlo.',4:'Chyba ukladania nastavení. Výstup je zablokovaný.',5:'Dosiahnutý limit jedného dopúšťania. Skontroluj hladinu a plavák.',6:'Čerpanie sa bezpečnostne zastavilo. Skontroluj hladinu a potvrď alarm.'};
    const reason=!online?'Zariadenie je nedostupné. SERVICE sa môžeš pokúsiť odoslať.':fault?(alarms[code]||'Dopúšťanie blokuje alarm. Podrobnosti skontroluj na zariadení.'):this._state('ready')?.state==='off'?(this._number('flow')===0?'Najprv ulož kalibráciu pumpy.':this._number('calibration')>0?'Ulož alebo zruš neukončenú kalibráciu.':remaining!==null&&remaining<=0?'Zásobník je podľa odhadu prázdny.':daily!==null&&limit!==null&&daily>=limit?'Dosiahnutý limit dopúšťania. Skontroluj hladinu a počítadlo.':'AUTO zatiaľ nie je pripravené. Podrobnosti sú na webe ATO.'):'';
    const web=this._webUrl();
    this._el('web').hidden=!web;this._el('web-missing').hidden=!!web;
    this._el('web').href=web;this._el('web').textContent=web?'Web ATO ↗ '+new URL(web).host:'';
    const fill=this._lastFill;
    this._el('last-fill').textContent=fill?new Intl.DateTimeFormat(this._hass.config?.time_zone?'sk-SK':undefined,{timeZone:this._hass.config?.time_zone,day:'numeric',month:'numeric',hour:'2-digit',minute:'2-digit'}).format(fill.end)+(fill.pending?' · Čakám':fill.ml===null?' · objem neznámy':' · približne '+this._fmt(fill.ml)+' ml'):this._lastFillError?'História nie je dostupná':this._lastFillPending?'Čakám':'Bez dokončeného dopúšťania v posledných 7 dňoch';
    this._el('last-fill').title='Čas ukončenia podľa histórie HASS. Objem je odhad podľa kalibrácie, nie meranie prietoku.';
    this._el('reset-open').disabled=!online||automatic||pumping||this._isOn('calibrating')||busy||!this._map.reset;
    this._el('reset-open').title=!this._map.reset?'Vyžaduje obnovenie údajov Zigbee zariadenia.':automatic||pumping?'Najprv zvoľ SERVICE.':'Vynuluje iba počítadlo ochranného limitu.';
    this._el('reset-confirm').disabled=!online||automatic||pumping||this._isOn('calibrating')||busy||!this._map.reset;
    this._el('notice').textContent=this._message||reason;this._el('notice').classList.toggle('error',!!reason);
    this._el('auto').disabled=!online||fault||this._state('ready')?.state!=='on'||busy||automatic;
    // STOP stays available even when another command is pending or availability is stale.
    this._el('service').disabled=!this._map.mode;this._el('auto').textContent=automatic?'AUTO je zapnuté':'Zapnúť AUTO';
    this._el('float').textContent=!online||!validState(this._state('low'))?'Stav plaváka neznámy':this._isOn('low')?'Plavák žiada vodu':'Hladina je v poriadku';
    this._el('refill-open').disabled=!online||automatic||pumping||busy||!this._map.refill;
    this._el('refill-open').title=automatic?'Najprv zvoľ SERVICE':'';
    this._el('clear').hidden=!fault||!this._map.clear;this._el('clear').disabled=!online||automatic||busy;
    this._el('refill-save').disabled=busy||!online||automatic||pumping;this._el('refill-full').disabled=capacity===null;
  }
  _openReset() {
    if(!validState(this._state('mode'))||this._isOn('mode')||this._isOn('pump')||this._isOn('calibrating')||this._command||!this._map.reset)return;
    this._el('reset-error').textContent='';this._el('reset-modal').hidden=false;this._el('reset-cancel').focus();
  }
  _closeReset() {this._el('reset-modal').hidden=true;this._el('reset-open').focus();}
  async _resetCounter() {
    if(this._el('reset-modal').hidden||!validState(this._state('mode'))||this._isOn('mode')||this._isOn('pump')||this._isOn('calibrating')||!this._map.reset){this._el('reset-error').textContent='Reset vyžaduje SERVICE a vypnutú pumpu.';return;}
    if(await this._send('reset','switch','turn_on',{entity_id:this._map.reset},{field:'daily',state:'0'}))this._closeReset();
    else this._el('reset-error').textContent=this._message;
  }
  async _mode(on) {
    if(!this._map.mode) return;
    if(on && (!validState(this._state('mode'))||this._state('ready')?.state!=='on'||this._isOn('fault'))) return;
    await this._send('mode','switch',on?'turn_on':'turn_off',{entity_id:this._map.mode},{field:'mode',state:on?'on':'off'});
  }
  async _send(kind,domain,service,data,expected) {
    if(!this._hass || !data.entity_id) return false;
    if(this._command && !(kind==='mode'&&service==='turn_off')) return false;
    const token={kind,expected}; clearTimeout(this._commandTimer);this._command=token;this._message='Odosielam príkaz…';this._lastDraw='';this._render();
    try {
      // A frontend timeout limits the wait; it does not claim to cancel a command already sent.
      let timer;await Promise.race([this._hass.callService(domain,service,data),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Odpoveď neprišla. Stav over na zariadení.')),10000);})]).finally(()=>clearTimeout(timer));
      if(this._command!==token) return false;
      token.sent=true;
      if(!expected || this._state(expected.field)?.state===expected.state){this._command=null;this._message=expected?'':'Príkaz bol odoslaný.';}
      else {this._message='Čakám na potvrdenie stavu…';this._commandTimer=setTimeout(()=>{if(this._command===token){this._command=null;this._message='Stav sa nepotvrdil. Skontroluj spojenie so zariadením.';this._render();}},10000);}
      this._lastDraw='';this._render();return true;
    } catch(error) {if(this._command===token){this._command=null;this._message=error.message||'Príkaz sa nepodaril.';this._lastDraw='';this._render();}return false;}
  }
  _openRefill() {
    if(this._isOn('mode')||this._isOn('pump')||!validState(this._state('mode'))||!this._map.refill) return;
    this._el('refill-value').value='';const max=this._number('capacity');if(max!==null)this._el('refill-value').max=max;else this._el('refill-value').removeAttribute('max');
    this._el('modal-error').textContent='';this._el('modal').hidden=false;this._el('refill-value').focus();
  }
  _closeRefill() {this._el('modal').hidden=true;this._el('refill-open').focus();}
  async _refill() {
    const input=this._el('refill-value'),value=Number(input.value),max=this._number('capacity');
    if(input.value.trim()===''||!Number.isFinite(value)||value<0||(max!==null&&value>max)||this._isOn('mode')||this._isOn('pump')||!validState(this._state('mode'))){this._el('modal-error').textContent='Zadaj platný zostatok a ponechaj SERVICE s vypnutou pumpou.';return;}
    if(await this._send('refill','number','set_value',{entity_id:this._map.refill,value})){this._closeRefill();}
    else this._el('modal-error').textContent=this._message;
  }
}
class Net4uAtoCardEditor extends HTMLElement {
  constructor(){super();this.attachShadow({mode:'open'});this._registry=null;}
  setConfig(config){this._config={...config};this._render();}
  set hass(hass){this._hass=hass;if(!this._loading&&!this._registry){this._loading=true;getRegistry(hass).then(r=>{this._registry=r;this._render();}).catch(()=>{this._error='Nepodarilo sa načítať zariadenia.';this._render();}).finally(()=>this._loading=false);}}
  _changed(key,value){this._config={...this._config,[key]:value};this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:this._config},bubbles:true,composed:true}));}
  _render(){
    if(!this._config)return;
    const devices=this._registry?devicesFor(this._registry):[];
    this.shadowRoot.innerHTML=`<style>:host{display:block;padding:8px}label{display:block;margin:0 0 16px;font-size:13px}input,select{display:block;width:100%;margin-top:8px;padding:12px;box-sizing:border-box;border:1px solid var(--divider-color,#ccc);border-radius:8px;color:var(--primary-text-color);background:var(--card-background-color);font:inherit}p{font-size:12px;color:var(--secondary-text-color);line-height:1.6}</style><label>Názov karty<input id="name" value="${escape(this._config.name||'Akvárium')}"></label><label>Dopúšťač<select id="device"><option value="">Automaticky (ak je iba jeden)</option>${devices.map(d=>`<option value="${escape(d.id)}" ${d.id===this._config.device_id?'selected':''}>${escape(d.name_by_user||d.name||'Aquivo ATO')}</option>`).join('')}</select></label><label>Náhradná adresa webu ATO<input id="web-url" placeholder="Automaticky zo zariadenia" value="${escape(this._config.web_url||'')}"></label><p>${escape(this._error||(!this._registry?'Načítavam zariadenia…':!devices.length?'Dopúšťač Aquivo ATO sa ešte nenašiel. Najprv ho pridaj cez Zigbee2MQTT.':'Karta sama nájde entity vybraného dopúšťača. Kalibrácia a ochrany ostávajú vo firmvéri.'))}</p>`;
    this.shadowRoot.getElementById('name').onchange=e=>this._changed('name',e.target.value);
    this.shadowRoot.getElementById('web-url').onchange=e=>{const raw=e.target.value.trim(),url=webAddress(raw);if(raw&&!url){e.target.setCustomValidity('Zadaj platnú HTTP alebo HTTPS adresu.');e.target.reportValidity();return;}e.target.setCustomValidity('');this._changed('web_url',url);};
    this.shadowRoot.getElementById('device').onchange=e=>this._changed('device_id',e.target.value);
  }
}
if(!customElements.get('net4u-ato-card'))customElements.define('net4u-ato-card',Net4uAtoCard);
if(!customElements.get('net4u-ato-card-editor'))customElements.define('net4u-ato-card-editor',Net4uAtoCardEditor);
window.customCards=window.customCards||[];
if(!window.customCards.some(c=>c.type==='net4u-ato-card'))window.customCards.push({type:'net4u-ato-card',name:'Aquivo · Akváriový dopúšťač',description:'Zostatok vody, dopúšťanie a bezpečné ovládanie AUTO / SERVICE.',preview:true});
console.info(`%c AQUIVO ATO CARD %c ${VERSION} `,'background:#158a7d;color:white;padding:4px','background:#153d44;color:white;padding:4px');
