// profile.js — ALL BUGS FIXED
// Fix 5: 3 female avatars + 1 male, no "View Profile" text
// Fix: Upload opens correctly, Edit info tab works

let _cropper=null;

const AVATARS={
  female:[
    `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="30" fill="#EC4899"/><circle cx="30" cy="22" r="10" fill="#fff" opacity=".9"/><ellipse cx="30" cy="48" rx="16" ry="10" fill="#fff" opacity=".9"/><path d="M18 20Q14 30 18 38" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/><path d="M42 20Q46 30 42 38" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/></svg>`,
    `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="30" fill="#8B5CF6"/><circle cx="30" cy="22" r="10" fill="#fff" opacity=".9"/><ellipse cx="30" cy="48" rx="16" ry="10" fill="#fff" opacity=".9"/><circle cx="22" cy="18" r="4" fill="#F9A8D4" opacity=".8"/><circle cx="38" cy="18" r="4" fill="#F9A8D4" opacity=".8"/></svg>`,
    `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="30" fill="#DB2777"/><circle cx="30" cy="22" r="10" fill="#fff" opacity=".9"/><ellipse cx="30" cy="48" rx="16" ry="10" fill="#fff" opacity=".9"/><circle cx="30" cy="10" r="5" fill="#FDE68A" opacity=".9"/></svg>`,
  ],
  male:[
    `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="30" fill="#4F46E5"/><circle cx="30" cy="22" r="10" fill="#fff" opacity=".9"/><ellipse cx="30" cy="48" rx="16" ry="10" fill="#fff" opacity=".9"/></svg>`,
  ]
};

function renderAvatarDisplay(){
  ['sb-avatar','avatar-img'].forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    const saved=localStorage.getItem('dg_avatar');
    if(saved){el.style.backgroundImage=`url('${saved}')`;el.style.backgroundSize='cover';el.style.backgroundPosition='center';el.innerHTML='';}
    else{
      const g=window.dgProfile?.gender||'female';
      const list=AVATARS[g]||AVATARS.female;
      const idx=Math.min(parseInt(localStorage.getItem('dg_avIdx')||'0'),list.length-1);
      el.innerHTML=list[idx];el.style.backgroundImage='';
    }
  });
}

function openProfileModal(){
  const modal=document.getElementById('profile-modal');
  if(!modal){console.error('profile-modal not found');return;}
  modal.classList.add('open');
  setTimeout(()=>{_showTab('avatar');_buildGrid();_fillInfo();},60);
}
function closeProfileModal(){document.getElementById('profile-modal')?.classList.remove('open');_cancelCrop();}

function _showTab(tab){
  ['avatar','info'].forEach(t=>{
    const div=document.getElementById('ptab-body-'+t);
    const btn=document.getElementById('ptab-'+t);
    if(div)div.style.display=t===tab?'block':'none';
    if(btn)btn.classList.toggle('active',t===tab);
  });
  if(tab==='info')_fillInfo();
}
window.switchPTab=_showTab;

function _buildGrid(){
  const grid=document.getElementById('av-grid');if(!grid)return;
  const g=window.dgProfile?.gender||'female';
  const list=AVATARS[g]||AVATARS.female;
  const cur=parseInt(localStorage.getItem('dg_avIdx')||'0');
  const hasPic=!!localStorage.getItem('dg_avatar');
  grid.innerHTML=list.map((svg,i)=>`<div class="av-opt ${!hasPic&&cur===i?'sel':''}" onclick="selectAvatar(${i})">${svg}</div>`).join('');
}
function selectAvatar(idx){
  localStorage.setItem('dg_avIdx',idx);localStorage.removeItem('dg_avatar');
  document.querySelectorAll('.av-opt').forEach((el,i)=>el.classList.toggle('sel',i===idx));
  renderAvatarDisplay();showToast('Avatar updated! 🎨');
}

function triggerUpload(){document.getElementById('avatar-file-input')?.click();}

