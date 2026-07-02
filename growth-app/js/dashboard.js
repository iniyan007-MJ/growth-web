// Daily Growth Dashboard FINAL
// ── Utils FIRST (prevent hoisting bugs) ──────────────────────
function escHtml(t){const d=document.createElement('div');d.textContent=t;return d.innerHTML;}
function showToast(msg){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600);}

// ── Theme ────────────────────────────────────────────────────
function applyTheme(t){
  document.documentElement.setAttribute('data-color',t);
  localStorage.setItem('dg_theme',t);
  document.querySelectorAll('.theme-dot,.sb-theme-btn').forEach(d=>{
    d.classList.toggle('active',d.classList.contains('td-'+t)||d.classList.contains('td-dot '+t));
  });
  document.querySelectorAll('.sb-theme-btn').forEach(b=>{
    const match=b.getAttribute('onclick')?.includes("'"+t+"'");
    b.classList.toggle('active',!!match);
  });
}
function toggleDark(){
  const isDark=document.documentElement.getAttribute('data-theme')==='dark';
  document.documentElement.setAttribute('data-theme',isDark?'light':'dark');
  localStorage.setItem('dg_dark',isDark?'':'1');
  const btn=document.getElementById('dark-toggle');
  if(btn)btn.textContent=isDark?'🌙':'☀️';
}
function initAppTheme(){
  const t=localStorage.getItem('dg_theme')||'purple';
  const dark=localStorage.getItem('dg_dark')==='1';
  document.documentElement.setAttribute('data-color',t);
  if(dark)document.documentElement.setAttribute('data-theme','dark');
  else document.documentElement.removeAttribute('data-theme');
  const btn=document.getElementById('dark-toggle');
  if(btn)btn.textContent=dark?'☀️':'🌙';
  document.querySelectorAll('.sb-theme-btn').forEach(b=>{
    const match=b.getAttribute('onclick')?.includes("'"+t+"'");
    b.classList.toggle('active',!!match);
  });
}
function toggleSidebar(){
  const sb=document.getElementById('sidebar');
  if(!sb)return;
  if(window.innerWidth<=768){sb.classList.toggle('open');sb.classList.remove('collapsed');}
  else{sb.classList.toggle('collapsed');}
}

