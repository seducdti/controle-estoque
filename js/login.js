// login.js
import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value.trim().toLowerCase();
  const senha = document.getElementById("senha").value.trim();

  // Converte automaticamente o usuário para o e-mail do Firebase
  let emailConvertido = usuario + "@sistema.com";

  // Para admin usa o e-mail escondido:
  if (usuario === "admin") {
    emailConvertido = "adm@sistema.com";
  }

  try {
    await signInWithEmailAndPassword(auth, emailConvertido, senha);

    // Salva nível
    const nivel = (usuario === "admin") ? "admin" : "operador";
    localStorage.setItem("nivel", nivel);

    window.location.href = "index.html";
  } catch (error) {
    console.log(error);
    alert("Usuário ou senha incorretos!");
  }
});
