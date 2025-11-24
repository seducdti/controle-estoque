// 🔐 Login com senha protegida por hash SHA-256

// Hash SHA-256 correto da senha: "T3cn0l0g1@dm1n"
const HASH_CORRETO = "a43cadbca86b2381d8a2ed72b79324e228b8d31b7669c105fcf4eb5ad54d613a";

// Função para gerar hash SHA-256
async function gerarHash(texto) {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

// Se já estiver logado, redireciona
if (localStorage.getItem("usuarioLogado")) {
    window.location.href = "index.html";
}

// Evento de login
document.getElementById("formLogin").addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value.trim();

    // Gera hash da senha digitada
    const hashDigitado = await gerarHash(senha);

    // Validação
    if (usuario === "Admin" && hashDigitado === HASH_CORRETO) {
        localStorage.setItem("usuarioLogado", "Admin");
        window.location.href = "index.html";
    } else {
        alert("Usuário ou senha incorretos!");
    }
});