// ── Word Bank ────────────────────────────────────────────────
const WD='dg_wday',WC='dg_wcnt',WB='dg_wbank',WL=5;
function _gBank(){try{return JSON.parse(localStorage.getItem(WB)||'[]');}catch{return[];}}
function _sBank(b){localStorage.setItem(WB,JSON.stringify(b.slice(0,50)));}
function _cnt(){
  const t=new Date().toISOString().slice(0,10);
  if(localStorage.getItem(WD)!==t){localStorage.setItem(WD,t);localStorage.setItem(WC,'0');return 0;}
  return parseInt(localStorage.getItem(WC)||'0');
}
function _addCnt(){const c=_cnt()+1;localStorage.setItem(WC,String(c));return c;}
function renderWordSection(){
  const count=_cnt();const left=Math.max(0,WL-count);
  const b=document.getElementById('word-count-badge');
  if(b)b.textContent=count+'/'+WL+' today';
  const btn=document.getElementById('ai-fetch-btn');
  if(btn){btn.disabled=left===0;btn.textContent=left===0?'✓ Limit reached':'✨ New Word';}
}
function renderWordBank(){
  const bank=_gBank();const el=document.getElementById('word-bank-list');if(!el)return;
  if(!bank.length){el.innerHTML='<p style="font-size:.78rem;color:var(--text4);padding:.5rem 0;font-weight:500;">No words yet. Fetch some! 📚</p>';return;}
  el.innerHTML=bank.slice(0,10).map(w=>`<div class="wb-item"><div class="wb-word">${escHtml(w.word)}</div><div class="wb-meaning">🇮🇳 ${escHtml(w.tamil_meaning)}</div><div class="wb-ex">💬 <em>${escHtml(w.example)}</em></div><div class="wb-pron">🔊 ${escHtml(w.pronunciation)}</div></div>`).join('');
}
function switchWordTab(tab){
  ['fetch','bank','search'].forEach(t=>{
    const el=document.getElementById('wt-'+t);if(el)el.style.display=t===tab?'block':'none';
    const btn=document.getElementById('wtab-'+t);if(btn)btn.classList.toggle('active',t===tab);
  });
  if(tab==='bank')renderWordBank();
}
async function fetchWordOfDay(){
  if(!APP_CONFIG.ai.enabled)return;
  if(_cnt()>=WL){showToast('Daily limit '+WL+' words! 📵 Tomorrow vaangalam.');return;}
  const btn=document.getElementById('ai-fetch-btn');
  const card=document.getElementById('word-card');
  if(btn){btn.disabled=true;btn.textContent='⏳ Loading...';}
  try{
    if(typeof addApiCall==='function')addApiCall();
    const res=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key='+APP_CONFIG.ai.apiKey,
      {method:'POST',headers:{'Content-Type':'application/json'},
       body:JSON.stringify({contents:[{parts:[{text:'Give one useful English word for a Tamil student.\nReturn ONLY valid JSON. No markdown, no backticks.\nFormat:\n{"word":"string","tamil_meaning":"string","example":"string","pronunciation":"string"}'}]}]})});
    const data=await res.json();
    if(!res.ok)throw new Error(data?.error?.message||'API failed');
    const text=data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if(!text)throw new Error('No response');
    const word=JSON.parse(text.replace(/```json|```/g,'').trim());
    const bank=_gBank();
    if(!bank.find(w=>w.word.toLowerCase()===word.word.toLowerCase())){bank.unshift({...word,date:new Date().toISOString().slice(0,10)});_sBank(bank);}
    _addCnt();renderWordCard(word);renderWordSection();
  }catch(e){
    if(card)card.innerHTML='<p style="color:var(--red);font-size:.8rem;padding:.5rem;">AI failed 😅 '+escHtml(e.message)+'</p>';
    if(btn){btn.disabled=false;btn.textContent='✨ New Word';}
  }
}
function renderWordCard(word){
  const card=document.getElementById('word-card');if(!card)return;
  card.innerHTML=`<div class="word-inner"><div class="word-main">${escHtml(word.word)}</div><div class="word-pron">🔊 ${escHtml(word.pronunciation)}</div><div class="word-meaning">🇮🇳 ${escHtml(word.tamil_meaning)}</div><div class="word-example">💬 <em>${escHtml(word.example)}</em></div></div>`;
}
async function doAiSearch(){
  const inp=document.getElementById('ai-search-input');
  const out=document.getElementById('ai-search-output');
  if(!inp||!out)return;
  const q=inp.value.trim();
  if(!q){out.innerHTML='<p style="color:var(--text4);font-size:.8rem;">Type a question first! ✍️</p>';return;}
  out.innerHTML='<p style="font-size:.8rem;color:var(--text4);">⏳ Thinking...</p>';
  try{
    if(typeof addApiCall==='function')addApiCall();
    const res=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key='+APP_CONFIG.ai.apiKey,
      {method:'POST',headers:{'Content-Type':'application/json'},
       body:JSON.stringify({contents:[{parts:[{text:'Answer briefly for a Tamil student. Simple English. Max 4 sentences.\n\nQuestion: '+q}]}]})});
    const data=await res.json();
    if(!res.ok)throw new Error(data?.error?.message||'Failed');
    const ans=data?.candidates?.[0]?.content?.parts?.[0]?.text||'No answer';
    out.innerHTML='<div class="ai-ans">'+escHtml(ans).replace(/\n/g,'<br>')+'</div>';
  }catch(e){out.innerHTML='<p style="color:var(--red);font-size:.8rem;">Error: '+escHtml(e.message)+'</p>';}
}

const TODAY = new Date().toISOString().slice(0, 10);
const SC    = APP_CONFIG.scoring;

// ── Default Questions ──────────────────────────────────────
const DEFAULT_QUESTIONS = [
  {
    id: 'q_energy', icon: '🌸', pts: 10,
    label: 'What is your energy level today?',
    type: 'scale',
    options: ['😴 Low', '😐 Okay', '😊 Good', '🔥 High'],
    onSelect: (val, gender) => {
      const wrap = document.getElementById('low-energy-wrap');
      if (wrap) wrap.style.display = val === '😴 Low' ? 'block' : 'none';
    }
  },
  {
    id: 'q_focus', icon: '⏳', pts: 15,
    label: 'How focused will you be today?',
    type: 'scale',
    options: ['😵 Distracted', '😐 So-so', '🎯 Focused', '⚡ Ultra focused'],
    onSelect: (val) => {
      const wrap = document.getElementById('distract-quote-wrap');
      if (wrap) wrap.style.display = val === '😵 Distracted' ? 'block' : 'none';
      if (val === '😵 Distracted' && wrap) {
        wrap.querySelector('.distract-quote').textContent = getDistractionQuote();
      }
    }
  },
  {
    id: 'q_linkedin', icon: '💼', pts: 0,
    label: 'Did you use LinkedIn today?',
    type: 'scale',
    options: ['✅ Yes', '❌ No'],
  },
  {
    id: 'q_practice', icon: '📝', pts: 0,
    label: 'Did you practice your tool today?',
    type: 'scale',
    options: ['❌ Not yet', '1️⃣ 1 question', '2️⃣ 2 questions', '3️⃣ 3+ questions'],
  },
  {
    id: 'q_improve', icon: '🚀', pts: 10,
    label: 'What do you want to improve today?',
    type: 'text', placeholder: 'e.g. Focus, study time, consistency...',
  },
  {
    id: 'q_ready', icon: '💖', pts: 15,
    label: 'Are you ready to grow?',
    type: 'scale',
    options: ['😅 Not really', '😌 Trying', '💪 Yes!', '🏆 100% Let\'s go!'],
  },
  {
    id: 'q_insta', icon: '📱', pts: 0,
    label: 'Instagram use — evalo neram?',
    type: 'scale',
    options: ['✅ 0–15 min', '🟡 15–30 min', '🟠 30–60 min', '🔴 1hr+'],
  },
];

