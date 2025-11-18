function getDados() {
  return JSON.parse(localStorage.getItem("estoque")) || {
    produtos: [],
    entradas: [],
    saidas: []
  };
}

function calcularNivel(qtd) {
  if (qtd >= 50) return { texto: "ALTO", cor: "green" };
  if (qtd >= 20) return { texto: "MÉDIO", cor: "orange" };
  return { texto: "BAIXO", cor: "red" };
}

function atualizarControle() {
  const dados = getDados();
  const tbody = document.getElementById("controleTabela");
  tbody.innerHTML = "";

  dados.produtos.forEach(p => {
    const entradas = dados.entradas.filter(e => e.id === p.id)
      .reduce((sum, e) => sum + e.quantidade, 0);

    const saidas = dados.saidas.filter(s => s.id === p.id)
      .reduce((sum, s) => sum + s.quantidade, 0);

    const nivel = calcularNivel(p.quantidade);

    tbody.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.nome}</td>
        <td>${entradas}</td>
        <td>${saidas}</td>
        <td>${p.quantidade}</td>
        <td style="color:${nivel.cor}; font-weight:bold;">${nivel.texto}</td>
      </tr>
    `;
  });
}

atualizarControle();
