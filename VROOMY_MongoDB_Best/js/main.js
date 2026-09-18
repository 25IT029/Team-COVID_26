const API_BASE = '/api';
function formatDate(value){try{return new Date(value).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}catch{return value}}
function getStoredUser(){ try{return JSON.parse(localStorage.getItem('vroomyUser')||'null')}catch{return null} }
function getToken(){return localStorage.getItem('vroomyToken')||''}
async function api(path, options={}) {
  const headers = {...(options.headers||{})};
  if (options.body && !(options.body instanceof FormData)) headers['Content-Type']='application/json';
  const token=getToken(); if(token) headers.Authorization='Bearer '+token;
  const res=await fetch(API_BASE+path,{...options,headers});
  let data={}; try{data=await res.json()}catch{}
  if(!res.ok) throw new Error(data.message||'Request failed');
  return data;
}
function setSession(data){localStorage.setItem('vroomyToken',data.token);localStorage.setItem('vroomyUser',JSON.stringify(data.user))}
function clearSession(){localStorage.removeItem('vroomyToken');localStorage.removeItem('vroomyUser')}
function requireLogin(){if(!getToken()){window.location.href='login.html';return false}return true}
function showModal(title,message){const modal=document.getElementById('successModal');if(!modal)return;modal.querySelector('h2').textContent=title;modal.querySelector('p').textContent=message;modal.classList.add('show')}
function closeModal(){document.getElementById('successModal')?.classList.remove('show')}
document.addEventListener('DOMContentLoaded',()=>{
 const user=getStoredUser(), isAdmin=user?.role==='admin';
 if(location.pathname.endsWith('admin.html')&&!isAdmin){window.location.replace('login.html');return}
 const menu=document.querySelector('.menu-btn'),links=document.querySelector('.nav-links');
 menu?.addEventListener('click',()=>links.classList.toggle('open'));
 document.querySelectorAll('.brand').forEach(brand=>brand.innerHTML='VROO<span>MY</span>');
 document.title=document.title.replaceAll('VRUMY','VROOMY');
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;
 while(node=walker.nextNode())node.nodeValue=node.nodeValue.replaceAll('VRUMY','VROOMY');
 if(links&&!links.querySelector('[href="list-vehicle.html"]')){const a=document.createElement('a');a.href='list-vehicle.html';a.textContent='List & Earn';links.insertBefore(a,links.children[3]||null)}
 if(links&&isAdmin&&!links.querySelector('[href="admin.html"]')){const a=document.createElement('a');a.href='admin.html';a.textContent='Admin';links.append(a)}
 const exitAdmin=document.querySelector('[data-exit-admin]');exitAdmin?.addEventListener('click',()=>clearSession());
 const loginLink=document.querySelector('.nav-actions a[href="login.html"]');
 if(loginLink && user){loginLink.textContent='Log out';loginLink.href='#';loginLink.onclick=(e)=>{e.preventDefault();clearSession();location.href='index.html'}}
});
