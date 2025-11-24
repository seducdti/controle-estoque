// ===============================
// Controle de Saídas — com Editar, Excluir e Pesquisa
// ===============================

function getDados() {
  return JSON.parse(localStorage.getItem('estoque')) || { produtos: [], entradas: [], saidas: [], aquisicoes: [], destinos: [] };
}
function salvarDados(dados) {
  localStorage.setItem('estoque', JSON.stringify(dados));
}
function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function popularSelectSaida() {
  const sel = document.getElementById('produtoSaida');
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

function popularDestinos() {
  const datalist = document.getElementById('listaDestinos');
  if (!datalist) return;
  const dados = getDados();
  datalist.innerHTML = '';
  (dados.destinos || []).forEach(dest => {
    const opt = document.createElement('option');
    opt.value = dest;
    datalist.appendChild(opt);
  });
}

function atualizarListaSaidas(filtro = '') {
  const tbody = document.getElementById('listaSaidas');
  if (!tbody) return;
  const dados = getDados();

  const saidas = dados.saidas.filter(s =>
    s.produtoNome.toLowerCase().includes(filtro) ||
    s.destino.toLowerCase().includes(filtro) ||
    s.data.includes(filtro)
  );

  if (saidas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="muted">Nenhuma saída encontrada</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  saidas.slice().reverse().forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.produtoID}</td>
      <td>${s.produtoNome}</td>
      <td>${s.quantidade}</td>
      <td>${s.data}</td>
      <td>${s.destino}</td>
      <td>
        <button class="btn-editar" onclick="editarSaida(${dados.saidas.indexOf(s)})">✏️</button>
        <button class="btn-excluir" onclick="excluirSaida(${dados.saidas.indexOf(s)})">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Excluir saída
function excluirSaida(index) {
  const dados = getDados();
  if (!confirm('Deseja excluir esta saída?')) return;
  dados.saidas.splice(index, 1);
  salvarDados(dados);
  atualizarListaSaidas();
}

// Editar saída
function editarSaida(index) {
  const dados = getDados();
  const saida = dados.saidas[index];
  if (!saida) return;

  document.getElementById('produtoSaida').value = dados.produtos.findIndex(p => p.id === saida.produtoID);
  document.getElementById('quantidadeSaida').value = saida.quantidade;
  document.getElementById('dataSaida').value = saida.data;
  document.getElementById('destinoSaida').value = saida.destino;

  const form = document.getElementById('formSaida');
  form.setAttribute('data-editando', index);
  document.querySelector('#formSaida button[type="submit"]').textContent = 'Salvar Alterações';
  document.getElementById('cancelarEdicaoSaida').style.display = 'inline';
}

// Cancelar edição
document.getElementById('cancelarEdicaoSaida')?.addEventListener('click', () => {
  const form = document.getElementById('formSaida');
  form.removeAttribute('data-editando');
  form.reset();
  document.querySelector('#formSaida button[type="submit"]').textContent = 'Registrar Saída';
  document.getElementById('cancelarEdicaoSaida').style.display = 'none';
});

const formSaida = document.getElementById('formSaida');
if (formSaida) {
  popularSelectSaida();
  popularDestinos();
  atualizarListaSaidas();

  formSaida.addEventListener('submit', e => {
    e.preventDefault();

    const idx = document.getElementById('produtoSaida').value;
    const qtd = Number(document.getElementById('quantidadeSaida').value);
    const data = document.getElementById('dataSaida').value || hojeISO();
    const destino = document.getElementById('destinoSaida').value.trim();

    if (idx === '' || qtd <= 0 || !destino) {
      alert('Preencha todos os campos corretamente.');
      return;
    }

    const dados = getDados();
    const produto = dados.produtos[idx];
    if (!produto) return alert('Produto inválido.');
    if (produto.quantidade < qtd) return alert('Estoque insuficiente.');

    const editando = formSaida.getAttribute('data-editando');

    if (editando !== null) {
      dados.saidas[editando] = { produtoID: produto.id, produtoNome: produto.nome, quantidade: qtd, data, destino };
      formSaida.removeAttribute('data-editando');
      document.querySelector('#formSaida button[type="submit"]').textContent = 'Registrar Saída';
      document.getElementById('cancelarEdicaoSaida').style.display = 'none';
      alert('Saída atualizada com sucesso!');
    } else {
      produto.quantidade -= qtd;
      dados.saidas.push({ produtoID: produto.id, produtoNome: produto.nome, quantidade: qtd, data, destino });
      if (!dados.destinos.includes(destino)) dados.destinos.push(destino);
      alert('Saída registrada com sucesso!');
    }

    salvarDados(dados);
    popularSelectSaida();
    popularDestinos();
    atualizarListaSaidas();
    try { atualizarDashboard(); } catch(e) {}
    formSaida.reset();
  });

  // Filtro de pesquisa
  document.getElementById('pesquisaSaida')?.addEventListener('input', e => {
    const valor = e.target.value.trim().toLowerCase();
    atualizarListaSaidas(valor);
  });
}
