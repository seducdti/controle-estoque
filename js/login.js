// 🔒 Controle de Login
const credenciais = {
  usuario: "Admin",
  senha: "T3cn0l0g1@dm1n"
};

// Se já estiver logado, vai direto pro dashboard
if (localStorage.getItem("usuarioLogado")) {
  window.location.href = "index.html";
}

// Evento de login
document.getElementById("formLogin").addEventListener("submit", e => {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (usuario === credenciais.usuario && senha === credenciais.senha) {
    localStorage.setItem("usuarioLogado", usuario);
    window.location.href = "index.html";
  } else {
    alert("Usuário ou senha incorretos!");
  }
});
