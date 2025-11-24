// js/app.js
// ===============================
// Dashboard e funções globais
// ===============================

// 🧩 Proteção de páginas — redireciona se não estiver logado
if (!localStorage.getItem("usuarioLogado")) {
  if (!window.location.href.includes("login.html")) {
    window.location.href = "login.html";
  }
}

// 🔚 Função de logout
function logout() {
  if (confirm("Deseja realmente sair?")) {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
  }
}



// Funções utilitárias
function getDados() {
  return JSON.parse(localStorage.getItem('estoque')) || { produtos: [], entradas: [], saidas: [] };
}

function salvarDados(dados) {
  localStorage.setItem('estoque', JSON.stringify(dados));
}

function hojeISO() {
  return new Date().toISOString().slice(0,10);
}

// ===============================
// Atualiza Dashboard
// ===============================
function atualizarDashboard() {
  const totalProdutosEl = document.getElementById('totalProdutos');
  const totalEstoqueEl = document.getElementById('totalEstoque');
  const totalEntradasEl = document.getElementById('totalEntradas');
  const totalSaidasEl = document.getElementById('totalSaidas');

  const dados = getDados();

  // 1️⃣ Total de produtos cadastrados
  const totalProdutos = dados.produtos.length;

  // 2️⃣ Estoque atual = soma das (entradas - saídas) por produto
  const totais = {};
  dados.entradas.forEach(e => {
    totais[e.produtoNome] = (totais[e.produtoNome] || 0) + Number(e.quantidade || 0);
  });
  dados.saidas.forEach(s => {
    totais[s.produtoNome] = (totais[s.produtoNome] || 0) - Number(s.quantidade || 0);
  });

  const totalEstoque = Object.values(totais).reduce((a, b) => a + b, 0);

  // 3️⃣ Entradas e saídas do mês atual
  const mesAtual = new Date().toISOString().slice(0,7); // ex: "2025-11"
  const entradasMes = dados.entradas.filter(e => e.data?.startsWith(mesAtual)).length;
  const saidasMes = dados.saidas.filter(s => s.data?.startsWith(mesAtual)).length;

  // 4️⃣ Atualiza elementos visuais
  if (totalProdutosEl) totalProdutosEl.textContent = totalProdutos;
  if (totalEstoqueEl) totalEstoqueEl.textContent = totalEstoque;
  if (totalEntradasEl) totalEntradasEl.textContent = entradasMes;
  if (totalSaidasEl) totalSaidasEl.textContent = saidasMes;
}

// ===============================
// Inicialização
// ===============================
window.addEventListener('load', () => {
  try { atualizarDashboard(); } catch(e) { console.error('Erro ao atualizar dashboard', e); }
});

function gerarGraficoPizza() {
  const dados = getDados();
  if (!dados || !dados.produtos) return;

  let totalEstoque = dados.produtos.reduce((s, p) => s + (p.quantidade || 0), 0);
  let totalEntradas = dados.entradas.reduce((s, e) => s + (e.quantidade || 0), 0);
  let totalSaidas = dados.saidas.reduce((s, e) => s + (e.quantidade || 0), 0);

  const ctx = document.getElementById('graficoEstoque').getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Entradas', 'Saídas', 'Estoque Atual'],
      datasets: [{
        data: [totalEntradas, totalSaidas, totalEstoque],
        backgroundColor: ['#4CAF50', '#F44336', '#2196F3'],
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'Distribuição de Estoque' }
      }
    }
  });
}

// Chama o gráfico quando a página carregar
window.addEventListener('DOMContentLoaded', gerarGraficoPizza);
