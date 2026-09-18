document.addEventListener('DOMContentLoaded',async()=>{
 const el=document.getElementById('bookingList');if(!el)return;
 if(!requireLogin())return;
 let list=[];
 try{list=await api('/bookings/my')}catch(e){el.innerHTML=`<div class="empty">${e.message}</div>`;return}
 const render=status=>{
  const visible=status==='Upcoming'?list.filter(x=>['confirmed','pending'].includes(x.status)):list.filter(x=>x.status===status.toLowerCase());
  el.innerHTML=visible.length?visible.map(x=>`<article class="booking-row"><div><span class="pill">Rental</span><h3 style="margin:8px 0 4px">${x.vehicleId?.name||x.vehicleId?.type||'Vehicle booking'}</h3><span class="card-meta">${new Date(x.startDate).toLocaleString()} · ${x.hours} hour(s) · ${x.id}</span></div><div style="text-align:right"><b>₹${x.totalAmount}</b><br><span class="status">${x.status}</span></div></article>`).join(''):'<div class="empty">No '+status.toLowerCase()+' bookings yet.</div>';
 };
 render('Upcoming');
 document.querySelectorAll('.tab').forEach(tab=>tab.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));tab.classList.add('active');render(tab.textContent)}));
});
