// ============================================================
// admin.js — YGMB Admin Dashboard Logic
// Firebase v9+ Modular SDK, Vanilla JS, Real-time Firestore
// ============================================================

import { db, auth, storage } from '../firebase-config.js';
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, orderBy, query, serverTimestamp, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import {
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

// -------------------------------------------------------
// CONFIG
// -------------------------------------------------------
const ALLOWED_EMAILS = ['rumahkasiharrahman@gmail.com', 'admin@ygmb.or.id'];

// -------------------------------------------------------
// UTILS
// -------------------------------------------------------
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => { t.className = 'toast'; }, 3500);
}

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.textContent = loading ? 'Menyimpan...' : 'Simpan';
}

function formatDate(ts) {
  if (!ts) return '—';
  try { return ts.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
}

function formatRupiah(n) {
  return n != null ? 'Rp ' + Number(n).toLocaleString('id-ID') : '—';
}

// -------------------------------------------------------
// AUTH GUARD
// -------------------------------------------------------
onAuthStateChanged(auth, (user) => {
  if (!user || !ALLOWED_EMAILS.includes(user.email)) {
    window.location.href = 'login.html';
    return;
  }
  const emailEl = document.getElementById('authEmail');
  if (emailEl) emailEl.textContent = user.email;
  initDashboard();
});

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'login.html';
});

// -------------------------------------------------------
// SIDEBAR NAVIGATION
// -------------------------------------------------------
const sectionTitles = {
  overview: 'Dashboard',
  news: 'Manajemen Berita',
  peduli: 'YGMB Peduli',
  program: 'Manajemen Program',
  doa: 'Moderasi Titip Doa',
};

document.querySelectorAll('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.admin-section').forEach((s) => s.classList.remove('active'));
    btn.classList.add('active');
    const section = btn.dataset.section;
    document.getElementById(`section-${section}`)?.classList.add('active');
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = sectionTitles[section] || '';
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
      document.getElementById('sidebar')?.classList.remove('open');
    }
  });
});

document.getElementById('sidebarToggle')?.addEventListener('click', () => {
  document.getElementById('sidebar')?.classList.toggle('open');
});

// -------------------------------------------------------
// INIT DASHBOARD
// -------------------------------------------------------
function initDashboard() {
  initOverviewStats();
  initNewsModule();
  initPeduliModule();
  initMilestoneModule();
  initProgramModule();
  initDoaModule();
}

// -------------------------------------------------------
// 1. OVERVIEW STATS
// -------------------------------------------------------
function initOverviewStats() {
  onSnapshot(doc(db, 'config', 'stats'), (snap) => {
    const d = snap.exists() ? snap.data() : {};
    const donasi = document.getElementById('stat-donasi');
    const anak   = document.getElementById('stat-anak');
    const relawan = document.getElementById('stat-relawan');
    if (donasi) donasi.textContent = formatRupiah(d.totalDonasi);
    if (anak)   anak.textContent = d.jumlahAnakAsuh ?? '—';
    if (relawan) relawan.textContent = d.jumlahRelawan ?? '—';
  });

  onSnapshot(collection(db, 'titip_doa'), (snap) => {
    const statDoa = document.getElementById('stat-doa');
    if (statDoa) statDoa.textContent = snap.size;
  });
}

// ============================================================
// 2. NEWS MODULE
// ============================================================
let newsUnsub = null;
let editingNewsId = null;