// ── State ──────────────────────────────────────────────────
let currentUser    = null;
let profile        = null;
let answers        = {};
let comments       = {};
let tasks          = [];
let entryId        = null;
let selectedCat    = 'study';
let saveTimer      = null;
let friendCode     = null;

// ── Init ───────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  if (typeof initAppTheme === 'function') initAppTheme();
  if (typeof updateApiUI  === 'function') updateApiUI();
  initAppTheme();  // theme FIRST
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { window.location.href = 'index.html'; return; }
  currentUser = session.user;


  const { data: p } = await sb.from('profiles').select('*').eq('id', currentUser.id).single();
  profile = p;
  window.dgUser    = currentUser;
  window.dgProfile = profile;

  renderGreeting();
  renderQuote();
  buildDateStrip();
  if(typeof renderAvatarDisplay==="function") renderAvatarDisplay();
  renderQuestions();
  await loadTodayEntry();
  await loadTasks();
  await loadFriendCode();
  updateScoreUI();
  renderWordSection();

  document.getElementById('save-btn').addEventListener('click', saveAll);
  document.getElementById('act-input').addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

  // AI toggle
  if (!APP_CONFIG.ai.enabled) {
    const aiSection = document.getElementById('ai-section');
    if (aiSection) aiSection.style.display = 'none';
  }
});

// ── Greeting ───────────────────────────────────────────────
function renderGreeting() {
  const name   = profile?.username || currentUser.email.split('@')[0];
  const gender = profile?.gender || 'female';
  const h      = new Date().getHours();
  const period = h < 12 ? 'good morning 🌞' : h < 17 ? 'good afternoon ☀️' : 'good evening 🌙';
  const salute = (gender === 'female') ? 'Hi nanbi' : 'Hi da';
  const gEl = document.getElementById('greeting');
  if (gEl) gEl.textContent = `${salute}, ${period}!`;
  const uEl = document.getElementById('username-display');
  if (uEl) uEl.textContent = name;
  const sbEl = document.getElementById('sb-username');
  if (sbEl) sbEl.textContent = name;
  if (typeof renderAvatarDisplay === 'function') renderAvatarDisplay();
}

function renderQuote() {
  document.getElementById('daily-quote').textContent = getDailyQuote();
}

// ── Date strip ─────────────────────────────────────────────
function buildDateStrip() {
  const strip = document.getElementById('date-strip');
  strip.innerHTML = '';
  const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const today = new Date();
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const chip = document.createElement('div');
    chip.className = 'date-chip' + (i === 0 ? ' today' : '');
    chip.innerHTML = `<span class="dn">${days[d.getDay()]}</span><span class="dd">${d.getDate()}</span>`;
    strip.appendChild(chip);
  }
}

// ── Profile Avatar ─────────────────────────────────────────
function renderProfileAvatar() {
  const gender  = profile?.gender || 'female';
  const saved   = localStorage.getItem('dg_avatar');
  const el      = document.getElementById('avatar-img');
  if (!el) return;

  if (saved) {
    el.style.backgroundImage = `url(${saved})`;
    el.textContent = '';
  } else {
    const avatars = AVATARS[gender] || AVATARS.male;
    const idx     = parseInt(localStorage.getItem('dg_avatar_idx') || '0') % avatars.length;
    el.innerHTML  = avatars[idx];
    el.style.backgroundImage = '';
  }
}

function openProfileModal() {
  document.getElementById('profile-modal').classList.add('open');
  renderAvatarPicker();
}
function closeProfileModal() { document.getElementById('profile-modal').classList.remove('open'); }

function renderAvatarPicker() {
  const gender  = profile?.gender || 'female';
  const avatars = AVATARS[gender] || AVATARS.male;
  const container = document.getElementById('avatar-grid');
  if (!container) return;
  container.innerHTML = avatars.map((svg, i) =>
    `<div class="avatar-option ${parseInt(localStorage.getItem('dg_avatar_idx')||'0')===i?'selected':''}"
      onclick="selectAvatar(${i})">${svg}</div>`
  ).join('');
}

