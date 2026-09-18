document.addEventListener('DOMContentLoaded',async()=>{
 const user=getStoredUser();if(user?.role!=='admin')return;
 try{
  const s=await api('/admin/summary');
  const stat=(label,value,note)=>`<article class="vehicle-card"><div class="card-body"><span class="eyebrow">${label}</span><h2 style="font-size:2.25rem;margin:12px 0">${value}</h2><p style="margin:0">${note}</p></div></article>`;
  document.getElementById('adminStats').innerHTML=stat('Total vehicles',s.vehicles,'MongoDB vehicle inventory')+stat('Shared rides',s.rides,'Published ride offers')+stat('Bookings',s.bookings,'Stored rental bookings')+stat('Users',s.users,`${s.owners} vehicle owners`);
  const vs=await api('/vehicles?status=all');document.getElementById('adminVehicles').innerHTML=vs.map(v=>`<p style="padding:11px 0;border-bottom:1px solid #e5ebf4;margin:0"><b>${v.name}</b><br><small>${v.type} · ${v.location} · ₹${v.price}/hour</small></p>`).join('')||'<p>No vehicles.</p>';
  const rs=await api('/rides');document.getElementById('adminRides').innerHTML=rs.map(r=>`<p style="padding:11px 0;border-bottom:1px solid #e5ebf4;margin:0"><b>${r.from} → ${r.to}</b><br><small>${r.driver} · ${r.seats} seats · ₹${r.price}/seat</small></p>`).join('')||'<p>No rides.</p>';
  const bs=await api('/bookings/my');document.getElementById('adminBookings').innerHTML=bs.map(b=>`<article class="booking-row"><div><span class="pill">Rental</span><h3 style="margin:8px 0 0">${b.vehicleId?.name||'Vehicle'}</h3></div><div style="text-align:right"><b>₹${b.totalAmount}</b><br><span class="status">${b.status}</span></div></article>`).join('')||'<p>No bookings.</p>';
 }catch(e){document.getElementById('adminStats').innerHTML=`<div class="empty">${e.message}</div>`}
});
