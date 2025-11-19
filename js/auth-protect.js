// =========================
//  CONFIGURAÇÃO FIREBASE
// =========================
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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
const db = getFirestore(app);

// =========================
//  USUÁRIO PADRÃO SECRETO
// =========================

// Usuário padrão: Admin
// Senha original: T3cn0l0g1@dm1n
// O hash impede que a senha apareça no código
const USUARIO_PADRAO = "Admin";
const SENHA_HASH = "b6f5b3e7eaafd5cf8748d3b89f836d37"; // MD5 da senha

// Função hash MD5
function md5(str) {
  return CryptoJS.MD5(str).toString();
}

// =========================
// LOGIN
// =========================
export async function login(usuario, senhaDigitada) {
  const senhaHash = md5(senhaDigitada);

  // Verifica usuário padrão oculto
  if (usuario === USUARIO_PADRAO && senhaHash === SENHA_HASH) {
      localStorage.setItem("usuarioLogado", usuario);
      return { sucesso: true, admin: true };
  }

  return { sucesso: false, erro: "Usuário ou senha inválidos" };
}

// =========================
// VERIFICA LOGIN EM TODAS AS PÁGINAS
// =========================
export function protegerPagina() {
  const user = localStorage.getItem("usuarioLogado");
  if (!user) {
    window.location.href = "login.html";
  }
}

// =========================
// SAIR
// =========================
export function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}