function initNewsModule() {
  // Real-time listener
  const q = query(collection(db, 'news'), orderBy('timestamp', 'desc'));
  newsUnsub = onSnapshot(q, (snapshot) => {
    const tbody = document.getElementById('newsTbody');
    if (!tbody) return;
    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="5" class="table-loading">Belum ada berita.</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    snapshot.forEach((docSnap) => {
      const d = docSnap.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d.title || '—'}</td>
        <td>${d.category || '—'}</td>
        <td><span class="badge-type">${d.type || '—'}</span></td>
        <td>${formatDate(d.timestamp)}</td>
        <td><div class="td-actions">
          <button class="btn-edit" data-id="${docSnap.id}">Edit</button>
          <button class="btn-danger" data-id="${docSnap.id}">Hapus</button>
        </div></td>`;
      tbody.appendChild(tr);
    });

    // Wire edit/delete
    tbody.querySelectorAll('.btn-edit').forEach((btn) => {
      btn.addEventListener('click', () => openEditNews(btn.dataset.id, snapshot));
    });
    tbody.querySelectorAll('.btn-danger').forEach((btn) => {
      btn.addEventListener('click', () => deleteNews(btn.dataset.id));
    });
  });

  // Add button
  document.getElementById('btnAddNews')?.addEventListener('click', () => openNewsForm());
  document.getElementById('btnCancelNews')?.addEventListener('click', () => closeNewsForm());
  document.getElementById('btnSaveNews')?.addEventListener('click', saveNews);
}

function openNewsForm(data = null, id = null) {
  editingNewsId = id;
  const form = document.getElementById('newsForm');
  const title = document.getElementById('newsFormTitle');
  if (!form) return;
  form.style.display = 'block';
  title.textContent = id ? 'Edit Berita' : 'Tambah Berita';
  document.getElementById('newsDocId').value = id || '';
  document.getElementById('newsTitle').value = data?.title || '';
  document.getElementById('newsContent').value = data?.content || '';
  document.getElementById('newsCategory').value = data?.category || 'Program';
  document.getElementById('newsType').value = data?.type || 'Image';
  document.getElementById('newsMediaURL').value = data?.mediaURL || '';
  toggleMediaInput();
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeNewsForm() {
  const form = document.getElementById('newsForm');
  if (form) form.style.display = 'none';
  editingNewsId = null;
}

window.toggleMediaInput = function() {
  const type = document.getElementById('newsType')?.value;
  const label = document.getElementById('mediaURLLabel');
  if (label) label.textContent = type === 'YouTube' ? 'YouTube Embed URL (https://www.youtube.com/embed/...)' : 'URL Gambar';
};

async function openEditNews(id, snapshot) {
  const docSnap = snapshot.docs.find((d) => d.id === id);
  if (docSnap) openNewsForm(docSnap.data(), id);
}

async function saveNews() {
  const btn = document.getElementById('btnSaveNews');
  const title = document.getElementById('newsTitle').value.trim();
  const content = document.getElementById('newsContent').value.trim();
  const category = document.getElementById('newsCategory').value;
  const type = document.getElementById('newsType').value;
  const mediaURL = document.getElementById('newsMediaURL').value.trim();

  if (!title) { showToast('Judul wajib diisi.', 'error'); return; }

  setLoading(btn, true);

  try {
    const payload = { title, content, category, type, mediaURL, timestamp: serverTimestamp() };
    if (editingNewsId) {
      await updateDoc(doc(db, 'news', editingNewsId), payload);
      showToast('Berita berhasil diperbarui! ✅');
    } else {
      await addDoc(collection(db, 'news'), payload);
      showToast('Berita berhasil ditambahkan! ✅');
    }
    closeNewsForm();
  } catch (e) {
    console.error(e);
    showToast('Gagal menyimpan. Coba lagi.', 'error');
  } finally {
    setLoading(btn, false);
    btn.textContent = 'Simpan';
  }
}

async function deleteNews(id) {
  if (!confirm('Hapus berita ini?')) return;
  try {
    await deleteDoc(doc(db, 'news', id));
    showToast('Berita dihapus. 🗑️');
  } catch (e) {
    showToast('Gagal menghapus.', 'error');
  }
}

// ============================================================
// 3. YGMB PEDULI MODULE
// ============================================================
function initPeduliModule() {
  // Load current data
  getDoc(doc(db, 'config', 'stats')).then((snap) => {
    if (!snap.exists()) return;
    const d = snap.data();
    document.getElementById('peduliTotalDonasi').value = d.totalDonasi ?? '';
    document.getElementById('peduliTargetDonasi').value = d.targetDonasi ?? '';
    document.getElementById('peduliAnakAsuh').value = d.jumlahAnakAsuh ?? '';
    document.getElementById('peduliRelawan').value = d.jumlahRelawan ?? '';
  });

  document.getElementById('btnSavePeduli')?.addEventListener('click', async () => {
    const btn = document.getElementById('btnSavePeduli');
    setLoading(btn, true);
    try {
      await setDoc(doc(db, 'config', 'stats'), {
        totalDonasi:    Number(document.getElementById('peduliTotalDonasi').value) || 0,
        targetDonasi:   Number(document.getElementById('peduliTargetDonasi').value) || 0,
        jumlahAnakAsuh: Number(document.getElementById('peduliAnakAsuh').value) || 0,
        jumlahRelawan:  Number(document.getElementById('peduliRelawan').value) || 0,
        updatedAt: serverTimestamp()
      }, { merge: true });
      showToast('Statistik berhasil diperbarui! ✅');
    } catch (e) {
      showToast('Gagal menyimpan.', 'error');
    } finally {
      setLoading(btn, false);
      btn.textContent = 'Simpan Perubahan';
    }
  });
}

// ============================================================
// 4. PROGRAM MODULE
// ============================================================
let editingProgramId = null;

function initProgramModule() {
  const q = query(collection(db, 'program'), orderBy('createdAt', 'asc'));
  onSnapshot(q, (snapshot) => {
    const tbody = document.getElementById('programTbody');
    if (!tbody) return;
    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="5" class="table-loading">Belum ada program.</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    snapshot.forEach((docSnap) => {
      const d = docSnap.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-size:1.4rem;">${d.icon || '📌'}</td>
        <td>${d.title || '—'}</td>
        <td>${d.tab || '—'}</td>
        <td>${d.shortDesc ? d.shortDesc.substring(0,60)+'...' : '—'}</td>
        <td><div class="td-actions">
          <button class="btn-edit" data-id="${docSnap.id}">Edit</button>
          <button class="btn-danger" data-id="${docSnap.id}">Hapus</button>
        </div></td>`;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-edit').forEach((btn) => {
      btn.addEventListener('click', () => openEditProgram(btn.dataset.id, snapshot));
    });
    tbody.querySelectorAll('.btn-danger').forEach((btn) => {
      btn.addEventListener('click', () => deleteProgram(btn.dataset.id));
    });
  });

  document.getElementById('btnAddProgram')?.addEventListener('click', () => openProgramForm());
  document.getElementById('btnCancelProgram')?.addEventListener('click', () => closeProgramForm());
  document.getElementById('btnSaveProgram')?.addEventListener('click', saveProgram);
}