function selectAvatar(idx) {
  localStorage.setItem('dg_avatar_idx', idx);
  localStorage.removeItem('dg_avatar');
  document.querySelectorAll('.avatar-option').forEach((el, i) => el.classList.toggle('selected', i === idx));
  renderProfileAvatar();
}

function uploadAvatar() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = r => {
      localStorage.setItem('dg_avatar', r.result);
      renderProfileAvatar();
      closeProfileModal();
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// ── Questions ──────────────────────────────────────────────
function renderQuestions() {
  const gender = profile?.gender || 'female';
  const c = document.getElementById('questions-container');
  c.innerHTML = '';

  DEFAULT_QUESTIONS.forEach(q => {
    let inputHTML = '';
    if (q.type === 'scale') {
      inputHTML = `<div class="emoji-opts" id="opts-${q.id}">
        ${q.options.map(opt =>
          `<button class="emoji-opt" data-val="${opt}"
            onclick="selectOpt('${q.id}',this,'${opt.replace(/'/g,"\\'")}')">
            ${opt}</button>`
        ).join('')}
      </div>`;
    } else {
      inputHTML = `<input class="q-input" id="inp-${q.id}" type="text"
        placeholder="${q.placeholder}"
        onchange="saveAnswer('${q.id}',this.value)"
        onblur="saveAnswer('${q.id}',this.value)"/>`;
    }

    // Extra injections per question
    let extra = '';
    if (q.id === 'q_energy') {
      const followup = gender === 'female' ? LOW_ENERGY_FOLLOWUP.female : LOW_ENERGY_FOLLOWUP.male;
      extra = `<div id="low-energy-wrap" style="display:none;" class="followup-wrap">
        <span class="followup-msg">💬 ${followup}</span>
        <textarea class="q-comment" id="low-energy-text" placeholder="Sollu da..."></textarea>
      </div>`;
    }
    if (q.id === 'q_focus') {
      extra = `<div id="distract-quote-wrap" style="display:none;" class="distract-wrap">
        <div class="distract-quote"></div>
      </div>`;
    }

    const pts = q.pts ? `<span class="q-pts">${q.pts}pts</span>` : '';

    c.innerHTML += `
    <div class="q-card" id="qcard-${q.id}">
      <div class="q-head">
        <span class="q-icon">${q.icon}</span>
        <span class="q-label">${q.label}</span>
        ${pts}
      </div>
      ${inputHTML}
      ${extra}
      <div class="comment-wrap">
        <div class="comment-label">💬 Extra thoughts</div>
        <textarea class="q-comment" id="cmt-${q.id}" placeholder="Type here..."
          onblur="saveComment('${q.id}',this.value)"></textarea>
      </div>
    </div>`;
  });
}

function restoreQuestions() {
  const gender = profile?.gender || 'female';
  DEFAULT_QUESTIONS.forEach(q => {
    const saved = answers[q.id];
    if (!saved) return;
    if (q.type === 'scale') {
      const btn = document.querySelector(`#opts-${q.id} [data-val="${CSS.escape(saved)}"]`);
      if (btn) { btn.classList.add('selected'); if (q.onSelect) q.onSelect(saved, gender); }
    } else {
      const inp = document.getElementById(`inp-${q.id}`);
      if (inp) inp.value = saved;
    }
    const cmt = document.getElementById(`cmt-${q.id}`);
    if (cmt && comments[q.id]) cmt.value = comments[q.id];
  });
}

function selectOpt(qid, el, val) {
  document.querySelectorAll(`#opts-${qid} .emoji-opt`).forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  answers[qid] = val;
  const q = DEFAULT_QUESTIONS.find(x => x.id === qid);
  if (q?.onSelect) q.onSelect(val, profile?.gender || 'female');
  markDirty();
  updateScoreUI();
}

function saveAnswer(qid, val) { answers[qid] = val; markDirty(); updateScoreUI(); }
function saveComment(qid, val) { comments[qid] = val; markDirty(); }

