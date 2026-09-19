const API_BASE = '/api';

function formatDate(v){
  try{return new Date(v).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
  catch{return v}
}
function getStoredUser(){try{return JSON.parse(localStorage.getItem('vroomyUser')||'null')}catch{return null}}
function getToken(){return localStorage.getItem('vroomyToken')||''}
function setSession(d){localStorage.setItem('vroomyToken',d.token);localStorage.setItem('vroomyUser',JSON.stringify(d.user))}
function clearSession(){localStorage.removeItem('vroomyToken');localStorage.removeItem('vroomyUser')}
function requireLogin(){if(!getToken()){location.href='login.html';return false}return true}
function showModal(t,m){const x=document.getElementById('successModal');if(!x)return;x.querySelector('h2').textContent=t;x.querySelector('p').textContent=m;x.classList.add('show')}
function closeModal(){document.getElementById('successModal')?.classList.remove('show')}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

async function api(path,options={}){
  const headers={...(options.headers||{})};
  if(options.body && !(options.body instanceof FormData)) headers['Content-Type']='application/json';
  const token=getToken();
  if(token) headers.Authorization='Bearer '+token;
  let res;
  try{
    res=await fetch(API_BASE+path,{...options,headers});
  }catch(e){
    throw new Error('Cannot reach VROOMY server. Run "cd backend" and "npm start" on the host computer, then open the site through http://HOST-IP:5000.');
  }
  let data={};try{data=await res.json()}catch{}
  if(!res.ok) throw new Error(data.message||`Request failed (${res.status})`);
  return data;
}

async function downloadAgreement(id){
  try{
    const r=await fetch(API_BASE+'/bookings/'+encodeURIComponent(id)+'/agreement',{headers:{Authorization:'Bearer '+getToken()}});
    if(!r.ok){let d={};try{d=await r.json()}catch{}throw new Error(d.message||'Could not download agreement.')}
    const blob=await r.blob(),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='VROOMY-Agreement-'+id+'.pdf';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  }catch(e){alert(e.message)}
}

function updateNavbar(){
  const nav=document.querySelector('.nav');
  const links=document.querySelector('.nav-links');
  const actions=document.querySelector('.nav-actions');
  if(!nav)return;
  const user=getStoredUser();
  document.querySelectorAll('.brand').forEach(b=>b.innerHTML='VROO<span>MY</span>');
  document.title=document.title.replaceAll('VRUMY','VROOMY');

  if(links){
    if(user?.role==='owner' || user?.role==='admin'){
      if(!links.querySelector('[href="list-vehicle.html"]')){
        const a=document.createElement('a');a.href='list-vehicle.html';a.textContent='List & Earn';links.appendChild(a);
      }
    }
    if(user?.role==='admin' && !links.querySelector('[href="admin.html"]')){
      const a=document.createElement('a');a.href='admin.html';a.textContent='Admin';a.className='admin-nav-link';links.appendChild(a);
    }
  }

  if(actions){
    actions.innerHTML='';
    if(user){
      const profile=document.createElement('a');
      profile.href='profile.html';
      profile.className='user-nav';
      profile.innerHTML=`<span class="user-avatar">${escapeHtml((user.name||'V').slice(0,1).toUpperCase())}</span><span class="user-nav-name">${escapeHtml(user.name||'User')}</span>`;
      actions.appendChild(profile);
      if(user.role==='admin'){
        const admin=document.createElement('a');admin.href='admin.html';admin.className='btn btn-outline';admin.textContent='Admin';actions.appendChild(admin);
      }
      const logout=document.createElement('a');logout.href='#';logout.className='btn btn-primary';logout.textContent='Log out';
      logout.onclick=e=>{e.preventDefault();clearSession();location.href='index.html'};
      actions.appendChild(logout);
    }else{
      const login=document.createElement('a');login.href='login.html';login.textContent='Log in';actions.appendChild(login);
      const join=document.createElement('a');join.href='register.html';join.className='btn btn-primary';join.textContent='Join VROOMY';actions.appendChild(join);
    }
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  const user=getStoredUser();
  if(location.pathname.endsWith('admin.html') && user?.role!=='admin'){
    location.replace('login.html');return;
  }
  const menu=document.querySelector('.menu-btn'),links=document.querySelector('.nav-links');
  menu?.addEventListener('click',()=>links?.classList.toggle('open'));
  updateNavbar();
});
