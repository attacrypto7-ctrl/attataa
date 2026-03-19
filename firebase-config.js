// ============================================================
// firebase-config.js — Shared Firebase Initialization
// Used by: firebase-public.js + admin/admin.js
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyCnMbyB6TJjH_47MsgTX71tSqal-AjJh3w",
  authDomain: "ayaay-724f7.firebaseapp.com",
  projectId: "ayaay-724f7",
  storageBucket: "ayaay-724f7.firebasestorage.app",
  messagingSenderId: "257173408633",
  appId: "1:257173408633:web:04012cc412bce7920ebda8",
  measurementId: "G-X4XZ4YJ9CC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
