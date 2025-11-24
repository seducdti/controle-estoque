// ===============================
// js/app.js
// Dashboard e funções globais
// ===============================

// ==========================
//  FUNÇÕES GERAIS DO SISTEMA
// ==========================

function getDados() {
  return JSON.parse(localStorage.getItem('estoque')) || { 
    produtos: [],
    entradas: [],
    saidas: [],
    aquisicoes: [],
    origens: []
  };
}

function salvarDados(dados) {
  localStorage.setItem('estoque', JSON.stringify(dados));
}

function hojeISO() {
  return new Date().toISOString().slice(0,10);
}

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

window.addEventListener('DOMContentLoaded', gerarGraficoPizza);

// ===============================
// Gerenciamento de Entradas
// ===============================
function popularSelectEntrada() {
  const sel = document.getElementById('produtoEntrada');
  if (!sel) return;
  sel.innerHTML = '<option value="">-- Selecione o Produto --</option>';
  const dados = getDados();
  dados.produtos.forEach((p, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${p.nome} (ID: ${p.id})`;
    sel.appendChild(opt);
  });
}

function popularOrigens() {
  const datalist = document.getElementById('listaOrigens');
  if (!datalist) return;
  const dados = getDados();
  datalist.innerHTML = '';
  (dados.origens || []).forEach(org => {
    const opt = document.createElement('option');
    opt.value = org;
    datalist.appendChild(opt);
  });
}

function atualizarListaEntradas(filtro = '') {
  const tbody = document.getElementById('listaEntradas');
  if (!tbody) return;
  const dados = getDados();

  const entradas = dados.entradas.filter(e =>
    e.produtoNome.toLowerCase().includes(filtro) ||
    e.origem.toLowerCase().includes(filtro) ||
    (e.localMaterial || "").toLowerCase().includes(filtro) ||
    (e.data || "").includes(filtro)
  );

  if (entradas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="muted">Nenhuma entrada encontrada</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  entradas.slice().reverse().forEach(e => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${e.produtoID}</td>
      <td>${e.produtoNome}</td>
      <td>${e.quantidade}</td>
      <td>${e.data || '-'}</td>
      <td>${e.origem}</td>
      <td>${e.localMaterial || '-'}</td>
      <td>
        <button class="btn-editar" onclick="editarEntrada(${dados.entradas.indexOf(e)})">✏️</button>
        <button class="btn-excluir" onclick="excluirEntrada(${dados.entradas.indexOf(e)})">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function excluirEntrada(index) {
  const dados = getDados();
  if (!confirm('Deseja excluir esta entrada?')) return;

  dados.entradas.splice(index, 1);
  salvarDados(dados);
  atualizarListaEntradas();
}

function editarEntrada(index) {
  const dados = getDados();
  const entrada = dados.entradas[index];
  if (!entrada) return;

  document.getElementById('produtoEntrada').value = dados.produtos.findIndex(p => p.id === entrada.produtoID);
  document.getElementById('quantidadeEntrada').value = entrada.quantidade;
  document.getElementById('dataEntrada').value = entrada.data || "";
  document.getElementById('origemEntrada').value = entrada.origem;
  document.getElementById('localMaterial').value = entrada.localMaterial || "";

  document.getElementById('formEntrada').setAttribute('data-editando', index);
  document.querySelector('#formEntrada button[type="submit"]').textContent = 'Salvar Alterações';
  document.getElementById('cancelarEdicao').style.display = 'inline';
}

document.getElementById('cancelarEdicao')?.addEventListener('click', () => {
  const form = document.getElementById('formEntrada');
  form.removeAttribute('data-editando');
  form.reset();
  document.querySelector('#formEntrada button[type="submit"]').textContent = 'Registrar Entrada';
  document.getElementById('cancelarEdicao').style.display = 'none';
});

const formEntrada = document.getElementById('formEntrada');
if (formEntrada) {
  popularSelectEntrada();
  popularOrigens();
  atualizarListaEntradas();

  formEntrada.addEventListener('submit', e => {
    e.preventDefault();

    const idx = document.getElementById('produtoEntrada').value;
    const qtd = Number(document.getElementById('quantidadeEntrada').value);
    const data = document.getElementById('dataEntrada').value; // opcional
    const origem = document.getElementById('origemEntrada').value.trim();
    const localMaterial = document.getElementById('localMaterial').value.trim();

    if (idx === '' || qtd <= 0 || !origem || !localMaterial) {
      alert('Preencha todos os campos corretamente.');
      return;
    }

    const dados = getDados();
    const produto = dados.produtos[idx];
    if (!produto) return alert('Produto inválido.');

    const editando = formEntrada.getAttribute('data-editando');

    if (editando !== null) {
      dados.entradas[editando] = { 
        produtoID: produto.id, 
        produtoNome: produto.nome, 
        quantidade: qtd, 
        data, 
        origem, 
        localMaterial 
      };

      formEntrada.removeAttribute('data-editando');
      document.querySelector('#formEntrada button[type="submit"]').textContent = 'Registrar Entrada';
      document.getElementById('cancelarEdicao').style.display = 'none';
      alert('Entrada atualizada com sucesso!');

    } else {
      produto.quantidade = (produto.quantidade || 0) + qtd;

      dados.entradas.push({ 
        produtoID: produto.id, 
        produtoNome: produto.nome, 
        quantidade: qtd, 
        data, 
        origem, 
        localMaterial 
      });

      if (!dados.origens.includes(origem)) dados.origens.push(origem);

      alert('Entrada registrada com sucesso!');
    }

    salvarDados(dados);
    popularSelectEntrada();
    popularOrigens();
    atualizarListaEntradas();
    
    try { atualizarDashboard(); } catch(e) {}
    formEntrada.reset();
  });

  document.getElementById('pesquisaEntrada')?.addEventListener('input', e => {
    const valor = e.target.value.trim().toLowerCase();
    atualizarListaEntradas(valor);
  });
}

// ===============================
// Gerenciamento de Produtos
// ===============================
function gerarID(dados) {
  const ultimoID = dados.produtos.length ? Math.max(...dados.produtos.map(p => p.id)) : 0;
  return ultimoID + 1;
}

function atualizarListaProdutos() {
  const tbody = document.getElementById('listaProdutos');
  const dados = getDados();
  tbody.innerHTML = '';

  if (!dados.produtos || dados.produtos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="muted">Nenhum produto cadastrado</td></tr>';
    return;
  }

  dados.produtos.forEach((p, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nome}</td>
      <td>
        <button onclick="editarProduto(${i})">✏️ Editar</button>
        <button onclick="excluirProduto(${i})">🗑️ Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function excluirProduto(index) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;
  const dados = getDados();
  dados.produtos.splice(index, 1);
  salvarDados(dados);
  atualizarListaProdutos();
  alert('Produto excluído com sucesso.');
}

function editarProduto(index) {
  const dados = getDados();
  const produto = dados.produtos[index];
  if (!produto) return;

  document.getElementById('nome').value = produto.nome;
  document.getElementById('formProduto').setAttribute('data-editando', index);
  document.querySelector('#formProduto button[type="submit"]').textContent = 'Salvar Alterações';
}

const formProduto = document.getElementById('formProduto');
if (formProduto) {
  atualizarListaProdutos();

  formProduto.addEventListener('submit', e => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    if (!nome) {
      alert('Preencha o nome do produto.');
      return;
    }

    const dados = getDados();
    const editando = formProduto.getAttribute('data-editando');

    if (editando !== null) {
      dados.produtos[editando].nome = nome;
      formProduto.removeAttribute('data-editando');
      document.querySelector('#formProduto button[type="submit"]').textContent = 'Cadastrar';
      alert('Produto atualizado com sucesso!');
    } else {
      const novoProduto = {
        id: gerarID(dados),
        nome,
        quantidade: 0
      };
      dados.produtos.push(novoProduto);
      alert(`Produto cadastrado com sucesso! (ID: ${novoProduto.id})`);
    }

    salvarDados(dados);
    formProduto.reset();
    atualizarListaProdutos();

    try { popularSelectEntrada(); } catch(e){}
    try { atualizarDashboard(); } catch(e){}
  });
}
