# Project Specification: Admin Dashboard YGMB (Firebase + Vanilla JS)

## 1. Role & Objective
Anda adalah seorang **Senior Full-stack Developer** dengan keahlian khusus di **Firebase (v9+ Modular)** dan **Modern Vanilla JavaScript**.
Tugas Anda adalah membangun sistem Admin Dashboard (CMS) untuk yayasan **"Yayasan Generasi Muda Berguna (YGMB)"**. Sistem ini harus ringan, aman, dan memiliki sinkronisasi real-time dengan landing page utama.

## 2. Tech Stack Constraints
- **Frontend:** Pure HTML5, CSS3 (Custom Properties, Flexbox, Grid).
- **Styling UI:** Clean, Minimalist, Glassmorphism elements (sesuai tema landing page). High readability adalah prioritas.
- **Backend/Baas:** Firebase v9+ (Modular SDK).
    - **Authentication:** Email/Password (Restricted Access).
    - **Firestore:** Database utama untuk konten dan statistik.
    - **Storage:** Media storage untuk gambar berita/program.

## 3. Core Features & Requirements

### A. Authentication (Security Gate)
- Implementasi Firebase Auth.
- **Access Control:** Hanya UID atau Email tertentu yang didefinisikan di config/whitelist yang bisa masuk.
- **Route Guard:** Jika state `onAuthStateChanged` null, redirect otomatis ke `login.html`.

### B. UI/UX Layout
- **Sidebar Navigation:** - Dashboard (Statistik Ringkas)
    - News (Berita)
    - YGMB Peduli (Milestone & Donasi)
    - Program (Manajemen Program)
    - Titip Doa (Moderasi)
- **Main Content:** Area dinamis untuk form CRUD dan tabel data.
- **Feedback Loop:** Tampilkan loading state (spinner) dan toast notification setelah aksi CRUD berhasil/gagal.

### C. Module CRUD (Content Management)
1.  **News Section:**
    - Schema: `title`, `content`, `type` (Image/YouTube), `mediaURL`, `timestamp`.
    - Upload gambar ke Firebase Storage jika tipe media adalah 'Image'.
2.  **YGMB Peduli (Milestone):**
    - Update data statistik: `totalDonasi`, `jumlahAnakAsuh`, `jumlahRelawan`.
    - Data ini harus tersimpan di satu dokumen Firestore agar mudah ditarik sebagai pop-up di landing page.
3.  **Program Section:**
    - Schema: `iconPath`, `title`, `shortDescription`.

### D. Moderation: 'Titip Doa'
- Tarik data dari koleksi `titip_doa`.
- Tampilkan dalam format **Table** (Nama, No WA, Pesan Doa).
- Berikan tombol **Delete** untuk moderasi konten yang tidak pantas.

### E. Migration & Real-time Sync
- Gunakan `getFirestore`, `addDoc`, `updateDoc`, `deleteDoc`, dan `onSnapshot`.
- Pastikan kode modular sehingga mudah di-maintain.

## 4. Output Expected
1.  **Structure:** Berikan struktur folder yang direkomendasikan.
2.  **Code:** Sediakan kode HTML, CSS, dan JS secara terpisah.
3.  **Firebase Config:** Berikan placeholder untuk Firebase Config agar saya bisa memasukkan API Key saya sendiri.
4.  **Instructions:** Jelaskan cara setup Firestore Rules agar data aman.
