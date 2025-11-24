// ===============================
// controle.js — Resumo visual do estoque
// ===============================

function getDados() {
  return JSON.parse(localStorage.getItem('estoque')) || { produtos: [], entradas: [], saidas: [] };
}

function calcularNivelEstoque(quantidade, maximo) {
  const percentual = (quantidade / maximo) * 100;

  if (percentual <= 25) return { texto: "Baixo", cor: "vermelho" };
  if (percentual <= 75) return { texto: "Médio", cor: "amarelo" };
  return { texto: "Alto", cor: "verde" };
}

function atualizarControleEstoque() {
  const tbody = document.getElementById("listaControle");
  if (!tbody) return;

  const dados = getDados();
  const produtos = dados.produtos;

  if (produtos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="muted">Nenhum produto cadastrado</td></tr>';
    return;
  }

  const maxEstoque = Math.max(...produtos.map(p => p.quantidade || 0), 1);

  tbody.innerHTML = '';

  produtos.forEach(prod => {
    const entradas = dados.entradas
      .filter(e => e.produtoNome === prod.nome)
      .reduce((acc, e) => acc + e.quantidade, 0);

    const saidas = dados.saidas
      .filter(s => s.produtoNome === prod.nome)
      .reduce((acc, s) => acc + s.quantidade, 0);

    const saldo = (prod.quantidade || 0);
    const nivel = calcularNivelEstoque(saldo, maxEstoque);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${prod.id}</td>
      <td>${prod.nome}</td>
      <td>${entradas}</td>
      <td>${saidas}</td>
      <td>${saldo}</td>
      <td>
        <span class="nivel ${nivel.cor}">${nivel.texto}</span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

document.addEventListener("DOMContentLoaded", atualizarControleEstoque);
