// auth.js — ALL 8 BUGS FIXED
// Fix 4: doLogout global  Fix 7: API counter correct IDs  Fix 8: girls default theme

const _AK='dg_api_cnt',_AD='dg_api_day',API_LIMIT=20;

function getApiCount(){const t=new Date().toISOString().slice(0,10);if(localStorage.getItem(_AD)!==t){localStorage.setItem(_AD,t);localStorage.setItem(_AK,'0');return 0;}return parseInt(localStorage.getItem(_AK)||'0');}
function addApiCall(){const c=getApiCount()+1;localStorage.setItem(_AK,String(c));updateApiUI();return c;}
function updateApiUI(){
  const c=getApiCount();
  const badge=document.getElementById('api-badge');
  const lbl=document.getElementById('api-num');
  if(lbl)lbl.textContent=c+'/'+API_LIMIT;
  if(badge){badge.className='api-badge';badge.classList.add(c>=API_LIMIT?'over':c>=Math.floor(API_LIMIT*.7)?'warn':'ok');}
}

function applyTheme(t){
  document.documentElement.setAttribute('data-color',t);
  localStorage.setItem('dg_theme',t);
  document.querySelectorAll('.sb-theme-btn').forEach(b=>b.classList.toggle('active',(b.getAttribute('onclick')||'').includes("'"+t+"'")));
  document.querySelectorAll('.tdot').forEach(d=>d.classList.toggle('active',d.classList.contains(t)));
}
function toggleDark(){
  const dark=document.documentElement.getAttribute('data-theme')==='dark';
  document.documentElement.setAttribute('data-theme',dark?'light':'dark');
  localStorage.setItem('dg_dark',dark?'':'1');
  const btn=document.getElementById('dark-btn');
  if(btn)btn.textContent=dark?'🌙':'☀️';
}
function initAppTheme(){
  const t=localStorage.getItem('dg_theme')||'girls';
  const dark=localStorage.getItem('dg_dark')==='1';
  document.documentElement.setAttribute('data-color',t);
  if(dark)document.documentElement.setAttribute('data-theme','dark');
  else document.documentElement.removeAttribute('data-theme');
  const btn=document.getElementById('dark-btn');
  if(btn)btn.textContent=dark?'☀️':'🌙';
  document.querySelectorAll('.sb-theme-btn').forEach(b=>b.classList.toggle('active',(b.getAttribute('onclick')||'').includes("'"+t+"'")));
  document.querySelectorAll('.tdot').forEach(d=>d.classList.toggle('active',d.classList.contains(t)));
  updateApiUI();
}
function toggleSidebar(){const sb=document.getElementById('sidebar');if(!sb)return;if(window.innerWidth<=768)sb.classList.toggle('open');else sb.classList.toggle('collapsed');}

// Fix 4: ONE global doLogout — always works
async function doLogout(){try{await sb.auth.signOut();}catch(e){console.warn(e);}window.location.href='index.html';}

function showToast(msg){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600);}

// Login page
window.addEventListener('DOMContentLoaded',async()=>{
  initAppTheme();
  if(!document.getElementById('login-form'))return;
  const{data:{session}}=await sb.auth.getSession();
  if(session){window.location.href='dashboard.html';return;}
  document.getElementById('login-email')?.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('login-pass')?.focus();});
  document.getElementById('login-pass')?.addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
  document.getElementById('reg-pass')?.addEventListener('keydown',e=>{if(e.key==='Enter')doRegister();});
  document.querySelectorAll('.eye-btn').forEach(btn=>{btn.addEventListener('click',()=>{const inp=document.getElementById(btn.dataset.target);if(!inp)return;inp.type=inp.type==='password'?'text':'password';btn.textContent=inp.type==='password'?'👁️':'🙈';});});
  document.querySelectorAll('.gender-btn').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.gender-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');});});
});

function switchTab(tab){
  const isL=tab==='login';
  document.getElementById('login-form').style.display=isL?'block':'none';
  document.getElementById('register-form').style.display=isL?'none':'block';
  document.getElementById('tab-login').classList.toggle('active',isL);
  document.getElementById('tab-reg').classList.toggle('active',!isL);
  document.querySelectorAll('.field-err').forEach(e=>{e.textContent='';e.style.display='none';});
}
async function doLogin(){
  const email=document.getElementById('login-email')?.value.trim();
  const pass=document.getElementById('login-pass')?.value.trim();
  if(!email){_err('login-err','📧 Email enter pannu!');return;}
  if(!pass){_err('login-err','Password venum!');return;}
  _btn('login-btn',true,'⏳ Logging in...');
  const{error}=await sb.auth.signInWithPassword({email,password:pass});
  if(error){_btn('login-btn',false,'🚀 Login');_err('login-err','Wrong email or password! 😤');document.querySelector('.auth-card')?.classList.add('shake');setTimeout(()=>document.querySelector('.auth-card')?.classList.remove('shake'),500);return;}
  _btn('login-btn',false,'✓ Done!');setTimeout(()=>window.location.href='dashboard.html',500);
}
async function doRegister(){
  const username=document.getElementById('reg-username')?.value.trim();
  const email=document.getElementById('reg-email')?.value.trim();
  const pass=document.getElementById('reg-pass')?.value.trim();
  const gender=document.querySelector('.gender-btn.active')?.dataset.gender||'female';
  if(!username){_err('reg-err','Username venum!');return;}
  if(!email){_err('reg-err','Email venum!');return;}
  if(pass.length<6){_err('reg-err','Password min 6 chars!');return;}
  _btn('reg-btn',true,'⏳ Creating...');
  const{data,error}=await sb.auth.signUp({email,password:pass,options:{data:{username,gender}}});
  if(error){_btn('reg-btn',false,'🌟 Create Account');_err('reg-err',error.message);return;}
  if(data.user)await sb.from('profiles').upsert({id:data.user.id,username,gender},{onConflict:'id'});
  _btn('reg-btn',false,'✓ Done!');
  const ok=document.getElementById('reg-ok');if(ok){ok.textContent='✓ Account created! Login pannunga 🚀';ok.style.display='block';ok.classList.add('ok');}
  setTimeout(()=>switchTab('login'),1500);
}
function _err(id,msg){const e=document.getElementById(id);if(e){e.textContent=msg;e.style.display='block';}}
function _btn(id,d,t){const b=document.getElementById(id);if(b){b.disabled=d;b.textContent=t;}}
