const KEY='ciclo-estudos-v1';
const defaults={daily:240,cap:120,days:6,perday:'auto',subjects:[
 {name:'Constitucional',status:'Consolidação',weight:1},{name:'Administrativo',status:'Construção',weight:1},{name:'Português',status:'Construção',weight:1},{name:'Contabilidade',status:'Construção',weight:1},
 ...Array.from({length:11},(_,i)=>({name:`Matéria ${i+5}`,status:'Aguardando',weight:1}))]};
let state;try{state=JSON.parse(localStorage.getItem(KEY))||structuredClone(defaults)}catch{state=structuredClone(defaults)}
// Keep existing subject names and phases; migrate only the old time controls.
if(typeof state.daily==='string'){state.daily=240;state.perday='auto'}
if(!state.cap)state.cap=120;
if(!state.perday)state.perday='auto';
const $=id=>document.getElementById(id), phases=['Aguardando','Construção','Consolidação','Manutenção'], days=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const min=s=>{let [h,m]=String(s).split(':').map(Number);return (h||0)*60+(m||0)};
const hm=n=>{n=Math.round(n);return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){localStorage.setItem(KEY,JSON.stringify(state));renderSchedule()}
function renderSubjects(){
 $('subjects').innerHTML=state.subjects.map((s,i)=>`<div class="subject"><input aria-label="Nome da matéria ${i+1}" data-i="${i}" data-field="name" value="${esc(s.name)}"><select aria-label="Fase de ${esc(s.name)}" data-i="${i}" data-field="status">${phases.map(p=>`<option ${s.status===p?'selected':''}>${p}</option>`).join('')}</select><input aria-label="Peso de ${esc(s.name)}" data-i="${i}" data-field="weight" type="number" min="0.1" max="5" step="0.1" value="${s.weight}"><button class="del" aria-label="Remover ${esc(s.name)}" data-remove="${i}">×</button></div>`).join('');
}
const phaseWeight={Construção:1,Consolidação:.5,Manutenção:.25};
function combinations(indices,count){
 let out=[];function go(start,chosen){if(chosen.length===count){out.push(chosen);return}for(let k=start;k<=indices.length-(count-chosen.length);k++)go(k+1,[...chosen,indices[k]])}go(0,[]);return out;
}
function allocate(ids,active,work,cap){
 const weights=ids.map(i=>phaseWeight[active[i].status]),amount=ids.map(()=>0);
 let remaining=Math.min(work,ids.length*cap),pool=ids.map((_,i)=>i);
 while(pool.length&&remaining>0){
  let sum=pool.reduce((n,i)=>n+weights[i],0),capped=pool.filter(i=>remaining*weights[i]/sum>=cap-amount[i]);
  if(!capped.length){for(const i of pool)amount[i]+=remaining*weights[i]/sum;break}
  for(const i of capped){let add=cap-amount[i];amount[i]+=add;remaining-=add}
  pool=pool.filter(i=>!capped.includes(i));
 }
 let result=amount.map(Math.floor),extra=Math.round(Math.min(work,ids.length*cap))-result.reduce((a,b)=>a+b,0);
 let order=amount.map((v,i)=>i).sort((a,b)=>(amount[b]-Math.floor(amount[b]))-(amount[a]-Math.floor(amount[a]))||a-b);
 for(const i of order){if(extra<=0)break;if(result[i]<cap){result[i]++;extra--}}
 return result;
}
function makeWeek(active,nd,slots,work,cap){
 if(!active.length||work<=0||!slots)return {plan:[],totals:[]};
 const weighted=active.map(s=>phaseWeight[s.status]*s.weight),totalWeight=weighted.reduce((a,b)=>a+b,0);
 const target=weighted.map(x=>nd*work*x/totalWeight),all=active.map((_,i)=>i);
 let beam=[{alloc:active.map(()=>0),seen:active.map(()=>0),last:active.map(()=>-99),plan:[],cost:0}];
 for(let d=0;d<nd;d++){
  let next=[];
  for(const st of beam){
   // For many active matters, shortlisting keeps the planner responsive.
   let pool=all.length>11?all.slice().sort((a,b)=>(target[b]-st.alloc[b])-(target[a]-st.alloc[a])).slice(0,Math.max(8,slots+4)):all;
   for(const ids of combinations(pool,slots)){
    let minutes=allocate(ids,active,work,cap);
    let alloc=st.alloc.slice(),seen=st.seen.slice(),last=st.last.slice();
    ids.forEach((i,j)=>{alloc[i]+=minutes[j];seen[i]++;last[i]=d});
    let progress=active.reduce((a,_,i)=>a+(alloc[i]-target[i]*(d+1)/nd)**2/Math.max(90,target[i]),0);
    const construction=active.map((s,i)=>s.status==='Construção'&&s.weight===1?alloc[i]:null).filter(x=>x!==null);
    const mean=construction.reduce((a,b)=>a+b,0)/Math.max(1,construction.length);
    const spread=construction.length>1?construction.reduce((a,v)=>a+(v-mean)**2,0)/Math.max(90,nd*work/construction.length):0;
    let unseen=seen.filter(x=>!x).length,remaining=(nd-d-1)*slots;
    let impossible=unseen>remaining&&active.length<=nd*slots?10000:0;
    let repeat=ids.reduce((a,i)=>a+(st.last[i]===d-1?.08:0),0);
    let mixed=ids.some(i=>active[i].status==='Construção')&&ids.some(i=>active[i].status!=='Construção');
    // A mixed day is useful, but weekly targets decide when two construction subjects should share a day.
    let cost=progress+spread*.35+impossible+repeat-(mixed?.03:0)+unseen*.01;
    next.push({alloc,seen,last,plan:[...st.plan,ids.map((i,j)=>({i,minutes:minutes[j]}))],cost});
   }
  }
  next.sort((a,b)=>a.cost-b.cost);
  beam=next.slice(0,90);
 }
 // Refine the full week after daily choices; this prevents an early day's locally good
 // choice from leaving construction subjects with unequal weekly hours.
 const evaluate=idsPlan=>{
  let alloc=active.map(()=>0),seen=active.map(()=>0),plan=[];
  idsPlan.forEach(ids=>{
   let amounts=allocate(ids,active,work,cap);
   plan.push(ids.map((i,j)=>{let minutes=amounts[j];alloc[i]+=minutes;seen[i]++;return {i,minutes}}));
  });
  const construction=active.map((s,i)=>s.status==='Construção'&&s.weight===1?alloc[i]:null).filter(x=>x!==null);
  let mean=construction.reduce((a,b)=>a+b,0)/Math.max(1,construction.length);
  let spread=construction.length>1?construction.reduce((a,v)=>a+(v-mean)**2,0)/Math.max(90,nd*work/construction.length):0;
  let deviation=alloc.reduce((a,v,i)=>a+(v-target[i])**2/Math.max(90,target[i]),0);
  let missing=active.length<=nd*slots?seen.filter(x=>!x).length*10000:0;
  let pairCounts={},repeated=0;
  idsPlan.forEach(ids=>{let key=ids.slice().sort((a,b)=>a-b).join(',');pairCounts[key]=(pairCounts[key]||0)+1;if(pairCounts[key]>1)repeated++});
  return {score:deviation+spread*.8+missing+repeated*.7,plan,totals:alloc};
 };
 let idsPlan=beam[0].plan.map(day=>day.map(x=>x.i)),result=evaluate(idsPlan);
 for(let pass=0;pass<35;pass++){
  let best=result,bestPlan=null;
  for(let d=0;d<nd;d++)for(let k=0;k<slots;k++)for(let i=0;i<active.length;i++){
   if(idsPlan[d].includes(i))continue;
   let copy=idsPlan.map(x=>x.slice());copy[d][k]=i;let v=evaluate(copy);
   if(v.score<best.score-1e-7){best=v;bestPlan=copy}
  }
  for(let d=0;d<nd;d++)for(let e=d+1;e<nd;e++)for(let k=0;k<slots;k++)for(let q=0;q<slots;q++){
   let a=idsPlan[d][k],b=idsPlan[e][q];
   if(a===b||idsPlan[d].includes(b)||idsPlan[e].includes(a))continue;
   let copy=idsPlan.map(x=>x.slice());copy[d][k]=b;copy[e][q]=a;let v=evaluate(copy);
   if(v.score<best.score-1e-7){best=v;bestPlan=copy}
  }
  if(!bestPlan)break;idsPlan=bestPlan;result=best;
 }
 let plan=result.plan.map(day=>day.map(x=>({...x}))),totals=result.totals.slice();
 const score=()=>{
  const c=active.map((s,i)=>s.status==='Construção'&&s.weight===1?totals[i]:null).filter(x=>x!==null);
  let mean=c.reduce((a,b)=>a+b,0)/Math.max(1,c.length);
  let spread=c.length>1?c.reduce((a,v)=>a+(v-mean)**2,0)/Math.max(90,nd*work/c.length):0;
  return totals.reduce((a,v,i)=>a+(v-target[i])**2/Math.max(90,target[i]),0)+spread*5;
 };
 // Adjustment happens only across different phases. Subjects sharing a phase
 // on the same day keep equal blocks; weekly balance comes from frequency.
 for(let pass=0;pass<100;pass++){
  let best=score(),change=null;
  for(let d=0;d<plan.length;d++)for(let a=0;a<plan[d].length;a++)for(let b=0;b<plan[d].length;b++){
   if(a===b||new Set(plan[d].map(x=>active[x.i].status)).size!==plan[d].length)continue;
   let from=plan[d][a],to=plan[d][b],transfer=5;
   if(active[from.i].status===active[to.i].status)continue;
   if(from.minutes-transfer<30||to.minutes+transfer>cap)continue;
   let first=active[from.i],second=active[to.i];
   if(first.status==='Construção'&&second.status!=='Construção'){
    let minShare=second.status==='Manutenção'?.75:.6;
    if((from.minutes-transfer)/work<minShare)continue;
   }
   if(first.status!=='Construção'&&second.status==='Construção'){
    let maxShare=first.status==='Manutenção'?.25:.4;
    if((from.minutes-transfer)/work>maxShare)continue;
   }
   totals[from.i]-=transfer;totals[to.i]+=transfer;let v=score();totals[from.i]+=transfer;totals[to.i]-=transfer;
   if(v<best-1e-7){best=v;change={from,to}}
  }
  if(!change)break;
  change.from.minutes-=5;change.to.minutes+=5;totals[change.from.i]-=5;totals[change.to.i]+=5;
 }
 return {plan,totals,target};
}
function renderSchedule(){
 const daily=+state.daily,cap=+state.cap,nd=+state.days;
 const active=state.subjects.map((s,i)=>({...s,i})).filter(s=>s.name.trim()&&phaseWeight[s.status]&&s.weight>0);
 const required=Math.ceil(daily/cap),minimum=Math.max(required,Math.ceil(active.length/nd),1);
 const manual=state.perday==='auto'?0:+state.perday;
 let slots=Math.min(4,Math.max(minimum,manual));slots=Math.min(slots,active.length);
 let week=makeWeek(active,nd,slots,daily,cap);
 const spread=w=>{let b=active.map((s,i)=>s.status==='Construção'&&s.weight===1?w.totals[i]:null).filter(x=>x!==null);return b.length>1?Math.max(...b)-Math.min(...b):0};
 if(!manual&&active.length>slots){
  for(let count=slots+1;count<=Math.min(4,active.length);count++){
   if(spread(week)<=Math.max(60,daily*.15))break;
   let option=makeWeek(active,nd,count,daily,cap);
   if(spread(option)+30<spread(week)){week=option;slots=count}
  }
 }
 const alerts=[];
 if(required>4)alerts.push(`O limite de 4 matérias por dia permite no máximo ${hm(4*cap)}. Reduza as horas diárias ou aumente o máximo por matéria.`);
 if(manual&&manual<required)alerts.push(`Para cumprir ${hm(daily)} por dia sem passar de ${hm(cap)} por matéria, são necessárias pelo menos ${required} matérias no dia.`);
 if(active.length<required)alerts.push(`Com ${active.length} matéria(s) ativa(s), cabem no máximo ${hm(active.length*cap)} por dia. Ative mais matérias ou ajuste o limite.`);
 if(active.length===required&&active.length>1&&new Set(active.map(s=>s.status)).size>1)alerts.push('Com esta carga e este limite, todas as matérias ativas precisam preencher o máximo diário. Para dar menos tempo às fases avançadas, ative outra matéria ou ajuste um dos limites.');
 if(active.length>nd*4)alerts.push(`Há mais matérias ativas que os ${nd*4} blocos máximos da semana; algumas não caberão.`);
 if(!manual&&slots>minimum)alerts.push(`O modo automático usou ${slots} matérias por dia para aproximar as horas semanais das matérias em Construção.`);
 $('schedule').innerHTML=week.plan.map((blocks,d)=>`<div class="day"><h3>${days[d]}</h3>${blocks.map(({i,minutes})=>`<div class="slot"><div><b>${esc(active[i].name)}</b><small>${esc(active[i].status)}</small></div><time>${hm(minutes)}</time></div>`).join('')}</div>`).join('')||'<p>Ative ao menos uma matéria para gerar a semana.</p>';
 $('allocation').innerHTML=week.totals.length?`<h3>Horas por matéria na semana</h3>${active.map((s,i)=>`<div class="allocation-row"><span>${esc(s.name)} <small>· ${esc(s.status)}</small></span><b>${hm(week.totals[i])}</b></div>`).join('')}`:'';
 $('alerts').innerHTML=alerts.map(x=>`<div class="alert">${esc(x)}</div>`).join('');
 $('total').textContent=hm(week.totals.reduce((a,b)=>a+b,0));$('active').textContent=active.length;$('study').textContent=hm(daily);
}
for(let id of ['daily','cap','days','perday']){$(id).value=state[id];$(id).addEventListener(id==='daily'||id==='cap'?'input':'change',e=>{state[id]=id==='perday'?e.target.value:+e.target.value;updateSliderLabels();save()})}
function updateSliderLabels(){$('dailyValue').textContent=hm(state.daily);$('capValue').textContent=hm(state.cap)}
$('reset').onclick=()=>{state.daily=defaults.daily;state.cap=defaults.cap;state.days=defaults.days;state.perday=defaults.perday;for(let id of ['daily','cap','days','perday'])$(id).value=state[id];updateSliderLabels();save()};
$('subjects').addEventListener('change',e=>{let i=e.target.dataset.i,f=e.target.dataset.field;if(i===undefined||!f)return;state.subjects[+i][f]=f==='weight'?Math.max(.1,Number(e.target.value)||1):e.target.value;save()});
$('subjects').addEventListener('input',e=>{let i=e.target.dataset.i;if(i!==undefined&&e.target.dataset.field==='name'){state.subjects[+i].name=e.target.value;save()}});
$('subjects').addEventListener('click',e=>{let i=e.target.dataset.remove;if(i===undefined)return;state.subjects.splice(+i,1);renderSubjects();save()});
$('add').onclick=()=>{state.subjects.push({name:'Nova matéria',status:'Aguardando',weight:1});renderSubjects();save()};
updateSliderLabels();renderSubjects();renderSchedule();
