// ================================
// Inicialização do Firebase + Firestore
// ================================

// Import via ES Modules (para páginas <script type="module">)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuração do seu Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDyqiggixe6x3EAUnyU7tD__IDOg9uclyE",
  authDomain: "controle-estoque-14207.firebaseapp.com",
  projectId: "controle-estoque-14207",
  storageBucket: "controle-estoque-14207.firebasestorage.app",
  messagingSenderId: "394834089086",
  appId: "1:394834089086:web:f3e4183bd707a45751b42f",
  measurementId: "G-B9NLSQTNBX"
};

// Iniciar Firebase
const app = initializeApp(firebaseConfig);

// Criar instância do Firestore
export const db = getFirestore(app);
