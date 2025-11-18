function getDados() {
  return JSON.parse(localStorage.getItem("estoque")) || { produtos: [], entradas: [], saidas: [] };
}

function salvarDados(d) {
  localStorage.setItem("estoque", JSON.stringify(d));
}

function gerarID(dados) {
  const ultimo = dados.produtos.map(p => p.id);
  return ultimo.length ? Math.max(...ultimo) + 1 : 1;
}

function atualizarTabela() {
  const tbody = document.getElementById("listaProdutos");
  const dados = getDados();
  tbody.innerHTML = "";

  dados.produtos.forEach((p, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.nome}</td>
        <td>${p.quantidade}</td>
        <td>
          <button onclick="editarProduto(${i})">Editar</button>
          <button onclick="excluirProduto(${i})">Excluir</button>
        </td>
      </tr>
    `;
  });
}

function excluirProduto(i) {
  const dados = getDados();
  dados.produtos.splice(i, 1);
  salvarDados(dados);
  atualizarTabela();
}

function editarProduto(i) {
  const dados = getDados();
  const p = dados.produtos[i];
  document.getElementById("nome").value = p.nome;
  document.getElementById("formProduto").dataset.editando = i;
}

document.getElementById("formProduto").addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const dados = getDados();
  const edit = e.target.dataset.editando;

  if (edit !== undefined) {
    dados.produtos[edit].nome = nome;
    delete e.target.dataset.editando;
  } else {
    dados.produtos.push({ id: gerarID(dados), nome, quantidade: 0 });
  }

  salvarDados(dados);
  e.target.reset();
  atualizarTabela();
});

atualizarTabela();
