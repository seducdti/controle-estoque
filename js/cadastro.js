// ===============================
// Gerenciamento de produtos (com ID automático)
// ===============================

// Funções auxiliares de armazenamento
function getDados() {
  return JSON.parse(localStorage.getItem('estoque')) || { produtos: [], entradas: [], saidas: [], aquisicoes: [] };
}

function salvarDados(dados) {
  localStorage.setItem('estoque', JSON.stringify(dados));
}

// Gera um ID numérico sequencial
function gerarID(dados) {
  const ultimoID = dados.produtos.length ? Math.max(...dados.produtos.map(p => p.id)) : 0;
  return ultimoID + 1;
}

// Atualiza tabela de produtos
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

// Excluir produto
function excluirProduto(index) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;
  const dados = getDados();
  dados.produtos.splice(index, 1);
  salvarDados(dados);
  atualizarListaProdutos();
  alert('Produto excluído com sucesso.');
}

// Editar produto
function editarProduto(index) {
  const dados = getDados();
  const produto = dados.produtos[index];
  if (!produto) return;

  document.getElementById('nome').value = produto.nome;
  document.getElementById('formProduto').setAttribute('data-editando', index);
  document.querySelector('#formProduto button[type="submit"]').textContent = 'Salvar Alterações';
}

// Inicializa formulário
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
        quantidade: 0 // começa zerado, entradas vão aumentar depois
      };
      dados.produtos.push(novoProduto);
      alert(`Produto cadastrado com sucesso! (ID: ${novoProduto.id})`);
    }

    salvarDados(dados);
    formProduto.reset();
    atualizarListaProdutos();

    // Atualiza selects e dashboard
    try { popularSelectEntrada(); } catch(e){}
    try { popularSelectSaida(); } catch(e){}
    try { popularSelectAquisicao(); } catch(e){}
    try { atualizarDashboard(); } catch(e){}
  });
}
