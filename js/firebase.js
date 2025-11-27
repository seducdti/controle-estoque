// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { 
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuração fornecida por você
const firebaseConfig = {
  apiKey: "AIzaSyDyqiggixe6x3EAUnyU7tD__IDOg9uclyE",
  authDomain: "controle-estoque-14207.firebaseapp.com",
  projectId: "controle-estoque-14207",
  storageBucket: "controle-estoque-14207.firebasestorage.app",
  messagingSenderId: "394834089086",
  appId: "1:394834089086:web:f3e4183bd707a45751b42f",
  measurementId: "G-B9NLSQTNBX"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inicializa Firestore
const db = getFirestore(app);

// Exporta para outros arquivos JS
export {
  db,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc
};
