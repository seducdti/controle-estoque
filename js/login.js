// Hash SHA-256 da senha verdadeira
const senhaHashArmazenada = "c4e7889bdc3cbdf15f26ae67baae67f7a9af4c2250958a85c4f7c5a3316d0eaf";

// Função para gerar hash SHA-256 no navegador
async function gerarHash(texto) {
  const encoder = new TextEncoder();
  const data = encoder.encode(texto);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

// Redireciona se já estiver logado
if (localStorage.getItem("usuarioLogado")) {
  window.location.href = "index.html";
}

// Evento de login
document.getElementById("formLogin").addEventListener("submit", async e => {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value.trim();

  // Gera o hash da senha digitada
  const senhaHashDigitada = await gerarHash(senha);

  // Validação
  if (usuario === "Admin" && senhaHashDigitada === senhaHashArmazenada) {
    localStorage.setItem("usuarioLogado", usuario);
    window.location.href = "index.html";
  } else {
    alert("Usuário ou senha incorretos!");
  }
});
