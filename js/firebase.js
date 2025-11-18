import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1vYUwkyY2OzIvpVN9wLVhke-gKGZcNaU",
  authDomain: "controle-estoque-17051.firebaseapp.com",
  projectId: "controle-estoque-17051",
  storageBucket: "controle-estoque-17051.firebasestorage.app",
  messagingSenderId: "433891769456",
  appId: "1:433891769456:web:ba7459c1a05508481d08b5",
  measurementId: "G-DVSME1VHCT"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