function openProgramForm(data = null, id = null) {
  editingProgramId = id;
  const form = document.getElementById('programForm');
  const title = document.getElementById('programFormTitle');
  if (!form) return;
  form.style.display = 'block';
  title.textContent = id ? 'Edit Program' : 'Tambah Program';
  document.getElementById('programDocId').value = id || '';
  document.getElementById('programTitle').value = data?.title || '';
  document.getElementById('programDesc').value = data?.shortDesc || '';
  document.getElementById('programIcon').value = data?.icon || '';
  document.getElementById('programTab').value = data?.tab || 'tahunan';
  const imgUrl = data?.imageURL || '';
  document.getElementById('programImageURL').value = imgUrl;
  updateImgPreview('programImgPreview', imgUrl);
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Live preview
  document.getElementById('programImageURL').oninput = (e) => updateImgPreview('programImgPreview', e.target.value);
}

function closeProgramForm() {
  const form = document.getElementById('programForm');
  if (form) form.style.display = 'none';
  editingProgramId = null;
}

function openEditProgram(id, snapshot) {
  const docSnap = snapshot.docs.find((d) => d.id === id);
  if (docSnap) openProgramForm(docSnap.data(), id);
}

async function saveProgram() {
  const btn = document.getElementById('btnSaveProgram');
  const title = document.getElementById('programTitle').value.trim();
  if (!title) { showToast('Nama program wajib diisi.', 'error'); return; }

  setLoading(btn, true);
  try {
    const payload = {
      title,
      shortDesc: document.getElementById('programDesc').value.trim(),
      icon: document.getElementById('programIcon').value.trim() || '📌',
      tab: document.getElementById('programTab').value,
      imageURL: document.getElementById('programImageURL').value.trim(),
      createdAt: serverTimestamp()
    };
    if (editingProgramId) {
      await updateDoc(doc(db, 'program', editingProgramId), payload);
      showToast('Program diperbarui! ✅');
    } else {
      await addDoc(collection(db, 'program'), payload);
      showToast('Program ditambahkan! ✅');
    }
    closeProgramForm();
  } catch (e) {
    showToast('Gagal menyimpan.', 'error');
  } finally {
    setLoading(btn, false);
    btn.textContent = 'Simpan';
  }
}

