function vehicleCard(v){
 return `<article class="vehicle-card"><div class="vehicle-image" style="height:175px;overflow:hidden;background:#eaf1f8"><img style="width:100%;height:100%;object-fit:cover;display:block" src="${v.image||''}" alt="${v.name}" loading="lazy"></div><div class="card-body"><div class="card-top"><div><h3 class="card-title">${v.name}</h3><div class="card-meta">${v.type} · 📍 ${v.location}</div></div><span class="rating">★ ${v.rating||5}</span></div><span class="pill">● Available</span><p class="card-price">₹${v.price} <small>/ hour</small></p><div class="card-actions"><a class="btn btn-outline" href="vehicle-details.html?id=${v.id}">Details</a><a class="btn btn-primary" href="vehicle-details.html?id=${v.id}">Book now</a></div></div></article>`;
}
async function renderVehicles(filters={}){
 const box=document.getElementById('vehicleResults'); if(!box)return;
 box.innerHTML='<div class="empty">Loading vehicles...</div>';
 try{
  const p=new URLSearchParams();
  if(filters.location)p.set('location',filters.location); if(filters.type)p.set('type',filters.type); if(filters.maxPrice)p.set('maxPrice',filters.maxPrice);
  const list=await api('/vehicles?'+p.toString());
  box.innerHTML=list.length?list.map(vehicleCard).join(''):'<div class="empty">No vehicles match those filters.</div>';
 }catch(e){box.innerHTML=`<div class="empty">${e.message}</div>`}
}
document.addEventListener('DOMContentLoaded',async()=>{
 const form=document.getElementById('rentalSearch');
 if(form) { await renderVehicles(); form.addEventListener('submit',e=>{e.preventDefault();renderVehicles({location:form.location.value.trim(),type:form.type.value,maxPrice:form.maxPrice.value})}); }
 const detail=document.getElementById('vehicleDetail');
 if(detail){
  const id=new URLSearchParams(location.search).get('id');
  if(!id){detail.innerHTML='<div class="empty">Vehicle ID is missing.</div>';return}
  try{
   const v=await api('/vehicles/'+encodeURIComponent(id));
   detail.dataset.vehicleId=v.id;
   detail.innerHTML=`<div class="detail-vehicle"><img style="width:100%;height:100%;object-fit:cover" src="${v.image||''}" alt="${v.name}"></div><span class="pill">● Available today</span><h1 class="section-title">${v.name}</h1><p>${v.type} · ${v.location} · Owner rating <span class="rating">★ ${v.rating||5}</span></p><hr><h3>Ready for your city journey</h3><p>Well maintained, verified and insured for a smooth ride. Pick up from the listed location and travel on your schedule.</p><div class="ride-details"><div><b>Price</b>₹${v.price}/hour</div><div><b>Fuel</b>Included</div><div><b>Minimum booking</b>1 hour</div><div><b>Cancellation</b>Free up to 1 hour</div></div>`;
   document.getElementById('hourlyPrice').value=v.price;
   document.getElementById('rentalBooking').dataset.vehicleId=v.id;
  }catch(e){detail.innerHTML=`<div class="empty">${e.message}</div>`}
 }
});
function calculateRental(){
 const f=document.getElementById('rentalBooking'); if(!f)return;
 const start=new Date(f.startDate.value+'T'+f.startTime.value),end=new Date(f.endDate.value+'T'+f.endTime.value),price=+document.getElementById('hourlyPrice').value,km=parseInt(f.estimatedKm?.value||'0',10);
 if(Number.isNaN(start.getTime())||Number.isNaN(end.getTime())||end<=start)return;
 const hours=Math.max(1,Math.ceil((end-start)/36e5)),extraKm=hours>=24?Math.max(0,km-300):0,total=hours*price+extraKm*10;
 document.getElementById('rentalTotal').innerHTML='<span>'+hours+' hour'+(hours>1?'s':'')+' × ₹'+price+(extraKm?' + extra km ₹'+(extraKm*10):'')+'</span><strong>₹'+total+'</strong>';
 document.getElementById('rentalTotal').dataset.total=total;
}
async function confirmRental(e){
 e.preventDefault();
 if(!requireLogin())return;
 calculateRental();
 const f=e.target,total=+document.getElementById('rentalTotal').dataset.total,vehicleId=f.dataset.vehicleId;
 if(!vehicleId){alert('Vehicle information is missing. Please reopen the vehicle from Rent a Vehicle.');return}
 if(!total){alert('Please select a valid start and end time.');return}
 try{
  const b=await api('/bookings',{method:'POST',body:JSON.stringify({vehicleId,startDate:f.startDate.value+'T'+f.startTime.value,endDate:f.endDate.value+'T'+f.endTime.value,estimatedKm:Number(f.estimatedKm.value)||0})});
  showModal('Booking confirmed!',`Your vehicle is reserved. Booking ID: ${b.id}`);
 }catch(err){alert(err.message)}
}
