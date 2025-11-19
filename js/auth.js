// auth.js
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const paginaLogin = window.location.pathname.includes("login.html");

onAuthStateChanged(auth, (user) => {
  if (!user && !paginaLogin) {
    window.location.href = "login.html";
  }
});