async function deleteProgram(id) {
  if (!confirm('Hapus program ini?')) return;
  try {
    await deleteDoc(doc(db, 'program', id));
    showToast('Program dihapus. 🗑️');
  } catch (e) {
    showToast('Gagal menghapus.', 'error');
  }
}

// ============================================================
// SHARED HELPER
// ============================================================
function updateImgPreview(containerId, url) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (url && (url.startsWith('http') || url.startsWith('/'))) {
    el.innerHTML = `<img src="${url}" alt="preview" style="margin-top:10px;max-height:120px;border-radius:8px;border:1px solid #eee;">`;
  } else {
    el.innerHTML = '';
  }
}

// ============================================================
// MILESTONE MODULE (YGMB Peduli Cards)
// ============================================================
let editingMilestoneId = null;

function initMilestoneModule() {
  const q = query(collection(db, 'milestones'), orderBy('createdAt', 'asc'));
  onSnapshot(q, (snapshot) => {
    const tbody = document.getElementById('milestoneTbody');
    if (!tbody) return;
    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-loading">Belum ada milestone.</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    snapshot.forEach((docSnap) => {
      const d = docSnap.data();
      const pct = d.target ? Math.round((d.current / d.target) * 100) : 0;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d.imageURL ? `<img src="${d.imageURL}" style="width:56px;height:40px;object-fit:cover;border-radius:6px;">` : '—'}</td>
        <td>${d.title || '—'}</td>
        <td>Rp ${Number(d.current || 0).toLocaleString('id-ID')}</td>
        <td>Rp ${Number(d.target || 0).toLocaleString('id-ID')}</td>
        <td><strong>${pct}%</strong></td>
        <td><div class="td-actions">
          <button class="btn-edit" data-id="${docSnap.id}">Edit</button>
          <button class="btn-danger" data-id="${docSnap.id}">Hapus</button>
        </div></td>`;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-edit').forEach((btn) => {
      btn.addEventListener('click', () => openEditMilestone(btn.dataset.id, snapshot));
    });
    tbody.querySelectorAll('.btn-danger').forEach((btn) => {
      btn.addEventListener('click', () => deleteMilestone(btn.dataset.id));
    });
  });

  document.getElementById('btnAddMilestone')?.addEventListener('click', () => openMilestoneForm());
  document.getElementById('btnCancelMilestone')?.addEventListener('click', () => closeMilestoneForm());
  document.getElementById('btnSaveMilestone')?.addEventListener('click', saveMilestone);
}

function openMilestoneForm(data = null, id = null) {
  editingMilestoneId = id;
  const form = document.getElementById('milestoneForm');
  const titleEl = document.getElementById('milestoneFormTitle');
  if (!form) return;
  form.style.display = 'block';
  titleEl.textContent = id ? 'Edit Milestone' : 'Tambah Milestone';
  document.getElementById('milestoneDocId').value = id || '';
  document.getElementById('milestoneTitle').value = data?.title || '';
  document.getElementById('milestoneBadge').value = data?.badge || 'Dana Beasiswa';
  document.getElementById('milestoneCurrent').value = data?.current || '';
  document.getElementById('milestoneTarget').value = data?.target || '';
  document.getElementById('milestoneDesc').value = data?.desc || '';
  const imgUrl = data?.imageURL || '';
  document.getElementById('milestoneImageURL').value = imgUrl;
  updateImgPreview('milestoneImgPreview', imgUrl);
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Live preview
  document.getElementById('milestoneImageURL').oninput = (e) => updateImgPreview('milestoneImgPreview', e.target.value);
}

function closeMilestoneForm() {
  const form = document.getElementById('milestoneForm');
  if (form) form.style.display = 'none';
  editingMilestoneId = null;
}

function openEditMilestone(id, snapshot) {
  const docSnap = snapshot.docs.find((d) => d.id === id);
  if (docSnap) openMilestoneForm(docSnap.data(), id);
}

async function saveMilestone() {
  const btn = document.getElementById('btnSaveMilestone');
  const title = document.getElementById('milestoneTitle').value.trim();
  if (!title) { showToast('Judul milestone wajib diisi.', 'error'); return; }

  setLoading(btn, true);
  try {
    const payload = {
      title,
      badge: document.getElementById('milestoneBadge').value,
      current: Number(document.getElementById('milestoneCurrent').value) || 0,
      target: Number(document.getElementById('milestoneTarget').value) || 0,
      desc: document.getElementById('milestoneDesc').value.trim(),
      imageURL: document.getElementById('milestoneImageURL').value.trim(),
      createdAt: serverTimestamp()
    };
    if (editingMilestoneId) {
      await updateDoc(doc(db, 'milestones', editingMilestoneId), payload);
      showToast('Milestone diperbarui! ✅');
    } else {
      await addDoc(collection(db, 'milestones'), payload);
      showToast('Milestone ditambahkan! ✅');
    }
    closeMilestoneForm();
  } catch (e) {
    console.error(e);
    showToast('Gagal menyimpan.', 'error');
  } finally {
    setLoading(btn, false);
    btn.textContent = 'Simpan';
  }
}

async function deleteMilestone(id) {
  if (!confirm('Hapus milestone ini?')) return;
  try {
    await deleteDoc(doc(db, 'milestones', id));
    showToast('Milestone dihapus. 🗑️');
  } catch (e) {
    showToast('Gagal menghapus.', 'error');
  }
}

// ============================================================
// 5. TITIP DOA MODERATION
// ============================================================
function initDoaModule() {
  const q = query(collection(db, 'titip_doa'), orderBy('timestamp', 'desc'));
  onSnapshot(q, (snapshot) => {
    const tbody = document.getElementById('doaTbody');
    if (!tbody) return;
    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="5" class="table-loading">Belum ada Titip Doa.</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    snapshot.forEach((docSnap) => {
      const d = docSnap.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d.nama || '—'}</td>
        <td>${d.noWa || '—'}</td>
        <td>${d.pesan || '—'}</td>
        <td>${formatDate(d.timestamp)}</td>
        <td><button class="btn-danger" data-id="${docSnap.id}">Hapus</button></td>`;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-danger').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Hapus pesan doa ini?')) return;
        try {
          await deleteDoc(doc(db, 'titip_doa', btn.dataset.id));
          showToast('Pesan doa dihapus. 🗑️');
        } catch (e) {
          showToast('Gagal menghapus.', 'error');
        }
      });
    });
  });
}
