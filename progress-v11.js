(function(){
'use strict';
const A=window.StudyApp,C=window.StudyCore,$=id=>document.getElementById(id);
const today=()=>C.dateKey(new Date()),week=()=>C.bucketKey(today(),'weekly'),at=old=>A.timeStamp(old),key=(date,subject)=>date+'|'+subject;
let busy=false,editing=null,notePage=0,lastDay=today();
const icons={done:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4 10-10"/></svg>',clock:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></svg>',note:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h10l4 4v14H5zM9 10h6M9 14h6M9 18h4"/></svg>'};
function datePlus(date,n){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+n);return C.dateKey(d)}
function capture(){
 const d=A.snapshot(),base=week(),date=today();let changed=false;
 for(let i=0;i<6;i++){
  const day=datePlus(base,i),blocks=window.currentWeekPlan?.[i]||[],old=d.planDays.find(p=>p.date===day);
  // Past days are a snapshot. Only today and future days follow the recalculated plan.
  if(old&&day<date)continue;
  if(!old||JSON.stringify(old.blocks)!==JSON.stringify(blocks)){
   const next={id:'plan:'+day,date:day,blocks:structuredClone(blocks),updatedAt:at(old?.updatedAt)};
   d.planDays=d.planDays.filter(p=>p.date!==day);d.planDays.push(next);changed=true;
  }
 }
 if(changed)A.commitProgress(d.planDays,d.reflections);
 return d;
}
function paint(){
 if(busy)return;busy=true;
 try{
  const d=capture(),base=week(),date=today(),days=d.planDays.filter(p=>C.bucketKey(p.date,'weekly')===base).sort((a,b)=>a.date.localeCompare(b.date)),done=C.plannedCompletion(days,d.sessions,date);
  $('schedule').innerHTML=days.filter(p=>p.blocks.length).map(p=>`<div class="day${p.date===date?' today':''}"><h3>${['Segunda','Terça','Quarta','Quinta','Sexta','Sábado'][Math.round((new Date(p.date+'T12:00:00')-new Date(base+'T12:00:00'))/86400000)]}${p.date===date?'<span class="today-label">Hoje</span>':''}</h3>${p.blocks.map(b=>{
   const k=key(p.date,b.subject),studied=done.get(k),reason=d.reflections.find(r=>!r.deleted&&r.id==='reason:'+k),label=studied?`Estudada em ${new Date(studied+'T12:00:00').toLocaleDateString('pt-BR')}; presença registrada, independente das horas`:p.date===date?'Abrir cronômetro de '+b.subject:reason?'Ver motivo registrado':'Registrar motivo do estudo não realizado';
   const marker=studied?`<span class="plan-symbol done" role="img" aria-label="${esc(label)}" title="${esc(label)}">${icons.done}</span>`:p.date===date?`<button type="button" class="plan-symbol clock" data-study="${esc(b.subject)}" aria-label="${esc(label)}" title="${esc(label)}">${icons.clock}</button>`:p.date<date?`<button type="button" class="plan-symbol note${reason?' recorded':''}" data-reason-date="${p.date}" data-reason-subject="${esc(b.subject)}" aria-label="${esc(label)}" title="${esc(label)}">${icons.note}</button>`:'';
   return `<div class="slot" style="--subject-color:${C.subjectColor(b.subject)}"><div><b>${esc(b.subject)}</b><small>${esc(b.status)}</small></div><div class="plan-time"><time>${hm(b.minutes)}</time>${marker}</div></div>`;
  }).join('')}</div>`).join('')||'<p>Ative uma matéria para gerar a semana.</p>';
  renderReflections();
 }finally{busy=false}
}
function resetForm(){editing=null;$('reflection-heading').textContent='Registrar motivo';$('reflection-date').value=today();$('reflection-subject').value='';$('reflection-reason').value='';$('reflection-action').value=''}
function openReason(date,subject){const r=A.snapshot().reflections.find(r=>r.id==='reason:'+key(date,subject)&&!r.deleted);editing=r?.id||null;$('reflection-date').value=date;$('reflection-subject').value=subject;$('reflection-reason').value=r?.reason||'';$('reflection-action').value=r?.action||'';$('reflection-heading').textContent=r?'Editar motivo registrado':'Registrar motivo';A.openView('reflection-view');$('reflection-form').scrollIntoView({behavior:'smooth',block:'start'})}
$('schedule').onclick=e=>{const button=e.target.closest('button');if(!button)return;if(button.dataset.study){A.openView('study-view');A.selectStudy(button.dataset.study);$('timer-clock').scrollIntoView({behavior:'smooth',block:'center'})}else if(button.dataset.reasonDate)openReason(button.dataset.reasonDate,button.dataset.reasonSubject)};
$('reflection-form').onsubmit=e=>{
 e.preventDefault();const date=$('reflection-date').value,subject=$('reflection-subject').value.trim(),reason=$('reflection-reason').value.trim(),action=$('reflection-action').value.trim();
 if(!C.validDate(date)||date>=today()||!subject||!reason){$('reflection-message').hidden=false;$('reflection-message').textContent='Escolha um dia já passado, a matéria e o motivo.';return}
 const d=A.snapshot(),id='reason:'+key(date,subject),prior=d.reflections.find(r=>r.id===id),old=d.reflections.find(r=>r.id===editing);
 if(old&&old.id!==id){old.deleted=true;old.updatedAt=at(old.updatedAt)}
 const row={id,date,subject,reason,action,createdAt:prior?.createdAt||at(),updatedAt:at(prior?.updatedAt),deleted:false};
 d.reflections=d.reflections.filter(r=>r.id!==id);d.reflections.push(row);A.commitProgress(d.planDays,d.reflections);resetForm();$('reflection-message').hidden=false;$('reflection-message').textContent='Nota salva. Use seu registro para ajustar a próxima tentativa.';paint();
};
$('reflection-cancel').onclick=resetForm;
function noteCard(r){return `<article class="reflection-row" style="--subject-color:${C.subjectColor(r.subject)}"><div class="section-title"><h3>${esc(r.subject)} <small>· ${new Date(r.date+'T12:00:00').toLocaleDateString('pt-BR')}</small></h3><div class="review-actions"><button type="button" data-reflection-edit="${esc(r.id)}">Editar</button><button type="button" data-reflection-delete="${esc(r.id)}">Excluir</button></div></div><p><b>O que aconteceu:</b> ${esc(r.reason)}</p>${r.action?`<p><b>Próximo ajuste:</b> ${esc(r.action)}</p>`:''}</article>`}
function renderReflections(){
 const records=A.snapshot().reflections.filter(r=>!r.deleted).sort((a,b)=>b.date.localeCompare(a.date)||C.stamp(b.createdAt)-C.stamp(a.createdAt)||a.id.localeCompare(b.id)),rest=records.slice(3);
 $('reflection-list').innerHTML=records.slice(0,3).map(noteCard).join('')||'<p class="hint">Nenhuma nota registrada.</p>';
 const subject=$('reflection-filter-subject').value.trim().toLocaleLowerCase('pt-BR'),month=$('reflection-filter-month').value,query=$('reflection-search').value.trim().toLocaleLowerCase('pt-BR');
 const filtered=rest.filter(r=>(!subject||r.subject.toLocaleLowerCase('pt-BR').includes(subject))&&($('reflection-all').checked||r.date.startsWith(month))&&(!query||(r.reason+' '+r.action).toLocaleLowerCase('pt-BR').includes(query)));
 $('reflection-details').hidden=!rest.length;$('reflection-rest-total').textContent=`(${rest.length})`;
 notePage=Math.max(0,Math.min(notePage,Math.ceil(filtered.length/10)-1));const start=notePage*10;
 $('reflection-rest-list').innerHTML=filtered.slice(start,start+10).map(noteCard).join('')||'<p class="hint">Nenhuma nota com estes filtros.</p>';
 $('reflection-page-count').textContent=filtered.length?`${start+1}–${Math.min(start+10,filtered.length)} de ${filtered.length} notas`:'0 notas';
 $('reflection-prev').disabled=notePage===0;$('reflection-next').disabled=start+10>=filtered.length;
}
function noteAction(e){const b=e.target.closest('button');if(!b)return;const d=A.snapshot(),r=d.reflections.find(r=>r.id===(b.dataset.reflectionEdit||b.dataset.reflectionDelete));if(!r)return;if(b.dataset.reflectionEdit)openReason(r.date,r.subject);else if(window.confirm('Excluir esta nota?')){r.deleted=true;r.updatedAt=at(r.updatedAt);A.commitProgress(d.planDays,d.reflections);paint()}};
$('reflection-list').onclick=noteAction;$('reflection-rest-list').onclick=noteAction;
for(const id of ['reflection-filter-subject','reflection-filter-month','reflection-all','reflection-search'])$(id).addEventListener('input',()=>{notePage=0;renderReflections()});
$('reflection-prev').onclick=()=>{notePage--;renderReflections()};$('reflection-next').onclick=()=>{notePage++;renderReflections()};
$('reflection-filter-month').value=today().slice(0,7);$('reflection-all').checked=true;resetForm();
window.addEventListener('schedulepaint',paint);window.addEventListener('studydatachange',paint);
window.addEventListener('focus',()=>{if(lastDay!==today()){lastDay=today();renderSchedule()}else paint()});
setInterval(()=>{if(lastDay!==today()){lastDay=today();renderSchedule()}},30000);
paint();
})();
