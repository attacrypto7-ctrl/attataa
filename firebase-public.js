// ============================================================
// firebase-public.js — Public Landing Page Real-time Sync
// Reads: news, config/stats, titip_doa, milestones, program
// Writes: titip_doa (form submissions)
// ============================================================

import { db } from './firebase-config.js';
import {
  collection, doc, onSnapshot, addDoc, serverTimestamp,
  orderBy, query, limit, getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// -------------------------------------------------------
// 1. REAL-TIME NEWS / BERITA SLIDER
// -------------------------------------------------------
function initFirebaseNews() {
  const slider = document.getElementById('beritaSlider');
  const dotsContainer = document.getElementById('beritaDots');
  if (!slider) return;

  const q = query(collection(db, 'news'), orderBy('timestamp', 'desc'), limit(6));

  onSnapshot(q, (snapshot) => {
    if (snapshot.empty) return;

    const badgeColors = ['', 'berita-badge-green', 'berita-badge-blue', '', 'berita-badge-green'];
    const badgeLabels = ['Program', 'Donasi', 'Komunitas', 'Sosial', 'Pendidikan'];

    slider.innerHTML = '';
    if (dotsContainer) dotsContainer.innerHTML = '';

    snapshot.docs.forEach((docSnap, i) => {
      const d = docSnap.data();
      const badgeClass = badgeColors[i % badgeColors.length];
      const badgeLabel = d.category || badgeLabels[i % badgeLabels.length];
      const dateStr = d.timestamp
        ? new Date(d.timestamp.toDate()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

      let imgSrc = 'https://images.unsplash.com/photo-1577896851231-70ef18481754?auto=format&fit=crop&w=600&q=80';
      if (d.type === 'Image' && d.mediaURL) {
        imgSrc = d.mediaURL;
      } else if (d.type === 'YouTube' && d.mediaURL) {
        const ytUrl = d.mediaURL;
        let videoId = '';
        const watchMatch = ytUrl.match(/[?&]v=([^&#]+)/);
        const shortMatch = ytUrl.match(/youtu\.be\/([^?&#]+)/);
        const embedMatch = ytUrl.match(/embed\/([^?&#]+)/);
        if (watchMatch) videoId = watchMatch[1];
        else if (shortMatch) videoId = shortMatch[1];
        else if (embedMatch) videoId = embedMatch[1];
        if (videoId) imgSrc = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }

      const article = document.createElement('article');
      article.className = 'berita-card animate-zoom';
      article.style.cssText = `--i:${i};`;
      if (d.type === 'YouTube' && d.mediaURL) {
        article.setAttribute('data-video', d.mediaURL); // raw URL, modal will convert to embed
      }
      // Store full content for modal (not truncated)
      if (d.content) article.dataset.fullContent = d.content;
      article.innerHTML = `
        <div class="berita-card-img"><img src="${imgSrc}" alt="${d.title || ''}" loading="lazy" style="width:100%;height:100%;object-fit:cover;"></div>
        <div class="berita-card-body">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span class="berita-card-badge-inline ${badgeClass}">${badgeLabel}</span>
            <time class="berita-date" style="margin-bottom:0;">${dateStr}</time>
          </div>
          <h3>${d.title || ''}</h3>
          <p>${d.content ? d.content.substring(0, 100) + '...' : ''}</p>
          <span class="berita-read">Baca Selengkapnya &rarr;</span>
        </div>`;
      slider.appendChild(article);

      if (dotsContainer) {
        const dot = document.createElement('button');
        dot.className = `berita-dot${i === 0 ? ' active' : ''}`;
        dot.dataset.slide = i;
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dotsContainer.appendChild(dot);
      }
    });

    // Re-init slider + modal after DOM is updated
    setTimeout(() => {
      if (window.__YGMB_REINIT_BERITA__) window.__YGMB_REINIT_BERITA__();
    }, 50);
  });
}

// -------------------------------------------------------
// 2. REAL-TIME DONATION STATS (YGMB Peduli)
// -------------------------------------------------------
function initFirebaseStats() {
  const pctEl = document.querySelector('.peduli-overall-pct');
  const barEl = document.querySelector('.peduli-bar-fill');
  // Counter el has dynamic data-count; select by class instead
  const counterEl = document.querySelector('.peduli-stat-num');

  onSnapshot(doc(db, 'config', 'stats'), (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();

    if (counterEl && data.totalDonasi != null) {
      counterEl.dataset.count = data.totalDonasi;
      // Animate the number right away
      counterEl.textContent = 'Rp ' + Number(data.totalDonasi).toLocaleString('id-ID');
    }

    if (data.targetDonasi && data.totalDonasi != null) {
      const pct = Math.min(100, Math.round((data.totalDonasi / data.targetDonasi) * 10000) / 100);
      if (pctEl) pctEl.textContent = pct + '%';
      if (barEl) barEl.style.setProperty('--target-w', pct + '%');
    }

    // Update supporting stats text if present
    const statLabel = document.querySelector('.peduli-stat-label');
    if (statLabel && data.targetDonasi) {
      statLabel.textContent = 'Terkumpul dari target Rp ' + Number(data.targetDonasi).toLocaleString('id-ID');
    }
  });
}

// -------------------------------------------------------
// 3. REAL-TIME TITIP DOA WALL
// -------------------------------------------------------
function initFirebaseDoaWall() {
  const wall = document.querySelector('.doa-wall');
  if (!wall) return;

  const q = query(collection(db, 'titip_doa'), limit(6));

  onSnapshot(q, (snapshot) => {
    if (snapshot.empty) return;
    wall.innerHTML = '';
    // Sort client-side to avoid needing a Firestore index
    const docs = snapshot.docs.sort((a, b) => {
      const ta = a.data().timestamp?.toMillis?.() || 0;
      const tb = b.data().timestamp?.toMillis?.() || 0;
      return tb - ta;
    });
    docs.forEach((docSnap) => {
      const d = docSnap.data();
      const card = document.createElement('div');
      card.className = 'doa-card animate-slide-up';
      card.innerHTML = `
        <div class="doa-card-name">${d.nama || 'Hamba Allah'}</div>
        <div class="doa-card-text">"${d.pesan || ''}"</div>`;
      wall.appendChild(card);
    });
  });
}

// -------------------------------------------------------
// 4. TITIP DOA FORM SUBMIT → FIRESTORE
// -------------------------------------------------------
function initDoaFormSubmit() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-modal-target="modal-titip-doa"]');
    if (!btn) return;

    setTimeout(() => {
      const form = document.querySelector('#modalBody form');
      if (!form || form.dataset.firebaseWired) return;
      form.dataset.firebaseWired = 'true';
      form.removeAttribute('onsubmit');

      form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const submitBtn = form.querySelector('[type=submit]');
        const nama = form.querySelector('#doaName')?.value?.trim();
        const noWa = form.querySelector('#doaPhone')?.value?.trim();
        const pesan = form.querySelector('#doaMessage')?.value?.trim();

        if (!nama || !noWa || !pesan) return;

        submitBtn.textContent = 'Mengirim...';
        submitBtn.disabled = true;

        try {
          await addDoc(collection(db, 'titip_doa'), {
            nama, noWa, pesan,
            timestamp: serverTimestamp()
          });
          alert('Terima kasih! Doa Anda berhasil terkirim. 🤲');
          document.getElementById('modalClose')?.click();
          form.reset();
        } catch (err) {
          console.error(err);
          alert('Gagal mengirim doa. Silakan coba lagi.');
        } finally {
          submitBtn.textContent = 'Kirim Doa Penuh Kebaikan';
          submitBtn.disabled = false;
        }
      });
    }, 300);
  });
}

// -------------------------------------------------------
// 5. REAL-TIME MILESTONE CARDS (YGMB Peduli)
// -------------------------------------------------------
function initFirebaseMilestones() {
  const peduliGrid = document.querySelector('.peduli-cards');
  if (!peduliGrid) return;

  const q = query(collection(db, 'milestones'), limit(3));

  onSnapshot(q, (snapshot) => {
    if (snapshot.empty) return;

    peduliGrid.innerHTML = '';
    snapshot.docs.forEach((docSnap) => {
      const d = docSnap.data();
      const pct = d.target > 0 ? Math.min(100, Math.round((d.current / d.target) * 100)) : 0;
      const imgSrc = d.imageURL
        || 'https://images.unsplash.com/photo-1510531704581-5b2870936bc5?auto=format&fit=crop&w=600&q=80';

      const card = document.createElement('div');
      card.className = 'peduli-card animate-slide-up';
      card.style.cssText = 'cursor:default; min-height:320px;';
      card.innerHTML = `
        <div class="peduli-card-photo" style="height:180px;border-radius:12px;overflow:hidden;margin-bottom:16px;">
          <img src="${imgSrc}" alt="${d.title || ''}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
        </div>
        <h3>${d.title || ''}</h3>
        ${d.desc ? `<p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:12px;">${d.desc}</p>` : ''}
        <div class="peduli-card-progress" style="margin-top:auto;">
          <div class="peduli-prog-label">
            <span class="peduli-prog-raised">Rp ${Number(d.current || 0).toLocaleString('id-ID')}</span>
            <span class="peduli-prog-pct">${pct}%</span>
          </div>
          <div class="peduli-prog-bar">
            <div class="peduli-prog-fill" style="--prog:${pct}%;width:${pct}%;"></div>
          </div>
          <div style="font-size:0.82rem;color:var(--text-muted);margin-top:6px;">
            Target: Rp ${Number(d.target || 0).toLocaleString('id-ID')}
          </div>
        </div>`;
      peduliGrid.appendChild(card);
    });

    // Re-init progress bar animations
    setTimeout(() => {
      if (window.__YGMB_REINIT_BERITA__) window.__YGMB_REINIT_BERITA__();
    }, 50);
  });
}

// -------------------------------------------------------
// 6. REAL-TIME PROGRAM CARDS
// -------------------------------------------------------
function initFirebasePrograms() {
  const tabs = ['tahunan', 'bulanan', 'mingguan'];

  const q = query(collection(db, 'program'), limit(20));

  onSnapshot(q, (snapshot) => {
    // Clear all grids
    tabs.forEach((tab) => {
      const grid = document.getElementById(`program-grid-${tab}`);
      if (grid) grid.innerHTML = '';
    });

    if (snapshot.empty) return;

    snapshot.docs.forEach((docSnap, i) => {
      const d = docSnap.data();
      const tab = d.tab || 'tahunan';
      const grid = document.getElementById(`program-grid-${tab}`);
      if (!grid) return;

      const imgSrc = d.imageURL
        || 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=600&q=80';

      const card = document.createElement('div');
      card.className = 'program-card tilt-card animate-zoom';
      card.style.cssText = `--i:${i};`;
      card.innerHTML = `
        <div class="card-glow"></div>
        <div class="card-content">
          <div class="program-card-photo" style="height:140px;border-radius:12px;overflow:hidden;margin-bottom:16px;">
            <img src="${imgSrc}" alt="${d.title || ''}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
          </div>
          <div class="program-badge" style="display:inline-flex;align-items:center;background:rgba(255,107,53,0.1);color:var(--primary);padding:6px 12px;border-radius:100px;font-size:0.85rem;font-weight:700;margin-bottom:12px;">
            ${d.icon || '📌'} ${d.title || ''}
          </div>
          <h3>${d.title || ''}</h3>
          <p class="clamp-2" style="margin-bottom:16px;">${d.shortDesc || ''}</p>
          <span class="peduli-read-more btn-secondary"
            style="width:100%;text-align:center;border-radius:100px;padding:10px;display:inline-block;margin-top:auto;">
            Baca Selengkapnya
          </span>
        </div>`;
      grid.appendChild(card);
    });

    // Reinit tilt and modal for new cards
    setTimeout(() => {
      if (window.__YGMB_REINIT_BERITA__) window.__YGMB_REINIT_BERITA__();
    }, 50);
  });
}

// -------------------------------------------------------
// 7. XENDIT DONATION FORM → Netlify Function
// -------------------------------------------------------
function initXenditDonationForm() {
  // Wire up whenever the modal with the Xendit form is opened
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-modal-target="peduli-modal-bank"]');
    if (!trigger) return;

    // Give modal time to render template content
    setTimeout(() => {
      const form = document.getElementById('xenditDonationForm');
      if (!form || form.dataset.wired) return;
      form.dataset.wired = 'true';

      // Amount chip shortcuts
      document.querySelectorAll('.amount-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          const amountInput = document.getElementById('xenditAmount');
          if (amountInput) amountInput.value = chip.dataset.amount;
          document.querySelectorAll('.amount-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
        });
      });

      form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const btn = document.getElementById('xenditSubmitBtn');
        const btnText = document.getElementById('xenditBtnText');
        const name = document.getElementById('xenditName')?.value?.trim();
        const email = document.getElementById('xenditEmail')?.value?.trim();
        const amount = document.getElementById('xenditAmount')?.value?.trim();

        if (!name || !email || !amount) return;

        // Loading state
        btn.disabled = true;
        btnText.textContent = 'Memproses...';

        try {
          const res = await fetch('/.netlify/functions/create-invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, amount: Number(amount) }),
          });
          const data = await res.json();

          if (!res.ok || !data.invoiceUrl) {
            throw new Error(data.error || 'Gagal membuat invoice.');
          }

          // Start real-time monitoring BEFORE redirecting
          initDonationStatusMonitor(data.donationId);

          // Show transition popup then redirect
          await Swal.fire({
            icon: 'info',
            title: 'Menuju Halaman Pembayaran',
            html: `Terima kasih, <strong>${name}</strong>!<br>Kamu akan diarahkan ke halaman pembayaran Xendit.`,
            timer: 2500,
            timerProgressBar: true,
            showConfirmButton: false,
            backdrop: 'rgba(10,14,23,0.85)',
            customClass: { popup: 'swal-ygmb' },
          });

          // Open Xendit invoice in new tab
          window.open(data.invoiceUrl, '_blank', 'noopener');
          document.getElementById('modalClose')?.click();
        } catch (err) {
          console.error('[XenditForm]', err);
          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: err.message || 'Terjadi kesalahan. Silakan coba lagi.',
            backdrop: 'rgba(10,14,23,0.85)',
            confirmButtonColor: '#ff6b35',
            customClass: { popup: 'swal-ygmb' },
          });
        } finally {
          btn.disabled = false;
          btnText.textContent = '🔒 Lanjutkan Pembayaran';
        }
      });
    }, 300);
  });
}

// -------------------------------------------------------
// 8. REAL-TIME DONATION STATUS MONITOR (onSnapshot)
// -------------------------------------------------------
function initDonationStatusMonitor(donationId) {
  if (!donationId) return;

  const donationRef = doc(db, 'donations', donationId);
  let unsubscribe;

  unsubscribe = onSnapshot(donationRef, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();

    if (data.status === 'COMPLETED') {
      // Stop listening once paid
      if (unsubscribe) unsubscribe();

      const formattedAmount = 'Rp ' + Number(data.paidAmount || data.amount).toLocaleString('id-ID');

      Swal.fire({
        icon: 'success',
        title: '🎉 Donasi Berhasil!',
        html: `
          <p style="margin:0 0 8px;">Terima kasih atas kebaikan hati Anda.</p>
          <p style="font-size:1.6rem;font-weight:800;color:#ff6b35;margin:12px 0;">${formattedAmount}</p>
          <p style="color:#888;font-size:0.9rem;">Semoga menjadi amal jariyah yang mengalir terus. 🤲</p>
        `,
        confirmButtonText: 'Aamiin 🤲',
        confirmButtonColor: '#ff6b35',
        backdrop: 'rgba(10,14,23,0.9)',
        showClass: { popup: 'animate__animated animate__bounceIn' },
        customClass: { popup: 'swal-ygmb' },
        allowOutsideClick: false,
      });
    }
  });
}

// -------------------------------------------------------
// INIT ALL
// -------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initFirebaseNews();
  initFirebaseStats();
  initFirebaseDoaWall();
  initDoaFormSubmit();
  initFirebaseMilestones();
  initFirebasePrograms();
  initXenditDonationForm();

  // Check for donation completion via URL param (returning from Xendit page)
  const urlParams = new URLSearchParams(window.location.search);
  const donationIdFromURL = urlParams.get('donation');
  const statusFromURL = urlParams.get('status');
  if (donationIdFromURL) {
    if (statusFromURL === 'success') {
      initDonationStatusMonitor(donationIdFromURL);
    } else if (statusFromURL === 'failed') {
      Swal.fire({
        icon: 'error',
        title: 'Pembayaran Gagal/Batal',
        text: 'Transaksi Anda gagal diproses atau dibatalkan. Silakan coba kembali.',
        customClass: {
          popup: 'swal-ygmb'
        },
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#e74c3c'
      });
    }
    // Clean up URL
    window.history.replaceState({}, '', window.location.pathname + window.location.hash);
  }
});
