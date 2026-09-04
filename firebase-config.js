import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC5O541ngBda1qxuUfCYcNURB3AkLMAGbM",
  authDomain: "mi-tierra-colorada.firebaseapp.com",
  projectId: "mi-tierra-colorada",
  storageBucket: "mi-tierra-colorada.firebasestorage.app",
  messagingSenderId: "453529203724",
  appId: "1:453529203724:web:3285bdfbb73a56b0b96a29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };
