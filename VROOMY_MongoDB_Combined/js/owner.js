const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

async function fileToDataUrl(file){
 if(!file)return '';
 if(file.size>4*1024*1024)throw new Error('Vehicle photo must be 4 MB or smaller.');
 return await new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onload=()=>resolve(reader.result);
  reader.onerror=()=>reject(new Error('Could not read vehicle photo.'));
  reader.readAsDataURL(file);
 });
}

async function renderOwnerVehicles(){
 const list=document.getElementById('ownerVehicleList');if(!list)return;
 if(!requireLogin())return;
 const current=getStoredUser();
 if(current && !['owner','admin'].includes(current.role)){
   list.innerHTML='<div class="empty">Your account is a renter account. Log in with an Owner account to list a vehicle.</div>';
   return;
 }
 try{
  const vehicles=await api('/vehicles/mine');
  list.innerHTML=vehicles.length?vehicles.map(v=>`<article class="vehicle-card">
    <div class="vehicle-image" style="height:175px;overflow:hidden;background:#eaf1f8"><img src="${v.image||''}" alt="${escapeHtml(v.name)}" style="width:100%;height:100%;object-fit:cover"></div>
    <div class="card-body"><span class="pill">● ${v.verified?'Verified':(v.status==='rejected'?'Rejected':'Pending verification')}</span><p style="font-size:.82rem;color:#64748b">${escapeHtml(v.verificationNote||'')}</p>
    <h3 class="card-title" style="margin-top:12px">${escapeHtml(v.name)}</h3>
    <div class="card-meta">${escapeHtml(v.type)} · 📍 ${escapeHtml(v.location)}</div>
    <p class="card-price">₹${v.price} <small>/ hour</small></p>
    <button class="btn btn-outline" type="button" data-delete-vehicle="${v.id}" style="width:100%;color:#b42318;border-color:#f0b7b2">Delete vehicle</button></div></article>`).join(''):'<div class="empty">You have not registered any vehicles yet.</div>';
 }catch(e){list.innerHTML=`<div class="empty">${escapeHtml(e.message)}</div>`}
}

async function renderOwnerDashboard(){
 const box=document.getElementById('ownerDashboard');if(!box)return;
 const current=getStoredUser();
 if(!current || !['owner','admin'].includes(current.role)){box.innerHTML='';return;}
 try{
  const s=await api('/bookings/owner/summary');
  document.getElementById('ownerStats').innerHTML=[
   ['Net earnings','₹'+Number(s.totalEarnings||0).toLocaleString('en-IN'),'Your 90% owner share after VROOMY commission'],['Gross revenue','₹'+Number(s.grossRevenue||0).toLocaleString('en-IN'),'Total paid booking value'],['VROOMY commission','₹'+Number(s.commission||0).toLocaleString('en-IN'),'10% platform commission'],
   ['Paid bookings',s.paidBookings,'Successfully paid rentals'],
   ['Pending payments','₹'+Number(s.pendingPayments||0).toLocaleString('en-IN'),`${s.pendingPaymentCount||0} payment(s) awaiting`],
   ['Active rentals',s.activeBookings,`${s.rentedVehicles||0} vehicle(s) with paid history`]
  ].map(x=>`<article class="vehicle-card"><div class="card-body"><span class="eyebrow">${x[0]}</span><h2 style="font-size:2rem;margin:12px 0">${x[1]}</h2><p style="margin:0">${x[2]}</p></div></article>`).join('');

  document.getElementById('ownerRevenue').innerHTML=s.revenuePerVehicle?.length
   ? s.revenuePerVehicle.map(v=>`<p style="padding:12px 0;border-bottom:1px solid #e5ebf4;margin:0"><b>${escapeHtml(v.vehicleName)}</b><br><small>${v.paidBookings} paid booking(s) · ₹${Number(v.earnings).toLocaleString('en-IN')}</small></p>`).join('')
   : '<p>No paid bookings yet.</p>';

  document.getElementById('ownerRecent').innerHTML=s.recent?.length
   ? s.recent.map(b=>`<p style="padding:12px 0;border-bottom:1px solid #e5ebf4;margin:0"><b>${escapeHtml(b.vehicleId?.name||'Vehicle')}</b><br><small>${escapeHtml(b.userId?.name||'Renter')} · ₹${Number(b.totalAmount||0).toLocaleString('en-IN')} · ${escapeHtml(b.paymentStatus||b.status)}</small></p>`).join('')
   : '<p>No bookings yet.</p>';
 }catch(e){box.innerHTML=`<div class="empty">${escapeHtml(e.message)}</div>`}
}

document.addEventListener('DOMContentLoaded',()=>{
 const form=document.getElementById('vehicleListing');
 form?.addEventListener('submit',async event=>{
  event.preventDefault(); if(!requireLogin())return;
  const current=getStoredUser();
  if(current && !['owner','admin'].includes(current.role)){alert('Please log in with an Owner account to list a vehicle.');return;}
  const f=event.target;
  try{
   const picture=await fileToDataUrl(f.vehiclePicture?.files[0]);
   const item=await api('/vehicles',{method:'POST',body:JSON.stringify({
    name:f.name.value.trim(),type:f.type.value,location:f.location.value.trim(),price:Number(f.price.value),
    available:f.available.value,numberPlate:f.numberPlate?.value.trim()||'',
    ownershipPaper:f.ownershipPaper?.files[0]?.name||'',
    insurance:f.insurance?.files[0]?.name||'',
    puc:f.puc?.files[0]?.name||'',
    vehiclePicture:picture
   })});
   await renderOwnerVehicles();await renderOwnerDashboard();
   showModal('Vehicle registered successfully!',`${item.name} is saved with its own uploaded photo. It is pending admin verification.`);
   f.reset();
  }catch(e){alert(e.message)}
 });
 document.getElementById('ownerVehicleList')?.addEventListener('click',async event=>{
  const button=event.target.closest('[data-delete-vehicle]');if(!button)return;
  if(!confirm('Delete this vehicle?'))return;
  try{await api('/vehicles/'+button.dataset.deleteVehicle,{method:'DELETE'});await renderOwnerVehicles();await renderOwnerDashboard();showModal('Vehicle deleted','The vehicle was removed from MongoDB.')}catch(e){alert(e.message)}
 });
 renderOwnerVehicles();renderOwnerDashboard();
});