// ── Score calculation ───────────────────────────────────────
function calcScore() {
  // Base score from questions (max 100)
  let base = 0;
  // energy
  const energyMap = { '😴 Low': 2, '😐 Okay': 5, '😊 Good': 8, '🔥 High': 10 };
  base += energyMap[answers.q_energy] || 0;
  // focus
  const focusMap = { '😵 Distracted': 0, '😐 So-so': 8, '🎯 Focused': 12, '⚡ Ultra focused': 15 };
  base += focusMap[answers.q_focus] || 0;
  // linkedin
  base += answers.q_linkedin === '✅ Yes' ? SC.linkedinPts : 0;
  // practice tool
  const practMap = { '❌ Not yet': 0, '1️⃣ 1 question': SC.practicePts['1'], '2️⃣ 2 questions': SC.practicePts['2'], '3️⃣ 3+ questions': SC.practicePts['3'] };
  base += practMap[answers.q_practice] || 0;
  // improve text (filled = pts)
  base += answers.q_improve?.trim() ? 10 : 0;
  // ready
  const readyMap = { '😅 Not really': 0, '😌 Trying': 8, '💪 Yes!': 12, '🏆 100% Let\'s go!': 15 };
  base += readyMap[answers.q_ready] || 0;
  // instagram penalty/bonus
  const instaPts = SC.instaPenalty[answers.q_insta] || 0;
  base += instaPts;

  base = Math.min(Math.max(base, 0), SC.maxDailyScore);

  // Extra task bonus
  const bonus = tasks.filter(t => t.done).length * SC.extraTaskBonus;

  return { base, bonus, total: base + bonus };
}

function updateScoreUI() {
  const { base, bonus, total } = calcScore();

  document.getElementById('score-base').textContent  = base;
  document.getElementById('score-bonus').textContent = bonus > 0 ? `+${bonus}` : '0';
  document.getElementById('score-total').textContent = total;

  const pct = Math.min(100, Math.round((base / SC.maxDailyScore) * 100));
  document.getElementById('score-bar-fill').style.width = pct + '%';
  document.getElementById('score-pct').textContent = pct + '%';

  // Reward button visibility
  const rewardBtn = document.getElementById('reward-btn');
  if (rewardBtn) rewardBtn.style.display = total >= SC.rewardMinScore ? 'inline-flex' : 'none';

  // Tasks progress
  const totalT = tasks.length;
  const doneT  = tasks.filter(t => t.done).length;
  document.getElementById('stat-total').textContent  = totalT;
  document.getElementById('stat-done').textContent   = doneT;

  // Ring
  const answered = DEFAULT_QUESTIONS.filter(q => answers[q.id]).length;
  const allCount = DEFAULT_QUESTIONS.length + totalT;
  const allDone  = answered + doneT;
  const ringPct  = allCount === 0 ? 0 : Math.min(100, Math.round(allDone / allCount * 100));
  document.getElementById('ring-fg').style.strokeDashoffset = 201 - (201 * ringPct / 100);
  document.getElementById('ring-pct').textContent = ringPct + '%';
  document.getElementById('progress-label').textContent =
    allCount === 0 ? 'Questions answer pannu! 🚀' :
    allDone >= allCount ? 'Ellam complete! 🏆' :
    `${allDone}/${allCount} complete 💪`;
}

// ── Save ───────────────────────────────────────────────────
function markDirty() {
  updateSaveStatus('unsaved');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveAll, 8000);
}

function updateSaveStatus(state) {
  const el = document.getElementById('save-status');
  const states = { saved: ['✓ Saved', 'ok'], saving: ['⏳ Saving...', 'saving'], unsaved: ['● Unsaved', 'dirty'], new: ['✦ New', 'new'] };
  const [text, cls] = states[state] || states.new;
  if (el) { el.textContent = text; el.className = `save-status ${cls}`; }
}

async function saveAll() {
  clearTimeout(saveTimer);
  updateSaveStatus('saving');
  const { base, bonus, total } = calcScore();
  const moodText = document.getElementById('mood-journal')?.value || '';

  const payload = {
    user_id: currentUser.id, entry_date: TODAY,
    answers, comments, score: total, mood_journal: moodText,
    saved_at: new Date().toISOString(),
  };

  let err;
  if (entryId) {
    const r = await sb.from('daily_entries').update(payload).eq('id', entryId);
    err = r.error;
  } else {
    const r = await sb.from('daily_entries').insert(payload).select().single();
    err = r.error; if (r.data) entryId = r.data.id;
  }

  if (err) { showToast('Save failed! 😤'); updateSaveStatus('unsaved'); return; }
  updateSaveStatus('saved');
  showToast('Saved! ☁️ Data secure da!');
}

async function loadTodayEntry() {
  const { data } = await sb.from('daily_entries').select('*')
    .eq('user_id', currentUser.id).eq('entry_date', TODAY).single();
  if (data) {
    entryId = data.id; answers = data.answers || {}; comments = data.comments || {};
    if (data.mood_journal && document.getElementById('mood-journal'))
      document.getElementById('mood-journal').value = data.mood_journal;
    restoreQuestions();
    updateSaveStatus('saved');
  } else {
    updateSaveStatus('new');
  }
}

