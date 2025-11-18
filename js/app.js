function getDados() {
  return JSON.parse(localStorage.getItem("estoque")) || { produtos: [], entradas: [], saidas: [] };
}

function atualizarDashboard() {
  const dados = getDados();

  document.getElementById("totalProdutos").textContent = dados.produtos.length;

  const totalEstoque = dados.produtos.reduce((s, p) => s + p.quantidade, 0);
  document.getElementById("totalEstoque").textContent = totalEstoque;

  const mesAtual = new Date().getMonth();

  const entradasMes = dados.entradas.filter(e => new Date(e.data).getMonth() === mesAtual).length;
  const saidasMes = dados.saidas.filter(s => new Date(s.data).getMonth() === mesAtual).length;

  document.getElementById("totalEntradas").textContent = entradasMes;
  document.getElementById("totalSaidas").textContent = saidasMes;

  gerarGrafico(totalEstoque, entradasMes, saidasMes);
}

function gerarGrafico(estoque, entradas, saidas) {
  const ctx = document.getElementById("graficoEstoque");

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Estoque", "Entradas", "Saídas"],
      datasets: [{
        data: [estoque, entradas, saidas]
      }]
    }
  });
}

atualizarDashboard();
