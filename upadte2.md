# UI/UX & FEATURE UPDATE: YGMB FOUNDATION

## 1. NEWS UPDATE: Dynamic Media (YouTube Integration)
* **Objective:** Upgrade the existing news/article pop-up modal to support both static images and playable YouTube videos.
* **Technical Specs (Vanilla JS & HTML):** * Create a dynamic media container inside the news pop-up.
  * When opening a news item, check if the data contains a video link. If yes, dynamically generate a responsive YouTube `<iframe>` instead of an `<img>` tag.
  * Ensure the iframe uses `allow="autoplay; encrypted-media; picture-in-picture"` so the video plays seamlessly inside the pop-up without redirecting the user.
  * The video container must maintain a 16:9 aspect ratio and fit perfectly within the pop-up's padding, keeping the smooth entry animations intact.

## 2. 'TITIP DOA' (PRAYER SUBMISSION) POP-UP
* **Objective:** Create an elegant, interactive modal form where visitors can write prayers for the orphans. (Backend/Database connection will be handled separately later).
* **UI/UX & Styling:** * The pop-up MUST strictly follow the established global design system (Glassmorphism, Midnight Blue/Soft Gold palette, `backdrop-filter` blur). 
  * Include a smooth closing mechanism (a custom 'X' button with hover rotation, or closing when clicking outside the modal).
* **Form Structure:** Build a clean HTML form with the following fields, using smooth floating labels (CSS only) when focused:
  * `Nama Lengkap` (Name): `<input type="text" required>`
  * `Nomor WhatsApp` (Number): `<input type="tel" required>`
  * `Tulis Doamu di Sini` (Prayer Message): `<textarea rows="5" required>` 
  * `Kirim Doa` (Submit Button): Use the primary CTA button style with the magnetic cursor effect and gradient border. 
  * *Note for JS:* Add `e.preventDefault()` on form submit to prevent page reload during this frontend testing phase.

## 3. HIGH-QUALITY DUMMY DATA INJECTION
* **Objective:** Populate the layout with realistic, high-quality placeholder content for presentation and testing purposes.
* **Images:** Do not leave image containers empty. Fetch high-quality, relevant placeholder images (representing youth, education, charity, and community) using reliable sources like `https://picsum.photos` or direct Unsplash image links.
* **Text Content:** DO NOT use generic "Lorem Ipsum". Generate realistic, foundation-appropriate dummy text in Indonesian.
  * *News Articles:* Create engaging dummy headlines (e.g., "Program Belajar Bersama Ciptakan Senyum Baru").
  * *Titip Doa Examples:* Pre-fill the background UI with realistic dummy prayers to show how submitted prayers will look once the database is active.