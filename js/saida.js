function getDados() {
  return JSON.parse(localStorage.getItem("estoque")) || { produtos: [], entradas: [], saidas: [] };
}

function salvarDados(d) {
  localStorage.setItem("estoque", JSON.stringify(d));
}

function popularSelect() {
  const dados = getDados();
  const select = document.getElementById("produtoEntrada");
  select.innerHTML = "";
  dados.produtos.forEach(p => {
    select.innerHTML += `<option value="${p.id}">${p.nome}</option>`;
  });
}

document.getElementById("formEntrada").addEventListener("submit", (e) => {
  e.preventDefault();

  const dados = getDados();

  const id = Number(document.getElementById("produtoEntrada").value);
  const qtd = Number(document.getElementById("quantidadeEntrada").value);
  const data = document.getElementById("dataEntrada").value;

  dados.entradas.push({ id, quantidade: qtd, data });

  const produto = dados.produtos.find(p => p.id === id);
  produto.quantidade += qtd;

  salvarDados(dados);
  e.target.reset();
  alert("Entrada registrada!");
});

popularSelect();
