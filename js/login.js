import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Redireciona se já estiver logado
onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = "index.html";
});

// Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const btn = e.submitter;
  btn.disabled = true;
  btn.textContent = "Entrando...";

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    window.location.href = "index.html";
  } catch (erro) {
    alert("Erro ao entrar: " + erro.message);
  }

  btn.disabled = false;
  btn.textContent = "Entrar";
});
