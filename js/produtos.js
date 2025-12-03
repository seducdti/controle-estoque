// js/produtos.js
import { db } from "./firebase.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const produtosCol = collection(db, "produtos");
const listaProdutos = document.getElementById("listaProdutos");
const formProduto = document.getElementById("formProduto");
const nomeInput = document.getElementById("nome");

// Cache local com os documentos (docId + data)
let produtosCache = [];

// Inicia listener em tempo real
function iniciarListenerProdutos() {
  const q = query(produtosCol, orderBy("nome"));
  onSnapshot(q, (snap) => {
    produtosCache = [];
    if (listaProdutos) listaProdutos.innerHTML = "";
    snap.forEach(d => {
      produtosCache.push({ docId: d.id, ...d.data() });
    });
    renderizarTabela();
    popularSelectsGlobais();
  }, err => console.error("Erro listener produtos:", err));
}

// Render tabela HTML
function renderizarTabela() {
  if (!listaProdutos) return;
  if (!produtosCache || produtosCache.length === 0) {
    listaProdutos.innerHTML = '<tr><td colspan="3" class="muted">Nenhum produto cadastrado</td></tr>';
    return;
  }
  listaProdutos.innerHTML = "";
  produtosCache.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id ?? "-"}</td>
      <td>${p.nome}</td>
      <td>
        <button class="btn-editar" onclick="editarProdutoFirestore('${p.docId}')">✏️ Editar</button>
        <button class="btn-excluir" onclick="excluirProdutoFirestore('${p.docId}')">🗑️ Excluir</button>
      </td>
    `;
    listaProdutos.appendChild(tr);
  });
}

// Gera ID sequencial baseado no cache
function gerarIDSequencial() {
  if (!produtosCache || produtosCache.length === 0) return 1;
  const maxId = produtosCache.reduce((m, p) => Math.max(m, Number(p.id || 0)), 0);
  return maxId + 1;
}

// Salvar (novo ou edição)
async function salvarProdutoFirestore(e) {
  if (e) e.preventDefault();
  if (!nomeInput) return;
  const nome = nomeInput.value.trim();
  if (!nome) return alert("Preencha o nome do produto.");

  const form = formProduto;
  const editandoDocId = form?.getAttribute("data-editando-docid") || null;

  try {
    if (editandoDocId) {
      const ref = doc(db, "produtos", editandoDocId);
      await updateDoc(ref, { nome });
      form.removeAttribute("data-editando-docid");
      const btn = document.querySelector('#formProduto button[type="submit"]');
      if (btn) btn.textContent = 'Cadastrar';
      alert("Produto atualizado!");
    } else {
      const novoId = gerarIDSequencial();
      await addDoc(produtosCol, { id: novoId, nome, quantidade: 0 });
      alert(`Produto cadastrado! ID: ${novoId}`);
    }
    form.reset();
  } catch (err) {
    console.error("Erro salvar produto:", err);
    alert("Erro ao salvar produto (veja console).");
  }
}

// Editar (popula formulário)
async function editarProdutoFirestore(docId) {
  try {
    const p = produtosCache.find(x => x.docId === docId);
    if (!p) return alert("Produto não encontrado.");
    nomeInput.value = p.nome;
    formProduto.setAttribute("data-editando-docid", docId);
    const btn = document.querySelector('#formProduto button[type="submit"]');
    if (btn) btn.textContent = 'Salvar Alterações';
    formProduto.scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    console.error(err);
  }
}

// Excluir
async function excluirProdutoFirestore(docId) {
  if (!confirm("Deseja excluir este produto?")) return;
  try {
    await deleteDoc(doc(db, "produtos", docId));
    alert("Produto excluído.");
  } catch (err) {
    console.error("Erro excluir produto:", err);
    alert("Erro ao excluir produto (veja console).");
  }
}

// Popula selects usados por entrada/saída (global)
async function popularSelectsGlobais() {
  const selects = document.querySelectorAll('select[data-produto-select="true"]');
  selects.forEach(sel => {
    sel.innerHTML = '<option value="">-- Selecione o Produto --</option>';
    produtosCache.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.docId;
      opt.textContent = `${p.nome} (ID:${p.id ?? "-"})`;
      sel.appendChild(opt);
    });
  });
}

// Expor funções ao escopo global para usar nos atributos onclick do HTML
window.editarProdutoFirestore = editarProdutoFirestore;
window.excluirProdutoFirestore = excluirProdutoFirestore;
window.popularSelectsGlobais = popularSelectsGlobais;

// Hook do formulário
if (formProduto) formProduto.addEventListener("submit", salvarProdutoFirestore);

// Start
iniciarListenerProdutos();
