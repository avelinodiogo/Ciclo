(function(root){
'use strict';
const pad=n=>String(n).padStart(2,'0');
const dateKey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const stamp=s=>{const n=Date.parse(s||'');return Number.isFinite(n)?n:0};
function validDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00');return !Number.isNaN(+d)&&dateKey(d)===s}
function validPlanner(p){return p&&Number.isFinite(p.daily)&&p.daily>=60&&p.daily<=480&&Number.isFinite(p.cap)&&p.cap>=30&&p.cap<=240&&Number.isInteger(p.days)&&p.days>=1&&p.days<=6&&['auto','1','2','3','4',1,2,3,4].includes(p.perday)&&Array.isArray(p.subjects)&&p.subjects.length<=60&&p.subjects.every(s=>typeof s.name==='string'&&s.name.length<=200&&['Aguardando','Construção','Consolidação','Manutenção'].includes(s.status)&&Number.isFinite(s.weight)&&s.weight>0&&s.weight<=5)}
function validRecord(r){return r&&typeof r.id==='string'&&r.id.length<=150&&validDate(r.date)&&typeof r.subject==='string'&&r.subject.length<=200&&Number.isInteger(r.seconds)&&r.seconds>0&&r.seconds<=86400&&stamp(r.updatedAt)>0&&typeof r.deleted==='boolean'}
function validate(doc){
 if(!doc||![2,3].includes(doc.schema)||!doc.planner||!validPlanner(doc.planner.value)||!Array.isArray(doc.sessions)||!doc.sessions.every(validRecord))throw new Error('O arquivo não é um backup válido do Ciclo de estudos. Nenhum dado foi substituído.');
 const sessions=doc.sessions.map(r=>({...r,kind:r.kind||'study',topic:r.topic||''}));
 const plans=doc.schema===3?doc.reviewPlans:[],reviews=doc.schema===3?doc.reviews:[];
 const base=r=>r&&typeof r.id==='string'&&r.id.length<=150&&typeof r.subject==='string'&&r.subject.length<=200&&typeof r.topic==='string'&&r.topic.length<=400&&stamp(r.updatedAt)>0&&typeof r.deleted==='boolean';
 if(!sessions.every(r=>['study','review'].includes(r.kind)&&typeof r.topic==='string'&&r.topic.length<=400)||!Array.isArray(plans)||!Array.isArray(reviews)||!plans.every(r=>base(r)&&validDate(r.studiedOn)&&typeof r.notes==='string'&&r.notes.length<=2000)||!reviews.every(r=>base(r)&&typeof r.planId==='string'&&validDate(r.dueDate)&&[1,7,14,30,90,120].includes(r.interval)&&['scheduled','done'].includes(r.status)))throw new Error('O arquivo contém registros de revisão incompatíveis. Nenhum dado foi substituído.');
 return {schema:3,planner:doc.planner,sessions,reviewPlans:plans,reviews};
}
function merge(a,b){a=validate(a);b=validate(b);const join=key=>{const map=new Map();for(const r of [...a[key],...b[key]]){const prior=map.get(r.id);if(!prior||stamp(r.updatedAt)>stamp(prior.updatedAt))map.set(r.id,{...r})}return [...map.values()].sort((a,b)=>a.id.localeCompare(b.id))};return {schema:3,planner:stamp(a.planner.updatedAt)>=stamp(b.planner.updatedAt)?a.planner:b.planner,sessions:join('sessions'),reviewPlans:join('reviewPlans'),reviews:join('reviews')}}
function parseDuration(s){const m=/^(\d{1,2}):([0-5]\d)$/.exec(s.trim());if(!m)return null;const seconds=(+m[1]*60+ +m[2])*60;return seconds>0&&seconds<=86400?seconds:null}
function formatHours(seconds){const mins=Math.round(seconds/60);return `${Math.floor(mins/60)}:${pad(mins%60)}`}
function formatClock(ms){const s=Math.floor(Math.max(0,ms)/1000);return `${pad(Math.floor(s/3600))}:${pad(Math.floor(s/60)%60)}:${pad(s%60)}`}
function splitSegments(segments){const totals={};for(const segment of segments){let start=segment.start,end=segment.end;if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)continue;while(start<end){const d=new Date(start),next=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1).getTime(),stop=Math.min(end,next),key=dateKey(d);totals[key]=(totals[key]||0)+stop-start;start=stop}}return Object.entries(totals).map(([date,ms])=>({date,seconds:Math.round(ms/1000)})).filter(x=>x.seconds>0)}
function bucketKey(date,mode){const d=new Date(date+'T12:00:00');if(mode==='monthly')return date.slice(0,7);if(mode==='weekly'){d.setDate(d.getDate()-((d.getDay()+6)%7));return dateKey(d)}return date}
function chartBuckets(sessions,mode,reference){const ref=new Date(reference+'T12:00:00'),keys=[];if(mode==='daily'){for(let i=13;i>=0;i--){const d=new Date(ref);d.setDate(d.getDate()-i);keys.push(dateKey(d))}}else if(mode==='weekly'){ref.setDate(ref.getDate()-((ref.getDay()+6)%7));for(let i=11;i>=0;i--){const d=new Date(ref);d.setDate(d.getDate()-i*7);keys.push(dateKey(d))}}else{ref.setDate(1);for(let i=11;i>=0;i--){const d=new Date(ref);d.setMonth(d.getMonth()-i);keys.push(dateKey(d).slice(0,7))}}const map=new Map(keys.map(k=>[k,{studySeconds:0,reviewSeconds:0}]));for(const r of sessions)if(!r.deleted){let k=bucketKey(r.date,mode);if(map.has(k))map.get(k)[r.kind==='review'?'reviewSeconds':'studySeconds']+=r.seconds}return [...map].map(([key,values])=>({key,...values,seconds:values.studySeconds+values.reviewSeconds}))}
const REVIEW_INTERVALS=[1,7,14,30,90,120];
function shiftAllowed(date,days=0){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+days);if(d.getDay()===0)d.setDate(d.getDate()+1);return dateKey(d)}
function buildReviews(subject,topic,studiedOn,notes,id,at,makeId){const plan={id,subject,topic,studiedOn,notes,createdAt:at,updatedAt:at,deleted:false,closed:false};return {plan,reviews:REVIEW_INTERVALS.map(interval=>({id:makeId(),planId:id,subject,topic,interval,dueDate:shiftAllowed(studiedOn,interval),status:'scheduled',doneAt:null,notes:'',createdAt:at,updatedAt:at,deleted:false}))}}
function reviewState(review,today){return review.status==='done'?'finished':review.dueDate<today?'overdue':'scheduled'}
function subjectColor(name){const palette=['#225dba','#0a7b78','#8749a8','#a64b20','#436e2d','#aa3963','#3e63a5','#83601d'];let hash=0;for(const c of name)hash=(hash*31+c.codePointAt(0))|0;return palette[(hash>>>0)%palette.length]}
const api={dateKey,stamp,validDate,validate,merge,parseDuration,formatHours,formatClock,splitSegments,bucketKey,chartBuckets,REVIEW_INTERVALS,shiftAllowed,buildReviews,reviewState,subjectColor};
if(typeof module!=='undefined')module.exports=api;else root.StudyCore=api;
})(typeof window!=='undefined'?window:globalThis);
