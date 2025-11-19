// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDyqiggixe6x3EAUnyU7tD__IDOg9uclyE",
  authDomain: "controle-estoque-14207.firebaseapp.com",
  projectId: "controle-estoque-14207",
  storageBucket: "controle-estoque-14207.firebasestorage.app",
  messagingSenderId: "394834089086",
  appId: "1:394834089086:web:f3e4183bd707a45751b42f",
  measurementId: "G-B9NLSQTNBX"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
