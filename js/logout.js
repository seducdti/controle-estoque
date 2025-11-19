import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

export function logout() {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
}