// ── Tasks ──────────────────────────────────────────────────
const CAT_INFO = {
  study:    { label: '📚 Study',     cls: 'cat-study' },
  health:   { label: '🏃 Health',    cls: 'cat-health' },
  selfcare: { label: '🧘 Self Care', cls: 'cat-selfcare' },
  other:    { label: '⚡ Other',     cls: 'cat-other' },
};

function selectCat(el) {
  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  selectedCat = el.dataset.cat;
}

async function addTask() {
  const input = document.getElementById('act-input');
  const name  = input.value.trim();
  if (!name) { showToast('Task name type pannu! ✍️'); return; }
  const { data, error } = await sb.from('tasks').insert({
    user_id: currentUser.id, entry_date: TODAY, name, category: selectedCat, done: false,
  }).select().single();
  if (error) { showToast('Add failed 😤'); return; }
  tasks.push(data);
  renderTasks();
  updateScoreUI();
  input.value = '';
  showToast('Task added! 🎯');
}

async function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  await sb.from('tasks').update({ done: task.done }).eq('id', id);
  if (task.done) { showToast('+5 bonus pts! 🔥'); spawnConfetti(); }
  renderTasks();
  updateScoreUI();
  markDirty();
}

async function deleteTask(id) {
  await sb.from('tasks').delete().eq('id', id);
  tasks = tasks.filter(t => t.id !== id);
  renderTasks();
  updateScoreUI();
}

async function loadTasks() {
  const { data } = await sb.from('tasks').select('*')
    .eq('user_id', currentUser.id).eq('entry_date', TODAY)
    .order('created_at', { ascending: true });
  tasks = data || [];
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById('task-list');
  if (!tasks.length) {
    list.innerHTML = `<div class="empty-state"><span>⚡</span><p>Extra tasks illai!<br>Add pannunga.</p></div>`;
    return;
  }
  list.innerHTML = tasks.map(t => {
    const info = CAT_INFO[t.category] || CAT_INFO.other;
    const time = new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `
    <div class="task-item ${t.done ? 'done' : ''}">
      <button class="chk ${t.done ? 'done' : ''}" onclick="toggleTask('${t.id}')">${t.done ? '✓' : ''}</button>
      <div class="task-info">
        <div class="task-name">${escHtml(t.name)}</div>
        <div class="task-meta">
          <span class="task-cat ${info.cls}">${info.label}</span>
          <span class="task-pts">+5 bonus</span>
          <span class="task-time">${time}</span>
        </div>
      </div>
      <button class="del-btn" onclick="deleteTask('${t.id}')">🗑️</button>
    </div>`;
  }).join('');
}

// ── Reward ─────────────────────────────────────────────────
function openReward() {
  const { total } = calcScore();
  const modal = document.getElementById('reward-modal');
  const content = document.getElementById('reward-modal-content');
  let tier, quote, extra = '';

  if (total >= APP_CONFIG.rewards.tier4.min) {
    tier  = 'tier4';
    quote = getRewardQuote('tier4');
    extra = buildTier4Media();
    setTimeout(() => fullConfetti(), 300);
  } else if (total >= APP_CONFIG.rewards.tier3.min) {
    tier  = 'tier3';
    quote = getRewardQuote('tier3');
    extra = `<div class="choco-anim" id="choco-anim"></div>`;
    setTimeout(() => spawnChocolates(), 300);
  } else if (total >= APP_CONFIG.rewards.tier2.min) {
    tier  = 'tier2';
    quote = getRewardQuote('tier2');
  } else {
    tier  = 'tier1';
    quote = getRewardQuote('tier1');
  }

  const tierColors = { tier1: '#F97316', tier2: '#10B981', tier3: '#7C3AED', tier4: '#FBBF24' };
  const tierLabels = { tier1: '🔥 Keep Going!', tier2: '🏆 Great Work!', tier3: '🎉 Excellent!', tier4: '👑 LEGENDARY!' };

  content.innerHTML = `
    <div class="reward-tier-badge" style="background:${tierColors[tier]}20;color:${tierColors[tier]};">${tierLabels[tier]}</div>
    <div class="reward-score-big">${total}<span>pts</span></div>
    <div class="reward-quote-box">${quote}</div>
    ${extra}
    <button class="btn-reward-share" onclick="shareScore(${total})">🚀 Share Achievement!</button>
  `;
  modal.classList.add('open');
}

