// js/produtos.js
// Gerenciamento de produtos usando Firestore (com listeners em tempo real)

import { db } from './firebase.js';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/*
Coleções usadas:
- produtos (cada documento: { id: number, nome: string, quantidade: number })
*/

const produtosCol = collection(db, 'produtos');

// Cache local (mantido em tempo real via onSnapshot)
let produtosCache = [];

// Inicializa listener em tempo real para produtos
function iniciarListenerProdutos() {
  const q = query(produtosCol, orderBy('id', 'asc'));
  onSnapshot(q, snap => {
    produtosCache = [];
    snap.forEach(docSnap => {
      produtosCache.push({ docId: docSnap.id, ...docSnap.data() });
    });
    // Atualiza UI
    try { atualizarListaProdutos(); } catch (e) {}
    try { popularSelectEntrada(); } catch (e) {}
    try { atualizarDashboard(); } catch (e) {}
  }, err => {
    console.error('Erro ao ouvir produtos:', err);
  });
}

// Gera próximo ID numérico (1,2,3...) a partir do cache
function gerarIDSequencial() {
  if (!produtosCache || produtosCache.length === 0) return 1;
  const maxId = produtosCache.reduce((m, p) => Math.max(m, Number(p.id || 0)), 0);
  return maxId + 1;
}

// Atualiza tabela de produtos (HTML) — mantém mesma estrutura que tinha antes
function atualizarListaProdutos() {
  const tbody = document.getElementById('listaProdutos');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!produtosCache || produtosCache.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="muted">Nenhum produto cadastrado</td></tr>';
    return;
  }

  produtosCache.forEach((p, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nome}</td>
      <td>
        <button onclick="editarProdutoFirestore('${p.docId}')">✏️ Editar</button>
        <button onclick="excluirProdutoFirestore('${p.docId}')">🗑️ Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Popula select de entrada (usado por entrada.js)
function popularSelectEntrada() {
  const sel = document.getElementById('produtoEntrada');
  if (!sel) return;
  sel.innerHTML = '<option value="">-- Selecione o Produto --</option>';
  produtosCache.forEach((p, i) => {
    const opt = document.createElement('option');
    opt.value = p.docId; // armazenamos docId para operações futuras
    opt.textContent = `${p.nome} (ID: ${p.id})`;
    sel.appendChild(opt);
  });
}

// Função para cadastrar ou editar produto (conectada ao formProduto)
async function salvarProdutoFirestore(event) {
  if (event) event.preventDefault();
  const nomeEl = document.getElementById('nome');
  if (!nomeEl) return alert('Campo nome não encontrado');
  const nome = nomeEl.value.trim();
  if (!nome) return alert('Preencha o nome do produto.');

  const form = document.getElementById('formProduto');
  const editandoDocId = form?.getAttribute('data-editando-docid');

  try {
    if (editandoDocId) {
      // Atualizar documento existente
      const ref = doc(db, 'produtos', editandoDocId);
      await updateDoc(ref, { nome });
      form.removeAttribute('data-editando-docid');
      document.querySelector('#formProduto button[type="submit"]').textContent = 'Cadastrar';
      alert('Produto atualizado com sucesso!');
    } else {
      // Criar novo produto com id sequencial
      const novoId = gerarIDSequencial();
      await addDoc(produtosCol, { id: novoId, nome, quantidade: 0 });
      alert(`Produto cadastrado com sucesso! (ID: ${novoId})`);
    }
    // limpar form
    form.reset();
  } catch (err) {
    console.error('Erro ao salvar produto:', err);
    alert('Erro ao salvar produto. Veja console.');
  }
}

// Editar produto: carrega os valores no formulário
async function editarProdutoFirestore(docId) {
  try {
    // Encontrar produto no cache
    const p = produtosCache.find(x => x.docId === docId);
    if (!p) return alert('Produto não encontrado no cache.');
    document.getElementById('nome').value = p.nome;
    const form = document.getElementById('formProduto');
    form.setAttribute('data-editando-docid', docId);
    document.querySelector('#formProduto button[type="submit"]').textContent = 'Salvar Alterações';
  } catch (err) {
    console.error(err);
  }
}

// Excluir produto
async function excluirProdutoFirestore(docId) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;
  try {
    await deleteDoc(doc(db, 'produtos', docId));
    alert('Produto excluído com sucesso.');
  } catch (err) {
    console.error('Erro ao excluir produto:', err);
    alert('Erro ao excluir produto. Veja console.');
  }
}

// Expor funções para o escopo global (compatibilidade com o restante do seu código)
window.popularSelectEntrada = popularSelectEntrada;
window.atualizarListaProdutos = atualizarListaProdutos;
window.salvarProdutoFirestore = salvarProdutoFirestore;
window.editarProdutoFirestore = editarProdutoFirestore;
window.excluirProdutoFirestore = excluirProdutoFirestore;

// Hook do formProduto (se existir)
const formProduto = document.getElementById('formProduto');
if (formProduto) {
  formProduto.addEventListener('submit', salvarProdutoFirestore);
}

// Inicia listener quando o módulo carregar
iniciarListenerProdutos();
