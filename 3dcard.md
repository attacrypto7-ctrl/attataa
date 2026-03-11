# [UI REDESIGN: VERTICAL 3D CARDS]

## ROLE: Professional UI/UX Designer
Ubah tampilan Card di section "Tentang Kami" agar lebih estetik dan memiliki "Breathing Room".

## 1. CARD ARCHITECTURE (VERTICAL & CLEAN)
- **Orientation:** Ubah card menjadi **Portrait/Vertikal** (Tegak berdiri). Rasio ideal 3:4.
- **Visual Style:**
  - **Minimalist Content:** HAPUS semua deskripsi panjang. Di dalam card HANYA ada:
    1. Gambar/Logo (Ukuran besar di tengah).
    2. Judul (Font: Clash Display, Bold).
    3. Border tipis (1px solid rgba(255,255,255,0.2)).
  - **White Space:** Tambahkan padding internal minimal `40px` agar konten tidak terlihat "full" atau "sumpek".
  - **Glassmorphism:** Gunakan background semi-transparan dengan `backdrop-filter: blur(15px)`.

## 2. 3D INTERACTION
- **Effect:** Implementasikan efek **3D Tilt** (ketika di-hover, card akan miring mengikuti arah kursor).
- **Depth:** Tambahkan `drop-shadow` yang sangat halus dan melebar saat hover untuk memberikan efek "melayang" yang nyata.

## 3. IMAGE QUALITY
- Pastikan gambar di dalam card (`LOGO 1`, `LOGO 2`, `PROGRAM 3`) menggunakan `object-fit: contain` dan tidak memenuhi seluruh kotak card (beri margin/ruang kosong di sekeliling gambar).