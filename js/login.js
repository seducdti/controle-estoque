import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Usuário padrão ADMIN (não aparece no HTML)
const ADMIN_USER = {
  email: "adm@sistema.com",
  password: "T3cn0l0g1@dm1n"
};

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value.trim();

  let emailLogin = "";

  // Substitui "Admin" pelo e-mail real escondido
  if (usuario.toLowerCase() === "admin") {
    emailLogin = ADMIN_USER.email;
  } else {
    alert("Usuário inválido!");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, emailLogin, senha);
    window.location.href = "index.html";
  } catch (error) {
    alert("Usuário ou senha incorretos!");
  }
});
