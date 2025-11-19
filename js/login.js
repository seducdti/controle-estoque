// login.js
import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value.trim();

  // Usuário padrão convertido para e-mail interno
  const emailConvertido = usuario.toLowerCase() === "admin"
    ? "adm@sistema.com"
    : usuario + "@sistema.com";

  try {
    await signInWithEmailAndPassword(auth, emailConvertido, senha);
    window.location.href = "index.html";
  } catch (error) {
    alert("Usuário ou senha incorretos!");
  }
});
