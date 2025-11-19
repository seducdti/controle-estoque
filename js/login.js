import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  let usuario = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value;

  // Converte "Admin" -> email real do Firebase
  if (usuario.toLowerCase() === "admin") {
    usuario = "admin@system.com";
  }

  try {
    await signInWithEmailAndPassword(auth, usuario, senha);
    window.location.href = "index.html";
  } catch (error) {
    alert("Usuário ou senha incorretos.");
  }
});
