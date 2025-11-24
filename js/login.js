// 🔐 Login com senha protegida por hash SHA-256

// Hash SHA-256 da senha verdadeira: "T3cn0l0g1@dm1n"
const HASH_CORRETO = "1c9bace67fcbab50f6bde7d70fe50b26f2984280f49e512462c03965da575813";

// Função para gerar hash SHA-256
async function gerarHash(texto) {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

// Se já estiver logado, vai direto pro dashboard
if (localStorage.getItem("usuarioLogado")) {
    window.location.href = "index.html";
}

// Evento de login
document.getElementById("formLogin").addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value.trim();

    const hashDigitado = await gerarHash(senha);

    if (usuario === "Admin" && hashDigitado === HASH_CORRETO) {
        localStorage.setItem("usuarioLogado", usuario);
        window.location.href = "index.html";
    } else {
        alert("Usuário ou senha incorretos!");
    }
});
