(function(){
const C=window.StudyCore,phase={'Construção':'construction','Consolidação':'consolidation','Manutenção':'maintenance','Aguardando':'waiting'};
function paint(){for(const box of document.querySelectorAll('.subject')){const name=box.querySelector('[data-field="name"]')?.value,status=box.querySelector('[data-field="status"]')?.value;box.dataset.phase=phase[status]||'waiting';box.style.setProperty('--subject-color',C.subjectColor(name||''))}for(const slot of document.querySelectorAll('.slot')){const name=slot.querySelector('b')?.textContent,status=slot.querySelector('small')?.textContent;slot.dataset.phase=phase[status]||'waiting';slot.style.setProperty('--subject-color',C.subjectColor(name||''))}}
window.addEventListener('plannerchange',paint);window.addEventListener('studydatachange',paint);paint();
})();