function handleAvatarUpload(input){
  const file=input.files?.[0];if(!file)return;
  _cancelCrop();
  const reader=new FileReader();
  reader.onload=ev=>{
    const cz=document.getElementById('crop-zone');
    const img=document.getElementById('crop-img');
    if(!cz||!img){_saveDirect(ev.target.result);return;}
    // Ensure avatar tab visible
    const ab=document.getElementById('ptab-body-avatar');
    const ib=document.getElementById('ptab-body-info');
    if(ab)ab.style.display='block';if(ib)ib.style.display='none';
    cz.style.display='block';img.src=ev.target.result;
    img.onload=()=>{
      if(typeof Cropper!=='undefined'){
        try{_cropper=new Cropper(img,{aspectRatio:1,viewMode:1,dragMode:'move',autoCropArea:.85,responsive:true,movable:true,zoomable:true,background:false});}
        catch(e){_saveDirect(ev.target.result);}
      }else{_saveDirect(ev.target.result);}
    };
  };
  reader.readAsDataURL(file);input.value='';
}
function _saveDirect(dataUrl){localStorage.setItem('dg_avatar',dataUrl);localStorage.removeItem('dg_avIdx');renderAvatarDisplay();_cancelCrop();showToast('Photo saved! 📷');}
function confirmCrop(){if(!_cropper){showToast('No cropper!');return;}try{const c=_cropper.getCroppedCanvas({width:200,height:200});_saveDirect(c.toDataURL('image/jpeg',.88));showToast('Cropped & saved! ✂️');}catch(e){showToast('Crop error: '+e.message);_cancelCrop();}}
function _cancelCrop(){if(_cropper){try{_cropper.destroy();}catch(e){}finally{_cropper=null;}}const cz=document.getElementById('crop-zone');if(cz)cz.style.display='none';const ci=document.getElementById('crop-img');if(ci){ci.src='';ci.onload=null;}}
function cancelCrop(){_cancelCrop();}

function _fillInfo(){
  const u=document.getElementById('edit-uname');const e=document.getElementById('edit-email');const p=document.getElementById('edit-pass');
  if(u)u.value=window.dgProfile?.username||'';if(e)e.value=window.dgUser?.email||'';if(p)p.value='';
  const g=window.dgProfile?.gender||'female';
  document.querySelectorAll('#ptab-body-info .gender-btn').forEach(b=>b.classList.toggle('active',b.dataset.gender===g));
}
function selectGender(g){document.querySelectorAll('#ptab-body-info .gender-btn').forEach(b=>b.classList.toggle('active',b.dataset.gender===g));}
function toggleEditPass(){const i=document.getElementById('edit-pass');if(i)i.type=i.type==='password'?'text':'password';}

async function saveProfileInfo(){
  const username=document.getElementById('edit-uname')?.value.trim();
  const email=document.getElementById('edit-email')?.value.trim();
  const password=document.getElementById('edit-pass')?.value.trim();
  const gender=document.querySelector('#ptab-body-info .gender-btn.active')?.dataset?.gender||window.dgProfile?.gender||'female';
  const errEl=document.getElementById('prof-err');const okEl=document.getElementById('prof-ok');
  if(errEl){errEl.textContent='';errEl.style.display='none';}if(okEl){okEl.textContent='';okEl.style.display='none';}
  if(!username){_pErr('Username venum!');return;}
  const btn=document.getElementById('btn-save-prof');if(btn){btn.disabled=true;btn.textContent='⏳ Saving...';}
  try{
    const au={};
    if(email&&email!==window.dgUser?.email)au.email=email;
    if(password&&password.length>=6)au.password=password;
    if(Object.keys(au).length){const{error:ae}=await sb.auth.updateUser(au);if(ae){_pErr(ae.message);return;}}
    const{error:de}=await sb.from('profiles').upsert({id:window.dgUser?.id,username,gender},{onConflict:'id'});
    if(de){_pErr(de.message);return;}
    if(window.dgProfile){window.dgProfile.username=username;window.dgProfile.gender=gender;}
    if(typeof renderGreeting==='function')renderGreeting();
    if(okEl){okEl.textContent=email&&email!==window.dgUser?.email?'✓ Saved! Check email for verification.':'✓ Profile updated!';okEl.style.display='block';okEl.classList.add('ok');}
    showToast('Profile saved! 🎉');
  }catch(e){_pErr(e.message||'Error!');}
  finally{if(btn){btn.disabled=false;btn.textContent='💾 Save Changes';}}
}
function _pErr(msg){const el=document.getElementById('prof-err');if(el){el.textContent=msg;el.style.display='block';}}