function buildTier4Media() {
  const m = APP_CONFIG.media;
  let html = '';
  html += `<audio id="reward-audio" src="${m.rewardSong}" style="display:none;"></audio>`;
  html += `<video id="reward-video" src="${m.rewardVideo}" controls style="width:100%;border-radius:12px;margin:0.8rem 0;display:none;"></video>`;
  html += `<img id="reward-image" src="${m.rewardImage}" style="width:100%;border-radius:12px;margin:0.4rem 0;display:none;" onerror="this.style.display='none'"/>`;
  html += `<div style="display:flex;gap:0.5rem;flex-wrap:wrap;justify-content:center;margin-top:0.5rem;">
    <button class="mini-btn" onclick="playRewardSong()">🎵 Play Song</button>
    <button class="mini-btn" onclick="playRewardVideo()">🎬 Play Video</button>
  </div>`;
  return html;
}

function playRewardSong() {
  const a = document.getElementById('reward-audio');
  if (a) { a.style.display = 'block'; a.play().catch(() => showToast('Audio file add pannunga first!')); }
}
function playRewardVideo() {
  const v = document.getElementById('reward-video');
  if (v) { v.style.display = 'block'; v.play().catch(() => showToast('Video file add pannunga first!')); }
}

function closeReward() { document.getElementById('reward-modal').classList.remove('open'); }

function shareScore(score) {
  const name = profile?.username || 'me';
  const text = `🏆 ${name} earned ${score} points on Daily Growth today!\nConsistency dhaan real success 🔥 #DailyGrowth`;
  if (navigator.share) { navigator.share({ title: 'Daily Growth', text }).catch(() => {}); }
  else { navigator.clipboard.writeText(text).then(() => showToast('Copied! 🚀')); }
}

// ── Friend Accountability ──────────────────────────────────
async function loadFriendCode() {
  if (!APP_CONFIG.friends.enabled) return;
  // Use user id first 8 chars as friend code
  friendCode = currentUser.id.slice(0, 8).toUpperCase();
  const el = document.getElementById('friend-code');
  if (el) el.textContent = friendCode;
}

async function compareFriend() {
  const rawCode = document.getElementById('friend-input')?.value.trim();
  if (!rawCode || rawCode.length < 8) { showToast('Valid code enter pannu! (8 chars)'); return; }
  const code = rawCode.toLowerCase(); // Bug 6 FIX: UUIDs are lowercase
  // Try prefix match
  let { data } = await sb.from('profiles').select('id, username, gender').ilike('id', code + '%');
  if (!data || !data.length) {
    // Fallback: scan all profiles
    const { data: all } = await sb.from('profiles').select('id,username,gender');
    const m = all?.find(p => p.id.replace(/-/g,'').slice(0,8) === code.replace(/-/g,'').slice(0,8));
    if (!m) { showToast('Friend not found! Check code 😅'); return; }
    const { base, bonus, total } = calcScore();
    const { data: fe } = await sb.from('daily_entries').select('score').eq('user_id',m.id).eq('entry_date',TODAY).single();
    showCompareModal(profile?.username||'You', total, m.username||'Friend', fe?.score||0); return;
  }
  if (!data || !data.length) { showToast('Friend not found! Check code 😅'); return; }
  const friend = data[0];
  const { data: entry } = await sb.from('daily_entries').select('score')
    .eq('user_id', friend.id).eq('entry_date', TODAY).single();
  const { base, bonus, total } = calcScore();
  const friendScore = entry?.score || 0;
  const myName = profile?.username || 'You';
  showCompareModal(myName, total, friend.username, friendScore);
}

function showCompareModal(myName, myScore, friendName, friendScore) {
  const modal = document.getElementById('compare-modal');
  const winner = myScore >= friendScore ? myName : friendName;
  document.getElementById('compare-content').innerHTML = `
    <h3 style="font-family:'Syne',sans-serif;font-size:1.2rem;margin-bottom:1rem;">🏆 Score Comparison</h3>
    <div class="compare-row">
      <div class="compare-card ${myScore >= friendScore ? 'winner' : ''}">
        <div class="compare-name">You (${myName})</div>
        <div class="compare-score">${myScore}</div>
        ${myScore >= friendScore ? '<div class="compare-crown">👑</div>' : ''}
      </div>
      <div class="compare-vs">VS</div>
      <div class="compare-card ${friendScore > myScore ? 'winner' : ''}">
        <div class="compare-name">${friendName}</div>
        <div class="compare-score">${friendScore}</div>
        ${friendScore > myScore ? '<div class="compare-crown">👑</div>' : ''}
      </div>
    </div>
    <p style="text-align:center;font-size:0.85rem;margin-top:1rem;color:var(--text-3);">
      ${winner} leads today! ${myScore >= friendScore ? 'Keep it up! 🔥' : 'Catch up! 💪'}
    </p>
  `;
  modal.classList.add('open');
}

function closeCompare() { document.getElementById('compare-modal').classList.remove('open'); }


