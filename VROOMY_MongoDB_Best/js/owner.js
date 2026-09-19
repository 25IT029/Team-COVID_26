const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

// Compress an image File to a base64 JPEG string (max 800x600, 70% quality)
async function compressImageToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const MAX_W = 800, MAX_H = 600;
        let w = img.width, h = img.height;
        if (w > MAX_W) { h = Math.round(h * MAX_W / w); w = MAX_W; }
        if (h > MAX_H) { w = Math.round(w * MAX_H / h); h = MAX_H; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function renderOwnerEarnings() {
  const el = document.getElementById('ownerEarnings');
  if (!el || !getToken()) return;
  try {
    const data = await api('/vehicles/earnings');
    el.innerHTML = `
      <div style="background:linear-gradient(135deg,#176bff 0%,#0d4fcf 100%);color:#fff;border-radius:16px;padding:22px 28px;display:flex;gap:36px;flex-wrap:wrap;align-items:center;margin-bottom:24px;box-shadow:0 4px 18px rgba(23,107,255,.18)">
        <div>
          <div style="font-size:.72rem;opacity:.8;text-transform:uppercase;letter-spacing:.09em;margin-bottom:4px">💰 Total Earnings</div>
          <div style="font-size:2.1rem;font-weight:800;letter-spacing:-.01em">₹${data.totalEarnings.toLocaleString('en-IN')}</div>
        </div>
        <div style="width:1px;height:48px;background:rgba(255,255,255,.3)"></div>
        <div>
          <div style="font-size:.72rem;opacity:.8;text-transform:uppercase;letter-spacing:.09em;margin-bottom:4px">📦 Bookings Received</div>
          <div style="font-size:2.1rem;font-weight:800">${data.bookingCount}</div>
        </div>
      </div>`;
  } catch(e) {
    el.innerHTML = '';
  }
}

async function renderOwnerVehicles() {
  const list = document.getElementById('ownerVehicleList'); if (!list) return;
  if (!requireLogin()) return;
  try {
    const vehicles = await api('/vehicles/mine');
    list.innerHTML = vehicles.length
      ? vehicles.map(v => {
          const imgHtml = v.image
            ? `<div class="vehicle-image" style="height:175px;overflow:hidden;background:#eaf1f8">
                <img style="width:100%;height:100%;object-fit:cover;display:block" src="${escapeHtml(v.image)}" alt="${escapeHtml(v.name)}" loading="lazy">
              </div>`
            : '';
          return `<article class="vehicle-card">
            ${imgHtml}
            <div class="card-body">
              <span class="pill">● ${v.verified ? 'Verified' : 'Pending verification'}</span>
              <h3 class="card-title" style="margin-top:12px">${escapeHtml(v.name)}</h3>
              <div class="card-meta">${escapeHtml(v.type)} · 📍 ${escapeHtml(v.location)}</div>
              <p class="card-price">₹${v.price} <small>/ hour</small></p>
              <button class="btn btn-outline" type="button" data-delete-vehicle="${v.id}" style="width:100%;color:#b42318;border-color:#f0b7b2">Delete vehicle</button>
            </div>
          </article>`;
        }).join('')
      : '<div class="empty">You have not registered any vehicles yet.</div>';
  } catch(e) { list.innerHTML = `<div class="empty">${e.message}</div>`; }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('vehicleListing');
  form?.addEventListener('submit', async event => {
    event.preventDefault(); if (!requireLogin()) return;
    const f = event.target;
    const btn = f.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Uploading…';
    try {
      // Convert vehicle picture to compressed base64
      let imageBase64 = '';
      if (f.vehiclePicture?.files[0]) {
        imageBase64 = await compressImageToBase64(f.vehiclePicture.files[0]);
      }
      const item = await api('/vehicles', { method: 'POST', body: JSON.stringify({
        name: f.name.value.trim(),
        type: f.type.value,
        location: f.location.value.trim(),
        price: Number(f.price.value),
        available: f.available.value,
        numberPlate: f.numberPlate?.value.trim() || '',
        ownershipPaper: f.ownershipPaper?.files[0]?.name || '',
        insurance: f.insurance?.files[0]?.name || '',
        puc: f.puc?.files[0]?.name || '',
        vehiclePicture: f.vehiclePicture?.files[0]?.name || '',
        image: imageBase64   // send the real compressed photo
      })});
      await renderOwnerVehicles();
      await renderOwnerEarnings();
      showModal('Vehicle registered successfully!', `${item.name} is now listed in MongoDB.`);
      f.reset();
    } catch(e) { alert(e.message); }
    finally { btn.disabled = false; btn.textContent = 'List my vehicle'; }
  });

  document.getElementById('ownerVehicleList')?.addEventListener('click', async event => {
    const button = event.target.closest('[data-delete-vehicle]'); if (!button) return;
    try {
      await api('/vehicles/' + button.dataset.deleteVehicle, { method: 'DELETE' });
      await renderOwnerVehicles();
      await renderOwnerEarnings();
      showModal('Vehicle deleted', 'The vehicle was removed from MongoDB.');
    } catch(e) { alert(e.message); }
  });

  renderOwnerVehicles();
  renderOwnerEarnings();
});
