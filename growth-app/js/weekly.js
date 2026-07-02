// weekly.js — FINAL
let chartInst={},modalChart=null,chartData={};
window.addEventListener('DOMContentLoaded',async()=>{
  _applyTheme();
  const{data:{session}}=await sb.auth.getSession();
  if(!session){window.location.href='index.html';return;}
  const uid=session.user.id,days=_last7();
  const[{data:E},{data:T},{data:prof}]=await Promise.all([
    sb.from('daily_entries').select('*').eq('user_id',uid).in('entry_date',days).order('entry_date'),
    sb.from('tasks').select('*').eq('user_id',uid).in('entry_date',days),
    sb.from('profiles').select('*').eq('id',uid).single()
  ]);
  const entries=E||[],tasks=T||[];
  const ne=document.getElementById('week-user');
  if(ne)ne.textContent=prof?.username||session.user.email.split('@')[0];
  _summary(days,entries,tasks);
  requestAnimationFrame(()=>setTimeout(()=>_charts(days,entries),120));
  _daycards(days,entries,tasks);
});
function _applyTheme(){
  const t=localStorage.getItem('dg_theme')||'purple';
  const dark=localStorage.getItem('dg_dark')==='1';
  document.documentElement.setAttribute('data-color',t);
  if(dark)document.documentElement.setAttribute('data-theme','dark');
  else document.documentElement.removeAttribute('data-theme');
  const btn=document.getElementById('dark-toggle');
  if(btn)btn.textContent=dark?'☀️':'🌙';
  document.querySelectorAll('.sb-theme-btn').forEach(b=>b.classList.toggle('active',b.getAttribute('onclick')?.includes("'"+t+"'")));
}
function _last7(){return Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return d.toISOString().slice(0,10);});}
function _set(id,v){const el=document.getElementById(id);if(el)el.textContent=v;}
function _esc(t){const d=document.createElement('div');d.textContent=t;return d.innerHTML;}
function _summary(days,E,T){
  const tot=E.reduce((s,e)=>s+(e.score||0),0),act=E.length,avg=act?Math.round(tot/act):0,done=T.filter(t=>t.done).length;
  _set('w-total',tot);_set('w-active',act+'/7');_set('w-avg',avg);_set('w-tasks',done);
  let m='';
  if(!act)m='Ippo start pannunga! 🚀';
  else if(avg>=80)m='🏆 Excellent week! Un consistency top-notch iruku da!';
  else if(avg>=60)m='💪 Good week! 80+ hit pannalam!';
  else if(avg>=40)m='🚀 Decent start! Daily questions answer pannu.';
  else m='🔥 Next week better pannuvom!';
  _set('w-insight',m);
}
const EM={'😴 Low':1,'😐 Okay':2,'😊 Good':3,'🔥 High':4};
const FM={'😵 Distracted':1,'😐 So-so':2,'🎯 Focused':3,'⚡ Ultra focused':4};
const IM={'✅ 0–15 min':4,'🟡 15–30 min':3,'🟠 30–60 min':2,'🔴 1hr+':1};
const PM={'❌ Not yet':0,'1️⃣ 1 question':1,'2️⃣ 2 questions':2,'3️⃣ 3+ questions':3};
function _qv(E,day,key,map){const e=E.find(e=>e.entry_date===day);return map[e?.answers?.[key]]??0;}
function _charts(days,E){
  Object.values(chartInst).forEach(c=>{try{c.destroy();}catch(e){}});chartInst={};
  const labels=days.map(d=>new Date(d+'T12:00:00').toLocaleDateString('en',{weekday:'short'}));
  const scores=days.map(d=>E.find(e=>e.entry_date===d)?.score||0);
  const energy=days.map(d=>_qv(E,d,'q_energy',EM));
  const focus=days.map(d=>_qv(E,d,'q_focus',FM));
  const insta=days.map(d=>_qv(E,d,'q_insta',IM));
  const pract=days.map(d=>_qv(E,d,'q_practice',PM));
  chartData={labels,scores,energy,focus,insta,pract};
  const dark=document.documentElement.getAttribute('data-theme')==='dark';
  const tc=dark?'rgba(196,181,253,.45)':'rgba(139,92,246,.45)';
  const gc=dark?'rgba(196,181,253,.05)':'rgba(139,92,246,.05)';
  function o(yMax,yFn){return{responsive:true,maintainAspectRatio:false,animation:{duration:400},plugins:{legend:{display:false}},scales:{x:{grid:{color:gc},ticks:{color:tc,font:{size:10}}},y:{grid:{color:gc},ticks:{color:tc,font:{size:10},callback:yFn||undefined},beginAtZero:true,max:yMax}}};}
  function bar(id,data,colors,yMax,yFn){const el=document.getElementById(id);if(!el)return null;return new Chart(el,{type:'bar',data:{labels,datasets:[{data,backgroundColor:colors,borderRadius:6,borderSkipped:false}]},options:o(yMax,yFn)});}
  function line(id,data,color,yMax,yFn){const el=document.getElementById(id);if(!el)return null;return new Chart(el,{type:'line',data:{labels,datasets:[{data,borderColor:color,backgroundColor:color+'22',borderWidth:2.5,pointRadius:5,pointBackgroundColor:color,fill:true,tension:0.4}]},options:o(yMax,yFn)});}
  chartInst.score=bar('score-chart',scores,scores.map(s=>s>=80?'#8B5CF6':s>=50?'#A78BFA':'rgba(139,92,246,.2)'),120);
  chartInst.energy=line('energy-chart',energy,'#06D6A0',4,v=>['','Low','Okay','Good','High'][v]||'');
  chartInst.focus=line('focus-chart',focus,'#22D3EE',4,v=>['','Dist.','So-so','Focus','Ultra'][v]||'');
  chartInst.insta=bar('insta-chart',insta,insta.map(v=>v>=3?'#06D6A0':v===2?'#FBBF24':'#F87171'),4,v=>['','1hr+','30-60','15-30','0-15'][v]||'');
  chartInst.pract=bar('practice-chart',pract,pract.map(v=>v===3?'#8B5CF6':v===2?'#A78BFA':v===1?'rgba(139,92,246,.4)':'rgba(139,92,246,.12)'),3,v=>['0','1Q','2Q','3+Q'][v]||'');
}
const CI={
  score:{title:'⭐ Daily Score',type:'bar',color:'#8B5CF6',data:()=>chartData.scores,colors:()=>chartData.scores.map(s=>s>=80?'#8B5CF6':s>=50?'#A78BFA':'rgba(139,92,246,.2)'),yMax:120,yFn:null,good:'High scores = strong discipline.',improve:'Answer all 7 questions + extra tasks.',focus:'Aim for 80+ every day.',key:'Each point = 1 step toward your goal!'},
  energy:{title:'🌸 Energy Level',type:'line',color:'#06D6A0',data:()=>chartData.energy,colors:()=>'#06D6A0',yMax:4,yFn:v=>['','Low','Okay','Good','High'][v]||'',good:'High energy = better productivity.',improve:'Sleep 7-8 hrs. Drink water first thing.',focus:'Track energized days.',key:'Consistent energy = consistent performance!'},
  focus:{title:'🎯 Focus Level',type:'line',color:'#22D3EE',data:()=>chartData.focus,colors:()=>'#22D3EE',yMax:4,yFn:v=>['','Dist.','So-so','Focus','Ultra'][v]||'',good:'Focused days = 3x more work.',improve:'Pomodoro: 25 min work, 5 min break.',focus:'Phone face-down when studying.',key:'Each focused day compounds!'},
  insta:{title:'📵 Instagram',type:'bar',color:'#06D6A0',data:()=>chartData.insta,colors:()=>chartData.insta.map(v=>v>=3?'#06D6A0':v===2?'#FBBF24':'#F87171'),yMax:4,yFn:v=>['','1hr+','30-60','15-30','0-15'][v]||'',good:'Low usage = more growth time.',improve:'Set 15 min/day limit.',focus:'Insta vida un future important da!',key:'Every saved hour = 1 hour toward dream!'},
  practice:{title:'📝 Practice',type:'bar',color:'#8B5CF6',data:()=>chartData.pract,colors:()=>chartData.pract.map(v=>v===3?'#8B5CF6':v===2?'#A78BFA':v===1?'rgba(139,92,246,.4)':'rgba(139,92,246,.12)'),yMax:3,yFn:v=>['0','1Q','2Q','3+Q'][v]||'',good:'Daily questions build strong habits.',improve:'Same time every day.',focus:'Consistency > intensity.',key:'Daily practice = mastery!'},
};
function openChartModal(key){
  const info=CI[key];if(!info||!chartData.labels)return;
  _set('chart-modal-title',info.title);_set('modal-good',info.good);_set('modal-improve',info.improve);_set('modal-focus',info.focus);_set('modal-key',info.key);
  document.getElementById('chart-modal').classList.add('open');
  if(modalChart){try{modalChart.destroy();}catch(e){}modalChart=null;}
  setTimeout(()=>{
    const canvas=document.getElementById('modal-chart-canvas');if(!canvas)return;
    const dark=document.documentElement.getAttribute('data-theme')==='dark';
    const tc=dark?'rgba(196,181,253,.45)':'rgba(139,92,246,.45)';
    const gc=dark?'rgba(196,181,253,.06)':'rgba(139,92,246,.06)';
    const o={responsive:true,maintainAspectRatio:false,animation:{duration:300},plugins:{legend:{display:false}},scales:{x:{grid:{color:gc},ticks:{color:tc,font:{size:10}}},y:{grid:{color:gc},ticks:{color:tc,font:{size:10},callback:info.yFn||undefined},beginAtZero:true,max:info.yMax}}};
    const ds=info.type==='line'
      ?{data:info.data(),borderColor:info.color,backgroundColor:info.color+'22',borderWidth:2.5,pointRadius:5,pointBackgroundColor:info.color,fill:true,tension:0.4}
      :{data:info.data(),backgroundColor:info.colors(),borderRadius:6,borderSkipped:false};
    modalChart=new Chart(canvas,{type:info.type,data:{labels:chartData.labels,datasets:[ds]},options:o});
  },80);
}
function closeChartModal(){document.getElementById('chart-modal').classList.remove('open');if(modalChart){try{modalChart.destroy();}catch(e){}modalChart=null;}}
function _daycards(days,E,T){
  const c=document.getElementById('day-cards');if(!c)return;c.innerHTML='';
  const today=new Date().toISOString().slice(0,10);
  days.forEach(day=>{
    const entry=E.find(e=>e.entry_date===day),dT=T.filter(t=>t.entry_date===day);
    const label=new Date(day+'T12:00:00').toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'});
    const isToday=day===today,ans=entry?.answers||{};
    if(!entry){c.innerHTML+=`<div class="day-card empty"><div class="day-card-head"><span class="day-name">${label}</span>${isToday?'<span class="day-badge today-b">Today</span>':'<span class="day-badge missed-b">No entry</span>'}</div><p class="day-empty-msg">Data illai 📭</p></div>`;return;}
    c.innerHTML+=`<div class="day-card"><div class="day-card-head"><span class="day-name">${label}</span><span class="day-score-badge">${entry.score||0}pts</span>${isToday?'<span class="day-badge today-b">Today</span>':''}</div><div class="day-grid"><div class="day-row"><span class="dr-icon">🌸</span><span class="dr-label">Energy</span><span class="dr-val">${ans.q_energy||'—'}</span></div><div class="day-row"><span class="dr-icon">🎯</span><span class="dr-label">Focus</span><span class="dr-val">${ans.q_focus||'—'}</span></div><div class="day-row"><span class="dr-icon">📵</span><span class="dr-label">Insta</span><span class="dr-val">${ans.q_insta||'—'}</span></div><div class="day-row"><span class="dr-icon">📝</span><span class="dr-label">Practice</span><span class="dr-val">${ans.q_practice||'—'}</span></div><div class="day-row"><span class="dr-icon">✅</span><span class="dr-label">Tasks</span><span class="dr-val">${dT.filter(t=>t.done).length}/${dT.length}</span></div></div>${entry.mood_journal?`<div class="day-mood">"${_esc(entry.mood_journal)}"</div>`:''}</div>`;
  });
}
function applyTheme(t){document.documentElement.setAttribute('data-color',t);localStorage.setItem('dg_theme',t);if(typeof updateApiUI==='function')updateApiUI();document.querySelectorAll('.sb-theme-btn').forEach(b=>b.classList.toggle('active',b.getAttribute('onclick')?.includes("'"+t+"'")));}
function toggleDark(){const isDark=document.documentElement.getAttribute('data-theme')==='dark';document.documentElement.setAttribute('data-theme',isDark?'light':'dark');localStorage.setItem('dg_dark',isDark?'':'1');const btn=document.getElementById('dark-toggle');if(btn)btn.textContent=isDark?'🌙':'☀️';}
function toggleSidebar(){const sb=document.getElementById('sidebar');if(!sb)return;if(window.innerWidth<=768)sb.classList.toggle('open');else sb.classList.toggle('collapsed');}
async function doLogout(){await sb.auth.signOut();window.location.href='index.html';}
