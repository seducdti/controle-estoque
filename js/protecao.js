// Impede acesso sem login
if (!localStorage.getItem("usuarioLogado")) {
    window.location.href = "login.html";
}