function spawnConfetti() {
  ['⭐','🎉','🔥','💥','🎯','💪','🏆'].forEach((em, i) => {
    if (i > 5) return;
    const el = document.createElement('div');
    el.textContent = em;
    el.style.cssText = `position:fixed;top:${15+Math.random()*50}%;left:${10+Math.random()*80}%;font-size:${0.9+Math.random()}rem;pointer-events:none;z-index:9999;animation:cfall 1.3s ease forwards;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  });
}

function spawnChocolates() {
  const emojis = ['🍫','🍬','🍭','🎊','✨','🌟','🎉'];
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.cssText = `position:fixed;top:-5%;left:${Math.random()*100}%;font-size:${1+Math.random()*1.5}rem;pointer-events:none;z-index:9999;animation:chocolateFall ${1.5+Math.random()}s ease forwards;`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2500);
    }, i * 100);
  }
}

function fullConfetti() {
  const emojis = ['🏆','⭐','🎉','🔥','💥','🎯','💪','🌟','✅','🚀','👑','💎','🍫','🎊'];
  for (let i = 0; i < 35; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.cssText = `position:fixed;top:${Math.random()*30}%;left:${Math.random()*100}%;font-size:${1+Math.random()*1.5}rem;pointer-events:none;z-index:9999;animation:chocolateFall ${1.5+Math.random()*1}s ease forwards;`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2500);
    }, i * 80);
  }
}

// ── Avatars data ─────────────────────────────────────────────
const AVATARS = {
  male: [
    `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="30" fill="#4F46E5"/><circle cx="30" cy="22" r="10" fill="#fff" opacity=".9"/><ellipse cx="30" cy="48" rx="16" ry="10" fill="#fff" opacity=".9"/></svg>`,
    `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="30" fill="#0D9488"/><circle cx="30" cy="22" r="10" fill="#fff" opacity=".9"/><ellipse cx="30" cy="48" rx="16" ry="10" fill="#fff" opacity=".9"/><rect x="22" y="10" width="16" height="6" rx="3" fill="#fff" opacity=".7"/></svg>`,
    `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="30" fill="#7C3AED"/><circle cx="30" cy="22" r="10" fill="#fff" opacity=".9"/><ellipse cx="30" cy="48" rx="16" ry="10" fill="#fff" opacity=".9"/><rect x="18" y="30" width="24" height="4" rx="2" fill="#fff" opacity=".5"/></svg>`,
    `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="30" fill="#DC2626"/><circle cx="30" cy="22" r="10" fill="#fff" opacity=".9"/><ellipse cx="30" cy="48" rx="16" ry="10" fill="#fff" opacity=".9"/></svg>`,
    `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="30" fill="#B45309"/><circle cx="30" cy="22" r="10" fill="#fff" opacity=".9"/><ellipse cx="30" cy="48" rx="16" ry="10" fill="#fff" opacity=".9"/></svg>`,
  ],
  female: [
    `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="30" fill="#EC4899"/><circle cx="30" cy="22" r="10" fill="#fff" opacity=".9"/><ellipse cx="30" cy="48" rx="16" ry="10" fill="#fff" opacity=".9"/><path d="M18 20 Q14 30 18 38" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/><path d="M42 20 Q46 30 42 38" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/></svg>`,
    `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="30" fill="#7C3AED"/><circle cx="30" cy="22" r="10" fill="#fff" opacity=".9"/><ellipse cx="30" cy="48" rx="16" ry="10" fill="#fff" opacity=".9"/><circle cx="22" cy="18" r="4" fill="#F9A8D4" opacity=".8"/><circle cx="38" cy="18" r="4" fill="#F9A8D4" opacity=".8"/></svg>`,
    `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="30" fill="#0D9488"/><circle cx="30" cy="22" r="10" fill="#fff" opacity=".9"/><ellipse cx="30" cy="48" rx="16" ry="10" fill="#fff" opacity=".9"/><path d="M20 14 Q30 8 40 14" stroke="#fff" stroke-width="2.5" fill="none" opacity=".7"/></svg>`,
    `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="30" fill="#D97706"/><circle cx="30" cy="22" r="10" fill="#fff" opacity=".9"/><ellipse cx="30" cy="48" rx="16" ry="10" fill="#fff" opacity=".9"/></svg>`,
    `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="30" fill="#DB2777"/><circle cx="30" cy="22" r="10" fill="#fff" opacity=".9"/><ellipse cx="30" cy="48" rx="16" ry="10" fill="#fff" opacity=".9"/><circle cx="30" cy="10" r="5" fill="#FDE68A" opacity=".9"/></svg>`,
  ],
};

// ── Utils ───────────────────────────────────────────────────

// Bug 4 FIX
async function doLogout(){await sb.auth.signOut();window.location.href="index.html";}
