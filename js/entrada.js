// ===============================
// Controle de Entradas — com Editar, Excluir e Pesquisa
// ===============================

function getDados() {
  return JSON.parse(localStorage.getItem('estoque')) || { produtos: [], entradas: [], saidas: [], aquisicoes: [], origens: [] };
}
function salvarDados(dados) {
  localStorage.setItem('estoque', JSON.stringify(dados));
}
function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

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
    e.tipoMaterial.toLowerCase().includes(filtro) ||
    e.data.includes(filtro)
  );

  if (entradas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="muted">Nenhuma entrada encontrada</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  entradas.slice().reverse().forEach((e, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${e.produtoID}</td>
      <td>${e.produtoNome}</td>
      <td>${e.quantidade}</td>
      <td>${e.data}</td>
      <td>${e.origem}</td>
      <td>${e.tipoMaterial}</td>
      <td>
        <button class="btn-editar" onclick="editarEntrada(${dados.entradas.indexOf(e)})">✏️</button>
        <button class="btn-excluir" onclick="excluirEntrada(${dados.entradas.indexOf(e)})">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Excluir entrada
function excluirEntrada(index) {
  const dados = getDados();
  if (!confirm('Deseja excluir esta entrada?')) return;

  dados.entradas.splice(index, 1);
  salvarDados(dados);
  atualizarListaEntradas();
}

// Editar entrada
function editarEntrada(index) {
  const dados = getDados();
  const entrada = dados.entradas[index];
  if (!entrada) return;

  document.getElementById('produtoEntrada').value = dados.produtos.findIndex(p => p.id === entrada.produtoID);
  document.getElementById('quantidadeEntrada').value = entrada.quantidade;
  document.getElementById('dataEntrada').value = entrada.data;
  document.getElementById('origemEntrada').value = entrada.origem;
  document.getElementById('tipoMaterial').value = entrada.tipoMaterial;
  document.getElementById('formEntrada').setAttribute('data-editando', index);
  document.querySelector('#formEntrada button[type="submit"]').textContent = 'Salvar Alterações';
  document.getElementById('cancelarEdicao').style.display = 'inline';
}

// Cancelar edição
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
    const data = document.getElementById('dataEntrada').value || hojeISO();
    const origem = document.getElementById('origemEntrada').value.trim();
    const tipo = document.getElementById('tipoMaterial').value.trim();

    if (idx === '' || qtd <= 0 || !origem || !tipo) {
      alert('Preencha todos os campos corretamente.');
      return;
    }

    const dados = getDados();
    const produto = dados.produtos[idx];
    if (!produto) return alert('Produto inválido.');

    const editando = formEntrada.getAttribute('data-editando');

    if (editando !== null) {
      dados.entradas[editando] = { produtoID: produto.id, produtoNome: produto.nome, quantidade: qtd, data, origem, tipoMaterial: tipo };
      formEntrada.removeAttribute('data-editando');
      document.querySelector('#formEntrada button[type="submit"]').textContent = 'Registrar Entrada';
      document.getElementById('cancelarEdicao').style.display = 'none';
      alert('Entrada atualizada com sucesso!');
    } else {
      produto.quantidade = (produto.quantidade || 0) + qtd;
      dados.entradas.push({ produtoID: produto.id, produtoNome: produto.nome, quantidade: qtd, data, origem, tipoMaterial: tipo });
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

  // Filtro de pesquisa
  document.getElementById('pesquisaEntrada')?.addEventListener('input', e => {
    const valor = e.target.value.trim().toLowerCase();
    atualizarListaEntradas(valor);
  });
}
