const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
async function renderOwnerVehicles(){
 const list=document.getElementById('ownerVehicleList');if(!list)return;
 if(!requireLogin())return;
 try{
  const vehicles=await api('/vehicles/mine');
  list.innerHTML=vehicles.length?vehicles.map(v=>`<article class="vehicle-card"><div class="card-body"><span class="pill">● ${v.verified?'Verified':'Pending verification'}</span><h3 class="card-title" style="margin-top:12px">${escapeHtml(v.name)}</h3><div class="card-meta">${escapeHtml(v.type)} · 📍 ${escapeHtml(v.location)}</div><p class="card-price">₹${v.price} <small>/ hour</small></p><button class="btn btn-outline" type="button" data-delete-vehicle="${v.id}" style="width:100%;color:#b42318;border-color:#f0b7b2">Delete vehicle</button></div></article>`).join(''):'<div class="empty">You have not registered any vehicles yet.</div>';
 }catch(e){list.innerHTML=`<div class="empty">${e.message}</div>`}
}
document.addEventListener('DOMContentLoaded',()=>{
 const form=document.getElementById('vehicleListing');
 form?.addEventListener('submit',async event=>{
  event.preventDefault(); if(!requireLogin())return;
  const f=event.target;
  try{
   const item=await api('/vehicles',{method:'POST',body:JSON.stringify({
    name:f.name.value.trim(),type:f.type.value,location:f.location.value.trim(),price:Number(f.price.value),
    available:f.available.value,numberPlate:f.numberPlate?.value.trim()||'',
    ownershipPaper:f.ownershipPaper?.files[0]?.name||'',insurance:f.insurance?.files[0]?.name||'',
    puc:f.puc?.files[0]?.name||'',vehiclePicture:f.vehiclePicture?.files[0]?.name||''
   })});
   await renderOwnerVehicles();showModal('Vehicle registered successfully!',`${item.name} is now listed in MongoDB.`);f.reset();
  }catch(e){alert(e.message)}
 });
 document.getElementById('ownerVehicleList')?.addEventListener('click',async event=>{
  const button=event.target.closest('[data-delete-vehicle]');if(!button)return;
  try{await api('/vehicles/'+button.dataset.deleteVehicle,{method:'DELETE'});await renderOwnerVehicles();showModal('Vehicle deleted','The vehicle was removed from MongoDB.')}catch(e){alert(e.message)}
 });
 renderOwnerVehicles();
});
