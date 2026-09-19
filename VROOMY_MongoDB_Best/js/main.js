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
 const joinLink=document.querySelector('.nav-actions a[href="register.html"]');
 if(joinLink && user) joinLink.style.display='none';
});

document.addEventListener('DOMContentLoaded', () => {
  const mapElement = document.getElementById('city-map');
  if (!mapElement || typeof L === 'undefined') return;

  const map = L.map('city-map').setView([20.5937, 78.9629], 5);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const mapListings = [
    { position: [28.6139, 77.2090], title: 'Honda Activa', details: 'Scooter rental • ₹250/day', type: 'Rental' },
    { position: [19.0760, 72.8777], title: 'Mumbai to Pune', details: 'Ride share • ₹450/seat', type: 'Ride' },
    { position: [12.9716, 77.5946], title: 'Hyundai i20', details: 'Car rental • ₹1,200/day', type: 'Rental' }
  ];

  mapListings.forEach((listing) => {
    L.marker(listing.position)
      .addTo(map)
      .bindPopup(`<b>${listing.title}</b><br>${listing.details}<br><small>${listing.type}</small>`);
  });

  const cityCoordinates = {
    delhi: [28.6139, 77.2090],
    mumbai: [19.0760, 72.8777],
    bengaluru: [12.9716, 77.5946],
    bangalore: [12.9716, 77.5946],
    pune: [18.5204, 73.8567],
    hyderabad: [17.3850, 78.4867],
    chennai: [13.0827, 80.2707],
    kolkata: [22.5726, 88.3639],
    ahmedabad: [23.0225, 72.5714]
  };

  async function showVehicleListings() {
    try {
      const vehicles = await api('/vehicles');
      vehicles.forEach((vehicle) => {
        const coordinates = cityCoordinates[vehicle.location.trim().toLowerCase()];
        if (!coordinates) return;

        L.marker(coordinates)
          .addTo(map)
          .bindPopup(`<b>${vehicle.name}</b><br>${vehicle.type} rental • ₹${vehicle.price}/day<br><small>${vehicle.location}</small>`);
      });
    } catch (error) {
      console.error('Could not load vehicle map markers:', error.message);
    }
  }

  async function showRideListings() {
    try {
      const rides = await api('/rides');
      rides.forEach((ride) => {
        const departureCity = ride.from.split(',')[0].trim().toLowerCase();
        const coordinates = cityCoordinates[departureCity];
        if (!coordinates) return;

        L.marker(coordinates)
          .addTo(map)
          .bindPopup(`<b>${ride.from} → ${ride.to}</b><br>Driver: ${ride.driver}<br>₹${ride.price}/seat • ${ride.seats} seats available`);
      });
    } catch (error) {
      console.error('Could not load ride map markers:', error.message);
    }
  }

  showVehicleListings();
  showRideListings();
});
