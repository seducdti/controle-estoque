import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
};
