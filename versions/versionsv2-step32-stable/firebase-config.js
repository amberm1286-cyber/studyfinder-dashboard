import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDSEV2PjMqPFORxb9PkdWBGPsSsi1_jfsc",
  authDomain: "student-dashboard-ecad5.firebaseapp.com",
  projectId: "student-dashboard-ecad5",
  storageBucket: "student-dashboard-ecad5.firebasestorage.app",
  messagingSenderId: "689543937524",
  appId: "1:689543937524:web:46051b48b0ea641911cda1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };