# Project: Auto-Verification Donation (Xendit + Netlify + Firebase)

## 1. Context
Saya sedang membangun backend web dan migrasi ke Firebase. 
- Hosting: Netlify.
- Database: Firebase Firestore (Spark Plan).
- Payment Gateway: Xendit (Mode Tes).

## 2. Configuration
Data berikut sudah saya masukkan ke Environment Variables di Netlify:
- XENDIT_SECRET_KEY
- FIREBASE_PRIVATE_KEY
- XENDIT_PUBLIC_KEY: xnd_public_development_47hBQLqzczll2bQVJGcLEmHulMbo8LB_fc_F0vMWzsbzRrIjdiZlNuCc58wzJ3o2

## 3. Requirements

### A. Backend (Netlify Functions)
1.  **create-invoice.js**: 
    - Menerima `amount`, `name`, dan `email` dari frontend.
    - Membuat invoice via Xendit API.
    - Mencatat data donasi ke Firestore (Koleksi: `donations`) dengan status `PENDING`.
2.  **xendit-webhook.js**:
    - Menerima callback dari Xendit.
    - Jika status `PAID`, update Firestore:
        - Set status donasi jadi `COMPLETED`.
        - Update total saldo di `stats/ygmb_peduli` menggunakan `FieldValue.increment`.

### B. Frontend (Vanilla JS)
- Integrasikan SweetAlert2 untuk pop-up.
- Gunakan Firebase `onSnapshot` untuk memantau perubahan status donasi secara real-time. Jika status berubah jadi `COMPLETED`, tampilkan pesan sukses yang estetik.

## 4. Output Expected
Berikan struktur folder yang rapi (termasuk netlify.toml) dan kode lengkap untuk masing-masing file tersebut.