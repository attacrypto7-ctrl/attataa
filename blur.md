# [EMERGENCY BUG FIX] - LOGO BLUR & WA OVERLAP

## ROLE: Senior Frontend Debugger
Fokus perbaiki DUA BUG KRUSIAL ini pada kode HTML dan CSS. Jangan ubah logika lain, ikuti instruksi ini secara mutlak!

---

## 1. FIX LOGO NAVBAR BLUR (CRITICAL)
- **Akar Masalah:** Gambar `LOGO 1.PNG` menjadi sangat blur karena kemungkinan besar dimasukkan ke dalam elemen `<svg>` lama atau dibatasi oleh CSS yang memaksanya meregang (*stretching*).
- **Instruksi Mutlak (HTML):** Cari bagian Logo di Navbar. HAPUS seluruh tag `<svg>` bawaan. Ganti HANYA dengan tag `img` bersih seperti ini:
  `<img src="LOGO 1.PNG" alt="Logo YGMB" class="navbar-logo-img">`
- **Instruksi Mutlak (CSS):**
  Tambahkan CSS baru ini:
  `.navbar-logo-img { height: 50px; width: auto; max-width: 100%; object-fit: contain; }`
  (Hapus properti `image-rendering` atau `transform: scale` jika sebelumnya kamu menambahkannya).

---

## 2. FIX WHATSAPP BUTTON (WRONG ICON & OVERLAP)
- **Akar Masalah:** Icon di dalam tombol floating WA belum diganti menjadi logo yayasan, dan posisinya menabrak elemen lain (seperti tombol back-to-top atau footer).
- **Instruksi Mutlak (HTML):**
  Cari elemen Floating WhatsApp. HAPUS icon default (entah itu `<svg>` atau `<i>`). Masukkan tag `img` ini ke dalam tombolnya:
  `<img src="LOGO 1.PNG" alt="WhatsApp YGMB" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
- **Instruksi Mutlak (CSS):**
  Pastikan wadah/container tombol WA memiliki CSS berikut agar tidak overlap:
  ```css
  .whatsapp-floating-btn {
      position: fixed;
      bottom: 90px; /* Angkat lebih tinggi agar tidak nabrak footer/scroll indicator */
      right: 30px;
      width: 60px;
      height: 60px;
      z-index: 99999; /* Super tinggi agar selalu di paling depan */
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  }