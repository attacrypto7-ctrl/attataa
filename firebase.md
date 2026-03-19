# firebase data
<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCnMbyB6TJjH_47MsgTX71tSqal-AjJh3w",
    authDomain: "ayaay-724f7.firebaseapp.com",
    projectId: "ayaay-724f7",
    storageBucket: "ayaay-724f7.firebasestorage.app",
    messagingSenderId: "257173408633",
    appId: "1:257173408633:web:04012cc412bce7920ebda8",
    measurementId: "G-X4XZ4YJ9CC"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>